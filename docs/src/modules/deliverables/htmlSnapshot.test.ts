import { expect } from 'chai';
import { isSavedNextSnapshotHtml, sanitizeSavedNextSnapshotHtml } from './htmlSnapshot';

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
});
