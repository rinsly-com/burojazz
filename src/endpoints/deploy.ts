import type { PayloadHandler, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'
import { isReviewer } from '../access/roles'
import { triggerDeploy } from '../hooks/triggerStaticDeploy'

/**
 * POST /api/deploy — manually trigger a static production rebuild from the
 * current published (accp) content, without having to (re)publish a document.
 *
 * Backs the admin "Deploy" view. Reviewer-only, matching who is allowed to
 * publish (the same event that normally triggers a production rebuild). Uses
 * the shared triggerDeploy helper so the manual path and the on-publish hooks
 * hit the exact same Cloudflare Deploy Hook.
 */
export const deployHandler: PayloadHandler = async (req: PayloadRequest): Promise<Response> => {
  const user = req.user as User | null

  if (!isReviewer(user)) {
    return Response.json(
      { status: 'forbidden', message: 'Only reviewers can trigger a production deploy.' },
      { status: 403 },
    )
  }

  const result = await triggerDeploy(req.payload, `manual deploy by ${user?.email ?? 'unknown'}`)

  // 502 when the hook call actually failed; 200 for triggered/skipped so the UI
  // can show the skipped-because-unconfigured case as a normal (non-error) note.
  const httpStatus = result.status === 'failed' ? 502 : 200
  return Response.json(result, { status: httpStatus })
}
