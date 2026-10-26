'use client'

import { type ReactNode } from 'react'

import { Dialog } from '@rinsly-com/ui/dialog'
import { Button } from '@rinsly-com/ui/button'

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

const DEFAULT_BOX = 'w-[min(920px,calc(100vw-2rem))] rounded-3xl bg-white p-0'

/**
 * Modal built on `@rinsly-com/ui/dialog` (Base UI). Focus-trapping, Escape,
 * outside-press and scroll lock come from the dialog. Children only mount
 * while the modal is open (fresh state on every open). The box stays the
 * burojazz skin: centered, rounded, white, with a blurred dim backdrop.
 */
export function Modal({ open, onClose, label, labelledBy, className, children }: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup
          aria-label={label}
          aria-labelledby={labelledBy}
          className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none ${className ?? DEFAULT_BOX}`}
        >
          {open && (
            <div className="relative max-h-[90vh] overflow-y-auto p-5 md:p-8">
              <Dialog.Close
                aria-label="Sluiten"
                render={
                  <Button className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/5 p-0 text-ink transition-colors hover:bg-black/10" />
                }
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 3L13 13M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </Dialog.Close>
              {children}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
