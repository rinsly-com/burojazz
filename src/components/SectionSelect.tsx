'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { FieldLabel, SelectInput, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/** The subset of a Page block we need to build a scroll-target option. */
type BlockLite = {
  id?: string | null
  blockType?: string
  anchor?: string | null
}

/** Human labels for each block type (matches the block `labels.singular`). */
const BLOCK_LABELS: Record<string, string> = {
  hero: 'Hero',
  services: 'Services',
  about: 'Over ons',
  coreValues: 'Kernwaarden',
  visionMission: 'Visie & missie',
  contactPersons: 'Contactpersonen',
  complaints: 'Klachtenprocedure',
  social: 'Social',
  vacancies: 'Vacatures',
  accordion: 'Accordion',
  buttonRow: 'Knoppenrij',
  richText: 'Tekst',
}

const cleanAnchor = (v: unknown): string =>
  typeof v === 'string' ? v.trim().replace(/^#+/, '') : ''

/**
 * Field component for a link's "Section" target. Reads the sibling `page`
 * relationship, fetches that page's block layout over the admin API, and
 * offers a select of its sections. The stored value is the block's Anchor ID
 * when set (readable, e.g. `over-ons`), otherwise the block's stable id — so
 * it always matches the `id` that `RenderBlocks` renders on the section, and
 * `hrefFor` turns it into `/slug#value`.
 */
export const SectionSelect: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })

  // The `page` relationship lives beside us in the same link group; swap the
  // trailing path segment (`…anchor` → `…page`) to read it from form state.
  const pagePath = useMemo(() => {
    const parts = path.split('.')
    parts[parts.length - 1] = 'page'
    return parts.join('.')
  }, [path])

  const pageId = useFormFields(([state]) => {
    const v = state[pagePath]?.value
    // Single-relationTo relationships store the bare id; be defensive anyway.
    return v && typeof v === 'object' ? (v as { value?: unknown }).value : v
  }) as number | string | null | undefined

  const hasPage = pageId !== null && pageId !== undefined && pageId !== ''

  // Keep the fetch result tagged with the page it belongs to, so loading and
  // errors can be *derived* rather than set synchronously in the effect body
  // (which would trigger cascading renders). All setState here runs inside
  // async callbacks only.
  const [result, setResult] = useState<{
    pageId: number | string
    blocks: BlockLite[] | null
    error: boolean
  } | null>(null)

  useEffect(() => {
    if (!hasPage) return
    const forPage = pageId as number | string
    let active = true
    fetch(`/api/pages/${forPage}?depth=0&draft=true`, {
      credentials: 'include',
      headers: { accept: 'application/json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((doc) => {
        const layout = (doc as { layout?: BlockLite[] } | null)?.layout
        if (active) setResult({ pageId: forPage, blocks: Array.isArray(layout) ? layout : [], error: false })
      })
      .catch(() => {
        if (active) setResult({ pageId: forPage, blocks: null, error: true })
      })
    return () => {
      active = false
    }
  }, [hasPage, pageId])

  const current = result && result.pageId === pageId ? result : null
  const loading = hasPage && !current
  const error = current?.error ?? false
  const blocks = current?.error ? null : current?.blocks ?? null

  const options = useMemo(() => {
    if (!blocks) return []
    return blocks
      .map((b, i) => {
        const anchor = cleanAnchor(b.anchor)
        const target = anchor || b.id || ''
        const typeLabel = BLOCK_LABELS[b.blockType ?? ''] ?? b.blockType ?? 'Sectie'
        const label = anchor ? `${typeLabel} — #${anchor}` : `${typeLabel} (sectie ${i + 1})`
        return { label, value: String(target) }
      })
      .filter((o) => o.value)
  }, [blocks])

  const label = typeof field?.label === 'string' ? field.label : 'Section'
  const description =
    typeof field?.admin?.description === 'string' ? field.admin.description : undefined

  const hint = (text: string) => (
    <p style={{ opacity: 0.6, fontSize: 13, margin: 0 }}>{text}</p>
  )

  return (
    <div className="field-type" style={{ marginBottom: 'var(--base)' }}>
      <FieldLabel label={label} path={path} />

      {!hasPage ? (
        hint('Kies eerst een pagina om naar een sectie te scrollen.')
      ) : loading ? (
        hint('Secties laden…')
      ) : error ? (
        <p style={{ color: 'var(--theme-error-500)', fontSize: 13, margin: 0 }}>
          Kon de secties van deze pagina niet laden.
        </p>
      ) : options.length === 0 ? (
        hint('Deze pagina heeft nog geen (opgeslagen) secties.')
      ) : (
        <SelectInput
          path={path}
          name={field?.name ?? 'anchor'}
          options={options}
          value={value ?? undefined}
          isClearable
          placeholder="Bovenaan de pagina (geen sectie)"
          onChange={(opt: unknown) => {
            const selected = Array.isArray(opt) ? opt[0] : opt
            setValue((selected as { value?: string } | null)?.value ?? '')
          }}
        />
      )}

      {description && (
        <p style={{ opacity: 0.6, fontSize: 12, margin: '6px 0 0' }}>{description}</p>
      )}
    </div>
  )
}

export default SectionSelect
