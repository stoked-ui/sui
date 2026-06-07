import * as fs from 'fs';
import * as path from 'path';
import type { PlaybookId } from './index';

const promptCache = new Map<PlaybookId, string>();

export function getPlaybookSystemPrompt(id: PlaybookId): string {
  const cached = promptCache.get(id);
  if (cached) {
    return cached;
  }
  // cwd differs by runtime: the monorepo root in local dev, but the Next.js
  // app dir on Lambda (/var/task/docs). Try both layouts.
  const candidates = [
    path.join(process.cwd(), 'docs/src/modules/auditBot/playbooks', id, 'system.md'),
    path.join(process.cwd(), 'src/modules/auditBot/playbooks', id, 'system.md'),
  ];
  const promptPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!promptPath) {
    throw new Error(`Playbook system prompt not found for "${id}" (tried: ${candidates.join(', ')})`);
  }
  const prompt = fs.readFileSync(promptPath, 'utf8');
  promptCache.set(id, prompt);
  return prompt;
}
