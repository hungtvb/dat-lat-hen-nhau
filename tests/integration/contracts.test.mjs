import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeGuestName, parseVariant, parseMoveInput, advancePlayer,
  WALK_SPEED_MPS, SPIKE_BOUNDS, SIM_TICK_MS, isInviteToken
} from '../../packages/shared/dist/index.js';

test('Vietnamese nickname is preserved and bounded', () => {
  assert.equal(normalizeGuestName('  Hồng   Anh  '), 'Hồng Anh');
  assert.equal(normalizeGuestName('A'), null);
  assert.equal(normalizeGuestName('<script>'), null);
  assert.equal(normalizeGuestName('A\u202eB'), null);
  assert.equal(normalizeGuestName('a'.repeat(25)), null);
  assert.equal(normalizeGuestName(123), null);
});
test('variant is allowlisted', () => {
  assert.equal(parseVariant('forest'), 'forest');
  assert.equal(parseVariant('custom_user_asset'), null);
});
test('move inputs cannot inject NaN, coordinates, negative seq or dt', () => {
  assert.equal(parseMoveInput({seq: 1, forward: NaN, strafe: 0, heading: 0}), null);
  assert.equal(parseMoveInput({seq: -1, forward: 0, strafe: 0, heading: 0}), null);
  assert.equal(parseMoveInput({seq: 1, forward: 2, strafe: 0, heading: 0}), null);
  assert.equal(parseMoveInput({seq: 1, forward: 1, strafe: 0, heading: Math.PI + 1}), null);
  assert.deepEqual(parseMoveInput({seq: 1, forward: 1, strafe: 0, heading: 0, x: 9999, dt: 800}), {seq:1,forward:1,strafe:0,heading:0});
});
test('server cannot walk faster than maximum step or beyond playable bounds', () => {
  const forward = {seq:1, forward:1, strafe:1, heading:0};
  const a = advancePlayer({x:0,z:0}, forward, 3600);
  assert.ok(Math.hypot(a.x,a.z) <= WALK_SPEED_MPS * SIM_TICK_MS / 1000 + 1e-8);
  const b = advancePlayer({x:SPIKE_BOUNDS.maxX,z:SPIKE_BOUNDS.maxZ}, {seq:2,forward: -1,strafe:1,heading:0}, 1);
  assert.ok(b.x <= SPIKE_BOUNDS.maxX && b.z <= SPIKE_BOUNDS.maxZ);
});
test('no input or invalid delta cannot create player movement', () => {
  assert.deepEqual(advancePlayer({x:2,z:3}, null, .05), {x:2,z:3});
  assert.deepEqual(advancePlayer({x:2,z:3}, {seq:1,forward:1,strafe:0,heading:0}, -5), {x:2,z:3});
});
test('invite format must be high entropy string', () => {
  assert.equal(isInviteToken('1234'), false);
  assert.equal(isInviteToken('a'.repeat(32)), true);
  assert.equal(isInviteToken(' ' + 'x'.repeat(32)), false);
});
