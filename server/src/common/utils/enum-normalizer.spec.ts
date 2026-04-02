import {
  normalizeEnumFromApi,
  normalizeEnumToApi,
  normalizeEnumsFromApi,
  normalizeEnumsToApi,
} from './enum-normalizer';

describe('enum-normalizer', () => {
  it('converts enum values between API and Prisma casing', () => {
    expect(normalizeEnumToApi('AVAILABLE')).toBe('available');
    expect(normalizeEnumFromApi('limited')).toBe('LIMITED');
  });

  it('converts arrays of enum values', () => {
    expect(normalizeEnumsToApi(['ACTIVE', 'PENDING'])).toEqual(['active', 'pending']);
    expect(normalizeEnumsFromApi(['active', 'pending'])).toEqual(['ACTIVE', 'PENDING']);
  });
});
