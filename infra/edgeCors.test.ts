/// <reference types="mocha" />

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import * as edgeCors from './edge-cors';

const edgeCorsModulePath = path.resolve(process.cwd(), 'infra/edge-cors.ts');

describe('credentialed edge CORS policy', () => {
  before(() => {
    expect(
      fs.existsSync(edgeCorsModulePath),
      'infra/edge-cors.ts must define the shared policy',
    ).to.equal(true);
  });

  it('echoes an exact owned origin with credentials for API preflight', () => {
    const response = edgeCors.getEdgePreflightResponse(
      '/api/auth/session',
      'https://stokedconsulting.com',
    );

    expect(response.statusCode).to.equal(204);
    expect(response.headers['access-control-allow-origin']).to.equal(
      'https://stokedconsulting.com',
    );
    expect(response.headers['access-control-allow-credentials']).to.equal('true');
    expect(response.headers.vary).to.contain('Origin');
  });

  it('retains the Brian Stoker production origins as CORS-only consumers', () => {
    for (const origin of ['https://brianstoker.com', 'https://www.brianstoker.com']) {
      const response = edgeCors.getEdgePreflightResponse('/api/media', origin);
      expect(response.statusCode).to.equal(204);
      expect(response.headers['access-control-allow-origin']).to.equal(origin);
      expect(response.headers['access-control-allow-credentials']).to.equal('true');
    }
  });

  it('denies unknown API preflight without an allow-origin header', () => {
    const response = edgeCors.getEdgePreflightResponse(
      '/api/auth/session',
      'https://unknown.example.com',
    );

    expect(response.statusCode).to.equal(403);
    expect(response.headers['access-control-allow-origin']).to.equal(undefined);
    expect(response.headers['access-control-allow-credentials']).to.equal(undefined);
  });

  it('keeps wildcard CORS noncredentialed for public media and static responses', () => {
    const preflight = edgeCors.getEdgePreflightResponse(
      '/clients/xferall/video.mp4',
      'https://unknown.example.com',
    );
    const responseHeaders = edgeCors.getEdgeResponseHeaders(
      '/static/logo.svg',
      'https://unknown.example.com',
    );

    expect(preflight.statusCode).to.equal(204);
    expect(preflight.headers['access-control-allow-origin']).to.equal('*');
    expect(preflight.headers['access-control-allow-credentials']).to.equal(undefined);
    expect(responseHeaders['access-control-allow-origin']).to.equal('*');
    expect(responseHeaders['access-control-allow-credentials']).to.equal(undefined);
  });

  it('omits API response credentials and allow-origin for an unknown origin', () => {
    const headers = edgeCors.getEdgeResponseHeaders(
      '/api/cdn/contents',
      'https://unknown.example.com',
    );

    expect(headers['access-control-allow-origin']).to.equal(undefined);
    expect(headers['access-control-allow-credentials']).to.equal(undefined);
    expect(headers.vary).to.contain('Origin');
  });

  it('wires the shared policy into the site and both CDN site factories', () => {
    const siteSource = fs.readFileSync(path.resolve(process.cwd(), 'infra/site.ts'), 'utf8');
    const cdnSource = fs.readFileSync(path.resolve(process.cwd(), 'infra/cdn-site.ts'), 'utf8');

    expect(siteSource).to.contain('createEdgeCorsPreflightInjection');
    expect(siteSource).to.contain('createEdgeCorsResponseInjection');
    expect(cdnSource).to.contain('createEdgeCorsPreflightInjection');
    expect(cdnSource).to.contain('createEdgeCorsResponseInjection');
    expect(cdnSource.match(/createEdgeCorsPreflightInjection/g)?.length).to.be.greaterThan(1);
  });
});
