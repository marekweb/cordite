/**
 * @jest-environment node
 */

const cordite = require('.');
const axios = require('axios');

test('cordite', async () => {
  const testRouter = (req, res, next) => {
    res.send('ok');
  };

  const app = cordite({
    routers: {
      '/test-router': testRouter
    },
    env: { PORT: 1234 }
  });

  await app.start();

  console.log('started');
  try {
    const response = await axios.get('http://localhost:1234/test-router');
    console.log(Object.keys(response));
    expect(response.status).toBe(200);
    expect(response.data).toBe('ok');
  } finally {
    await app.stop();
  }
});
