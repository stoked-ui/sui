import { PLATFORM_REGISTRY, getPlatformByKey, ALL_PLATFORM_KEYS } from '../platformRegistry';

const EXPECTED_KEYS = [
  'instagram', 'tiktok', 'youtube', 'facebook', 'linkedin',
  'bluesky', 'books', 'website', 'x', 'soundcloud',
  'bandcamp', 'onlyfans', 'nostr',
] as const;

describe('PLATFORM_REGISTRY', () => {
  it('contains exactly 13 entries', () => {
    expect(PLATFORM_REGISTRY).toHaveLength(13);
  });

  it('every entry has required fields', () => {
    PLATFORM_REGISTRY.forEach((platform) => {
      expect(platform.key).toBeTruthy();
      expect(platform.label).toBeTruthy();
      expect(platform.placeholder).toBeTruthy();
      expect(platform.icon).toBeTruthy();
      expect(platform.inputType).toBeTruthy();
    });
  });

  it('contains all expected platform keys in order', () => {
    const keys = PLATFORM_REGISTRY.map((p) => p.key);
    expect(keys).toEqual(EXPECTED_KEYS);
  });
});

describe('getPlatformByKey', () => {
  it.each(EXPECTED_KEYS)('returns platform for key "%s"', (key) => {
    const result = getPlatformByKey(key);
    expect(result).toBeDefined();
    expect(result!.key).toBe(key);
  });

  it('returns undefined for invalid key', () => {
    const result = getPlatformByKey('nonexistent' as any);
    expect(result).toBeUndefined();
  });
});

describe('ALL_PLATFORM_KEYS', () => {
  it('has 13 entries', () => {
    expect(ALL_PLATFORM_KEYS).toHaveLength(13);
  });

  it('contains all expected keys', () => {
    EXPECTED_KEYS.forEach((key) => {
      expect(ALL_PLATFORM_KEYS).toContain(key);
    });
  });

  it('is derived from PLATFORM_REGISTRY', () => {
    const registryKeys = PLATFORM_REGISTRY.map((p) => p.key);
    expect([...ALL_PLATFORM_KEYS]).toEqual(registryKeys);
  });
});
