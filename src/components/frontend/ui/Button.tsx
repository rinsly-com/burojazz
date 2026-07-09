import Link from 'next/link'

import { ArrowIcon } from './ArrowIcon'

type ButtonProps = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
  className?: string
}

/**
 * Brand button (server-safe). Primary is a teal pill with white text;
 * secondary is a bare teal text link. Both end in a small right arrow.
 */
export function Button({ label, href, variant = 'primary', className }: ButtonProps) {
  const base = 'inline-flex items-center gap-2.5 text-sm font-medium'
  const styles =
    variant === 'primary'
      ? `${base} rounded-pill bg-brand px-7 py-3.5 text-white transition-colors hover:bg-[#3fadb7]`
      : `${base} text-brand transition-colors hover:text-[#3fadb7]`

  return (
    <Link href={href} className={className ? `${styles} ${className}` : styles}>
      {label}
      <ArrowIcon />
    </Link>
  )
}
