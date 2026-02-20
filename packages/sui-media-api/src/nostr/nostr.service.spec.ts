/**
 * NostrService unit tests
 *
 * All Nostr relay I/O and the Mongoose model are fully mocked, so these
 * tests run without any network access or database connection.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { NostrService } from './nostr.service';
import { BlogPost } from '@stoked-ui/common-api';
import { NOSTR_CONFIG } from './nostr.config';

// ---------------------------------------------------------------------------
// Mock nostr-tools modules
// ---------------------------------------------------------------------------

// We mock the CJS require calls that NostrService performs internally.
// Jest automatically intercepts require() when the module is mocked this way.

const mockSubClose = jest.fn();
const mockSubscribeMany = jest.fn();
const mockPoolClose = jest.fn();

jest.mock(
  'nostr-tools/pool',
  () => ({
    SimplePool: jest.fn().mockImplementation(() => ({
      subscribeMany: mockSubscribeMany,
      close: mockPoolClose,
    })),
  }),
  { virtual: true },
);

jest.mock(
  'nostr-tools/nip19',
  () => ({
    decode: jest.fn((npub: string) => {
      if (npub.startsWith('npub1')) {
        // Return a predictable hex key derived from the npub for tests.
        return { type: 'npub', data: `hex_${npub.slice(5, 13)}` };
      }
      throw new Error(`Invalid npub: ${npub}`);
    }),
  }),
  { virtual: true },
);

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Builds a minimal NIP-23 Nostr event. */
function makeEvent(overrides: Partial<{
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  content: string;
  tags: string[][];
}> = {}) {
  return {
    id: overrides.id ?? 'aabbccdd1122334455667788aabbccdd11223344556677881122334455667788',
    pubkey: overrides.pubkey ?? 'deadbeef1234',
    created_at: overrides.created_at ?? 1_700_000_000,
    kind: overrides.kind ?? NOSTR_CONFIG.LONG_FORM_KIND,
    content: overrides.content ?? '# Hello\n\nThis is the body.',
    tags: overrides.tags ?? [
      ['title', 'My First Long-Form Post'],
      ['summary', 'A brief description'],
      ['image', 'https://example.com/img.png'],
      ['t', 'nostr'],
      ['t', 'blog'],
      ['d', 'my-first-long-form-post'],
    ],
    sig: 'fakesig',
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('NostrService', () => {
  let service: NostrService;
  let mockModel: Record<string, jest.Mock>;
  let mockConfigGet: jest.Mock;

  function buildModule(configOverrides: Record<string, string> = {}) {
    const defaults: Record<string, string> = {
      [NOSTR_CONFIG.ENV.RELAYS]: 'wss://relay.damus.io,wss://nos.lol',
      [NOSTR_CONFIG.ENV.NPUBS]: 'npub1abcdefgh,npub1ijklmnop',
      [NOSTR_CONFIG.ENV.POLL_INTERVAL]: '15',
    };
    const config = { ...defaults, ...configOverrides };

    mockConfigGet = jest.fn((key: string) => config[key]);

    return Test.createTestingModule({
      providers: [
        NostrService,
        {
          provide: ConfigService,
          useValue: { get: mockConfigGet },
        },
        {
          provide: getModelToken(BlogPost.name),
          useValue: mockModel,
        },
      ],
    }).compile();
  }

  beforeEach(() => {
    jest.useFakeTimers();

    mockSubClose.mockReset();
    mockSubscribeMany.mockReset();
    mockPoolClose.mockReset();

    // Default subscription: immediately calls onclose so poll() resolves fast.
    mockSubscribeMany.mockImplementation(
      (_relays: string[], _filters: object[], handlers: { onclose?: () => void }) => {
        if (handlers.onclose) handlers.onclose();
        return { close: mockSubClose };
      },
    );

    mockModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      create: jest.fn().mockResolvedValue({ _id: 'new-id' }),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Config parsing
  // -------------------------------------------------------------------------

  describe('Config parsing', () => {
    it('loads relay URLs from NOSTR_RELAYS env var', async () => {
      const module = await buildModule({
        [NOSTR_CONFIG.ENV.RELAYS]: 'wss://relay.damus.io,wss://nos.lol',
      });
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      expect(service.getRelays()).toEqual(['wss://relay.damus.io', 'wss://nos.lol']);
    });

    it('decodes npubs to hex pubkeys', async () => {
      const module = await buildModule({
        [NOSTR_CONFIG.ENV.NPUBS]: 'npub1abcdefgh,npub1ijklmnop',
      });
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      // Both npubs should decode to hex_ + their 8 chars after "npub1"
      expect(service.getPubkeys()).toEqual(['hex_abcdefgh', 'hex_ijklmnop']);
    });

    it('uses default poll interval of 15 minutes when env var is absent', async () => {
      const module = await buildModule({ [NOSTR_CONFIG.ENV.POLL_INTERVAL]: '' });
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      expect(service.getPollIntervalMs()).toBe(15 * 60_000);
    });

    it('respects a custom poll interval from NOSTR_POLL_INTERVAL', async () => {
      const module = await buildModule({ [NOSTR_CONFIG.ENV.POLL_INTERVAL]: '30' });
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      expect(service.getPollIntervalMs()).toBe(30 * 60_000);
    });

    it('returns empty arrays when NOSTR_RELAYS and NOSTR_NPUBS are absent', async () => {
      const module = await buildModule({
        [NOSTR_CONFIG.ENV.RELAYS]: '',
        [NOSTR_CONFIG.ENV.NPUBS]: '',
      });
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      expect(service.getRelays()).toEqual([]);
      expect(service.getPubkeys()).toEqual([]);
    });

    it('uses default target sites when NOSTR_TARGET_SITES is absent', async () => {
      const module = await buildModule({});
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      expect(service.getTargetSites()).toEqual(NOSTR_CONFIG.DEFAULTS.TARGET_SITES);
    });

    it('skips invalid (non-npub) keys and logs a warning', async () => {
      // Our mock decode() only accepts npub1* strings.
      const module = await buildModule({
        [NOSTR_CONFIG.ENV.NPUBS]: 'npub1validkey,nsec1invalidsecret',
      });
      service = module.get<NostrService>(NostrService);

      const warnSpy = jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
      service['loadConfig']();

      // Only the valid npub should be decoded.
      expect(service.getPubkeys()).toHaveLength(1);
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // parseEvent()
  // -------------------------------------------------------------------------

  describe('parseEvent()', () => {
    beforeEach(async () => {
      const module = await buildModule();
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();
    });

    it('maps a kind 30023 event to a ParsedNostrPost object', () => {
      const event = makeEvent();
      const parsed = service.parseEvent(event);

      expect(parsed).not.toBeNull();
      expect(parsed!.title).toBe('My First Long-Form Post');
      expect(parsed!.body).toBe('# Hello\n\nThis is the body.');
      expect(parsed!.description).toBe('A brief description');
      expect(parsed!.image).toBe('https://example.com/img.png');
      expect(parsed!.tags).toEqual(['nostr', 'blog']);
      expect(parsed!.nostrEventId).toBe(event.id);
      expect(parsed!.date).toEqual(new Date(event.created_at * 1000));
      expect(parsed!.authors).toEqual([event.pubkey]);
    });

    it('uses the d tag as the basis for the slug', () => {
      const event = makeEvent({
        tags: [
          ['title', 'Fancy Title With Spaces'],
          ['d', 'my-canonical-slug'],
        ],
      });
      const parsed = service.parseEvent(event);

      expect(parsed!.slug).toBe('my-canonical-slug');
    });

    it('falls back to title-based slug when d tag is absent', () => {
      const event = makeEvent({
        tags: [['title', 'Hello World Post']],
      });
      const parsed = service.parseEvent(event);

      expect(parsed!.slug).toBe('hello-world-post');
    });

    it('returns null when kind is not 30023', () => {
      const event = makeEvent({ kind: 1 });
      const parsed = service.parseEvent(event);

      expect(parsed).toBeNull();
    });

    it('returns null when event content is empty', () => {
      const event = makeEvent({ content: '' });
      const parsed = service.parseEvent(event);

      expect(parsed).toBeNull();
    });

    it('returns null when neither title nor subject tag is present', () => {
      const event = makeEvent({ tags: [['d', 'some-id']] });
      const parsed = service.parseEvent(event);

      expect(parsed).toBeNull();
    });

    it('accepts the subject tag as an alternative to title', () => {
      const event = makeEvent({
        tags: [['subject', 'Post via Subject Tag']],
      });
      const parsed = service.parseEvent(event);

      expect(parsed).not.toBeNull();
      expect(parsed!.title).toBe('Post via Subject Tag');
    });

    it('sets targetSites from loaded config', () => {
      const event = makeEvent();
      service['targetSites'] = ['site-a.com', 'site-b.com'];
      const parsed = service.parseEvent(event);

      expect(parsed!.targetSites).toEqual(['site-a.com', 'site-b.com']);
    });
  });

  // -------------------------------------------------------------------------
  // importEvent()
  // -------------------------------------------------------------------------

  describe('importEvent()', () => {
    beforeEach(async () => {
      const module = await buildModule();
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();
    });

    it('creates a BlogPost with correct fields', async () => {
      const event = makeEvent();
      const result = await service.importEvent(event);

      expect(result).toBe(true);
      expect(mockModel.create).toHaveBeenCalledTimes(1);

      const createArg = mockModel.create.mock.calls[0][0];
      expect(createArg.title).toBe('My First Long-Form Post');
      expect(createArg.body).toBe('# Hello\n\nThis is the body.');
      expect(createArg.source).toBe('nostr');
      expect(createArg.status).toBe('published');
      expect(createArg.nostrEventId).toBe(event.id);
      expect(createArg.description).toBe('A brief description');
      expect(createArg.image).toBe('https://example.com/img.png');
      expect(createArg.tags).toEqual(['nostr', 'blog']);
    });

    it('skips a duplicate event (same nostrEventId)', async () => {
      // Simulate an already-existing document.
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing', nostrEventId: makeEvent().id }),
      });

      const result = await service.importEvent(makeEvent());

      expect(result).toBe(false);
      expect(mockModel.create).not.toHaveBeenCalled();
    });

    it('returns false and does not crash for an invalid event', async () => {
      // An event without a title results in parseEvent returning null.
      const event = makeEvent({ tags: [] });
      const result = await service.importEvent(event);

      expect(result).toBe(false);
      expect(mockModel.create).not.toHaveBeenCalled();
    });

    it('appends event-id suffix to slug when slug already exists in DB', async () => {
      // First findOne (duplicate nostrEventId check) → null (not a duplicate).
      // Second findOne (slug conflict check) → existing doc.
      mockModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({ _id: 'slug-conflict' }),
        });

      const event = makeEvent();
      await service.importEvent(event);

      const createArg = mockModel.create.mock.calls[0][0];
      // Slug should have the event-id suffix.
      expect(createArg.slug).toMatch(/-[0-9a-f]{8}$/);
    });

    it('handles a duplicate-key DB error gracefully (returns false)', async () => {
      const dupError = Object.assign(new Error('E11000'), { code: 11000 });
      mockModel.create.mockRejectedValue(dupError);

      const result = await service.importEvent(makeEvent());

      expect(result).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // poll()
  // -------------------------------------------------------------------------

  describe('poll()', () => {
    it('does nothing when no relays are configured', async () => {
      const module = await buildModule({
        [NOSTR_CONFIG.ENV.RELAYS]: '',
        [NOSTR_CONFIG.ENV.NPUBS]: '',
      });
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      await service.poll();

      expect(mockSubscribeMany).not.toHaveBeenCalled();
    });

    it('logs a warning and does not crash when a relay is unreachable', async () => {
      mockSubscribeMany.mockImplementation(() => {
        throw new Error('Connection refused');
      });

      const module = await buildModule();
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      const warnSpy = jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});

      await service.poll();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error connecting to Nostr relays'),
      );
    });

    it('imports events received from relays', async () => {
      const event = makeEvent();

      // subscribeMany calls onevent with our mock event, then calls onclose.
      mockSubscribeMany.mockImplementation(
        (_relays: string[], _filters: object[], handlers: {
          onevent?: (e: typeof event) => void;
          onclose?: () => void;
        }) => {
          if (handlers.onevent) handlers.onevent(event);
          if (handlers.onclose) handlers.onclose();
          return { close: mockSubClose };
        },
      );

      const module = await buildModule();
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      await service.poll();

      expect(mockModel.create).toHaveBeenCalledTimes(1);
    });

    it('skips already-imported events during a poll', async () => {
      const event = makeEvent();

      mockSubscribeMany.mockImplementation(
        (_relays: string[], _filters: object[], handlers: {
          onevent?: (e: typeof event) => void;
          onclose?: () => void;
        }) => {
          if (handlers.onevent) handlers.onevent(event);
          if (handlers.onclose) handlers.onclose();
          return { close: mockSubClose };
        },
      );

      // Simulate the post already existing.
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      const module = await buildModule();
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      await service.poll();

      expect(mockModel.create).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Lifecycle (onModuleInit / onModuleDestroy)
  // -------------------------------------------------------------------------

  describe('Lifecycle hooks', () => {
    it('logs a warning and skips polling when NOSTR_RELAYS is not set', async () => {
      const module = await buildModule({
        [NOSTR_CONFIG.ENV.RELAYS]: '',
        [NOSTR_CONFIG.ENV.NPUBS]: 'npub1abcdefgh',
      });
      service = module.get<NostrService>(NostrService);

      const warnSpy = jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});

      await service.onModuleInit();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Nostr integration disabled'),
      );
      expect(mockSubscribeMany).not.toHaveBeenCalled();
    });

    it('clears the poll timer on destroy', async () => {
      const module = await buildModule();
      service = module.get<NostrService>(NostrService);
      service['loadConfig']();

      // Manually install a fake timer.
      service['pollTimer'] = setInterval(() => {}, 999_999);

      service.onModuleDestroy();

      expect(service['pollTimer']).toBeNull();
    });
  });
});
