import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost, BlogPostDocument } from '@stoked-ui/common-api';
import { NOSTR_CONFIG, parseCommaSeparated } from './nostr.config';

// ---------------------------------------------------------------------------
// nostr-tools imports - imported at the CJS path so they work under Node16
// module resolution without ESM concerns.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SimplePool } = require('nostr-tools/pool') as {
  SimplePool: new () => ISimplePool;
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nip19 = require('nostr-tools/nip19') as {
  decode: (npub: string) => { type: string; data: string };
};

// ---------------------------------------------------------------------------
// Minimal interfaces for nostr-tools types so we avoid importing the full
// type definitions (which may not resolve cleanly under Node16 + CJS).
// ---------------------------------------------------------------------------

interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

interface ISimplePool {
  subscribeMany(
    relays: string[],
    filters: object[],
    handlers: {
      onevent?: (event: NostrEvent) => void;
      onclose?: (reasons: string[]) => void;
    },
  ): { close(): void };
  close(relays: string[]): void;
}

// ---------------------------------------------------------------------------
// Parsed blog-post data extracted from a NIP-23 event.
// ---------------------------------------------------------------------------

interface ParsedNostrPost {
  title: string;
  body: string;
  slug: string;
  description?: string;
  image?: string;
  tags: string[];
  nostrEventId: string;
  date: Date;
  authors: string[];
  targetSites: string[];
}

// ---------------------------------------------------------------------------
// Slugify helper (mirrors the one in blog.service.ts)
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// NostrService
// ---------------------------------------------------------------------------

@Injectable()
export class NostrService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NostrService.name);

  /** Active SimplePool instance (created on first poll, replaced on each poll). */
  private pool: ISimplePool | null = null;

  /** setInterval handle for the periodic poll. */
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  /** Resolved configuration values (populated in onModuleInit). */
  private relays: string[] = [];
  private pubkeys: string[] = [];
  private targetSites: string[] = [];
  private pollIntervalMs: number = NOSTR_CONFIG.DEFAULTS.POLL_INTERVAL_MINUTES * 60_000;

  constructor(
    private readonly configService: ConfigService,
    @Inject(getModelToken(BlogPost.name))
    private readonly blogPostModel: Model<BlogPostDocument>,
  ) {}

  // -------------------------------------------------------------------------
  // Lifecycle hooks
  // -------------------------------------------------------------------------

  async onModuleInit(): Promise<void> {
    this.loadConfig();

    if (this.relays.length === 0 || this.pubkeys.length === 0) {
      this.logger.warn(
        'Nostr integration disabled – set NOSTR_RELAYS and NOSTR_NPUBS to enable.',
      );
      return;
    }

    this.logger.log(
      `Nostr integration enabled. Relays: [${this.relays.join(', ')}], ` +
        `pubkeys: ${this.pubkeys.length}, poll interval: ${this.pollIntervalMs / 60_000} min`,
    );

    // Run the first poll immediately (non-blocking), then schedule subsequent polls.
    this.poll().catch(err => this.logger.error('Initial Nostr poll failed', err));
    this.pollTimer = setInterval(() => void this.poll(), this.pollIntervalMs);
  }

  onModuleDestroy(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.pool) {
      try {
        this.pool.close(this.relays);
      } catch {
        // Ignore errors during teardown
      }
      this.pool = null;
    }
  }

  // -------------------------------------------------------------------------
  // Configuration loading
  // -------------------------------------------------------------------------

  private loadConfig(): void {
    this.relays = parseCommaSeparated(
      this.configService?.get?.<string>(NOSTR_CONFIG.ENV.RELAYS) || process.env[NOSTR_CONFIG.ENV.RELAYS],
    );

    const npubs = parseCommaSeparated(
      this.configService?.get?.<string>(NOSTR_CONFIG.ENV.NPUBS) || process.env[NOSTR_CONFIG.ENV.NPUBS],
    );
    this.pubkeys = this.decodeNpubs(npubs);

    const intervalStr = this.configService?.get?.<string>(NOSTR_CONFIG.ENV.POLL_INTERVAL) || process.env[NOSTR_CONFIG.ENV.POLL_INTERVAL];
    const intervalMinutes = intervalStr ? parseInt(intervalStr, 10) : NOSTR_CONFIG.DEFAULTS.POLL_INTERVAL_MINUTES;
    this.pollIntervalMs = (isNaN(intervalMinutes) ? NOSTR_CONFIG.DEFAULTS.POLL_INTERVAL_MINUTES : intervalMinutes) * 60_000;

    const sitesStr = this.configService?.get?.<string>(NOSTR_CONFIG.ENV.TARGET_SITES) || process.env[NOSTR_CONFIG.ENV.TARGET_SITES];
    this.targetSites = sitesStr
      ? parseCommaSeparated(sitesStr)
      : [...NOSTR_CONFIG.DEFAULTS.TARGET_SITES];
  }

  /**
   * Decode npub keys to hex pubkeys. Invalid npubs are logged and skipped.
   */
  private decodeNpubs(npubs: string[]): string[] {
    const hexKeys: string[] = [];
    for (const npub of npubs) {
      try {
        const decoded = nip19.decode(npub);
        if (decoded.type === 'npub') {
          hexKeys.push(decoded.data);
        } else {
          this.logger.warn(`Skipping non-npub key: ${npub} (type=${decoded.type})`);
        }
      } catch (err) {
        this.logger.warn(`Failed to decode npub "${npub}": ${String(err)}`);
      }
    }
    return hexKeys;
  }

  // -------------------------------------------------------------------------
  // Polling
  // -------------------------------------------------------------------------

  /**
   * Open a fresh SimplePool, subscribe to NIP-23 events from configured
   * pubkeys, collect events for 10 seconds, then close the pool and import.
   */
  async poll(): Promise<void> {
    if (this.relays.length === 0 || this.pubkeys.length === 0) {
      return;
    }

    this.logger.debug(`Polling ${this.relays.length} relay(s) for NIP-23 events...`);

    const collectedEvents: NostrEvent[] = [];

    try {
      const pool = new SimplePool();
      this.pool = pool;

      await new Promise<void>((resolve) => {
        const sub = pool.subscribeMany(
          this.relays,
          [
            {
              kinds: [NOSTR_CONFIG.LONG_FORM_KIND],
              authors: this.pubkeys,
            },
          ],
          {
            onevent: (event: NostrEvent) => {
              collectedEvents.push(event);
            },
            onclose: () => {
              resolve();
            },
          },
        );

        // Give the subscription 10 seconds to collect events before we close.
        setTimeout(() => {
          try {
            sub.close();
          } catch {
            // Ignore
          }
          resolve();
        }, 10_000);
      });
    } catch (err) {
      this.logger.warn(`Error connecting to Nostr relays: ${String(err)}`);
      return;
    } finally {
      if (this.pool) {
        try {
          this.pool.close(this.relays);
        } catch {
          // Ignore
        }
        this.pool = null;
      }
    }

    this.logger.debug(`Collected ${collectedEvents.length} NIP-23 event(s) from relays.`);

    let imported = 0;
    for (const event of collectedEvents) {
      const wasImported = await this.importEvent(event);
      if (wasImported) {
        imported++;
      }
    }

    if (imported > 0) {
      this.logger.log(`Imported ${imported} new NIP-23 event(s) from Nostr.`);
    }
  }

  // -------------------------------------------------------------------------
  // Event parsing and importing
  // -------------------------------------------------------------------------

  /**
   * Parse a raw NIP-23 Nostr event into a BlogPost-shaped object.
   * Returns null if the event is not usable (e.g. missing title).
   */
  parseEvent(event: NostrEvent): ParsedNostrPost | null {
    if (event.kind !== NOSTR_CONFIG.LONG_FORM_KIND) {
      this.logger.warn(`Skipping event ${event.id}: unexpected kind ${event.kind}`);
      return null;
    }

    if (!event.content) {
      this.logger.warn(`Skipping event ${event.id}: empty content`);
      return null;
    }

    // Helper to pull the first value from a named tag.
    const getTag = (name: string): string | undefined =>
      event.tags.find((t) => t[0] === name)?.[1];

    const title = getTag('title') ?? getTag('subject');
    if (!title) {
      this.logger.warn(`Skipping event ${event.id}: no title or subject tag`);
      return null;
    }

    // Use the `d` tag as a stable identifier for replaceable events (NIP-33).
    const dTag = getTag('d');
    const slug = dTag ? slugify(dTag) || slugify(title) : slugify(title);

    // Collect topic tags.
    const tags = event.tags
      .filter((t) => t[0] === 't' && t[1])
      .map((t) => t[1]);

    return {
      title,
      body: event.content,
      slug,
      description: getTag('summary'),
      image: getTag('image'),
      tags,
      nostrEventId: event.id,
      date: new Date(event.created_at * 1000),
      authors: [event.pubkey],
      targetSites: this.targetSites,
    };
  }

  /**
   * Import a single Nostr event as a BlogPost.
   *
   * - Silently skips duplicates (same nostrEventId).
   * - Logs a warning for invalid events and skips them.
   * - Returns true if a new post was created, false otherwise.
   */
  async importEvent(event: NostrEvent): Promise<boolean> {
    // Check for duplicates first.
    const existing = await this.blogPostModel
      .findOne({ nostrEventId: event.id })
      .exec();

    if (existing) {
      // Silently skip – already imported.
      return false;
    }

    let parsed: ParsedNostrPost | null;
    try {
      parsed = this.parseEvent(event);
    } catch (err) {
      this.logger.warn(`Failed to parse Nostr event ${event.id}: ${String(err)}`);
      return false;
    }

    if (!parsed) {
      return false;
    }

    // Ensure slug uniqueness by appending the first 8 chars of the event id.
    let { slug } = parsed;
    const slugConflict = await this.blogPostModel.findOne({ slug }).exec();
    if (slugConflict) {
      slug = `${slug}-${event.id.slice(0, 8)}`;
    }

    try {
      await this.blogPostModel.create({
        title: parsed.title,
        slug,
        body: parsed.body,
        description: parsed.description,
        image: parsed.image,
        tags: parsed.tags,
        authors: parsed.authors,
        targetSites: parsed.targetSites,
        date: parsed.date,
        status: 'published',
        source: 'nostr',
        nostrEventId: parsed.nostrEventId,
      });

      this.logger.log(
        `Imported Nostr post: "${parsed.title}" (id=${event.id.slice(0, 16)}...)`,
      );
      return true;
    } catch (err: unknown) {
      // Duplicate key – race condition between concurrent polls.
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        this.logger.debug(`Duplicate key on insert for event ${event.id}, skipping.`);
        return false;
      }
      this.logger.warn(`Failed to save Nostr event ${event.id}: ${String(err)}`);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Accessors used by tests / other services
  // -------------------------------------------------------------------------

  getRelays(): string[] {
    return this.relays;
  }

  getPubkeys(): string[] {
    return this.pubkeys;
  }

  getPollIntervalMs(): number {
    return this.pollIntervalMs;
  }

  getTargetSites(): string[] {
    return this.targetSites;
  }
}
