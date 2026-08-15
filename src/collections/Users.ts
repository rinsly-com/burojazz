import type { CollectionConfig } from 'payload'

import { buildUsers } from '@rinsly-com/site-core/collections/Users'

/**
 * Users — the engine's workflow variant (Admin / Reviewer / Author), composed
 * rather than forked. This used to be a copy of the engine's collection; the
 * copy silently missed engine-side auth changes (the 0.9.x TOTP two-factor
 * fields, hook and endpoints being the case that exposed it). Site-specific
 * tweaks belong here as a wrapper around `base`, not as a fresh collection.
 */
const base = buildUsers({ workflow: true })

export const Users: CollectionConfig = base
