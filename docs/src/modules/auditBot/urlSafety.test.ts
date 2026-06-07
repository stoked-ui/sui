import { expect } from 'chai';
import {
  normalizeUrl,
  isBlockedHostname,
  isPrivateOrReservedIp,
  UnsafeUrlError,
} from './urlSafety';

describe('auditBot urlSafety', () => {
  describe('normalizeUrl', () => {
    it('defaults to https when no scheme is given', () => {
      expect(normalizeUrl('example.com/about').href).to.equal('https://example.com/about');
    });

    it('accepts explicit http and https', () => {
      expect(normalizeUrl('http://example.com').protocol).to.equal('http:');
      expect(normalizeUrl('https://example.com').protocol).to.equal('https:');
    });

    it('rejects non-http(s) schemes', () => {
      expect(() => normalizeUrl('ftp://example.com')).to.throw(UnsafeUrlError);
      expect(() => normalizeUrl('file:///etc/passwd')).to.throw(UnsafeUrlError);
      expect(() => normalizeUrl('gopher://example.com')).to.throw(UnsafeUrlError);
    });

    it('rejects URLs with embedded credentials', () => {
      expect(() => normalizeUrl('https://user:pass@example.com')).to.throw(UnsafeUrlError);
    });

    it('rejects empty / unparseable input', () => {
      expect(() => normalizeUrl('')).to.throw(UnsafeUrlError);
      expect(() => normalizeUrl('   ')).to.throw(UnsafeUrlError);
      expect(() => normalizeUrl('http://')).to.throw(UnsafeUrlError);
    });
  });

  describe('isBlockedHostname', () => {
    it('blocks localhost and friends', () => {
      expect(isBlockedHostname('localhost')).to.equal(true);
      expect(isBlockedHostname('LOCALHOST')).to.equal(true);
      expect(isBlockedHostname('foo.localhost')).to.equal(true);
      expect(isBlockedHostname('printer.local')).to.equal(true);
      expect(isBlockedHostname('db.prod.internal')).to.equal(true);
      expect(isBlockedHostname('metadata')).to.equal(true);
      expect(isBlockedHostname('metadata.google.internal')).to.equal(true);
      expect(isBlockedHostname('metadata.google.internal.')).to.equal(true); // trailing dot
    });

    it('allows normal public hostnames', () => {
      expect(isBlockedHostname('example.com')).to.equal(false);
      expect(isBlockedHostname('www.localglass.com')).to.equal(false); // "local" inside a label is fine
      expect(isBlockedHostname('internal-tools.example.com')).to.equal(false);
    });
  });

  describe('isPrivateOrReservedIp', () => {
    it('blocks IPv4 loopback, private, link-local, CGNAT, and reserved ranges', () => {
      const blocked = [
        '127.0.0.1',
        '10.0.0.5',
        '172.16.0.1',
        '172.31.255.255',
        '192.168.1.1',
        '169.254.169.254', // cloud metadata
        '100.64.0.1', // CGNAT
        '0.0.0.0',
        '192.0.2.10', // TEST-NET
        '198.18.0.1', // benchmarking
        '224.0.0.1', // multicast
        '255.255.255.255',
      ];
      blocked.forEach((ip) => {
        expect(isPrivateOrReservedIp(ip), ip).to.equal(true);
      });
    });

    it('allows public IPv4 addresses', () => {
      const allowed = ['8.8.8.8', '1.1.1.1', '172.15.0.1', '172.32.0.1', '100.63.0.1', '100.128.0.1'];
      allowed.forEach((ip) => {
        expect(isPrivateOrReservedIp(ip), ip).to.equal(false);
      });
    });

    it('blocks IPv6 loopback, link-local, unique-local, multicast, and v4-mapped private', () => {
      const blocked = ['::1', '::', 'fe80::1', 'fc00::1', 'fd12:3456::1', 'ff02::1', '::ffff:10.0.0.1', '::ffff:169.254.169.254'];
      blocked.forEach((ip) => {
        expect(isPrivateOrReservedIp(ip), ip).to.equal(true);
      });
    });

    it('allows public IPv6 addresses', () => {
      expect(isPrivateOrReservedIp('2607:f8b0:4000::1')).to.equal(false);
      expect(isPrivateOrReservedIp('::ffff:8.8.8.8')).to.equal(false);
    });

    it('treats non-IP input as unsafe (caller must resolve hostnames first)', () => {
      expect(isPrivateOrReservedIp('example.com')).to.equal(true);
      expect(isPrivateOrReservedIp('')).to.equal(true);
      expect(isPrivateOrReservedIp('999.1.1.1')).to.equal(true);
    });
  });
});
