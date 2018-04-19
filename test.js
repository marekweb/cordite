/**
 * @jest-environment node
 */

const cordite = require('.');
const axios = require('axios');
const getPort = require('get-port');

const testRouter = (req, res, next) => {
  res.send('ok');
};

test('attach routers', async () => {
  const port = await getPort();

  const app = cordite({
    routers: {
      '/test-router': testRouter
    },
    env: { PORT: port }
  });

  await app.start();

  try {
    const response = await axios.get(`http://localhost:${port}/test-router`);
    expect(response.status).toBe(200);
    expect(response.data).toBe('ok');
  } finally {
    await app.stop();
  }
});

test('attach api', async () => {
  const port = await getPort();

  const app = cordite({
    api: testRouter,
    env: { PORT: port }
  });

  await app.start();

  try {
    const response = await axios.get(`http://localhost:${port}/api`);
    expect(response.status).toBe(200);
    expect(response.data).toBe('ok');
  } finally {
    await app.stop();
  }
});

test('https redirect with allow local insecure requests', async () => {
  // NOTE:
  // We don't have a way to test NON-local requests for this option,
  // unless we use a tool like ngrok.
  const port = await getPort();

  const app = cordite({
    api: testRouter,
    env: { PORT: port, NODE_ENV: 'production' },
    allowLocalInsecureRequests: true
  });

  await app.start();

  try {
    const response = await axios.get(`http://localhost:${port}/api`, {
      validateStatus: null,
      maxRedirects: 0
    });

    expect(response.status).toBe(200);
  } finally {
    await app.stop();
  }
});

test('https redirect', async () => {
  const port = await getPort();

  const app = cordite({
    api: testRouter,
    env: { PORT: port, NODE_ENV: 'production' }
  });

  await app.start();

  try {
    const response = await axios.get(`http://localhost:${port}/api`, {
      validateStatus: null,
      maxRedirects: 0
    });

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe(`https://localhost:${port}/api`);
  } finally {
    await app.stop();
  }
});
