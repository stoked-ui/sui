import Instagram from '@mui/icons-material/Instagram';
import Facebook from '@mui/icons-material/Facebook';
import YouTube from '@mui/icons-material/YouTube';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Language from '@mui/icons-material/Language';
import Link from '@mui/icons-material/Link';
import { SocialPlatform, SocialPlatformKey } from './types';

/**
 * Registry of all supported social platforms.
 * Platforms are listed in a standard order for consistent UI display.
 */
export const PLATFORM_REGISTRY: readonly SocialPlatform[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    inputType: 'username',
    placeholder: 'username',
    prefix: 'instagram.com/',
    icon: Instagram,
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    inputType: 'username',
    placeholder: '@username',
    prefix: 'tiktok.com/@',
    icon: Link,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    inputType: 'url',
    placeholder: 'youtube.com/c/yourchannel',
    icon: YouTube,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    inputType: 'url',
    placeholder: 'facebook.com/yourpage',
    icon: Facebook,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    inputType: 'url',
    placeholder: 'linkedin.com/in/yourprofile',
    icon: LinkedIn,
  },
  {
    key: 'bluesky',
    label: 'Bluesky',
    inputType: 'handle',
    placeholder: 'user.bsky.social',
    icon: Link,
  },
  {
    key: 'books',
    label: 'Books',
    inputType: 'url',
    placeholder: 'goodreads.com/yourprofile',
    icon: Link,
  },
  {
    key: 'website',
    label: 'Website',
    inputType: 'url',
    placeholder: 'yourwebsite.com',
    icon: Language,
  },
  {
    key: 'x',
    label: 'X',
    inputType: 'username',
    placeholder: 'username',
    prefix: 'x.com/',
    icon: Link,
  },
  {
    key: 'soundcloud',
    label: 'Soundcloud',
    inputType: 'url',
    placeholder: 'soundcloud.com/yourprofile',
    icon: Link,
  },
  {
    key: 'bandcamp',
    label: 'Bandcamp',
    inputType: 'url',
    placeholder: 'yourbandname.bandcamp.com',
    icon: Link,
  },
  {
    key: 'onlyfans',
    label: 'OnlyFans',
    inputType: 'username',
    placeholder: 'username',
    prefix: 'onlyfans.com/',
    icon: Link,
  },
  {
    key: 'nostr',
    label: 'Nostr',
    inputType: 'identifier',
    placeholder: 'npub1... or NIP-05 address',
    icon: Link,
  },
] as const;

/**
 * Array of all platform keys, derived from the registry.
 */
export const ALL_PLATFORM_KEYS: readonly SocialPlatformKey[] = PLATFORM_REGISTRY.map((p) => p.key);

/**
 * Lookup a platform configuration by its key.
 * @param key - The platform key to look up
 * @returns The platform configuration, or undefined if not found
 */
export function getPlatformByKey(key: SocialPlatformKey): SocialPlatform | undefined {
  return PLATFORM_REGISTRY.find((platform) => platform.key === key);
}
