'use client'

import Link from 'next/link'

/**
 * Animate the jump to an on-page section instead of letting Next's router
 * scroll instantly (it force-sets `scroll-behavior: auto` during navigation,
 * which defeats the CSS smooth-scroll). Only handles anchors on the current
 * page; cross-page/external links fall through to normal navigation. The
 * section's top lands flush against the top of the viewport (no offset).
 *
 * Returns true when the click was intercepted and handled here.
 */
export function scrollToAnchor(e: React.MouseEvent<HTMLAnchorElement>, href: string): boolean {
  const hashIndex = href.indexOf('#')
  if (hashIndex === -1) return false
  const pathPart = href.slice(0, hashIndex)
  const id = href.slice(hashIndex + 1)
  if (!id) return false

  const onCurrentPage =
    pathPart === '' ||
    pathPart === window.location.pathname ||
    (pathPart === '/' && window.location.pathname === '/')
  if (!onCurrentPage) return false

  const target = document.getElementById(decodeURIComponent(id))
  if (!target) return false

  e.preventDefault()
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
  window.history.pushState(null, '', `#${id}`)
  return true
}

type AnchorLinkProps = {
  href: string
  newTab?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * A `next/link` that smooth-scrolls when it targets a section on the current
 * page. Lets server components (e.g. the footer) render CMS links with the
 * same scroll behaviour as the header nav.
 */
export function AnchorLink({ href, newTab = false, className, children }: AnchorLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => scrollToAnchor(e, href)}
    >
      {children}
    </Link>
  )
}
