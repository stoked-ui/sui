import type { ProviderId, ThemeMode } from '../../types';
import './ProviderBadge.css';

const PROVIDER_LABELS: Record<ProviderId, string> = {
  claude: 'Claude',
  codex: 'Codex',
  gemini: 'Gemini',
  amp: 'Amp',
  grok: 'Grok',
  stokd: 'Stokd',
  local: 'Local',
  unknown: 'Agent',
};

// Providers that ship an SVG logo file (resolved against logoBaseUrl).
const PROVIDER_LOGO_FILES: Partial<Record<ProviderId, string>> = {
  claude: 'claude.svg',
  codex: 'codex.svg',
  gemini: 'gemini.svg',
  grok: 'grok.svg',
  stokd: 'stokd.svg',
};

const LOCAL_KEYS = new Set(['local', 'localmodel', 'lmstudio', 'ollama']);
const CLAUDE_KEYS = new Set(['claude', 'claudecode', 'anthropic', 'anthropiccode']);
const CODEX_KEYS = new Set([
  'codex',
  'codexcli',
  'openai',
  'openaicode',
  'chatgpt',
  'chatgptcli',
]);
const GEMINI_KEYS = new Set(['gemini', 'geminicli']);
const AMP_KEYS = new Set(['amp', 'ampcli', 'ampcode', 'sourcegraphamp', 'sourcegraph']);
const GROK_KEYS = new Set([
  'grok',
  'grokcli',
  'grok-cli',
  'supergrok',
  'super-grok',
  'xai',
  'x-ai',
]);
const STOKD_KEYS = new Set(['stokd', 'stokdcloud', 'stokdcli', 'stokdagent']);

function normalizeProviderKey(provider?: string | null): string {
  const key = (provider || '').trim().toLowerCase();
  if (!key) return '';
  return key.replace(/[\s_.-]/g, '');
}

/** Resolve a raw provider string to its canonical ProviderId. */
export function normalizeProviderId(provider?: string | null): ProviderId {
  const key = normalizeProviderKey(provider);
  if (!key) return 'unknown';
  if (LOCAL_KEYS.has(key) || key.includes('local') || key.includes('ollama') || key.includes('lmstudio'))
    return 'local';
  if (CLAUDE_KEYS.has(key) || key.includes('claude') || key.includes('anthropic')) return 'claude';
  if (
    CODEX_KEYS.has(key) ||
    key.includes('codex') ||
    key.includes('openai') ||
    key.includes('chatgpt') ||
    key.startsWith('gpt')
  )
    return 'codex';
  if (GEMINI_KEYS.has(key) || key.includes('gemini')) return 'gemini';
  if (AMP_KEYS.has(key)) return 'amp';
  if (GROK_KEYS.has(key) || key.includes('grok') || key.includes('xai')) return 'grok';
  if (STOKD_KEYS.has(key) || key.includes('stokd')) return 'stokd';
  return 'unknown';
}

/** Human label for a raw provider string. */
export function providerLabel(provider?: string | null): string {
  return PROVIDER_LABELS[normalizeProviderId(provider)];
}

export interface ProviderBadgeProps {
  provider?: string | null;
  showLabel?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  /** Override the native tooltip shown on hover. Defaults to the provider label. */
  tooltip?: string;
  /** Theme hint; affects the codex monochrome logo treatment. */
  theme?: ThemeMode;
  /**
   * Base URL/path under which provider logo SVGs live (e.g. "/provider-logos"
   * on the web, or an asWebviewUri base in a VS Code webview). When omitted,
   * a letter avatar is rendered instead of a logo image.
   */
  logoBaseUrl?: string;
}

export function ProviderBadge({
  provider,
  showLabel = true,
  className = '',
  size = 'sm',
  tooltip,
  theme = 'dark',
  logoBaseUrl,
}: ProviderBadgeProps) {
  const id = normalizeProviderId(provider);
  const label = PROVIDER_LABELS[id];
  const logoFile = PROVIDER_LOGO_FILES[id];
  const hasLogo = !!logoBaseUrl && !!logoFile;

  return (
    <span
      data-testid="provider-badge"
      data-provider={id}
      data-size={size}
      className={`sui-provider-badge ${className}`.trim()}
      title={tooltip ?? (provider || label)}
    >
      {hasLogo ? (
        <img
          src={`${logoBaseUrl!.replace(/\/$/, '')}/${logoFile}`}
          alt={label}
          className={`sui-provider-badge__logo${id === 'codex' ? ' sui-provider-badge__logo--mono' : ''}`}
          data-theme={theme}
          loading="lazy"
        />
      ) : (
        <span className="sui-provider-badge__avatar">{label.charAt(0)}</span>
      )}
      {showLabel && <span>{label}</span>}
    </span>
  );
}
