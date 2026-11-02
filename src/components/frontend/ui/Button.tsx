import Link from 'next/link'

import { ArrowIcon } from './ArrowIcon'

type ButtonProps = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
  newTab?: boolean
  className?: string
}

/**
 * Brand link button. Primary is a teal pill with white text; secondary is a
 * bare teal text link. Both end in a small right arrow. This is a link, so it
 * renders `next/link` directly: composing `@rinsly-com/ui/button` with
 * `nativeButton={false}` adds `tabindex="0"` and activates the link on Space.
 * Real buttons (Aanmelden, the services read-more, the dialog close) use
 * `@rinsly-com/ui/button` at their call sites.
 */
export function Button({ label, href, variant = 'primary', newTab, className }: ButtonProps) {
  const base = 'inline-flex items-center gap-2.5 text-sm font-medium'
  const styles =
    variant === 'primary'
      ? `${base} rounded-pill bg-brand px-7 py-3.5 text-white transition-colors hover:bg-[#3fadb7]`
      : `${base} text-brand transition-colors hover:text-[#3fadb7]`

  return (
    <Link
      href={href}
      className={className ? `${styles} ${className}` : styles}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
      <ArrowIcon />
    </Link>
  )
}
