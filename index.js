const path = require('path');
const express = require('express');
const bunyan = require('bunyan');

module.exports = function(options = {}) {
  const logBuffer = new bunyan.RingBuffer({ limit: 200 });
  const logCollection = options.logCollection;
  const app = express();
  const { env = {} } = options;

  app.logger = options.logger;
  if (!app.logger) {
    const logStreams = [
      {
        level: 'trace',
        stream: process.stdout
      },
      {
        level: 'trace',
        type: 'raw',
        stream: logBuffer
      }
    ];

    if (options.logCollection) {
      logStreams.push({
        level: 'trace',
        type: 'raw',
        stream: {
          write: obj => logCollection.insert(obj)
        }
      });
    }

    app.logger = bunyan.createLogger({
      name: options.name || 'app',
      serializers: bunyan.stdSerializers,
      level: 'debug',
      streams: logStreams
    });
  }

  function apiLoggerMiddleware(req, res, next) {
    req.logger = app.logger.child({ req });
    req.logger.debug('request');
    next();
  }

  app.start = function() {
    const port = env.PORT || 4000;
    return new Promise((resolve, reject) => {
      app.logger.debug({ port }, 'starting on port %s', port);
      app.server = app.listen(port, () => {
        resolve(app);
      });
    });
  };

  app.stop = function() {
    return new Promise((resolve, reject) => {
      if (!app.server) {
        throw new Error(
          'Cannot stop (app.stop before the server has started (app.start)'
        );
      }

      app.logger.debug('stopping server');
      // TODO: actually resolve only once all requests have
      // completed.
      app.server.close(() => resolve());

      resolve();
    });
  };

  app.disable('x-powered-by');
  app.use(require('helmet')());
  app.use(require('compression')());

  const routers = options.routers || {};
  if (options.api) {
    routers['/api'] = options.api;
  }

  for (const key in routers) {
    const router = routers[key];
    if (!router) {
      throw new Error(`Cordite: Api router "${key}" is null`);
    }

    app.use(key, apiLoggerMiddleware, express.json(), router);
  }

  if (env.NODE_ENV !== 'production') {
    app.get('/debug', (req, res, next) => {
      res.send(logBuffer.records);
    });
  }
  // Production middleware
  if (env.NODE_ENV === 'production') {
    // Middleware for static assets
    app.use(express.static(path.join(process.cwd(), 'build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'build/index.html'));
    });
  }

  // 404 handler
  app.use((req, res, next) => {
    // TODO: if api router handles its own 404s, then is it correct to assume
    // that this will never get called in prod?
    res.status(404).send('404 Not Found (Cordite)');
  });

  app.use((err, req, res, next) => {
    console.error(err);
    req.logger.fatal({ err });
    res.status(500).send('500 Internal Server Error');
  });

  return app;
};
