/**
 * AI response parsing.
 *
 * The old code fell back to hard-coded advice whenever the model returned
 * something unparseable, which meant a broken provider looked like working
 * insight. These tests pin down the honest behaviour: unparseable → empty.
 *
 * Run: node --test scripts/test-ai-parsing.mjs
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSuggestionArray } from '../src/services/ai/suggestionEngine.js';

test('parses a bare JSON array', () => {
  const raw = '[{"title":"A","description":"B","confidence":80}]';
  const out = parseSuggestionArray(raw);
  assert.equal(out.length, 1);
  assert.equal(out[0].title, 'A');
  assert.equal(out[0].confidence, 80);
});

test('strips markdown fences', () => {
  const raw = '```json\n[{"title":"A","description":"B","confidence":50}]\n```';
  assert.equal(parseSuggestionArray(raw).length, 1);
});

test('extracts the array from surrounding prose', () => {
  const raw = 'Here you go:\n[{"title":"A","description":"B"}]\nHope that helps!';
  const out = parseSuggestionArray(raw);
  assert.equal(out.length, 1);
  assert.equal(out[0].confidence, null, 'missing confidence stays null, not invented');
});

test('returns [] for unparseable output instead of canned advice', () => {
  assert.deepEqual(parseSuggestionArray('I cannot help with that.'), []);
  assert.deepEqual(parseSuggestionArray(''), []);
  assert.deepEqual(parseSuggestionArray(null), []);
  assert.deepEqual(parseSuggestionArray('[not json'), []);
});

test('drops entries missing a title or description', () => {
  const raw = '[{"title":"ok","description":"fine"},{"title":"","description":"x"},{"description":"y"}]';
  assert.equal(parseSuggestionArray(raw).length, 1);
});

test('clamps confidence into 0..100', () => {
  const raw = '[{"title":"a","description":"b","confidence":-5},{"title":"c","description":"d","confidence":900}]';
  const out = parseSuggestionArray(raw);
  assert.equal(out[0].confidence, 0);
  assert.equal(out[1].confidence, 100);
});

test('caps the list at five entries', () => {
  const many = Array.from({ length: 9 }, (_, i) => ({ title: `t${i}`, description: 'd' }));
  assert.equal(parseSuggestionArray(JSON.stringify(many)).length, 5);
});
