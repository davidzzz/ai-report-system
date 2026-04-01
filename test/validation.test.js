const test = require('node:test');
const assert = require('node:assert/strict');

const { validateSalesPayload } = require('../dist/utils/validation');

function validPayload() {
  return {
    companyName: 'Acme',
    period: '2026-Q1',
    sales: [
      {
        date: '2026-01-01',
        product: 'Widget',
        region: 'US',
        unitsSold: 3,
        unitPrice: 10
      }
    ]
  };
}

test('validateSalesPayload rejects invalid date', () => {
  const payload = validPayload();
  payload.sales[0].date = 'not-a-date';

  assert.throws(() => validateSalesPayload(payload), {
    message: /must be a valid date string/
  });
});

test('validateSalesPayload trims optional text fields', () => {
  const payload = validPayload();
  payload.companyName = '  Acme Corp  ';

  const validated = validateSalesPayload(payload);
  assert.equal(validated.companyName, 'Acme Corp');
});
