'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Banner,
  Button,
  Pill,
  SelectInput,
  TextareaInput,
  useAuth,
  useDocumentInfo,
} from '@payloadcms/ui'

type Ref = { id: string | number; email?: string } | string | number | null | undefined

type Comment = {
  id: string | number
  body: string
  resolved?: boolean
  parent?: Ref
  author?: Ref
  createdAt: string
}

const refId = (r: Ref): string | number | null =>
  r && typeof r === 'object' ? r.id : (r ?? null)
const authorLabel = (r: Ref): string =>
  r && typeof r === 'object' ? (r.email ?? String(r.id)) : String(r ?? 'unknown')

/**
 * PR-style threaded review comments for the current page, built from Payload's
 * own UI primitives (TextareaInput / Button / Pill / Banner) so it matches the
 * admin. Reads/writes the `comments` collection over the REST API.
 * Rendered as a `ui` field on the Pages edit view.
 */
export const CommentsPanel: React.FC = () => {
  const { id } = useDocumentInfo()
  const { user } = useAuth()

  const [comments, setComments] = useState<Comment[]>([])
  const [loaded, setLoaded] = useState(false)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<string | number | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  // Fetch only — no setState here, so it is safe to call from an effect.
  const fetchComments = useCallback(async (): Promise<Comment[]> => {
    if (!id) return []
    try {
      const res = await fetch(
        `/api/comments?where[page][equals]=${id}&sort=-createdAt&depth=1&limit=200`,
        { credentials: 'include' },
      )
      const data = (await res.json()) as { docs?: Comment[] }
      return data.docs ?? []
    } catch {
      return []
    }
  }, [id])

  useEffect(() => {
    let active = true
    fetchComments().then((docs) => {
      if (active) {
        setComments(docs)
        setLoaded(true)
      }
    })
    return () => {
      active = false
    }
  }, [fetchComments])

  const reload = useCallback(async () => {
    setComments(await fetchComments())
  }, [fetchComments])

  if (!id) {
    return (
      <div style={{ marginTop: 'var(--base)' }}>
        <h4 style={{ marginBottom: 'calc(var(--base) / 2)' }}>Review comments</h4>
        <Banner type="info">Save the page to start a review thread.</Banner>
      </div>
    )
  }

  const post = async (text: string, parent?: string | number | null) => {
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      await fetch('/api/comments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: id, body: text.trim(), ...(parent ? { parent } : {}) }),
      })
      setBody('')
      setReplyBody('')
      setReplyTo(null)
      await reload()
    } finally {
      setBusy(false)
    }
  }

  const toggleResolved = async (c: Comment) => {
    if (busy) return
    setBusy(true)
    try {
      await fetch(`/api/comments/${c.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: !c.resolved }),
      })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  const topLevel = comments.filter((c) => refId(c.parent) === null)
  const shownTopLevel = topLevel.filter((c) => filter === 'all' || !c.resolved)
  const repliesOf = (cid: string | number) =>
    comments
      .filter((c) => String(refId(c.parent)) === String(cid))
      // Threads read oldest → newest even though the top-level list is newest-first.
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const meta = (c: Comment) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'calc(var(--base) / 2)',
        marginBottom: 'calc(var(--base) / 4)',
        fontSize: '0.85rem',
        color: 'var(--theme-elevation-500)',
      }}
    >
      <strong style={{ color: 'var(--theme-elevation-800)' }}>{authorLabel(c.author)}</strong>
      <span>{new Date(c.createdAt).toLocaleString()}</span>
      {c.resolved && (
        <Pill pillStyle="success" size="small">
          Resolved
        </Pill>
      )}
    </div>
  )

  return (
    <div style={{ marginTop: 'var(--base)' }}>
      <h4 style={{ marginBottom: 'calc(var(--base) / 2)' }}>
        Review comments{user ? '' : ' (sign in to comment)'}
      </h4>

      {loaded && topLevel.length > 0 && (
        <div style={{ maxWidth: 220, marginBottom: 'calc(var(--base) / 2)' }}>
          <SelectInput
            name="comment-filter"
            path="comment-filter"
            label="Show"
            isClearable={false}
            value={filter}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'All (incl. resolved)', value: 'all' },
            ]}
            onChange={(opt) => {
              const value = (opt as { value?: string } | null)?.value
              setFilter(value === 'all' ? 'all' : 'active')
            }}
          />
        </div>
      )}

      {loaded && topLevel.length === 0 && <Banner type="info">No comments yet.</Banner>}
      {loaded && topLevel.length > 0 && shownTopLevel.length === 0 && (
        <Banner type="info">No active comments. Switch to “All” to see resolved ones.</Banner>
      )}

      {shownTopLevel.map((c) => (
        <div
          key={c.id}
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 'var(--style-radius-s)',
            padding: 'var(--base)',
            marginBottom: 'calc(var(--base) / 2)',
            background: c.resolved ? 'var(--theme-elevation-50)' : 'var(--theme-elevation-0)',
          }}
        >
          {meta(c)}
          <div style={{ whiteSpace: 'pre-wrap' }}>{c.body}</div>

          <div style={{ display: 'flex', gap: 'calc(var(--base) / 2)', marginTop: 'calc(var(--base) / 2)' }}>
            <Pill size="small" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>
              Reply
            </Pill>
            <Pill
              size="small"
              pillStyle={c.resolved ? 'warning' : 'light'}
              onClick={() => void toggleResolved(c)}
            >
              {c.resolved ? 'Reopen' : 'Resolve'}
            </Pill>
          </div>

          {repliesOf(c.id).map((r) => (
            <div
              key={r.id}
              style={{
                marginTop: 'calc(var(--base) / 2)',
                marginLeft: 'var(--base)',
                paddingLeft: 'calc(var(--base) / 2)',
                borderLeft: '2px solid var(--theme-elevation-150)',
              }}
            >
              {meta(r)}
              <div style={{ whiteSpace: 'pre-wrap' }}>{r.body}</div>
            </div>
          ))}

          {replyTo === c.id && (
            <div style={{ marginTop: 'calc(var(--base) / 2)', marginLeft: 'var(--base)' }}>
              <TextareaInput
                path={`reply-${c.id}`}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={2}
                placeholder="Reply…"
              />
              <Button buttonStyle="secondary" size="small" disabled={busy} onClick={() => void post(replyBody, c.id)}>
                Reply
              </Button>
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 'var(--base)' }}>
        <TextareaInput
          path="new-comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Leave a comment on these changes…"
        />
        <Button buttonStyle="primary" size="small" disabled={busy} onClick={() => void post(body)}>
          Comment
        </Button>
      </div>
    </div>
  )
}

export default CommentsPanel
