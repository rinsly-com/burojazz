import type { Page } from '@/payload-types'

import { Button } from './Button'

/**
 * The shape produced by the shared `link` / `linkGroup` fields (src/fields/link.ts).
 * `page` is a populated Page when fetched with depth >= 1, or a bare id at depth 0.
 */
export type LinkFields = {
  label?: string | null
  variant?: 'primary' | 'secondary' | null
  type?: 'internal' | 'external' | null
  page?: (number | Page) | null
  url?: string | null
  anchor?: string | null
  newTab?: boolean | null
}

/** Normalize a CMS section target to a leading-`#` hash, or '' when empty. */
function hashFor(anchor?: string | null): string {
  const id = anchor?.trim().replace(/^#+/, '')
  return id ? `#${id}` : ''
}

/**
 * Resolve a CMS link to an href: an external URL, or an internal page
 * (`/slug`), optionally scrolled to a section on that page (`/slug#anchor`).
 * Linking to a section of the current page (`/#anchor`) is how onepager
 * menu scrolling works.
 */
export function hrefFor(link: LinkFields | null | undefined): string {
  if (!link) return '#'
  if (link.type === 'external') return link.url || '#'
  const hash = hashFor(link.anchor)
  const page = link.page
  if (page && typeof page === 'object') {
    const base = page.slug === 'home' ? '/' : `/${page.slug}`
    return `${base}${hash}`
  }
  return hash || '#'
}

/** Render a single CMS-configured link as a brand button. */
export function CMSLink({ link, className }: { link?: LinkFields | null; className?: string }) {
  if (!link?.label) return null
  return (
    <Button
      label={link.label}
      href={hrefFor(link)}
      variant={link.variant ?? 'primary'}
      newTab={link.newTab ?? false}
      className={className}
    />
  )
}

/** Render a block's 0…N buttons (the `buttons` linkGroup array) as a row. */
export function Buttons({
  buttons,
  className,
}: {
  buttons?: (LinkFields & { id?: string | null })[] | null
  className?: string
}) {
  if (!buttons?.length) return null
  return (
    <div className={className ?? 'flex flex-wrap items-center gap-6'}>
      {buttons.map((button, index) => (
        <CMSLink key={button.id ?? index} link={button} />
      ))}
    </div>
  )
}
