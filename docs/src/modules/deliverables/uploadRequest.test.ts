import { expect } from 'chai';
import { resolveUploadRequest } from './uploadRequest';

describe('deliverables uploadRequest', () => {
  it('resolves metadata from the query string for a raw .json file upload', () => {
    // The `stoked` CLI uploads raw bytes and sets Content-Type from the file's
    // own mime type, so a `.json` deliverable arrives as `application/json`
    // with its metadata in the query string. Branching on the header alone
    // parsed this body as the metadata envelope and lost the clientId.
    const rawBody = Buffer.from(
      JSON.stringify({
        product: 'Popdock',
        phases: [{ id: 'phase-0', title: 'Foundations' }],
      }),
      'utf8',
    );

    const resolved = resolveUploadRequest({
      contentType: 'application/json',
      query: {
        clientId: '6a8454fbfb2ea48bf61710e7',
        clientSlug: 'eone-solutions',
        bundleId: 'eone-solutions-popdock-iac',
        filePath: 'references/facts.json',
      },
      rawBody,
    });

    expect(resolved.clientId).to.equal('6a8454fbfb2ea48bf61710e7');
    expect(resolved.clientSlug).to.equal('eone-solutions');
    expect(resolved.bundleId).to.equal('eone-solutions-popdock-iac');
    expect(resolved.filePath).to.equal('references/facts.json');
    expect(resolved.contentType).to.equal('application/json');
    expect(resolved.buffer.equals(rawBody)).to.equal(true);
  });

  it('still resolves the legacy JSON envelope when the query carries no metadata', () => {
    const fileBytes = Buffer.from('<h1>report</h1>', 'utf8');
    const rawBody = Buffer.from(
      JSON.stringify({
        clientId: '6a8454fbfb2ea48bf61710e7',
        clientSlug: 'eone-solutions',
        bundleId: 'eone-solutions-popdock-iac',
        filePath: 'index.html',
        contentType: 'text/html',
        file: fileBytes.toString('base64'),
      }),
      'utf8',
    );

    const resolved = resolveUploadRequest({
      contentType: 'application/json',
      query: {},
      rawBody,
    });

    expect(resolved.clientId).to.equal('6a8454fbfb2ea48bf61710e7');
    expect(resolved.bundleId).to.equal('eone-solutions-popdock-iac');
    expect(resolved.filePath).to.equal('index.html');
    expect(resolved.contentType).to.equal('text/html');
    expect(resolved.buffer.equals(fileBytes)).to.equal(true);
  });

  it('resolves non-JSON raw uploads from the query string', () => {
    const rawBody = Buffer.from('<h1>brief</h1>', 'utf8');

    const resolved = resolveUploadRequest({
      contentType: 'text/html; charset=utf-8',
      query: {
        clientId: '6a8454fbfb2ea48bf61710e7',
        bundleId: 'eone-solutions-popdock-iac',
        filePath: 'index.html',
      },
      rawBody,
    });

    expect(resolved.clientId).to.equal('6a8454fbfb2ea48bf61710e7');
    expect(resolved.contentType).to.equal('text/html');
    expect(resolved.buffer.equals(rawBody)).to.equal(true);
  });

  it('falls back to octet-stream when no Content-Type is sent', () => {
    const resolved = resolveUploadRequest({
      contentType: undefined,
      query: { clientId: '6a8454fbfb2ea48bf61710e7' },
      rawBody: Buffer.from('bytes', 'utf8'),
    });

    expect(resolved.contentType).to.equal('application/octet-stream');
  });

  it('takes the first value when a query parameter repeats', () => {
    const resolved = resolveUploadRequest({
      contentType: 'application/pdf',
      query: { clientId: ['6a8454fbfb2ea48bf61710e7', 'ignored'] },
      rawBody: Buffer.from('%PDF-1.7', 'utf8'),
    });

    expect(resolved.clientId).to.equal('6a8454fbfb2ea48bf61710e7');
  });
});
