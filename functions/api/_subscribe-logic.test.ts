import { describe, it, expect, vi } from 'vitest';
import { validateEmail, parseSubscribeBody, handleSubscribe } from './_subscribe-logic.js';

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('dev+test@gmail.com')).toBe(true);
    expect(validateEmail('a@b.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@no-local.com')).toBe(false);
    expect(validateEmail('no-domain@')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail(42)).toBe(false);
  });

  it('rejects emails over 320 characters', () => {
    const long = 'a'.repeat(310) + '@example.com'; // 322 chars
    expect(validateEmail(long)).toBe(false);
  });
});

describe('parseSubscribeBody', () => {
  it('parses valid body and normalizes email', () => {
    expect(parseSubscribeBody({ email: 'User@EXAMPLE.com' })).toEqual({
      email: 'user@example.com',
    });
  });

  it('trims whitespace', () => {
    expect(parseSubscribeBody({ email: '  dev@test.com  ' })).toEqual({
      email: 'dev@test.com',
    });
  });

  it('returns null for invalid body', () => {
    expect(parseSubscribeBody(null)).toBeNull();
    expect(parseSubscribeBody({})).toBeNull();
    expect(parseSubscribeBody({ email: 'bad' })).toBeNull();
    expect(parseSubscribeBody('string')).toBeNull();
  });
});

describe('handleSubscribe', () => {
  const okInsert = vi.fn().mockResolvedValue('ok' as const);
  const dupInsert = vi.fn().mockResolvedValue('duplicate' as const);
  const errInsert = vi.fn().mockResolvedValue('error' as const);

  it('returns 200 on successful subscribe', async () => {
    const result = await handleSubscribe({ email: 'new@user.com' }, okInsert);
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(okInsert).toHaveBeenCalledWith('new@user.com');
  });

  it('returns 409 on duplicate email', async () => {
    const result = await handleSubscribe({ email: 'dup@user.com' }, dupInsert);
    expect(result.status).toBe(409);
    expect(result.body.success).toBe(false);
    expect(result.body.error).toContain('already');
  });

  it('returns 500 on insert error', async () => {
    const result = await handleSubscribe({ email: 'err@user.com' }, errInsert);
    expect(result.status).toBe(500);
    expect(result.body.success).toBe(false);
  });

  it('returns 400 for invalid email', async () => {
    const result = await handleSubscribe({ email: 'bad' }, okInsert);
    expect(result.status).toBe(400);
    expect(result.body.success).toBe(false);
  });

  it('returns 400 for missing body', async () => {
    const result = await handleSubscribe(null, okInsert);
    expect(result.status).toBe(400);
  });
});
