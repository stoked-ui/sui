import * as bcrypt from 'bcryptjs';
import { Db, ObjectId } from 'mongodb';

type MaybeObjectId = ObjectId | string | null | undefined;

type ClientLike = {
  _id?: MaybeObjectId;
  contactEmail?: string;
  contactUserId?: MaybeObjectId;
  [key: string]: unknown;
};

type UserLike = {
  _id?: MaybeObjectId;
  name?: string;
  email?: string;
  active?: boolean;
  role?: string;
  clientId?: MaybeObjectId;
  [key: string]: unknown;
};

export type ClientContactInput = {
  name: string;
  email: string;
  password?: string;
};

export type LinkedContactUser = {
  _id: ObjectId;
  name: string;
  email: string;
  role: string;
  active: boolean;
  clientId?: ObjectId;
};

export function toIdString(value: MaybeObjectId): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && typeof value.toString === 'function') {
    return value.toString();
  }

  return undefined;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function buildContactUserSummary(user: UserLike) {
  return {
    _id: toIdString(user._id) || '',
    name: typeof user.name === 'string' ? user.name : '',
    email: typeof user.email === 'string' ? user.email : '',
    active: Boolean(user.active),
    role: typeof user.role === 'string' ? user.role : 'client',
    clientId: toIdString(user.clientId),
  };
}

export function mergeClientWithContact(client: ClientLike, contactUser?: UserLike | null) {
  const nextClient = {
    ...client,
    contactUserId: toIdString(client.contactUserId),
    contactEmail: contactUser?.email || client.contactEmail || '',
  };

  if (!contactUser) {
    return nextClient;
  }

  return {
    ...nextClient,
    contactUser: buildContactUserSummary(contactUser),
  };
}

export function validateAssignableContactUser(user: UserLike | null | undefined, clientId?: string) {
  if (!user) {
    return 'Contact user not found';
  }

  if (user.role && user.role !== 'client') {
    return 'Contact user must have client role';
  }

  const assignedClientId = toIdString(user.clientId);
  if (assignedClientId && assignedClientId !== clientId) {
    return 'Contact user is already assigned to another client';
  }

  return null;
}

export async function hydrateClientWithContact(db: Db, client: ClientLike | null) {
  if (!client) {
    return null;
  }

  const contactUserId = toIdString(client.contactUserId);
  if (!contactUserId || !ObjectId.isValid(contactUserId)) {
    return mergeClientWithContact(client);
  }

  const contactUser = await db.collection('users').findOne(
    { _id: new ObjectId(contactUserId) },
    { projection: { passwordHash: 0 } },
  );

  return mergeClientWithContact(client, contactUser);
}

export async function hydrateClientsWithContacts(db: Db, clients: ClientLike[]) {
  const contactUserIds = Array.from(new Set(
    clients
      .map((client) => toIdString(client.contactUserId))
      .filter((value): value is string => {
        if (!value) {
          return false;
        }

        return ObjectId.isValid(value);
      }),
  ));

  if (!contactUserIds.length) {
    return clients.map((client) => mergeClientWithContact(client));
  }

  const users = await db.collection('users').find(
    { _id: { $in: contactUserIds.map((id) => new ObjectId(id)) } },
    { projection: { passwordHash: 0 } },
  ).toArray();

  const usersById = new Map(users.map((user) => [toIdString(user._id), user]));

  return clients.map((client) => {
    const contactUserId = toIdString(client.contactUserId);
    return mergeClientWithContact(
      client,
      contactUserId ? usersById.get(contactUserId) : undefined,
    );
  });
}

export async function createContactUser(
  db: Db,
  clientId: ObjectId,
  input: ClientContactInput,
): Promise<LinkedContactUser> {
  const users = db.collection('users');
  const normalizedEmail = normalizeEmail(input.email);
  const existing = await users.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error('Email already registered');
  }

  const now = new Date();
  const doc: Record<string, unknown> = {
    name: input.name.trim(),
    email: normalizedEmail,
    role: 'client',
    active: true,
    clientId,
    createdAt: now,
    updatedAt: now,
  };

  if (input.password) {
    doc.passwordHash = await bcrypt.hash(input.password, 10);
  }

  const result = await users.insertOne(doc);
  return {
    _id: result.insertedId,
    name: String(doc.name),
    email: String(doc.email),
    role: String(doc.role),
    active: Boolean(doc.active),
    clientId,
  };
}

export async function assignExistingContactUser(
  db: Db,
  clientId: ObjectId,
  contactUserId: string,
): Promise<LinkedContactUser> {
  if (!ObjectId.isValid(contactUserId)) {
    throw new Error('Valid contactUserId is required');
  }

  const users = db.collection('users');
  const user = await users.findOne({ _id: new ObjectId(contactUserId) });
  const validationError = validateAssignableContactUser(user, clientId.toString());
  if (validationError) {
    throw new Error(validationError);
  }

  const updatedUser = await users.findOneAndUpdate(
    { _id: new ObjectId(contactUserId) },
    { $set: { clientId, updatedAt: new Date() } },
    {
      projection: { passwordHash: 0 },
      returnDocument: 'after',
    },
  );

  if (!updatedUser) {
    throw new Error('Contact user not found');
  }

  return {
    _id: updatedUser._id as ObjectId,
    name: String(updatedUser.name || ''),
    email: String(updatedUser.email || ''),
    role: String(updatedUser.role || 'client'),
    active: Boolean(updatedUser.active),
    clientId,
  };
}
