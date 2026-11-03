import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, timeAgo } from '../src/utils.js';

test('esc escapa caracteres HTML perigosos', () => {
  assert.equal(
    esc('<script>alert("x")</script>&'),
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;',
  );
});

test('esc converte valores não-string', () => {
  assert.equal(esc(42), '42');
});

test('timeAgo formata intervalos', () => {
  const now = Date.parse('2026-01-10T12:00:00Z');
  const ago = (s) => new Date(now - s * 1000).toISOString();
  assert.equal(timeAgo(ago(30), now), 'agora');
  assert.equal(timeAgo(ago(5 * 60), now), '5 min atrás');
  assert.equal(timeAgo(ago(3 * 3600), now), '3h atrás');
  assert.equal(timeAgo(ago(2 * 86400), now), '2d atrás');
});
