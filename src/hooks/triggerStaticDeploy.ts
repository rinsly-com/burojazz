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
 * Fire a GitHub `repository_dispatch` event that starts the "Deploy production
 * (static)" GitHub Actions workflow (.github/workflows/deploy-prod.yml), which
 * rebuilds + redeploys the static production site from the live accp content.
 * Never throws — a webhook failure must not break the editor's save (the
 * collection/global hooks await this and ignore the result), while the manual
 * /api/deploy endpoint reports the returned status to the admin UI.
 *
 * Configured via Worker secrets:
 *   DEPLOY_DISPATCH_URL   — https://api.github.com/repos/<owner>/<repo>/dispatches
 *   DEPLOY_DISPATCH_TOKEN — GitHub token with contents:write on that repo
 *   DEPLOY_DISPATCH_EVENT — event_type to send (optional, default "deploy-static")
 * When the URL or token is missing (e.g. local dev) the call is skipped.
 */
export const triggerDeploy = async (payload: Payload, reason: string): Promise<DeployResult> => {
  const url = process.env.DEPLOY_DISPATCH_URL
  const token = process.env.DEPLOY_DISPATCH_TOKEN
  const eventType = process.env.DEPLOY_DISPATCH_EVENT || 'deploy-static'
  if (!url || !token) {
    const message = 'Deploy skipped — DEPLOY_DISPATCH_URL / DEPLOY_DISPATCH_TOKEN not configured.'
    payload.logger.info(`[static-deploy] skipped (${reason}) — dispatch not configured`)
    return { status: 'skipped', message }
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'burojazz-cms-deploy',
      },
      body: JSON.stringify({ event_type: eventType, client_payload: { reason } }),
    })
    // GitHub returns 204 No Content on success.
    if (!res.ok) {
      payload.logger.error(`[static-deploy] failed (${reason}) — dispatch responded HTTP ${res.status}`)
      return {
        status: 'failed',
        message: `Deploy dispatch responded HTTP ${res.status} — production was not rebuilt.`,
      }
    }
    payload.logger.info(`[static-deploy] triggered (${reason}) — HTTP ${res.status}`)
    return {
      status: 'triggered',
      httpStatus: res.status,
      message: `Production rebuild triggered (GitHub Actions dispatched, HTTP ${res.status}).`,
    }
  } catch (err) {
    const message = (err as Error).message
    payload.logger.error(`[static-deploy] failed (${reason}): ${message}`)
    return { status: 'failed', message: `Deploy dispatch request failed: ${message}` }
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
