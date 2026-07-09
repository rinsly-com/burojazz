import type { ReactNode } from 'react'

/**
 * Small teal label rendered above section titles.
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  // One consistent eyebrow style across sections (per design). Callers may add
  // layout classes via className but should not override size/weight.
  const classes = ['text-sm font-medium text-brand', className].filter(Boolean).join(' ')
  return <p className={classes}>{children}</p>
}
