import { expect } from 'chai';
import * as path from 'path';
import { getPlaybookSystemPrompt } from './server';

describe('auditBot playbooks — getPlaybookSystemPrompt', () => {
  it('loads a prompt when cwd is the repo root (local dev)', () => {
    const prompt = getPlaybookSystemPrompt('ai-readiness');
    expect(prompt).to.be.a('string').and.to.have.length.greaterThan(100);
  });

  it('loads a prompt when cwd is the docs app dir (Lambda: /var/task/docs)', () => {
    const original = process.cwd();
    // The repo-root suite runs with cwd at the monorepo root; the Lambda runs
    // with cwd at the Next.js app dir. Simulate the latter.
    process.chdir(path.join(original, 'docs'));
    try {
      const prompt = getPlaybookSystemPrompt('cloud-cost');
      expect(prompt).to.be.a('string').and.to.have.length.greaterThan(100);
    } finally {
      process.chdir(original);
    }
  });

  it('caches per playbook id', () => {
    const a = getPlaybookSystemPrompt('security');
    const b = getPlaybookSystemPrompt('security');
    expect(a).to.equal(b);
  });
});
