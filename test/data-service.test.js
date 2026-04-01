const test = require('node:test');
const assert = require('node:assert/strict');

const { DataService } = require('../dist/services/data.service');

function payloadFromSales(sales) {
  return {
    companyName: 'Acme',
    period: '2026-Q1',
    sales
  };
}

test('DataService trend returns up when end-of-range revenue is meaningfully higher', () => {
  const result = DataService.process(
    payloadFromSales([
      { date: '2026-01-01', product: 'A', region: 'US', unitsSold: 1, unitPrice: 100 },
      { date: '2026-01-02', product: 'A', region: 'US', unitsSold: 1, unitPrice: 120 }
    ])
  );

  assert.equal(result.summary.trend, 'up');
});

test('DataService trend returns down when end-of-range revenue is meaningfully lower', () => {
  const result = DataService.process(
    payloadFromSales([
      { date: '2026-01-01', product: 'A', region: 'US', unitsSold: 1, unitPrice: 120 },
      { date: '2026-01-02', product: 'A', region: 'US', unitsSold: 1, unitPrice: 90 }
    ])
  );

  assert.equal(result.summary.trend, 'down');
});

test('DataService trend returns stable when change is within threshold', () => {
  const result = DataService.process(
    payloadFromSales([
      { date: '2026-01-01', product: 'A', region: 'US', unitsSold: 1, unitPrice: 100 },
      { date: '2026-01-02', product: 'A', region: 'US', unitsSold: 1, unitPrice: 104 }
    ])
  );

  assert.equal(result.summary.trend, 'stable');
});
