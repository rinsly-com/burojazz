'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import { Modal } from '@/components/frontend/ui/Modal'

import { AanmeldenForm } from './AanmeldenForm'

const HASH = '#aanmelden'

/** True if the anchor points at the aanmelden route/hash (same-tab, unmodified). */
function isAanmeldenLink(el: HTMLAnchorElement, e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    return false
  }
  if (el.target === '_blank') return false
  const href = el.getAttribute('href') ?? ''
  if (href === HASH) return true
  try {
    const url = new URL(el.href, window.location.href)
    return url.pathname.replace(/\/$/, '') === '/aanmelden'
  } catch {
    return false
  }
}

// The dialog's open state is derived from the URL hash (an external store), so
// deep-links, the back button and the click-interceptor all stay in sync
// without a synchronous setState-in-effect.
const subscribeHash = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  window.addEventListener('popstate', cb)
  return () => {
    window.removeEventListener('hashchange', cb)
    window.removeEventListener('popstate', cb)
  }
}
const isHashOpen = () => window.location.hash === HASH

/**
 * Global "Direct aanmelden" wizard dialog. Mounted once in the frontend layout.
 *
 * Opens when the URL hash is `#aanmelden`, which happens either from a deep-link
 * or because the visitor clicked any link to `/aanmelden` or `#aanmelden` — so
 * the existing Hero CTAs and the CMS-managed header CTA keep working without a
 * rewrite. The `/aanmelden` page stays a no-JS fallback.
 *
 * The dialog chrome itself (native <dialog>, backdrop, close button, scroll
 * lock) lives in the shared `Modal`.
 */
export function AanmeldenDialog({ privacyHref }: { privacyHref?: string }) {
  const open = useSyncExternalStore(subscribeHash, isHashOpen, () => false)

  const closeDialog = useCallback(() => {
    if (window.location.hash === HASH) {
      // Strip the hash without leaving the page, then notify the store.
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      window.dispatchEvent(new Event('hashchange'))
    }
  }, [])

  // Intercept clicks on aanmelden links → set the hash (opens via the store).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest('a')
      if (anchor && isAanmeldenLink(anchor, e)) {
        e.preventDefault()
        if (window.location.hash !== HASH) window.location.hash = 'aanmelden'
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <Modal open={open} onClose={closeDialog} label="Direct aanmelden">
      <AanmeldenForm privacyHref={privacyHref} />
    </Modal>
  )
}

export default AanmeldenDialog
