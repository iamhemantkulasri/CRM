// CRM/src/store/__tests__/unifiedSearch.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPooled, toAdminLead } from '../pooledSearch.js';
const rows = [
  { id:'1', builder_id:null, city:'Noida' },
  { id:'2', builder_id:'p-a', city:'Noida' },
  { id:'3', builder_id:'p-b', city:'Gurgaon' },
];
test('admin all sees everything, owner filter isolates', () => {
  assert.equal(filterPooled(rows, { owner:'all' }).length, 3);
  assert.equal(filterPooled(rows, { owner:'p-a' }).length, 1);
});
test('legacy owner_partner_id still matches as fallback', () => {
  assert.equal(filterPooled([{ id:'9', owner_partner_id:'p-a', city:'Noida' }], { owner:'p-a' }).length, 1);
});
test('lead tags partner but assigns admin', () => {
  const l = toAdminLead({ id:'x', builder_id:'p-a' }, { name:'Buyer' });
  assert.equal(l.assignedTo, 'emp_admin');
  assert.equal(l.source_partner_id, 'p-a');
});
