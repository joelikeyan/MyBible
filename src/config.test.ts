import { describe, expect, it } from 'vitest';
import { normalizeBaseUrl } from './config';

describe('normalizeBaseUrl', () => {
  it('normalizes supported URLs', () => {
    expect(normalizeBaseUrl(' https://api.example.com/ ')).toBe('https://api.example.com');
  });

  it('rejects empty and unsupported URLs', () => {
    expect(normalizeBaseUrl(undefined)).toBeNull();
    expect(normalizeBaseUrl('')).toBeNull();
    expect(normalizeBaseUrl('file:///tmp/api')).toBeNull();
    expect(normalizeBaseUrl('not-a-url')).toBeNull();
  });
});
