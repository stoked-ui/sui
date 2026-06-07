import OpenAI from 'openai';

let _client: OpenAI | null = null;

/**
 * The audit bot's inference engine is an OpenAI-compatible endpoint —
 * by default this points at LM Studio running on hq.stokd.cloud serving
 * Qwen 2.5 32B-Instruct. The same code works against any OpenAI-compatible
 * server (vLLM, Ollama, llama.cpp server, or the OpenAI / Anthropic-via-proxy
 * APIs themselves) by changing AUDIT_BOT_BASE_URL.
 *
 * LM Studio defaults:
 *   - base URL:  http://localhost:1234/v1
 *   - API key:   any non-empty string (LM Studio doesn't auth)
 *   - model id:  whatever's loaded in LM Studio (or use JIT loading)
 */
export function getLlmClient(): OpenAI {
  if (_client) {
    return _client;
  }
  const baseURL = process.env.AUDIT_BOT_BASE_URL || 'http://localhost:1234/v1';
  const apiKey = process.env.AUDIT_BOT_API_KEY || 'lm-studio';
  _client = new OpenAI({ baseURL, apiKey });
  return _client;
}

// Default points at Qwen 3 VL 32B Instruct — strong open-weight tool calling,
// fits on a single high-end GPU. Override via AUDIT_BOT_MODEL. The exact string
// must match what LM Studio's /v1/models endpoint returns (check `lms ls` or
// the model card in LM Studio). Common alternatives: `llama-3.3-70b-instruct`,
// `gemma-3-31b-instruct`, etc.
export const AUDIT_MODEL = process.env.AUDIT_BOT_MODEL || 'qwen3-vl-32b-instruct';

export const MAX_TOOL_ITERATIONS = 6;

/**
 * Some OpenAI-compatible backends (notably Bedrock's /openai/v1 endpoint
 * serving gpt-oss models) inline the model's chain-of-thought into the
 * message content as <reasoning>...</reasoning> blocks instead of using a
 * separate reasoning field. Visitors must never see that — strip every
 * block, including an unterminated one from a truncated response.
 */
export function stripReasoning(text: string | null | undefined): string {
  if (!text) {
    return '';
  }
  return text
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '')
    .replace(/<reasoning>[\s\S]*$/g, '')
    .trim();
}

export { PLAYBOOKS, isPlaybookId } from './playbooks';
export type { PlaybookId, PlaybookConfig } from './playbooks';
