import Link from 'next/link'

import { Button as UiButton } from '@rinsly-com/ui/button'

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
 * bare teal text link. Both end in a small right arrow. The control is
 * `@rinsly-com/ui/button` composed onto `next/link`; this file only owns the
 * burojazz classes.
 */
export function Button({ label, href, variant = 'primary', newTab, className }: ButtonProps) {
  const base = 'inline-flex items-center gap-2.5 text-sm font-medium'
  const styles =
    variant === 'primary'
      ? `${base} rounded-pill bg-brand px-7 py-3.5 text-white transition-colors hover:bg-[#3fadb7]`
      : `${base} text-brand transition-colors hover:text-[#3fadb7]`

  return (
    <UiButton
      nativeButton={false}
      // Base UI's non-native button sets role="button". These are links
      // (href, new tab, middle-click), so keep the link role.
      role="link"
      render={
        <Link href={href} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} />
      }
      className={className ? `${styles} ${className}` : styles}
    >
      {label}
      <ArrowIcon />
    </UiButton>
  )
}
