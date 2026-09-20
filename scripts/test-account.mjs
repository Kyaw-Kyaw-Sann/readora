import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';

function load(path, dependencies) {
  const output = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, URL, require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports;
}

const { profileSchema, passwordSchema } = load('src/schemas/account.schema.ts', { zod: { z } });
assert.equal(profileSchema.parse({ name: '  Reader  ', profileImageUrl: '' }).name, 'Reader');
for (const values of [{ name: ' ', profileImageUrl: '' }, { name: 'a'.repeat(101), profileImageUrl: '' }, { name: 'Reader', profileImageUrl: 'file:///secret' }, { name: 'Reader', profileImageUrl: 'https://user:password@example.com/avatar' }]) assert.equal(profileSchema.safeParse(values).success, false);
assert.equal(profileSchema.safeParse({ name: 'Reader', profileImageUrl: 'https://example.com/avatar.jpg' }).success, true);
const valid = { currentPassword: 'old password', newPassword: 'new password', confirmPassword: 'new password' };
assert.equal(passwordSchema.safeParse(valid).success, true);
for (const values of [{ ...valid, currentPassword: ' ' }, { ...valid, newPassword: 'short' }, { ...valid, confirmPassword: 'mismatch' }, { ...valid, newPassword: valid.currentPassword, confirmPassword: valid.currentPassword }]) assert.equal(passwordSchema.safeParse(values).success, false);

let options;
let cleaned = 0;
let cancelled = 0;
let cleared = 0;
let navigated = 0;
let failCleanup = false;
const { useLogout: inspectLogout } = load('src/hooks/use-session.ts', {
  '@tanstack/react-query': { useMutation: (value) => { options = value; return value; }, useQueryClient: () => ({ cancelQueries: async () => { cancelled++; }, clear: () => { cleared++; } }) },
  'expo-router': { router: { replace: (route) => { assert.equal(route, '/welcome'); navigated++; } } },
  '@/api/auth.api': { logout: async () => { throw new Error('Server unreachable'); } },
  '@/lib/token-storage': { getStoredRefreshToken: async () => 'test-only-token' },
  '@/lib/session': { restoreSession: async () => {}, clearSession: async () => { cleaned++; if (failCleanup) throw new Error('Secure storage unavailable'); } },
});
inspectLogout();
await options.mutationFn();
options.onSuccess();
assert.equal(cleaned, 1);
assert.equal(cancelled, 1);
assert.equal(navigated, 1);
assert.ok(cleared >= 1);
failCleanup = true;
await assert.rejects(options.mutationFn(), /Secure storage unavailable/);
assert.equal(cleaned, 2);
assert.equal(navigated, 1);
console.log('Account validation and secure logout checks passed.');
