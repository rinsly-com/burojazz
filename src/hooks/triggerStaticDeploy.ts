import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

/**
 * POST the Cloudflare Deploy Hook that rebuilds + redeploys the static
 * production site. Fire-and-forget with error handling so a webhook failure
 * never breaks the editor's save.
 *
 * The hook URL is provided via the CLOUDFLARE_DEPLOY_HOOK_URL env var / Worker
 * secret. When it is not set (e.g. local dev), the call is skipped.
 */
const triggerDeploy = async (payload: Payload, reason: string): Promise<void> => {
  const url = process.env.CLOUDFLARE_DEPLOY_HOOK_URL
  if (!url) {
    payload.logger.info(`[static-deploy] skipped (${reason}) — CLOUDFLARE_DEPLOY_HOOK_URL not set`)
    return
  }
  try {
    const res = await fetch(url, { method: 'POST' })
    payload.logger.info(`[static-deploy] triggered (${reason}) — HTTP ${res.status}`)
  } catch (err) {
    payload.logger.error(`[static-deploy] failed (${reason}): ${(err as Error).message}`)
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
