/**
 * src/access/roles.ts — the role predicates every collection's access rules are
 * built from. A false positive here silently widens access across the CMS, so
 * the negative cases matter as much as the positive ones.
 */
import { describe, expect, it } from 'vitest'

import type { User } from '@/payload-types'
import {
  adminOnly,
  authenticated,
  hasRole,
  isAdmin,
  isAuthenticated,
  isReviewer,
  reviewerOnly,
} from '../../src/access/roles'

type Role = 'admin' | 'reviewer' | 'author'

const user = (...roles: Role[]) => ({ id: 1, roles }) as unknown as User
const req = (u: User | null) => ({ req: { user: u } }) as never

describe('hasRole', () => {
  it('matches a role the user holds', () => {
    expect(hasRole(user('author'), 'author')).toBe(true)
  })

  it('does not match a role the user lacks', () => {
    expect(hasRole(user('author'), 'admin')).toBe(false)
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
  ])('is false for %s', (_label, u) => {
    expect(hasRole(u, 'admin')).toBe(false)
  })

  it('is false when the user has no roles array', () => {
    expect(hasRole({ id: 1 } as unknown as User, 'admin')).toBe(false)
  })

  it('is false for an empty roles array', () => {
    expect(hasRole(user(), 'admin')).toBe(false)
  })
})

describe('isReviewer', () => {
  it.each([
    ['a reviewer', user('reviewer'), true],
    ['an admin (admins can do anything a reviewer can)', user('admin'), true],
    ['an author', user('author'), false],
    ['a signed-out visitor', null, false],
  ])('is %s → %s', (_label, u, expected) => {
    expect(isReviewer(u)).toBe(expected)
  })

  it('is true when a user holds several roles including reviewer', () => {
    expect(isReviewer(user('author', 'reviewer'))).toBe(true)
  })
})

describe('isAdmin', () => {
  it.each([
    ['an admin', user('admin'), true],
    ['a reviewer is NOT an admin', user('reviewer'), false],
    ['an author', user('author'), false],
    ['a signed-out visitor', null, false],
  ])('is %s → %s', (_label, u, expected) => {
    expect(isAdmin(u)).toBe(expected)
  })
})

describe('isAuthenticated', () => {
  it('is true for any signed-in user, even with no roles', () => {
    expect(isAuthenticated(user())).toBe(true)
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
  ])('is false for %s', (_label, u) => {
    expect(isAuthenticated(u)).toBe(false)
  })
})

describe('collection access helpers', () => {
  it.each([
    ['authenticated', authenticated, user('author'), true],
    ['authenticated', authenticated, null, false],
    ['reviewerOnly', reviewerOnly, user('reviewer'), true],
    ['reviewerOnly', reviewerOnly, user('admin'), true],
    ['reviewerOnly', reviewerOnly, user('author'), false],
    ['reviewerOnly', reviewerOnly, null, false],
    ['adminOnly', adminOnly, user('admin'), true],
    ['adminOnly', adminOnly, user('reviewer'), false],
    ['adminOnly', adminOnly, null, false],
  ])('%s grants %o → %s', (_label, access, u, expected) => {
    expect((access as (a: never) => boolean)(req(u as User | null))).toBe(expected)
  })
})
