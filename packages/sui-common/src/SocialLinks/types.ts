import * as React from 'react';

/**
 * String literal union of all supported social platform keys.
 */
export type SocialPlatformKey =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'facebook'
  | 'linkedin'
  | 'bluesky'
  | 'books'
  | 'website'
  | 'x'
  | 'soundcloud'
  | 'bandcamp'
  | 'onlyfans'
  | 'nostr';

/**
 * Input type hint for a social platform field.
 */
export type InputType = 'username' | 'url' | 'handle' | 'identifier';

/**
 * Configuration for a single social platform.
 */
export interface SocialPlatform {
  /** Unique platform identifier */
  key: SocialPlatformKey;
  /** Human-readable platform name */
  label: string;
  /** Type of input expected */
  inputType: InputType;
  /** Placeholder text for the input field */
  placeholder: string;
  /** Optional URL prefix displayed as a non-editable adornment */
  prefix?: string;
  /** Icon component for the platform */
  icon: React.ComponentType<{ fontSize?: 'small' | 'medium' | 'large' | 'inherit' }>;
}

/**
 * Map of platform keys to their input values. Partial because not all platforms need values.
 */
export type SocialLinkValues = Partial<Record<SocialPlatformKey, string>>;
