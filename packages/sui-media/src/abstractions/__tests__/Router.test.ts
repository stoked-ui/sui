import { describe, it, expect } from 'vitest';
import { NoOpRouter, noOpRouter } from '../Router';
import type { IRouter } from '../Router';

describe('Router Abstraction', () => {
  describe('NoOpRouter', () => {
    it('should create a new instance', () => {
      const router = new NoOpRouter();
      expect(router).toBeInstanceOf(NoOpRouter);
    });

    it('should implement IRouter interface', () => {
      const router: IRouter = new NoOpRouter();
      expect(router).toHaveProperty('navigate');
      expect(router).toHaveProperty('getQueryParam');
      expect(router).toHaveProperty('getAllQueryParams');
      expect(router).toHaveProperty('getPathname');
    });

    it('should do nothing on navigate', () => {
      const router = new NoOpRouter();
      expect(() => router.navigate('/test')).not.toThrow();
      expect(() => router.navigate('/test', { replace: true })).not.toThrow();
    });

    it('should return undefined for query params', () => {
      const router = new NoOpRouter();
      expect(router.getQueryParam('key')).toBeUndefined();
      expect(router.getQueryParam('anyKey')).toBeUndefined();
    });

    it('should return empty object for all query params', () => {
      const router = new NoOpRouter();
      const params = router.getAllQueryParams();
      expect(params).toEqual({});
      expect(Object.keys(params)).toHaveLength(0);
    });

    it('should return root pathname', () => {
      const router = new NoOpRouter();
      expect(router.getPathname()).toBe('/');
    });
  });

  describe('noOpRouter singleton', () => {
    it('should provide a singleton instance', () => {
      expect(noOpRouter).toBeInstanceOf(NoOpRouter);
    });

    it('should be the same instance on multiple accesses', () => {
      const ref1 = noOpRouter;
      const ref2 = noOpRouter;
      expect(ref1).toBe(ref2);
    });

    it('should implement IRouter interface', () => {
      const router: IRouter = noOpRouter;
      expect(router).toHaveProperty('navigate');
      expect(router).toHaveProperty('getQueryParam');
      expect(router).toHaveProperty('getAllQueryParams');
      expect(router).toHaveProperty('getPathname');
    });
  });

  describe('Router interface contract', () => {
    it('should accept custom router implementations', () => {
      const mockRouter: IRouter = {
        navigate: (path, options) => {
          // Custom implementation
        },
        getQueryParam: (key) => {
          if (key === 'id') return '123';
          return undefined;
        },
        getAllQueryParams: () => ({
          id: '123',
          mode: 'test',
        }),
        getPathname: () => '/media/viewer',
      };

      expect(mockRouter.getQueryParam('id')).toBe('123');
      expect(mockRouter.getQueryParam('other')).toBeUndefined();
      expect(mockRouter.getAllQueryParams()).toEqual({
        id: '123',
        mode: 'test',
      });
      expect(mockRouter.getPathname()).toBe('/media/viewer');
    });

    it('should support navigation with options', () => {
      const navigations: Array<{ path: string; options?: any }> = [];

      const mockRouter: IRouter = {
        navigate: (path, options) => {
          navigations.push({ path, options });
        },
        getQueryParam: () => undefined,
        getAllQueryParams: () => ({}),
        getPathname: () => '/',
      };

      mockRouter.navigate('/media');
      mockRouter.navigate('/viewer', { replace: true });
      mockRouter.navigate('/card', { scroll: false, shallow: true });

      expect(navigations).toHaveLength(3);
      expect(navigations[0]).toEqual({ path: '/media', options: undefined });
      expect(navigations[1]).toEqual({ path: '/viewer', options: { replace: true } });
      expect(navigations[2]).toEqual({
        path: '/card',
        options: { scroll: false, shallow: true }
      });
    });

    it('should support async navigation', async () => {
      let navigated = false;

      const mockRouter: IRouter = {
        navigate: async (path) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          navigated = true;
        },
        getQueryParam: () => undefined,
        getAllQueryParams: () => ({}),
        getPathname: () => '/',
      };

      await mockRouter.navigate('/test');
      expect(navigated).toBe(true);
    });
  });
});
