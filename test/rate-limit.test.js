const test = require('node:test');
const assert = require('node:assert/strict');

const { createRateLimiter } = require('../dist/middlewares/rate-limit');

function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error));
  });
}

test('rate limiter allows requests up to max and blocks after threshold', async () => {
  const limiter = createRateLimiter({ windowMs: 10_000, maxRequests: 2 });
  const req = { ip: '10.0.0.8' };

  const first = await runMiddleware(limiter, req);
  const second = await runMiddleware(limiter, req);
  const third = await runMiddleware(limiter, req);

  assert.equal(first, undefined);
  assert.equal(second, undefined);
  assert.equal(third.statusCode, 429);
  assert.equal(third.code, 'RATE_LIMIT_EXCEEDED');
});
