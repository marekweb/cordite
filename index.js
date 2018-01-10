const path = require('path');
const express = require('express');

module.exports = function(options = {}) {
  const app = express();
  const { env = {} } = options;
  app.start = function() {
    const port = env.PORT || 4000;
    return new Promise((resolve, reject) => {
      app.server = app.listen(port, () => {
        resolve(app);
      });
    });
  };

  app.stop = function() {
    return new Promise((resolve, reject) => {
      if (app.server) {
        // TODO: actually resolve only once all requests have
        // completed.
        app.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  };

  app.disable('x-powered-by');

  // API router
  if (options.api) {
    app.use('/api', options.api);
  }

  // Production middleware
  if (env.NODE_ENV === 'production') {
    // Middleware useful only for production
    app.use(require('helmet')());
    app.use(require('compression')());

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
    res.status(404).send('404 Not Found');
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('500 Internal Server Error');
  });

  return app;
};
