// CRM/src/store/__tests__/commissionSplit.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { splitCommission } from '../commission.js';
test('2pct on 150L splits per 50-50 partner share', () => {
  const s = splitCommission({ dealValueLakhs: 150, commission_pct: 2, partnerCutPct: 50 });
  assert.equal(s.gross, 3);
  assert.equal(s.partner_share_lakhs, 1.5);
  assert.equal(s.tgv_share_lakhs, 1.5);
});
test('fixed commission overrides pct', () => {
  const s = splitCommission({ dealValueLakhs: 150, commission_fixed_lakhs: 2 });
  assert.equal(s.gross, 2);
});
