/**
 * SSRF guards for the audit bot's `fetch_company_site` tool.
 *
 * The tool fetches a visitor-supplied URL server-side, so it is a classic SSRF
 * vector: a visitor could point it at cloud metadata endpoints
 * (169.254.169.254), loopback services, or RFC-1918 internal hosts. The
 * pure helpers below classify a URL/host/IP so the network layer in `tools.ts`
 * can refuse anything that isn't a public, http(s) destination. Kept free of
 * `dns`/`fetch` so they're unit-testable without the network.
 */

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

/** Hostnames we refuse outright, before any DNS resolution. */
const BLOCKED_HOSTNAME_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /\.localhost$/i,
  /^ip6-localhost$/i,
  /\.local$/i, // mDNS / Bonjour
  /\.internal$/i, // common internal TLD
  /^metadata$/i,
  /^metadata\.google\.internal$/i,
];

/**
 * Normalize a raw user string into an absolute http(s) URL, defaulting to
 * https:// when no scheme is present. Throws UnsafeUrlError on anything that
 * isn't a parseable http(s) URL.
 */
export function normalizeUrl(raw: string): URL {
  const trimmed = (raw || '').trim();
  if (!trimmed) {
    throw new UnsafeUrlError('url is required');
  }
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new UnsafeUrlError('url is not parseable');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError('only http/https URLs are supported');
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError('credentials in URL are not allowed');
  }
  return url;
}

/** True if the hostname is one we refuse without even resolving it. */
export function isBlockedHostname(hostname: string): boolean {
  const host = (hostname || '').replace(/\.$/, '').toLowerCase();
  if (!host) {
    return true;
  }
  return BLOCKED_HOSTNAME_PATTERNS.some((re) => re.test(host));
}

function ipv4ToParts(ip: string): number[] | null {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) {
    return null;
  }
  const parts = m.slice(1, 5).map((p) => Number(p));
  if (parts.some((p) => p < 0 || p > 255)) {
    return null;
  }
  return parts;
}

function isPrivateIpv4(parts: number[]): boolean {
  const [a, b] = parts;
  if (a === 10) {return true;} // 10.0.0.0/8
  if (a === 127) {return true;} // loopback
  if (a === 0) {return true;} // "this" network
  if (a === 169 && b === 254) {return true;} // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) {return true;} // 172.16.0.0/12
  if (a === 192 && b === 168) {return true;} // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) {return true;} // CGNAT 100.64.0.0/10
  if (a === 192 && b === 0) {return true;} // 192.0.0.0/24 + 192.0.2.0/24 docs
  if (a === 198 && (b === 18 || b === 19)) {return true;} // benchmarking
  if (a >= 224) {return true;} // multicast + reserved (224+/255)
  return false;
}

/**
 * True if `ip` (IPv4 or IPv6 literal) is loopback, private, link-local,
 * unique-local, or otherwise not a public unicast address. Conservative: an
 * address it can't confidently classify as public is treated as unsafe.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const raw = (ip || '').trim().toLowerCase();
  if (!raw) {
    return true;
  }

  // IPv4-mapped / -embedded IPv6 (e.g. ::ffff:169.254.169.254) — classify the v4 tail.
  const mapped = raw.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (raw.includes(':') && mapped) {
    const parts = ipv4ToParts(mapped[1]);
    return parts ? isPrivateIpv4(parts) : true;
  }

  const v4 = ipv4ToParts(raw);
  if (v4) {
    return isPrivateIpv4(v4);
  }

  // IPv6 literals (strip zone id).
  const v6 = raw.split('%')[0];
  if (v6.includes(':')) {
    if (v6 === '::1' || v6 === '::') {return true;} // loopback / unspecified
    if (v6.startsWith('fe80')) {return true;} // link-local
    if (v6.startsWith('fc') || v6.startsWith('fd')) {return true;} // unique-local fc00::/7
    if (v6.startsWith('ff')) {return true;} // multicast
    return false; // global unicast
  }

  // Not a recognizable IP literal — caller resolves via DNS; treat literal as unsafe.
  return true;
}
