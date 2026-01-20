import { describe, it, expect } from 'vitest';
import { NoOpAuth, noOpAuth, createMockAuth } from '../Auth';
import type { IAuth, IUser } from '../Auth';

describe('Auth Abstraction', () => {
  describe('NoOpAuth', () => {
    it('should create a new instance', () => {
      const auth = new NoOpAuth();
      expect(auth).toBeInstanceOf(NoOpAuth);
    });

    it('should implement IAuth interface', () => {
      const auth: IAuth = new NoOpAuth();
      expect(auth).toHaveProperty('getCurrentUser');
      expect(auth).toHaveProperty('isAuthenticated');
      expect(auth).toHaveProperty('login');
      expect(auth).toHaveProperty('logout');
      expect(auth).toHaveProperty('hasPermission');
      expect(auth).toHaveProperty('isOwner');
      expect(auth).toHaveProperty('canEdit');
    });

    it('should return null for current user', () => {
      const auth = new NoOpAuth();
      expect(auth.getCurrentUser()).toBeNull();
    });

    it('should return false for isAuthenticated', () => {
      const auth = new NoOpAuth();
      expect(auth.isAuthenticated()).toBe(false);
    });

    it('should do nothing on login', () => {
      const auth = new NoOpAuth();
      expect(() => auth.login()).not.toThrow();
      expect(() => auth.login('/redirect')).not.toThrow();
    });

    it('should do nothing on logout', () => {
      const auth = new NoOpAuth();
      expect(() => auth.logout()).not.toThrow();
      expect(() => auth.logout('/redirect')).not.toThrow();
    });

    it('should return false for all permissions', () => {
      const auth = new NoOpAuth();
      expect(auth.hasPermission('media', 'create')).toBe(false);
      expect(auth.hasPermission('comment', 'delete')).toBe(false);
    });

    it('should return false for ownership checks', () => {
      const auth = new NoOpAuth();
      expect(auth.isOwner('user-123')).toBe(false);
      expect(auth.isOwner('any-id')).toBe(false);
    });

    it('should return false for edit permissions', () => {
      const auth = new NoOpAuth();
      expect(auth.canEdit?.('user-123')).toBe(false);
    });
  });

  describe('noOpAuth singleton', () => {
    it('should provide a singleton instance', () => {
      expect(noOpAuth).toBeInstanceOf(NoOpAuth);
    });

    it('should be the same instance on multiple accesses', () => {
      const ref1 = noOpAuth;
      const ref2 = noOpAuth;
      expect(ref1).toBe(ref2);
    });

    it('should implement IAuth interface', () => {
      const auth: IAuth = noOpAuth;
      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getCurrentUser()).toBeNull();
    });
  });

  describe('createMockAuth', () => {
    const mockUser: IUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      roles: ['user'],
    };

    it('should create a mock auth with user', () => {
      const auth = createMockAuth(mockUser);
      expect(auth.getCurrentUser()).toEqual(mockUser);
      expect(auth.isAuthenticated()).toBe(true);
    });

    it('should grant all permissions by default', () => {
      const auth = createMockAuth(mockUser);
      expect(auth.hasPermission('media', 'create')).toBe(true);
      expect(auth.hasPermission('comment', 'delete')).toBe(true);
      expect(auth.isOwner('any-id')).toBe(true);
      expect(auth.canEdit?.('any-id')).toBe(true);
    });

    it('should respect hasAllPermissions option', () => {
      const auth = createMockAuth(mockUser, { hasAllPermissions: false });
      expect(auth.hasPermission('media', 'create')).toBe(false);
    });

    it('should respect isOwnerOfAll option', () => {
      const auth = createMockAuth(mockUser, { isOwnerOfAll: false });
      expect(auth.isOwner('any-id')).toBe(false);
      expect(auth.canEdit?.('any-id')).toBe(false);
    });

    it('should support custom options', () => {
      const auth = createMockAuth(mockUser, {
        hasAllPermissions: true,
        isOwnerOfAll: false,
      });
      expect(auth.hasPermission('media', 'create')).toBe(true);
      expect(auth.isOwner('any-id')).toBe(false);
    });

    it('should do nothing on login/logout', () => {
      const auth = createMockAuth(mockUser);
      expect(() => auth.login()).not.toThrow();
      expect(() => auth.logout()).not.toThrow();
    });
  });

  describe('Auth interface contract', () => {
    it('should accept custom auth implementations', () => {
      let currentUser: IUser | null = {
        id: 'custom-123',
        email: 'custom@example.com',
        name: 'Custom User',
      };

      const customAuth: IAuth = {
        getCurrentUser: () => currentUser,
        isAuthenticated: () => currentUser !== null,
        login: async () => {
          currentUser = {
            id: 'logged-in-user',
            email: 'user@example.com',
            name: 'Logged In',
          };
        },
        logout: async () => {
          currentUser = null;
        },
        hasPermission: (resource, action) => {
          return currentUser?.roles?.includes('admin') ?? false;
        },
        isOwner: (resourceOwnerId) => {
          return currentUser?.id === resourceOwnerId;
        },
      };

      expect(customAuth.isAuthenticated()).toBe(true);
      expect(customAuth.getCurrentUser()?.id).toBe('custom-123');
      expect(customAuth.isOwner('custom-123')).toBe(true);
      expect(customAuth.isOwner('other-id')).toBe(false);
    });

    it('should support async login/logout', async () => {
      let authenticated = false;

      const customAuth: IAuth = {
        getCurrentUser: () => null,
        isAuthenticated: () => authenticated,
        login: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          authenticated = true;
        },
        logout: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          authenticated = false;
        },
        hasPermission: () => false,
        isOwner: () => false,
      };

      expect(customAuth.isAuthenticated()).toBe(false);
      await customAuth.login();
      expect(customAuth.isAuthenticated()).toBe(true);
      await customAuth.logout();
      expect(customAuth.isAuthenticated()).toBe(false);
    });

    it('should support async permission checks', async () => {
      const customAuth: IAuth = {
        getCurrentUser: () => ({ id: '1', name: 'Test' }),
        isAuthenticated: () => true,
        login: () => {},
        logout: () => {},
        hasPermission: async (resource, action) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return resource === 'media' && action === 'read';
        },
        isOwner: () => false,
        canEdit: async (resourceOwnerId) => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return resourceOwnerId === 'editable-123';
        },
      };

      const canRead = await customAuth.hasPermission('media', 'read');
      expect(canRead).toBe(true);

      const canWrite = await customAuth.hasPermission('media', 'write');
      expect(canWrite).toBe(false);

      const canEdit = await customAuth.canEdit?.('editable-123');
      expect(canEdit).toBe(true);

      const cannotEdit = await customAuth.canEdit?.('other-123');
      expect(cannotEdit).toBe(false);
    });
  });

  describe('IUser interface', () => {
    it('should support minimal user properties', () => {
      const minimalUser: IUser = {
        id: 'user-1',
      };

      expect(minimalUser.id).toBe('user-1');
      expect(minimalUser.email).toBeUndefined();
      expect(minimalUser.name).toBeUndefined();
    });

    it('should support all user properties', () => {
      const fullUser: IUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Full User',
        avatar: 'https://example.com/avatar.jpg',
        roles: ['admin', 'editor'],
      };

      expect(fullUser.id).toBe('user-1');
      expect(fullUser.email).toBe('user@example.com');
      expect(fullUser.name).toBe('Full User');
      expect(fullUser.avatar).toBe('https://example.com/avatar.jpg');
      expect(fullUser.roles).toEqual(['admin', 'editor']);
    });

    it('should support custom properties', () => {
      const customUser: IUser = {
        id: 'user-1',
        customField: 'custom-value',
        metadata: { key: 'value' },
      };

      expect(customUser.id).toBe('user-1');
      expect(customUser.customField).toBe('custom-value');
      expect(customUser.metadata).toEqual({ key: 'value' });
    });
  });
});
