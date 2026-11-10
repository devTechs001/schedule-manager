/**
 * Workspace membership and permissions.
 *
 * hasPermission() is the only thing standing between a workspace member and
 * actions they should not be able to take, so it has to be correct for every
 * shape a member document can take:
 *
 *   - freshly created by addMember(), where `user` is an ObjectId
 *   - loaded with .populate('members.user'), where `user` is a document
 *   - legacy rows written before permissions had a schema default
 *
 * It used to call `m.user.toString()` and `member.permissions.includes(...)`
 * unguarded. On a populated document toString() yields "[object Object]" and
 * nothing matched; on a member with no permissions array the call threw a
 * TypeError and took the request down with a 500.
 *
 * Run: node --test scripts/test-workspace-permissions.mjs
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

/**
 * Mirrors models/Workspace.js exactly. Kept as a local copy because the model
 * needs a live mongoose connection to import; if the two drift, the assertions
 * below stop describing the real code, so the logic is deliberately small.
 */
const memberUserId = (member) => {
  const user = member?.user;
  if (!user) return null;
  return (user._id || user).toString();
};

const hasPermission = (members, userId, permission) => {
  const target = userId.toString();
  const member = members.find((m) => memberUserId(m) === target);
  if (!member) return false;
  if (member.role === 'owner' || member.role === 'admin') return true;
  return Array.isArray(member.permissions) && member.permissions.includes(permission);
};

const memberWithPermissions = (role, permissions) => ({
  user: { toString: () => 'user-1' },
  role,
  permissions,
});

test('a member added by addMember can read', () => {
  const members = [{ user: { toString: () => 'user-1' }, role: 'member', permissions: ['read', 'write'] }];
  assert.equal(hasPermission(members, 'user-1', 'read'), true);
});

test('a member without a permissions array fails closed instead of throwing', () => {
  const members = [{ user: { toString: () => 'user-1' }, role: 'member' }];
  assert.doesNotThrow(() => hasPermission(members, 'user-1', 'read'));
  assert.equal(hasPermission(members, 'user-1', 'read'), false);
});

test('a member is denied a permission they were not granted', () => {
  const members = [memberWithPermissions('member', ['read'])];
  assert.equal(hasPermission(members, 'user-1', 'delete'), false);
  assert.equal(hasPermission(members, 'user-1', 'manage'), false);
});

test('a populated user document is matched by its _id', () => {
  const members = [{ user: { _id: { toString: () => 'user-1' }, name: 'Ada' }, role: 'member', permissions: ['read'] }];
  assert.equal(hasPermission(members, 'user-1', 'read'), true);
  // The old implementation compared "[object Object]" and always missed.
  assert.notEqual(members[0].user.toString(), 'user-1');
});

test('owner and admin bypass the permissions list', () => {
  const members = [
    { user: { toString: () => 'own' }, role: 'owner' },
    { user: { toString: () => 'adm' }, role: 'admin' },
  ];
  assert.equal(hasPermission(members, 'own', 'manage'), true);
  assert.equal(hasPermission(members, 'adm', 'delete'), true);
});

test('a non-member is denied', () => {
  const members = [memberWithPermissions('member', ['read', 'write'])];
  assert.equal(hasPermission(members, 'stranger', 'read'), false);
});

test('a member with no user reference does not throw or match', () => {
  const members = [{ role: 'member', permissions: ['read'] }];
  assert.doesNotThrow(() => hasPermission(members, 'user-1', 'read'));
  assert.equal(hasPermission(members, 'user-1', 'read'), false);
});

test('viewers get read but not write', () => {
  const members = [memberWithPermissions('viewer', ['read'])];
  assert.equal(hasPermission(members, 'user-1', 'read'), true);
  assert.equal(hasPermission(members, 'user-1', 'write'), false);
});
