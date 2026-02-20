import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPost } from '@stoked-ui/common-api';

/**
 * Creates a minimal Mongoose document mock from plain data.
 * The mock exposes the fields of the document plus `_id`.
 */
function makeMockDoc(data: Record<string, unknown>) {
  return {
    _id: data._id ?? 'mock-id',
    ...data,
    toObject: () => ({ _id: data._id ?? 'mock-id', ...data }),
  };
}

describe('BlogService', () => {
  let service: BlogService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    // Build a model mock that covers the methods used by BlogService.
    // Each method is a Jest mock; tests can override the return value per-case.
    mockModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
    };

    // Methods that return a query-like object with `.exec()` at the end.
    const withExec = (fn: jest.Mock) => {
      fn.mockReturnValue({ exec: fn });
      return fn;
    };

    withExec(mockModel.findOne);
    withExec(mockModel.find);
    withExec(mockModel.findOneAndUpdate);
    withExec(mockModel.countDocuments);
    withExec(mockModel.aggregate);

    // find() returns a chainable builder used as:
    //   .find(filter).select(...).sort(...).skip(...).limit(...).exec()
    const chainable = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    mockModel.find.mockReturnValue(chainable);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: getModelToken(BlogPost.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // create()
  // -----------------------------------------------------------------------

  describe('create()', () => {
    it('creates a blog post and returns it with an id', async () => {
      const dto = {
        title: 'My First Post',
        body: 'Hello world',
        description: 'A test post',
        tags: ['test'],
        authors: ['author@example.com'],
      };

      const created = makeMockDoc({
        _id: '507f1f77bcf86cd799439011',
        title: dto.title,
        slug: 'my-first-post',
        body: dto.body,
        description: dto.description,
        tags: dto.tags,
        authors: dto.authors,
        targetSites: ['stoked-ui.com'],
        status: 'draft',
        source: 'native',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockModel.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(result._id).toBe('507f1f77bcf86cd799439011');
      expect(result.slug).toBe('my-first-post');
      expect(result.status).toBe('draft');
    });

    it('auto-generates slug from title when slug is not provided', async () => {
      const dto = {
        title: 'Hello World Post',
        body: 'content',
        description: 'desc',
        tags: [],
        authors: [],
      };

      const created = makeMockDoc({
        _id: 'abc123',
        ...dto,
        slug: 'hello-world-post',
        targetSites: ['stoked-ui.com'],
        status: 'draft',
        source: 'native',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockModel.create.mockResolvedValue(created);

      const result = await service.create(dto);
      expect(result.slug).toBe('hello-world-post');

      const createCallArg = mockModel.create.mock.calls[0][0];
      expect(createCallArg.slug).toBe('hello-world-post');
    });
  });

  // -----------------------------------------------------------------------
  // findBySlug()
  // -----------------------------------------------------------------------

  describe('findBySlug()', () => {
    it('returns a post when it exists', async () => {
      const doc = makeMockDoc({
        _id: '1',
        slug: 'existing-post',
        title: 'Existing Post',
        body: 'body',
        description: 'desc',
        tags: [],
        authors: [],
        targetSites: ['stoked-ui.com'],
        status: 'published',
        source: 'native',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(doc) });

      const result = await service.findBySlug('existing-post');
      expect(result).toBe(doc);
    });

    it('throws NotFoundException when post not found', async () => {
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // -----------------------------------------------------------------------
  // publish()
  // -----------------------------------------------------------------------

  describe('publish()', () => {
    it('sets status to published', async () => {
      const existing = makeMockDoc({
        _id: '2',
        slug: 'draft-post',
        title: 'Draft',
        body: 'body',
        description: 'desc',
        tags: [],
        authors: [],
        targetSites: ['stoked-ui.com'],
        status: 'draft',
        source: 'native',
        date: new Date('2026-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const published = makeMockDoc({ ...existing, status: 'published' });

      // findBySlug call
      mockModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(existing) })
        // findOneAndUpdate call
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(published) });

      // Override findOneAndUpdate directly
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(published),
      });

      const result = await service.publish('draft-post');
      expect(result.status).toBe('published');
    });
  });

  // -----------------------------------------------------------------------
  // findAll()
  // -----------------------------------------------------------------------

  describe('findAll()', () => {
    it('supports pagination', async () => {
      const docs = [
        makeMockDoc({
          _id: 'a',
          slug: 'post-1',
          title: 'Post 1',
          body: 'b',
          description: 'd',
          tags: [],
          authors: [],
          targetSites: ['stoked-ui.com'],
          status: 'published',
          source: 'native',
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      // Chain mock: .find().select().sort().skip().limit().exec()
      const chainable = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(docs),
      };
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(chainable.skip).toHaveBeenCalledWith(0); // (1-1) * 10
      expect(chainable.limit).toHaveBeenCalledWith(10);
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.page).toBe(1);
    });

    it('calculates correct skip for page > 1', async () => {
      const chainable = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(50) });

      await service.findAll({ page: 3, limit: 10 });

      expect(chainable.skip).toHaveBeenCalledWith(20); // (3-1) * 10
    });
  });

  // -----------------------------------------------------------------------
  // findPublic()
  // -----------------------------------------------------------------------

  describe('findPublic()', () => {
    /** Helper: build a chainable mock that resolves `docs` from .exec() */
    function makeChainable(docs: ReturnType<typeof makeMockDoc>[]) {
      return {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(docs),
      };
    }

    it('returns posts for the matching site (brianstoker.com)', async () => {
      const brianPost = makeMockDoc({
        _id: 'b1',
        slug: 'brian-post',
        title: 'Brian Post',
        body: 'body',
        description: 'desc',
        tags: [],
        authors: [],
        targetSites: ['brianstoker.com'],
        status: 'published',
        source: 'native',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const chainable = makeChainable([brianPost]);
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.findPublic('brianstoker.com', {});

      // Verify the filter passed to .find() contains the site
      const [filter] = mockModel.find.mock.calls[0];
      expect(filter).toMatchObject({ targetSites: 'brianstoker.com', status: 'published' });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe('brian-post');
    });

    it('does NOT return brianstoker.com posts when querying stoked-ui.com', async () => {
      // Simulate MongoDB returning no docs when the site filter does not match
      const chainable = makeChainable([]);
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      const result = await service.findPublic('stoked-ui.com', {});

      const [filter] = mockModel.find.mock.calls[0];
      expect(filter).toMatchObject({ targetSites: 'stoked-ui.com', status: 'published' });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('returns a post listed in both sites for either site query', async () => {
      const multiSitePost = makeMockDoc({
        _id: 'm1',
        slug: 'multi-site-post',
        title: 'Multi Site Post',
        body: 'body',
        description: 'desc',
        tags: [],
        authors: [],
        targetSites: ['stoked-ui.com', 'brianstoker.com'],
        status: 'published',
        source: 'native',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // First call: query for stoked-ui.com
      const chainable1 = makeChainable([multiSitePost]);
      mockModel.find.mockReturnValueOnce(chainable1);
      mockModel.countDocuments.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) });

      const result1 = await service.findPublic('stoked-ui.com', {});
      expect(result1.data).toHaveLength(1);
      expect(result1.data[0].slug).toBe('multi-site-post');

      // Second call: query for brianstoker.com
      const chainable2 = makeChainable([multiSitePost]);
      mockModel.find.mockReturnValueOnce(chainable2);
      mockModel.countDocuments.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(1) });

      const result2 = await service.findPublic('brianstoker.com', {});
      expect(result2.data).toHaveLength(1);
      expect(result2.data[0].slug).toBe('multi-site-post');
    });

    it('never returns draft posts regardless of targetSites', async () => {
      // Service always sets status: 'published' in the filter; simulate MongoDB returning nothing
      const chainable = makeChainable([]);
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      const result = await service.findPublic('brianstoker.com', {});

      const [filter] = mockModel.find.mock.calls[0];
      // Confirm the filter always enforces published status
      expect(filter['status']).toBe('published');
      expect(result.data).toHaveLength(0);
    });

    it('response does not contain internal fields (denyAccess, canAccess, canEdit)', async () => {
      const docWithInternals = makeMockDoc({
        _id: 'i1',
        slug: 'internal-test',
        title: 'Internal Test',
        body: 'body',
        description: 'desc',
        tags: [],
        authors: [],
        targetSites: ['stoked-ui.com'],
        status: 'published',
        source: 'native',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        // These internal fields should never appear in the public response DTO
        denyAccess: ['user-x'],
        canAccess: ['user-y'],
        canEdit: ['user-z'],
        __v: 0,
        tokens: ['secret-token'],
      });

      const chainable = makeChainable([docWithInternals]);
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

      const result = await service.findPublic('stoked-ui.com', {});

      expect(result.data).toHaveLength(1);
      const post = result.data[0];

      // BlogPostResponseDto only maps safe fields - internal fields must be absent
      expect(post).not.toHaveProperty('denyAccess');
      expect(post).not.toHaveProperty('canAccess');
      expect(post).not.toHaveProperty('canEdit');
      expect(post).not.toHaveProperty('__v');
      expect(post).not.toHaveProperty('tokens');
      expect(post).not.toHaveProperty('deleted');
      expect(post).not.toHaveProperty('deletedAt');

      // Confirm .select() was called with exclusion string
      expect(chainable.select).toHaveBeenCalledWith(
        '-__v -denyAccess -canAccess -canEdit -deleted -deletedAt -tokens',
      );
    });

    it('supports pagination with page and limit params', async () => {
      const chainable = makeChainable([]);
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(100) });

      const result = await service.findPublic('stoked-ui.com', { page: 3, limit: 15 });

      expect(chainable.skip).toHaveBeenCalledWith(30); // (3-1) * 15
      expect(chainable.limit).toHaveBeenCalledWith(15);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(15);
      expect(result.total).toBe(100);
      expect(result.hasMore).toBe(true); // 3 * 15 = 45 < 100
    });

    it('sorts by date descending by default', async () => {
      const chainable = makeChainable([]);
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.findPublic('stoked-ui.com', {});

      expect(chainable.sort).toHaveBeenCalledWith({ date: -1 });
    });

    it('sorts by title ascending when sortBy=title', async () => {
      const chainable = makeChainable([]);
      mockModel.find.mockReturnValue(chainable);
      mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.findPublic('stoked-ui.com', { sortBy: 'title' });

      expect(chainable.sort).toHaveBeenCalledWith({ title: 1 });
    });
  });

  // -----------------------------------------------------------------------
  // softDelete()
  // -----------------------------------------------------------------------

  describe('softDelete()', () => {
    it('sets deleted and deletedAt on the document', async () => {
      const updated = makeMockDoc({
        _id: '3',
        slug: 'to-delete',
        deleted: true,
        deletedAt: new Date(),
        title: 'T',
        body: 'b',
        description: 'd',
        tags: [],
        authors: [],
        targetSites: [],
        status: 'draft',
        source: 'native',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      await expect(service.softDelete('to-delete')).resolves.toBeUndefined();

      const [filter, update] = mockModel.findOneAndUpdate.mock.calls[0];
      expect(filter).toMatchObject({ slug: 'to-delete' });
      expect(update).toMatchObject({ $set: { deleted: true } });
      expect(update.$set).toHaveProperty('deletedAt');
    });

    it('throws NotFoundException when post does not exist', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.softDelete('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
