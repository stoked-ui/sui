import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * E2E Tests for Upload Flow
 *
 * This test suite validates the complete upload workflow:
 * 1. Initiate upload
 * 2. Upload parts (simulated)
 * 3. Complete upload
 * 4. Verify media creation
 */
describe('Uploads E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Upload Flow', () => {
    let sessionId: string;
    let uploadId: string;

    it('should initiate a multipart upload', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'test-video.mp4',
          mimeType: 'video/mp4',
          totalSize: 10 * 1024 * 1024, // 10 MB
          hash: 'test-hash-' + Date.now(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('uploadId');
      expect(response.body).toHaveProperty('presignedUrls');
      expect(response.body).toHaveProperty('totalParts');
      expect(response.body).toHaveProperty('chunkSize');
      expect(response.body).toHaveProperty('expiresAt');

      sessionId = response.body.sessionId;
      uploadId = response.body.uploadId;

      expect(response.body.totalParts).toBeGreaterThan(0);
      expect(response.body.presignedUrls).toBeInstanceOf(Array);
    });

    it('should get upload status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/uploads/${sessionId}/status`)
        .expect(200);

      expect(response.body).toHaveProperty('sessionId', sessionId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('filename', 'test-video.mp4');
      expect(response.body).toHaveProperty('completedParts', 0);
      expect(response.body).toHaveProperty('progress', 0);
      expect(response.body).toHaveProperty('pendingPartNumbers');
    });

    it('should mark part as completed', async () => {
      const response = await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/parts/1/complete`)
        .send({
          etag: '"mock-etag-123"',
        })
        .expect(200);

      expect(response.body).toHaveProperty('completedParts', 1);
      expect(response.body).toHaveProperty('progress');
    });

    it('should complete the upload', async () => {
      const response = await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/complete`)
        .expect(200);

      expect(response.body).toHaveProperty('mediaId');
      expect(response.body).toHaveProperty('mediaType');
      expect(['video', 'image']).toContain(response.body.mediaType);
    });

    it('should fail to complete already completed upload', async () => {
      await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/complete`)
        .expect(409); // Conflict
    });
  });

  describe('Upload Resume Flow', () => {
    let sessionId: string;

    it('should initiate upload', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'resume-test.mp4',
          mimeType: 'video/mp4',
          totalSize: 20 * 1024 * 1024, // 20 MB = 2 parts
        })
        .expect(201);

      sessionId = response.body.sessionId;
      expect(response.body.totalParts).toBe(2);
    });

    it('should mark first part as completed', async () => {
      await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/parts/1/complete`)
        .send({
          etag: '"etag-part-1"',
        })
        .expect(200);
    });

    it('should get status with partial completion', async () => {
      const response = await request(app.getHttpServer())
        .get(`/uploads/${sessionId}/status`)
        .expect(200);

      expect(response.body.completedParts).toBe(1);
      expect(response.body.progress).toBe(50);
      expect(response.body.pendingPartNumbers).toEqual([2]);
    });

    it('should sync with S3 to get updated status', async () => {
      const response = await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/sync`)
        .expect(200);

      expect(response.body).toHaveProperty('sessionId', sessionId);
      expect(response.body).toHaveProperty('completedParts');
      expect(response.body).toHaveProperty('pendingPartNumbers');
    });

    it('should get more presigned URLs', async () => {
      const response = await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/presigned-urls`)
        .send({
          partNumbers: [2],
        })
        .expect(200);

      expect(response.body).toHaveProperty('presignedUrls');
      expect(response.body.presignedUrls).toBeInstanceOf(Array);
      expect(response.body.presignedUrls[0]).toHaveProperty('partNumber', 2);
      expect(response.body.presignedUrls[0]).toHaveProperty('url');
    });
  });

  describe('Upload Abort Flow', () => {
    let sessionId: string;

    it('should initiate upload', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'abort-test.mp4',
          mimeType: 'video/mp4',
          totalSize: 10 * 1024 * 1024,
        })
        .expect(201);

      sessionId = response.body.sessionId;
    });

    it('should abort the upload', async () => {
      await request(app.getHttpServer())
        .delete(`/uploads/${sessionId}`)
        .expect(200);
    });

    it('should show aborted status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/uploads/${sessionId}/status?includeUrls=false`)
        .expect(200);

      expect(response.body.status).toBe('aborted');
    });

    it('should not allow completing aborted upload', async () => {
      await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/complete`)
        .expect(409); // Conflict
    });
  });

  describe('Active Uploads', () => {
    it('should list active uploads for user', async () => {
      // Create multiple uploads
      const upload1 = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'active-1.mp4',
          mimeType: 'video/mp4',
          totalSize: 10 * 1024 * 1024,
        })
        .expect(201);

      const upload2 = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'active-2.mp4',
          mimeType: 'video/mp4',
          totalSize: 15 * 1024 * 1024,
        })
        .expect(201);

      // Get active uploads
      const response = await request(app.getHttpServer())
        .get('/uploads/active')
        .expect(200);

      expect(response.body).toHaveProperty('uploads');
      expect(response.body.uploads).toBeInstanceOf(Array);
      expect(response.body.uploads.length).toBeGreaterThanOrEqual(2);

      const sessionIds = response.body.uploads.map((u: any) => u.sessionId);
      expect(sessionIds).toContain(upload1.body.sessionId);
      expect(sessionIds).toContain(upload2.body.sessionId);
    });
  });

  describe('Duplicate Detection', () => {
    const testHash = 'duplicate-test-hash-' + Date.now();

    it('should create initial upload', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'original.mp4',
          mimeType: 'video/mp4',
          totalSize: 10 * 1024 * 1024,
          hash: testHash,
        })
        .expect(201);

      const sessionId = response.body.sessionId;

      // Complete the upload
      await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/parts/1/complete`)
        .send({ etag: '"etag-1"' })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/uploads/${sessionId}/complete`)
        .expect(200);
    });

    it('should detect duplicate and not create new upload', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'duplicate.mp4',
          mimeType: 'video/mp4',
          totalSize: 10 * 1024 * 1024,
          hash: testHash,
        })
        .expect(201);

      expect(response.body).toHaveProperty('existingMedia');
      expect(response.body.existingMedia).toHaveProperty('type');
      expect(response.body.existingMedia).toHaveProperty('id');
      expect(response.body.sessionId).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent session', async () => {
      await request(app.getHttpServer())
        .get('/uploads/non-existent-session/status')
        .expect(404);
    });

    it('should return 400 for invalid part number', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'test.mp4',
          mimeType: 'video/mp4',
          totalSize: 10 * 1024 * 1024,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/uploads/${response.body.sessionId}/parts/999/complete`)
        .send({ etag: '"etag"' })
        .expect(400);
    });

    it('should return 400 for completing upload with missing parts', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'incomplete.mp4',
          mimeType: 'video/mp4',
          totalSize: 20 * 1024 * 1024, // 2 parts
        })
        .expect(201);

      // Only complete one part
      await request(app.getHttpServer())
        .post(`/uploads/${response.body.sessionId}/parts/1/complete`)
        .send({ etag: '"etag-1"' })
        .expect(200);

      // Try to complete without all parts
      await request(app.getHttpServer())
        .post(`/uploads/${response.body.sessionId}/complete`)
        .expect(400);
    });

    it('should return 400 for requesting too many presigned URLs', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/initiate')
        .send({
          filename: 'test.mp4',
          mimeType: 'video/mp4',
          totalSize: 100 * 1024 * 1024,
        })
        .expect(201);

      const tooManyParts = Array.from({ length: 51 }, (_, i) => i + 1);

      await request(app.getHttpServer())
        .post(`/uploads/${response.body.sessionId}/presigned-urls`)
        .send({
          partNumbers: tooManyParts,
        })
        .expect(400);
    });
  });
});
