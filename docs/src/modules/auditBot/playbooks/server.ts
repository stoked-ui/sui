import * as fs from 'fs';
import * as path from 'path';
import type { PlaybookId } from './index';

const promptCache = new Map<PlaybookId, string>();

export function getPlaybookSystemPrompt(id: PlaybookId): string {
  const cached = promptCache.get(id);
  if (cached) {
    return cached;
  }
  const promptPath = path.join(
    process.cwd(),
    'docs/src/modules/auditBot/playbooks',
    id,
    'system.md',
  );
  const prompt = fs.readFileSync(promptPath, 'utf8');
  promptCache.set(id, prompt);
  return prompt;
}
