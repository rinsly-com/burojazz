'use client'

import { useState } from 'react'
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

  const navItems = (header?.navItems ?? [])
    .map((item, i) => toNavItem(item, item.id ?? String(i)))
    .filter((item): item is NavItem => item !== null)

  const cta = header?.cta ? toNavItem(header.cta, 'cta') : null

  const linkTarget = (item: NavItem) =>
    item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto w-full max-w-[1512px] px-4 py-4 md:px-20 md:py-[21px]">
        <div className="rounded-[70px] bg-white p-3 shadow-[0px_9px_26.9px_0px_rgba(0,0,0,0.08)] md:p-4">
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
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {cta && (
                <Link
                  href={cta.href}
                  {...linkTarget(cta)}
                  className="mt-2 inline-flex items-center gap-2.5 self-start rounded-pill bg-brand px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3fadb7]"
                  onClick={() => setOpen(false)}
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
