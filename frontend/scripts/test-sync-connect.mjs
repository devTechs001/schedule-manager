/**
 * Mirrored assertions for src/components/integration/syncConnect.js.
 *
 * The integration panels used to "connect" on a two second setTimeout and then
 * report invented counts ("45 events synced", "234 emails", "156 contacts").
 * These assertions pin down the replacement contract: no real handler means no
 * connection, and the refusal is described rather than swallowed.
 */
import { connectProvider, syncProvider, NOT_CONFIGURED } from '../src/components/integration/syncConnect.js';

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  ✗ ${name}\n    ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'assertion failed');
}

console.log('syncConnect');

// --- Without a real handler: refuse, and say why ---------------------------

check('refuses to connect when no handler is supplied', () => {
  const result = connectProvider('Google Calendar', undefined);
  assert(result.ok === false, 'expected ok:false');
});

check('refusal names the provider and explains nothing connected', () => {
  const result = connectProvider('Google Calendar', undefined);
  assert(result.message.includes('Google Calendar'), 'message should name the provider');
  assert(result.message.includes(NOT_CONFIGURED), 'message should use the shared explanation');
  assert(/nothing was connected/i.test(result.message), 'message should be explicit');
});

check('refuses to sync when no handler is supplied', () => {
  const result = syncProvider('Gmail', undefined);
  assert(result.ok === false, 'expected ok:false');
  assert(result.message.includes('Gmail'), 'message should name the provider');
});

check('a null handler is treated the same as a missing one', () => {
  assert(connectProvider('Outlook', null).ok === false, 'null should not connect');
  assert(syncProvider('Outlook', null).ok === false, 'null should not sync');
});

check('a non-function handler is rejected, not called', () => {
  const result = connectProvider('Zoom', { connect: 'nope' });
  assert(result.ok === false, 'a plain object is not a handler');
});

// --- With a real handler: defer to it -------------------------------------

check('connects when a real handler is supplied', () => {
  let called = 0;
  const result = connectProvider('Asana', () => { called += 1; });
  assert(result.ok === true, 'expected ok:true');
  assert(called === 1, `handler should run exactly once, ran ${called}`);
});

check('syncs when a real handler is supplied', () => {
  let called = 0;
  const result = syncProvider('Dropbox', () => { called += 1; });
  assert(result.ok === true, 'expected ok:true');
  assert(called === 1, 'handler should run exactly once');
});

check('a throwing handler surfaces the failure instead of reporting success', () => {
  const result = connectProvider('Jira', () => { throw new Error('401 Unauthorized'); });
  assert(result.ok === false, 'a failed connect must not report success');
  assert(result.message.includes('401 Unauthorized'), 'the underlying reason should be kept');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
