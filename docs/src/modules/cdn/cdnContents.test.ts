import { expect } from 'chai';
import {
  buildCdnViewer,
  isCdnContentsFormat,
  normalizeCdnPrefixFromSegments,
  parseCdnContentsMaxKeys,
  sanitizeCdnPrefix,
} from './cdnContents';

describe('cdn contents helpers', () => {
  it('sanitizes query prefixes into normalized directory paths', () => {
    expect(sanitizeCdnPrefix('/realty//2602.hidalgo/pictures')).to.equal('realty/2602.hidalgo/pictures/');
    expect(sanitizeCdnPrefix('../realty/2602.hidalgo/pictures')).to.equal('realty/2602.hidalgo/pictures/');
  });

  it('normalizes optional catch-all path segments into a CDN prefix', () => {
    expect(normalizeCdnPrefixFromSegments(['realty', '2602.hidalgo', 'pictures'])).to.equal(
      'realty/2602.hidalgo/pictures/',
    );
    expect(normalizeCdnPrefixFromSegments(undefined)).to.equal('');
  });

  it('recognizes supported path-based formats only', () => {
    expect(isCdnContentsFormat('json')).to.equal(true);
    expect(isCdnContentsFormat('yaml')).to.equal(true);
    expect(isCdnContentsFormat('xml')).to.equal(false);
  });

  it('caps maxKeys to the API maximum and falls back on invalid input', () => {
    expect(parseCdnContentsMaxKeys('25')).to.equal(25);
    expect(parseCdnContentsMaxKeys('5000')).to.equal(1000);
    expect(parseCdnContentsMaxKeys('nope')).to.equal(1000);
  });

  it('builds an anonymous viewer when no auth user exists', () => {
    expect(buildCdnViewer(null)).to.deep.equal({
      sub: 'anonymous',
      role: 'anonymous',
    });
  });
});
