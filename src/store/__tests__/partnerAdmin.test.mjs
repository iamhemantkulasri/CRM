// CRM/src/store/__tests__/partnerAdmin.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { toApprovalUpdate } from '../partnerAdmin.js';
test('approve sets commission and website flag explicitly', () => {
  const u = toApprovalUpdate({ commission_pct: 2, show_on_website: true });
  assert.equal(u.approval_status, 'approved');
  assert.equal(u.commission_pct, 2);
  assert.equal(u.show_on_website, true);
});
test('reject requires reason', () => {
  assert.throws(() => toApprovalUpdate({ decision: 'rejected', reason: '' }), /reason/);
});
