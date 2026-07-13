'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { ArrowIcon } from '@/components/frontend/ui/ArrowIcon'
import { hrefFor, type LinkFields } from '@/components/frontend/ui/CMSLink'
import { Media } from '@/components/frontend/ui/Media'
import type { Header } from '@/payload-types'

type SiteHeaderProps = {
  /** The `header` global data; nav is empty until items are added in the CMS. */
  header?: Pick<Header, 'navItems' | 'cta' | 'logo'> | null
}

type NavItem = {
  key: string
  label: string
  href: string
  newTab: boolean
}

function toNavItem(link: LinkFields, key: string): NavItem | null {
  if (!link.label) return null
  return { key, label: link.label, href: hrefFor(link), newTab: link.newTab ?? false }
}

/**
 * Floating pill navigation bar rendered over the hero. White rounded-[70px]
 * bar with the logo left, CMS-managed nav items center and a teal CTA pill
 * right. Client component only for the mobile hamburger toggle.
 */
export function SiteHeader({ header }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const pillRef = useRef<HTMLDivElement>(null)

  // Close the open mobile menu when clicking/tapping outside the pill.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const navItems = (header?.navItems ?? [])
    .map((item, i) => toNavItem(item, item.id ?? String(i)))
    .filter((item): item is NavItem => item !== null)

  const cta = header?.cta ? toNavItem(header.cta, 'cta') : null

  const linkTarget = (item: NavItem) =>
    item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  /**
   * Animate the jump to an on-page section instead of letting Next's router
   * scroll instantly (it force-sets `scroll-behavior: auto` during navigation,
   * which defeats the CSS smooth-scroll). Only handles anchors on the current
   * page; cross-page/external links fall through to normal navigation. The
   * section's top lands flush against the top of the viewport (no offset).
   */
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const hashIndex = href.indexOf('#')
    if (hashIndex === -1) return
    const pathPart = href.slice(0, hashIndex)
    const id = href.slice(hashIndex + 1)
    if (!id) return

    const onCurrentPage =
      pathPart === '' ||
      pathPart === window.location.pathname ||
      (pathPart === '/' && window.location.pathname === '/')
    if (!onCurrentPage) return

    const target = document.getElementById(decodeURIComponent(id))
    if (!target) return

    e.preventDefault()
    setOpen(false)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
    window.history.pushState(null, '', `#${id}`)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto w-full max-w-[1512px] px-4 py-4 md:px-20 md:py-[21px]">
        <div
          ref={pillRef}
          className={`bg-white p-3 shadow-[0px_9px_26.9px_0px_rgba(0,0,0,0.08)] md:p-4 ${
            open ? 'rounded-[36px] lg:rounded-[70px]' : 'rounded-[70px]'
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="Buro J.A.Z.Z. home" className="shrink-0">
              <Media
                resource={header?.logo}
                fallbackSrc="/images/header-hero/logo.svg"
                alt="Buro J.A.Z.Z. logo"
                fit="contain"
                className="size-12 md:size-14"
              />
            </Link>

            <nav aria-label="Hoofdmenu" className="hidden items-center gap-4 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  {...linkTarget(item)}
                  className="rounded-[46px] px-3 py-2 text-sm font-medium text-ink transition-colors hover:text-brand"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {cta && (
              <div className="hidden self-stretch lg:flex">
                <Link
                  href={cta.href}
                  {...linkTarget(cta)}
                  className="inline-flex h-full items-center gap-2.5 rounded-pill bg-brand px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3fadb7]"
                  onClick={(e) => handleNavClick(e, cta.href)}
                >
                  {cta.label}
                  <ArrowIcon />
                </Link>
              </div>
            )}

            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:text-brand lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Menu sluiten' : 'Menu openen'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 4L16 16M16 4L4 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
                  <path
                    d="M1 1H21M1 8H21M1 15H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>

          {open && (
            <nav
              id="mobile-menu"
              aria-label="Hoofdmenu mobiel"
              className="flex flex-col gap-1 px-3 pb-4 pt-2 lg:hidden"
            >
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  {...linkTarget(item)}
                  className="rounded-[46px] px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:text-brand"
                  onClick={(e) => {
                    setOpen(false)
                    handleNavClick(e, item.href)
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {cta && (
                <Link
                  href={cta.href}
                  {...linkTarget(cta)}
                  className="mt-2 inline-flex items-center gap-2.5 self-start rounded-pill bg-brand px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3fadb7]"
                  onClick={(e) => {
                    setOpen(false)
                    handleNavClick(e, cta.href)
                  }}
                >
                  {cta.label}
                  <ArrowIcon />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
