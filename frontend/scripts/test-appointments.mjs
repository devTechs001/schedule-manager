import assert from 'node:assert/strict';
import { nextOccurrence } from '../src/hooks/useAppointments.js';

let pass = 0;
const t = (n, fn) => { try { fn(); pass++; console.log('  ✓', n); } catch (e) { console.log('  ✗', n, '-', e.message); process.exitCode = 1; } };

console.log('\nAppointment recurrence');
t('daily advances one day', () => {
  const next = nextOccurrence({ at: '2026-11-09T09:00:00.000Z', repeat: 'daily' });
  assert.equal(next.toISOString(), '2026-11-10T09:00:00.000Z');
});
t('weekly advances seven days', () => {
  const next = nextOccurrence({ at: '2026-11-09T09:00:00.000Z', repeat: 'weekly' });
  assert.equal(next.toISOString(), '2026-11-16T09:00:00.000Z');
});
t('weekdays skips the weekend (Fri -> Mon)', () => {
  // 2026-11-13 is a Friday
  const next = nextOccurrence({ at: '2026-11-13T09:00:00.000Z', repeat: 'weekdays' });
  assert.equal(next.getUTCDay(), 1, 'expected Monday, got day ' + next.getUTCDay());
});
t('monthly advances one month', () => {
  const next = nextOccurrence({ at: '2026-11-09T09:00:00.000Z', repeat: 'monthly' });
  assert.equal(next.getUTCMonth(), 11);
});
t('none returns null so the reminder completes', () => {
  assert.equal(nextOccurrence({ at: '2026-11-09T09:00:00.000Z', repeat: 'none' }), null);
});
t('invalid date returns null instead of Invalid Date', () => {
  assert.equal(nextOccurrence({ at: 'garbage', repeat: 'daily' }), null);
});
console.log(`\nRecurrence: ${pass} passed\n`);
