import type { PayloadHandler, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'
import { isReviewer } from '../access/roles'
import { triggerDeploy } from '../hooks/triggerStaticDeploy'

/**
 * POST /api/deploy — trigger a static production rebuild from the current
 * published (accp) content.
 *
 * Backs the "Deploy now" button in the admin Deploy view, and is the ONLY thing
 * that deploys production: publishing or editing content just changes what this
 * build will ship. Reviewer-only, matching who is allowed to publish.
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
