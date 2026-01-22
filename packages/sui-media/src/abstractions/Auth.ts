/**
 * Authentication abstraction for sui-media components
 *
 * This abstraction provides a framework-agnostic interface for authentication and
 * authorization operations, allowing media components to work with any auth system
 * (NextAuth, Auth0, custom JWT, etc.).
 *
 * @example
 * ```typescript
 * // Implementation with NextAuth
 * import { useSession } from 'next-auth/react';
 *
 * function useAuthAdapter(): IAuth {
 *   const { data: session, status } = useSession();
 *
 *   return {
 *     getCurrentUser: () => session?.user ? {
 *       id: session.user.id,
 *       email: session.user.email,
 *       name: session.user.name,
 *       avatar: session.user.image,
 *     } : null,
 *     isAuthenticated: () => status === 'authenticated',
 *     login: async () => { await signIn(); },
 *     logout: async () => { await signOut(); },
 *     hasPermission: (resource, action) => {
 *       // Custom permission logic
 *       return true;
 *     },
 *     isOwner: (resourceOwnerId) => {
 *       return session?.user?.id === resourceOwnerId;
 *     },
 *   };
 * }
 *
 * // Pass to media components
 * <MediaCard auth={useAuthAdapter()} />
 * ```
 */

/**
 * User information interface
 */
export interface IUser {
  /**
   * Unique user identifier
   */
  id: string;

  /**
   * User's email address
   */
  email?: string;

  /**
   * User's display name
   */
  name?: string;

  /**
   * URL to user's avatar image
   */
  avatar?: string;

  /**
   * User's roles (e.g., ['admin', 'editor'])
   */
  roles?: string[];

  /**
   * Additional custom user properties
   */
  [key: string]: any;
}

/**
 * Authentication and authorization interface
 */
export interface IAuth {
  /**
   * Get the currently authenticated user
   * @returns The current user or null if not authenticated
   */
  getCurrentUser: () => IUser | null;

  /**
   * Check if a user is currently authenticated
   * @returns True if user is authenticated, false otherwise
   */
  isAuthenticated: () => boolean;

  /**
   * Initiate login flow
   * @param redirectUrl - Optional URL to redirect to after login
   */
  login: (redirectUrl?: string) => void | Promise<void>;

  /**
   * Initiate logout flow
   * @param redirectUrl - Optional URL to redirect to after logout
   */
  logout: (redirectUrl?: string) => void | Promise<void>;

  /**
   * Check if the current user has a specific permission
   * @param resource - The resource being accessed (e.g., 'media', 'comment')
   * @param action - The action being performed (e.g., 'create', 'edit', 'delete')
   * @returns True if user has permission, false otherwise
   */
  hasPermission: (resource: string, action: string) => boolean | Promise<boolean>;

  /**
   * Check if the current user is the owner of a resource
   * @param resourceOwnerId - The user ID of the resource owner
   * @returns True if current user is the owner, false otherwise
   */
  isOwner: (resourceOwnerId: string) => boolean;

  /**
   * Check if the current user can edit a resource
   * @param resourceOwnerId - The user ID of the resource owner
   * @returns True if current user can edit, false otherwise
   */
  canEdit?: (resourceOwnerId: string) => boolean | Promise<boolean>;
}

/**
 * No-op authentication implementation that simulates an unauthenticated state
 *
 * Use this as a default auth provider for applications that don't need authentication,
 * or as a placeholder during development/testing.
 *
 * @example
 * ```typescript
 * import { NoOpAuth } from '@stoked-ui/sui-media';
 *
 * // Use as default when auth is optional
 * function MediaViewer({ auth = NoOpAuth }) {
 *   // Component will work but all auth checks will return false/null
 * }
 * ```
 */
export class NoOpAuth implements IAuth {
  getCurrentUser(): IUser | null {
    return null;
  }

  isAuthenticated(): boolean {
    return false;
  }

  login(redirectUrl?: string): void {
    // No-op: does nothing
  }

  logout(redirectUrl?: string): void {
    // No-op: does nothing
  }

  hasPermission(resource: string, action: string): boolean {
    return false;
  }

  isOwner(resourceOwnerId: string): boolean {
    return false;
  }

  canEdit(resourceOwnerId: string): boolean {
    return false;
  }
}

/**
 * Singleton instance of NoOpAuth for convenience
 */
export const noOpAuth = new NoOpAuth();

/**
 * Mock authenticated user for testing
 *
 * @example
 * ```typescript
 * import { createMockAuth } from '@stoked-ui/sui-media';
 *
 * const mockAuth = createMockAuth({
 *   id: 'user-123',
 *   email: 'test@example.com',
 *   name: 'Test User',
 * });
 *
 * // Use in tests or Storybook stories
 * <MediaCard auth={mockAuth} />
 * ```
 */
export function createMockAuth(user: IUser, options?: {
  hasAllPermissions?: boolean;
  isOwnerOfAll?: boolean;
}): IAuth {
  return {
    getCurrentUser: () => user,
    isAuthenticated: () => true,
    login: () => {},
    logout: () => {},
    hasPermission: () => options?.hasAllPermissions ?? true,
    isOwner: () => options?.isOwnerOfAll ?? true,
    canEdit: () => options?.isOwnerOfAll ?? true,
  };
}
