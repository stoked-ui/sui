import type { SxProps, Theme } from '@mui/system';

export type DirectChatProvider = 'telegram' | 'whats-app';

export interface DirectChatPrompts {
  askMessage: string;
  askName: string;
  askEmail: string;
  success: string;
  failure: string;
}

export interface DirectChatPlaceholders {
  message: string;
  name: string;
  email: string;
}

export interface WebUserDirectChatProps {
  /** Messaging provider to use for forwarding */
  provider: DirectChatProvider;

  /** API endpoint to send the form data to */
  apiEndpoint?: string;

  /** Main title displayed in the chat header */
  title?: string;

  /** Supporting text displayed in the chat header */
  subtitle?: string;

  /** Deprecated alias for subtitle */
  headerText?: string;

  /** Prefilled user name. If provided, the chat skips asking for it. */
  initialName?: string;

  /** Prefilled reply email. If provided and valid, the chat skips asking for it. */
  initialEmail?: string;

  /** Override the default assistant prompts. */
  prompts?: Partial<DirectChatPrompts>;

  /** Override the composer placeholders for each step. */
  placeholders?: Partial<DirectChatPlaceholders>;

  /** Callback fired on successful submission */
  onSuccess?: () => void;

  /** Callback fired on submission error */
  onError?: (error: string) => void;

  /** Material-UI sx prop for custom styling */
  sx?: SxProps<Theme>;
}

export interface DirectChatFormData {
  name: string;
  email: string;
  message: string;
  provider: DirectChatProvider;
}

export type DirectChatStatus = 'idle' | 'collecting' | 'loading' | 'success' | 'error';
