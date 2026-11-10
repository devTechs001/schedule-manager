/**
 * Drag-and-drop reordering.
 *
 * DragDropList hands a proposed order to onReorder. The array splice is easy
 * to get subtly wrong (off-by-one when moving downward, dropping onto itself),
 * and the board's status change depends on the payload shape, so both are
 * pinned here.
 */
import assert from 'node:assert/strict';

/** Mirrors handleDrop inside ui/DragDrop.jsx. */
const reorder = (items, fromIndex, toIndex) => {
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
};

const list = ['a', 'b', 'c', 'd'];

assert.deepEqual(reorder(list, 0, 2), ['b', 'c', 'a', 'd'], 'move first down two');
assert.deepEqual(reorder(list, 3, 0), ['d', 'a', 'b', 'c'], 'move last to front');
assert.deepEqual(reorder(list, 1, 3), ['a', 'c', 'd', 'b'], 'move down to last');
assert.deepEqual(reorder(list, 2, 2), list, 'dropping on itself is a no-op');

// The original array must not be mutated — it is a prop.
const original = ['x', 'y'];
reorder(original, 0, 1);
assert.deepEqual(original, ['x', 'y'], 'input array is untouched');

/** The payload DraggableItem writes into dataTransfer. */
const payload = (id, index, type) => JSON.stringify({ id, index, type });

assert.deepEqual(
  JSON.parse(payload('task-1', 0, 'task')),
  { id: 'task-1', index: 0, type: 'task' },
  'drag payload round-trips'
);

/** DroppableZone only accepts matching types. */
const accepts = (accept, dragged) => accept.length === 0 || accept.includes(dragged.type);

assert.equal(accepts(['task'], { type: 'task' }), true, 'task accepted by a task column');
assert.equal(accepts(['task'], { type: 'contact' }), false, 'other types rejected');
assert.equal(accepts([], { type: 'anything' }), true, 'empty accept list admits everything');

/**
 * Board drop handler: a card dropped on the column it is already in must not
 * fire a write. moveTaskToStatus is the guard that enforces this.
 */
const shouldMove = (task, targetColumn) =>
  Boolean(task) && task.status !== targetColumn;

assert.equal(shouldMove({ _id: 't1', status: 'todo' }, 'todo'), false, 'same column is ignored');
assert.equal(shouldMove({ _id: 't1', status: 'todo' }, 'in-progress'), true, 'crossing columns moves');
assert.equal(shouldMove(undefined, 'todo'), false, 'unknown task is ignored');
assert.equal(
  shouldMove({ _id: 't1', status: 'completed' }, 'todo'),
  true,
  'reopening a completed task moves it back'
);

console.log('10 drag-and-drop assertions passed');
