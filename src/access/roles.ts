import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

export type Role = 'admin' | 'reviewer' | 'author'

/** True if the user has the given role. */
export const hasRole = (user: User | null | undefined, role: Role): boolean =>
  Boolean(user?.roles?.includes(role))

/** Admins can do everything a reviewer can. */
export const isReviewer = (user: User | null | undefined): boolean =>
  hasRole(user, 'admin') || hasRole(user, 'reviewer')

export const isAdmin = (user: User | null | undefined): boolean => hasRole(user, 'admin')

/** Any signed-in user (author, reviewer, or admin). */
export const isAuthenticated = (user: User | null | undefined): boolean => Boolean(user)

// ---- Collection-level access helpers ----
export const authenticated: Access = ({ req: { user } }) => isAuthenticated(user as User)
export const reviewerOnly: Access = ({ req: { user } }) => isReviewer(user as User)
export const adminOnly: Access = ({ req: { user } }) => isAdmin(user as User)

// ---- Field-level access helpers ----
export const adminFieldOnly: FieldAccess = ({ req: { user } }) => isAdmin(user as User)
