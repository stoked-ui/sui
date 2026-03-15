import { expect } from 'chai';
import {
  injectBaseHrefIntoHtml,
  isSavedNextSnapshotHtml,
  prepareDeliverableHtmlForProxy,
  prepareDeliverableHtmlForStorage,
  sanitizeSavedNextSnapshotHtml,
} from './htmlSnapshot';

describe('deliverables htmlSnapshot', () => {
  it('detects saved Next.js development snapshots', () => {
    const html = `
      <!DOCTYPE html>
      <!-- saved from url=(0069)http://localhost:5199/consulting/clients/xferall/ -->
      <html>
        <body>
          <div id="__next"><main>Snapshot content</main></div>
          <script id="__NEXT_DATA__" type="application/json">{"buildId":"development"}</script>
          <script src="./index_files/react-refresh.js"></script>
        </body>
      </html>
    `;

    expect(isSavedNextSnapshotHtml(html)).to.equal(true);
  });

  it('strips scripts from saved snapshots while keeping rendered content', () => {
    const html = `
      <html>
        <body>
          <div id="__next"><main>Snapshot content</main></div>
          <script>window.__NEXT_DATA__ = {};</script>
          <script src="./index_files/main.js"></script>
        </body>
      </html>
    `;

    const sanitized = sanitizeSavedNextSnapshotHtml(html);

    expect(sanitized).to.contain('Snapshot content');
    expect(sanitized).not.to.contain('<script');
    expect(sanitized).not.to.contain('main.js');
  });

  it('ignores regular HTML documents that are not saved Next snapshots', () => {
    const html = `
      <html>
        <body>
          <div id="app">Regular content</div>
        </body>
      </html>
    `;

    expect(isSavedNextSnapshotHtml(html)).to.equal(false);
  });

  it('injects a base href into proxied HTML documents', () => {
    const html = `
      <html>
        <head><title>Snapshot</title></head>
        <body>
          <main>Snapshot content</main>
        </body>
      </html>
    `;

    const output = injectBaseHrefIntoHtml(html, 'https://cdn.stokedconsulting.com/clients/xferall/deliverables/q1/index.html');

    expect(output).to.contain('<base href="https://cdn.stokedconsulting.com/clients/xferall/deliverables/q1/">');
  });

  it('sanitizes saved Next snapshots for proxy rendering while preserving assets', () => {
    const html = `
      <!DOCTYPE html>
      <!-- saved from url=(0069)http://localhost:5199/consulting/clients/xferall/ -->
      <html>
        <head>
          <title>Xferall</title>
          <link rel="stylesheet" href="./index_files/app.css" />
        </head>
        <body>
          <div id="__next"><main>Snapshot content</main></div>
          <script id="__NEXT_DATA__" type="application/json">{"buildId":"development"}</script>
          <script>window.__HYDRATION_ERROR__ = true;</script>
        </body>
      </html>
    `;

    const output = prepareDeliverableHtmlForProxy(
      html,
      'https://cdn.stokedconsulting.com/clients/xferall/deliverables/q1/index.html',
    );

    expect(output).to.contain('Snapshot content');
    expect(output).to.contain('<base href="https://cdn.stokedconsulting.com/clients/xferall/deliverables/q1/">');
    expect(output).not.to.contain('<script');
    expect(output).to.contain('./index_files/app.css');
  });

  it('sanitizes saved Next snapshots before storing uploaded HTML deliverables', () => {
    const html = `
      <!DOCTYPE html>
      <!-- saved from url=(0069)http://localhost:5199/consulting/clients/xferall/ -->
      <html>
        <body>
          <div id="__next"><main>Stored snapshot</main></div>
          <script>window.__NEXT_DATA__ = {};</script>
        </body>
      </html>
    `;

    const output = prepareDeliverableHtmlForStorage(
      html,
      'https://cdn.stokedconsulting.com/clients/xferall/deliverables/q1/index.html',
    );

    expect(output).to.contain('Stored snapshot');
    expect(output).to.contain('<base href="https://cdn.stokedconsulting.com/clients/xferall/deliverables/q1/">');
    expect(output).not.to.contain('<script');
  });
});
