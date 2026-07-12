'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

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
 * Uses a native <dialog> so focus-trapping, Escape-to-close and the backdrop are
 * handled by the platform.
 */
export function AanmeldenDialog({ privacyHref }: { privacyHref?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
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

  // Sync the native <dialog> element + body scroll lock with the open state.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label="Direct aanmelden"
      onCancel={(e) => {
        e.preventDefault()
        closeDialog()
      }}
      onClick={(e) => {
        // Backdrop click: the dialog element fills the viewport, so a click whose
        // target is the dialog itself (not its content) is on the backdrop.
        if (e.target === ref.current) closeDialog()
      }}
      className="m-auto w-[min(920px,calc(100vw-2rem))] rounded-3xl bg-white p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="relative max-h-[90vh] overflow-y-auto p-5 md:p-8">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Sluiten"
            className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/5 text-ink transition-colors hover:bg-black/10"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 3L13 13M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <AanmeldenForm privacyHref={privacyHref} />
        </div>
      )}
    </dialog>
  )
}

export default AanmeldenDialog
