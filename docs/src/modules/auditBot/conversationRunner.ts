import type OpenAI from 'openai';
import { getLlmClient, AUDIT_MODEL, MAX_TOOL_ITERATIONS } from './llmClient';
import { getPlaybookSystemPrompt } from './playbooks/server';
import type { PlaybookId } from './playbooks';
import { AUDIT_TOOLS, executeTool, type ToolName } from './tools';
import type { AuditReport } from './types';

export interface ClientChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RunTurnInput {
  sessionId: string;
  playbook: PlaybookId;
  /** Prior messages in the conversation, oldest first. Does NOT include the new user message. */
  history: ClientChatMessage[];
  /** The new user message to append for this turn. */
  userMessage: string;
}

export interface RunTurnResult {
  /** The assistant's text reply to display in the chat UI. */
  reply: string;
  /** If the model called generate_report this turn, the structured payload. */
  report?: AuditReport;
  /** True if the model signaled it called save_lead this turn — UI should treat as terminal. */
  finished: boolean;
  inputTokens?: number;
  outputTokens?: number;
}

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type AssistantMessage = OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;
type ToolMessage = OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
type ToolCall = OpenAI.Chat.Completions.ChatCompletionMessageToolCall;

function safeParseJson(raw: string): Record<string, unknown> {
  if (!raw || !raw.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

/**
 * Run one conversational turn against the LM Studio / Qwen endpoint.
 * Loops on tool_calls server-side so the frontend only sees clean assistant text
 * plus (optionally) a structured report payload when generate_report fires.
 */
export async function runTurn(input: RunTurnInput): Promise<RunTurnResult> {
  const client = getLlmClient();
  const systemPrompt = getPlaybookSystemPrompt(input.playbook);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...input.history.map((m): ChatMessage => ({ role: m.role, content: m.content })),
    { role: 'user', content: input.userMessage },
  ];

  let report: AuditReport | undefined;
  let finished = false;
  let inputTokens = 0;
  let outputTokens = 0;
  let lastReply = '';

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    const response = await client.chat.completions.create({
      model: AUDIT_MODEL,
      messages,
      tools: AUDIT_TOOLS,
      temperature: 0.4,
      max_tokens: 2048,
    });

    if (response.usage) {
      inputTokens += response.usage.prompt_tokens || 0;
      outputTokens += response.usage.completion_tokens || 0;
    }

    const choice = response.choices[0];
    if (!choice) {
      return {
        reply: "Sorry — empty response. Could you say that again?",
        report,
        finished,
        inputTokens,
        outputTokens,
      };
    }

    const message = choice.message;
    const toolCalls: ToolCall[] | undefined = message.tool_calls;
    const assistantText = (message.content || '').trim();
    if (assistantText) {
      lastReply = assistantText;
    }

    const assistantMessage: AssistantMessage = {
      role: 'assistant',
      content: assistantText || null,
    };
    if (toolCalls && toolCalls.length > 0) {
      assistantMessage.tool_calls = toolCalls;
    }
    messages.push(assistantMessage);

    if (!toolCalls || toolCalls.length === 0) {
      return {
        reply: lastReply,
        report,
        finished,
        inputTokens,
        outputTokens,
      };
    }

    // Process each tool call from this turn.
    for (const call of toolCalls) {
      if (call.type !== 'function') {
        continue;
      }
      const name = call.function.name as ToolName;
      const args = safeParseJson(call.function.arguments || '{}');

      if (name === 'generate_report') {
        report = {
          ...(args as Record<string, unknown>),
          playbook: input.playbook,
        } as unknown as AuditReport;
        const result: ToolMessage = {
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify({ ok: true, rendered: true }),
        };
        messages.push(result);
        continue;
      }

      if (name === 'email_report') {
        const result: ToolMessage = {
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify({ ok: true, queued: true }),
        };
        messages.push(result);
        continue;
      }

      if (name === 'save_lead') {
        finished = true;
        const result: ToolMessage = {
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify({ ok: true, leadId: 'queued' }),
        };
        messages.push(result);
        continue;
      }

      // Server-executed tool — fetch_company_site etc.
      const exec = await executeTool(
        name,
        args,
        { sessionId: input.sessionId, playbook: input.playbook },
      );
      const result: ToolMessage = {
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(exec),
      };
      messages.push(result);
    }

    if (finished) {
      return {
        reply: lastReply,
        report,
        finished,
        inputTokens,
        outputTokens,
      };
    }
  }

  return {
    reply: lastReply || "Sorry — I hit my limit on that turn. Could you say that again?",
    report,
    finished,
    inputTokens,
    outputTokens,
  };
}
