// @vitest-environment node
// Local API tests load the D1/wrangler config, which needs a real Node runtime
// (jsdom breaks esbuild's Uint8Array invariant used by wrangler).
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let authorId: string | number
let reviewerId: string | number
let author: any
let reviewer: any
let pageId: string | number

describe('Publishing workflow (draft -> review -> ready -> published)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    author = await payload.create({
      collection: 'users',
      data: { email: 'wf-author@test.local', password: 'test1234', roles: ['author'] },
    })
    authorId = author.id

    reviewer = await payload.create({
      collection: 'users',
      data: { email: 'wf-reviewer@test.local', password: 'test1234', roles: ['reviewer'] },
    })
    reviewerId = reviewer.id

    const page = await payload.create({
      collection: 'pages',
      data: { title: 'WF Test', slug: 'wf-test', workflowStatus: 'draft' },
      draft: true,
      user: author,
    })
    pageId = page.id
  })

  afterAll(async () => {
    if (pageId) await payload.delete({ collection: 'pages', id: pageId }).catch(() => {})
    if (authorId) await payload.delete({ collection: 'users', id: authorId }).catch(() => {})
    if (reviewerId) await payload.delete({ collection: 'users', id: reviewerId }).catch(() => {})
  })

  it('blocks an author from marking a page Ready', async () => {
    await expect(
      payload.update({
        collection: 'pages',
        id: pageId,
        data: { workflowStatus: 'ready' },
        draft: true,
        user: author,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/reviewers can mark/i)
  })

  it('blocks an author from publishing', async () => {
    await expect(
      payload.update({
        collection: 'pages',
        id: pageId,
        data: { title: 'WF Test', _status: 'published' },
        user: author,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/reviewers can publish/i)
  })

  it('blocks a reviewer from publishing a page that is not Ready', async () => {
    await expect(
      payload.update({
        collection: 'pages',
        id: pageId,
        data: { title: 'WF Test', _status: 'published' },
        user: reviewer,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/must be in "Ready"/i)
  })

  it('lets an author move Draft -> Review', async () => {
    const res = await payload.update({
      collection: 'pages',
      id: pageId,
      data: { workflowStatus: 'review' },
      draft: true,
      user: author,
      overrideAccess: false,
    })
    expect(res.workflowStatus).toBe('review')
  })

  it('lets a reviewer approve (Review -> Ready)', async () => {
    const res = await payload.update({
      collection: 'pages',
      id: pageId,
      data: { workflowStatus: 'ready' },
      draft: true,
      user: reviewer,
      overrideAccess: false,
    })
    expect(res.workflowStatus).toBe('ready')
  })

  it('lets a reviewer publish a Ready page and resets workflow to Draft', async () => {
    await payload.update({
      collection: 'pages',
      id: pageId,
      data: { title: 'WF Test Published', _status: 'published' },
      user: reviewer,
      overrideAccess: false,
    })
    const published = await payload.findByID({ collection: 'pages', id: pageId })
    expect(published._status).toBe('published')
    expect(published.workflowStatus).toBe('draft')
  })
})
