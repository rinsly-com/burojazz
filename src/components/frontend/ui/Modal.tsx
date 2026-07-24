'use client'

import { type ReactNode, useEffect, useRef } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  /** Accessible name for the dialog (used when there is no visible heading). */
  label?: string
  /** Id of the element inside the dialog that titles it. */
  labelledBy?: string
  /** Overrides the default width/rounding of the dialog box. */
  className?: string
  children: ReactNode
}

const DEFAULT_CLASSES =
  'm-auto w-[min(920px,calc(100vw-2rem))] rounded-3xl bg-white p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm'

/**
 * Modal built on the native `<dialog>` element, so focus-trapping,
 * Escape-to-close and the backdrop come from the platform. Children only
 * mount while the modal is open (fresh state on every open), and the body
 * scroll is locked for as long as it is.
 */
export function Modal({ open, onClose, label, labelledBy, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

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
      aria-label={label}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        // Escape: close through our own handler so the caller's state stays
        // the single source of truth.
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // Backdrop click: the dialog element fills the viewport, so a click whose
        // target is the dialog itself (not its content) is on the backdrop.
        if (e.target === ref.current) onClose()
      }}
      className={className ?? DEFAULT_CLASSES}
    >
      {open && (
        <div className="relative max-h-[90vh] overflow-y-auto p-5 md:p-8">
          <ModalCloseButton onClose={onClose} />
          {children}
        </div>
      )}
    </dialog>
  )
}

function ModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Sluiten"
      className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/5 text-ink transition-colors hover:bg-black/10"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </button>
  )
}
