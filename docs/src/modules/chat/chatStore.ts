import { randomUUID } from 'crypto';
import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';

export type ChatProvider = 'telegram' | 'whats-app';
export type ChatMessageRole = 'user' | 'support';

export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  sequence: number;
  source: 'web' | 'telegram';
  createdAt: string;
  telegramMessageId?: number;
  telegramUpdateId?: number;
  replyToTelegramMessageId?: number;
}

interface ChatSessionRecord {
  id: string;
  provider: ChatProvider;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastSequence: number;
  status: 'open';
}

interface ChatMessageDoc {
  _id: ObjectId;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  sequence: number;
  source: 'web' | 'telegram';
  createdAt: Date;
  telegramMessageId?: number;
  telegramUpdateId?: number;
  replyToTelegramMessageId?: number;
}

interface ChatSessionDoc {
  _id: ObjectId;
  sessionId: string;
  provider: ChatProvider;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  lastSequence: number;
  status: 'open';
}

interface ChatStateDoc {
  _id: string;
  telegramOffset: number;
  updatedAt: Date;
}

interface MemoryChatState {
  sessions: Map<string, ChatSessionRecord>;
  messages: Map<string, ChatMessageRecord[]>;
  telegramOffset: number;
  warnedNoMongo: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var _webUserDirectChatMemory: MemoryChatState | undefined;
}

const CHAT_SESSIONS_COLLECTION = 'chatSessions';
const CHAT_MESSAGES_COLLECTION = 'chatMessages';
const CHAT_STATE_COLLECTION = 'chatState';

function getMemoryState(): MemoryChatState {
  if (!global._webUserDirectChatMemory) {
    global._webUserDirectChatMemory = {
      sessions: new Map(),
      messages: new Map(),
      telegramOffset: 0,
      warnedNoMongo: false,
    };
  }

  return global._webUserDirectChatMemory;
}

async function shouldUseMemoryStore() {
  if (!process.env.MONGODB_URI || process.env.CHAT_STORE === 'memory') {
    const memory = getMemoryState();
    if (!memory.warnedNoMongo) {
      console.warn('[chat] Using in-memory chat store because MONGODB_URI is not configured.');
      memory.warnedNoMongo = true;
    }
    return true;
  }

  return false;
}

async function getMongoCollections() {
  if (await shouldUseMemoryStore()) {
    return null;
  }

  try {
    const db = await getDb();

    return {
      sessions: db.collection<ChatSessionDoc>(CHAT_SESSIONS_COLLECTION),
      messages: db.collection<ChatMessageDoc>(CHAT_MESSAGES_COLLECTION),
      state: db.collection<ChatStateDoc>(CHAT_STATE_COLLECTION),
    };
  } catch (error) {
    const memory = getMemoryState();
    if (!memory.warnedNoMongo) {
      console.warn('[chat] Falling back to in-memory chat store because Mongo is unavailable.', error);
      memory.warnedNoMongo = true;
    }
    return null;
  }
}

function toPublicMessage(doc: ChatMessageDoc | ChatMessageRecord): ChatMessageRecord {
  return {
    id: 'id' in doc ? doc.id : doc._id.toHexString(),
    sessionId: doc.sessionId,
    role: doc.role,
    content: doc.content,
    sequence: doc.sequence,
    source: doc.source,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    ...(doc.telegramMessageId ? { telegramMessageId: doc.telegramMessageId } : {}),
    ...(doc.telegramUpdateId ? { telegramUpdateId: doc.telegramUpdateId } : {}),
    ...(doc.replyToTelegramMessageId
      ? { replyToTelegramMessageId: doc.replyToTelegramMessageId }
      : {}),
  };
}

function toPublicSession(doc: ChatSessionDoc | ChatSessionRecord): ChatSessionRecord {
  return {
    id: 'id' in doc ? doc.id : doc.sessionId,
    provider: doc.provider,
    name: doc.name,
    email: doc.email,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
    lastSequence: doc.lastSequence,
    status: doc.status,
  };
}

export async function createChatSession(params: {
  provider: ChatProvider;
  name: string;
  email: string;
}) {
  const now = new Date();
  const sessionId = randomUUID();
  const collections = await getMongoCollections();

  if (!collections) {
    const session: ChatSessionRecord = {
      id: sessionId,
      provider: params.provider,
      name: params.name,
      email: params.email,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastSequence: 0,
      status: 'open',
    };
    const memory = getMemoryState();
    memory.sessions.set(sessionId, session);
    memory.messages.set(sessionId, []);
    return session;
  }

  const doc: ChatSessionDoc = {
    _id: new ObjectId(),
    sessionId,
    provider: params.provider,
    name: params.name,
    email: params.email,
    createdAt: now,
    updatedAt: now,
    lastSequence: 0,
    status: 'open',
  };

  await collections.sessions.insertOne(doc);
  return toPublicSession(doc);
}

export async function getChatSession(sessionId: string) {
  const collections = await getMongoCollections();

  if (!collections) {
    const session = getMemoryState().sessions.get(sessionId);
    return session ?? null;
  }

  const session = await collections.sessions.findOne({ sessionId });
  return session ? toPublicSession(session) : null;
}

export async function appendChatMessage(params: {
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  source: 'web' | 'telegram';
  telegramMessageId?: number;
  telegramUpdateId?: number;
  replyToTelegramMessageId?: number;
}) {
  const collections = await getMongoCollections();
  const now = new Date();

  if (!collections) {
    const memory = getMemoryState();
    const session = memory.sessions.get(params.sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    if (params.telegramUpdateId) {
      const existing = (memory.messages.get(params.sessionId) || []).find(
        (message) => message.telegramUpdateId === params.telegramUpdateId,
      );
      if (existing) {
        return existing;
      }
    }

    const nextSequence = session.lastSequence + 1;
    session.lastSequence = nextSequence;
    session.updatedAt = now.toISOString();
    memory.sessions.set(params.sessionId, session);

    const nextMessage: ChatMessageRecord = {
      id: randomUUID(),
      sessionId: params.sessionId,
      role: params.role,
      content: params.content,
      sequence: nextSequence,
      source: params.source,
      createdAt: now.toISOString(),
      ...(params.telegramMessageId ? { telegramMessageId: params.telegramMessageId } : {}),
      ...(params.telegramUpdateId ? { telegramUpdateId: params.telegramUpdateId } : {}),
      ...(params.replyToTelegramMessageId
        ? { replyToTelegramMessageId: params.replyToTelegramMessageId }
        : {}),
    };

    const messages = memory.messages.get(params.sessionId) || [];
    messages.push(nextMessage);
    memory.messages.set(params.sessionId, messages);

    return nextMessage;
  }

  if (params.telegramUpdateId) {
    const existing = await collections.messages.findOne({ telegramUpdateId: params.telegramUpdateId });
    if (existing) {
      return toPublicMessage(existing);
    }
  }

  const sessionUpdate = await collections.sessions.findOneAndUpdate(
    { sessionId: params.sessionId },
    {
      $inc: { lastSequence: 1 },
      $set: { updatedAt: now },
    },
    { returnDocument: 'after' },
  );

  if (!sessionUpdate) {
    throw new Error('Chat session not found');
  }

  const nextMessage: ChatMessageDoc = {
    _id: new ObjectId(),
    sessionId: params.sessionId,
    role: params.role,
    content: params.content,
    sequence: sessionUpdate.lastSequence,
    source: params.source,
    createdAt: now,
    ...(params.telegramMessageId ? { telegramMessageId: params.telegramMessageId } : {}),
    ...(params.telegramUpdateId ? { telegramUpdateId: params.telegramUpdateId } : {}),
    ...(params.replyToTelegramMessageId
      ? { replyToTelegramMessageId: params.replyToTelegramMessageId }
      : {}),
  };

  await collections.messages.insertOne(nextMessage);
  return toPublicMessage(nextMessage);
}

export async function listChatMessagesAfter(sessionId: string, afterSequence: number) {
  const collections = await getMongoCollections();

  if (!collections) {
    return (getMemoryState().messages.get(sessionId) || [])
      .filter((message) => message.sequence > afterSequence)
      .sort((a, b) => a.sequence - b.sequence);
  }

  const messages = await collections.messages
    .find({ sessionId, sequence: { $gt: afterSequence } })
    .sort({ sequence: 1 })
    .toArray();

  return messages.map((message) => toPublicMessage(message));
}

export async function findSessionIdByTelegramMessageId(telegramMessageId: number) {
  const collections = await getMongoCollections();

  if (!collections) {
    for (const [sessionId, messages] of getMemoryState().messages.entries()) {
      if (messages.some((message) => message.telegramMessageId === telegramMessageId)) {
        return sessionId;
      }
    }

    return null;
  }

  const message = await collections.messages.findOne({ telegramMessageId });
  return message?.sessionId ?? null;
}

export async function getTelegramOffset() {
  const collections = await getMongoCollections();

  if (!collections) {
    return getMemoryState().telegramOffset;
  }

  const state = await collections.state.findOne({ _id: 'telegram' });
  return state?.telegramOffset ?? 0;
}

export async function setTelegramOffset(offset: number) {
  const collections = await getMongoCollections();
  const now = new Date();

  if (!collections) {
    getMemoryState().telegramOffset = offset;
    return;
  }

  await collections.state.updateOne(
    { _id: 'telegram' },
    {
      $set: {
        telegramOffset: offset,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
}
