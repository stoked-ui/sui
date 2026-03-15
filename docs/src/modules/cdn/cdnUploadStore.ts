import { ObjectId } from 'mongodb';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  ListPartsCommand,
  S3Client,
  UploadPartCommand,
  type CompletedPart,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getDb } from '../db/mongodb';
import { CDN_BUCKET, CDN_REGION, buildCdnObjectUrl } from './cdnMutations';
import { normalizeCdnPath } from './cdnAccess';

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;
const MAX_URLS_PER_REQUEST = 50;
const SESSION_EXPIRATION_DAYS = 7;
const s3 = new S3Client({ region: CDN_REGION });

type UploadPartStatus = 'pending' | 'uploading' | 'completed' | 'failed';
type UploadSessionStatus = 'pending' | 'in_progress' | 'completed' | 'aborted' | 'expired';

type UploadPart = {
  partNumber: number;
  etag?: string;
  status: UploadPartStatus;
  size: number;
  uploadedAt?: Date;
};

type CdnUploadSession = {
  _id?: ObjectId;
  userId: ObjectId;
  uploadId: string;
  s3Key: string;
  bucket: string;
  region: string;
  filename: string;
  mimeType: string;
  totalSize: number;
  chunkSize: number;
  totalParts: number;
  hash?: string;
  status: UploadSessionStatus;
  parts: UploadPart[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function getCollection() {
  return getDb().then((db) => db.collection<CdnUploadSession>('cdnUploadSessions'));
}

function calculateTotalParts(totalSize: number, chunkSize: number) {
  return Math.ceil(totalSize / chunkSize);
}

function createInitialParts(totalParts: number, chunkSize: number, totalSize: number) {
  const parts: UploadPart[] = [];

  for (let partNumber = 1; partNumber <= totalParts; partNumber += 1) {
    const isLastPart = partNumber === totalParts;
    const size = isLastPart ? totalSize - (partNumber - 1) * chunkSize : chunkSize;
    parts.push({
      partNumber,
      size,
      status: 'pending',
    });
  }

  return parts;
}

function sanitizeUploadPath(path: string) {
  const normalized = normalizeCdnPath(path);
  if (!normalized || normalized.endsWith('/')) {
    throw new Error('A file path is required');
  }

  return normalized;
}

async function generatePresignedUrls(key: string, uploadId: string, partNumbers: number[]) {
  return Promise.all(
    partNumbers.map(async (partNumber) => ({
      partNumber,
      url: await getSignedUrl(
        s3,
        new UploadPartCommand({
          Bucket: CDN_BUCKET,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        }),
        { expiresIn: 60 * 60 },
      ),
    })),
  );
}

function mapStatus(session: CdnUploadSession, presignedUrls?: Array<{ partNumber: number; url: string }>) {
  const completedParts = session.parts.filter((part) => part.status === 'completed').length;
  const pendingPartNumbers = session.parts
    .filter((part) => part.status !== 'completed')
    .map((part) => part.partNumber);

  return {
    sessionId: session._id?.toString() || '',
    status: session.status,
    filename: session.filename,
    totalSize: session.totalSize,
    totalParts: session.totalParts,
    completedParts,
    progress: session.totalParts ? Math.round((completedParts / session.totalParts) * 100) : 0,
    pendingPartNumbers,
    presignedUrls,
    expiresAt: session.expiresAt,
  };
}

async function getOwnedSession(userId: string, sessionId: string) {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(sessionId)) {
    throw new Error('Invalid upload session');
  }

  const collection = await getCollection();
  const session = await collection.findOne({
    _id: new ObjectId(sessionId),
    userId: new ObjectId(userId),
  });

  if (!session) {
    throw new Error('Upload session not found');
  }

  return {
    collection,
    session,
  };
}

export async function initiateCdnUpload(
  userId: string,
  input: {
    path: string;
    filename: string;
    mimeType: string;
    totalSize: number;
    hash?: string;
    chunkSize?: number;
  },
) {
  const key = sanitizeUploadPath(input.path);
  const chunkSize = input.chunkSize || DEFAULT_CHUNK_SIZE;
  const totalParts = calculateTotalParts(input.totalSize, chunkSize);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

  const multipartUpload = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: CDN_BUCKET,
      Key: key,
      ContentType: input.mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  if (!multipartUpload.UploadId) {
    throw new Error('Failed to create multipart upload');
  }

  const collection = await getCollection();
  const session: CdnUploadSession = {
    userId: new ObjectId(userId),
    uploadId: multipartUpload.UploadId,
    s3Key: key,
    bucket: CDN_BUCKET,
    region: CDN_REGION,
    filename: input.filename,
    mimeType: input.mimeType,
    totalSize: input.totalSize,
    chunkSize,
    totalParts,
    hash: input.hash,
    status: 'pending',
    parts: createInitialParts(totalParts, chunkSize, input.totalSize),
    expiresAt,
    createdAt,
    updatedAt: createdAt,
  };

  const result = await collection.insertOne(session);
  const initialPartNumbers = Array.from(
    { length: Math.min(totalParts, MAX_URLS_PER_REQUEST) },
    (_, index) => index + 1,
  );

  const presignedUrls = await generatePresignedUrls(key, multipartUpload.UploadId, initialPartNumbers);

  return {
    sessionId: result.insertedId.toString(),
    uploadId: multipartUpload.UploadId,
    totalParts,
    chunkSize,
    expiresAt,
    presignedUrls,
  };
}

export async function getCdnUploadStatus(userId: string, sessionId: string, includeUrls = true) {
  const { session } = await getOwnedSession(userId, sessionId);
  const pendingPartNumbers = session.parts
    .filter((part) => part.status !== 'completed')
    .map((part) => part.partNumber)
    .slice(0, MAX_URLS_PER_REQUEST);

  const presignedUrls = includeUrls && pendingPartNumbers.length
    ? await generatePresignedUrls(session.s3Key, session.uploadId, pendingPartNumbers)
    : undefined;

  return mapStatus(session, presignedUrls);
}

export async function getMoreCdnUploadUrls(userId: string, sessionId: string, partNumbers: number[]) {
  const { session } = await getOwnedSession(userId, sessionId);
  const validPartNumbers = partNumbers
    .filter((partNumber) => Number.isInteger(partNumber))
    .filter((partNumber) => partNumber >= 1 && partNumber <= session.totalParts)
    .slice(0, MAX_URLS_PER_REQUEST);

  if (!validPartNumbers.length) {
    throw new Error('At least one valid part number is required');
  }

  return generatePresignedUrls(session.s3Key, session.uploadId, validPartNumbers);
}

export async function markCdnUploadPartComplete(
  userId: string,
  sessionId: string,
  partNumber: number,
  etag: string,
) {
  const { collection, session } = await getOwnedSession(userId, sessionId);
  const nextParts = session.parts.map((part) =>
    part.partNumber === partNumber
      ? {
          ...part,
          status: 'completed' as const,
          etag: etag.replace(/"/g, ''),
          uploadedAt: new Date(),
        }
      : part,
  );

  await collection.updateOne(
    { _id: session._id },
    {
      $set: {
        parts: nextParts,
        status: session.status === 'pending' ? 'in_progress' : session.status,
        updatedAt: new Date(),
      },
    },
  );

  const completedParts = nextParts.filter((part) => part.status === 'completed').length;
  return {
    completedParts,
    totalParts: session.totalParts,
    progress: Math.round((completedParts / session.totalParts) * 100),
  };
}

export async function completeCdnUpload(userId: string, sessionId: string) {
  const { collection, session } = await getOwnedSession(userId, sessionId);
  const incompleteParts = session.parts.filter((part) => part.status !== 'completed' || !part.etag);

  if (incompleteParts.length) {
    throw new Error('Upload is still missing completed parts');
  }

  const parts: CompletedPart[] = session.parts.map((part) => ({
    PartNumber: part.partNumber,
    ETag: part.etag,
  }));

  await s3.send(
    new CompleteMultipartUploadCommand({
      Bucket: CDN_BUCKET,
      Key: session.s3Key,
      UploadId: session.uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    }),
  );

  await collection.updateOne(
    { _id: session._id },
    {
      $set: {
        status: 'completed',
        updatedAt: new Date(),
      },
    },
  );

  return {
    path: session.s3Key,
    url: buildCdnObjectUrl(session.s3Key),
  };
}

export async function abortCdnUpload(userId: string, sessionId: string) {
  const { collection, session } = await getOwnedSession(userId, sessionId);

  await s3.send(
    new AbortMultipartUploadCommand({
      Bucket: CDN_BUCKET,
      Key: session.s3Key,
      UploadId: session.uploadId,
    }),
  );

  await collection.updateOne(
    { _id: session._id },
    {
      $set: {
        status: 'aborted',
        updatedAt: new Date(),
      },
    },
  );
}

export async function listActiveCdnUploads(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return [];
  }

  const collection = await getCollection();
  const sessions = await collection.find({
    userId: new ObjectId(userId),
    status: { $in: ['pending', 'in_progress'] },
    expiresAt: { $gt: new Date() },
  }).toArray();

  return sessions.map((session) => mapStatus(session));
}

export async function syncCdnUploadPartsFromS3(userId: string, sessionId: string) {
  const { collection, session } = await getOwnedSession(userId, sessionId);
  const response = await s3.send(
    new ListPartsCommand({
      Bucket: CDN_BUCKET,
      Key: session.s3Key,
      UploadId: session.uploadId,
    }),
  );

  const completedEtags = new Map(
    (response.Parts || []).map((part) => [part.PartNumber, part.ETag?.replace(/"/g, '')]),
  );

  const nextParts = session.parts.map((part) => {
    const etag = completedEtags.get(part.partNumber);
    if (!etag) {
      return part;
    }

    return {
      ...part,
      etag,
      status: 'completed' as const,
      uploadedAt: part.uploadedAt || new Date(),
    };
  });

  await collection.updateOne(
    { _id: session._id },
    {
      $set: {
        parts: nextParts,
        updatedAt: new Date(),
      },
    },
  );

  return nextParts;
}
