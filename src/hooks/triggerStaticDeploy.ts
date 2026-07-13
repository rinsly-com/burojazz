import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

/** Outcome of a deploy-hook call, surfaced to the admin Deploy view. */
export type DeployResult =
  | { status: 'triggered'; httpStatus: number; message: string }
  | { status: 'skipped'; message: string }
  | { status: 'failed'; message: string }

/**
 * POST the Cloudflare Deploy Hook that rebuilds + redeploys the static
 * production site. Never throws — a webhook failure must not break the editor's
 * save (the collection/global hooks await this and ignore the result), while
 * the manual /api/deploy endpoint reports the returned status to the admin UI.
 *
 * The hook URL is provided via the CLOUDFLARE_DEPLOY_HOOK_URL env var / Worker
 * secret. When it is not set (e.g. local dev, or before the static site's
 * deploy hook exists) the call is skipped.
 */
export const triggerDeploy = async (payload: Payload, reason: string): Promise<DeployResult> => {
  const url = process.env.CLOUDFLARE_DEPLOY_HOOK_URL
  if (!url) {
    const message = 'Deploy skipped — CLOUDFLARE_DEPLOY_HOOK_URL is not configured.'
    payload.logger.info(`[static-deploy] skipped (${reason}) — CLOUDFLARE_DEPLOY_HOOK_URL not set`)
    return { status: 'skipped', message }
  }
  try {
    const res = await fetch(url, { method: 'POST' })
    if (!res.ok) {
      payload.logger.error(`[static-deploy] failed (${reason}) — deploy hook responded HTTP ${res.status}`)
      return {
        status: 'failed',
        message: `Deploy hook responded HTTP ${res.status} — production was not rebuilt.`,
      }
    }
    payload.logger.info(`[static-deploy] triggered (${reason}) — HTTP ${res.status}`)
    return {
      status: 'triggered',
      httpStatus: res.status,
      message: `Production rebuild triggered (deploy hook responded HTTP ${res.status}).`,
    }
  } catch (err) {
    const message = (err as Error).message
    payload.logger.error(`[static-deploy] failed (${reason}): ${message}`)
    return { status: 'failed', message: `Deploy hook request failed: ${message}` }
  }
}

/**
 * Rebuild production whenever a document is published, or when an
 * already-published document changes or is unpublished — i.e. any change that
 * alters what the public (published) site should show.
 */
export const triggerStaticDeployAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  previousDoc,
  req,
}) => {
  const isPublished = doc?._status === 'published'
  const wasPublished = previousDoc?._status === 'published'
  if (isPublished || wasPublished) {
    await triggerDeploy(req.payload, `${collection.slug} ${doc?.id} published-change`)
  }
  return doc
}

/**
 * Rebuild production when a global (e.g. header) changes — globals have no
 * draft stage, so every change is immediately part of the published site.
 */
export const triggerStaticDeployAfterGlobalChange: GlobalAfterChangeHook = async ({
  doc,
  global,
  req,
}) => {
  await triggerDeploy(req.payload, `global ${global.slug} changed`)
  return doc
}

/** Rebuild production when a published document is deleted. */
export const triggerStaticDeployAfterDelete: CollectionAfterDeleteHook = async ({
  collection,
  doc,
  req,
}) => {
  if (doc?._status === 'published') {
    await triggerDeploy(req.payload, `${collection.slug} ${doc?.id} deleted`)
  }
  return doc
}
