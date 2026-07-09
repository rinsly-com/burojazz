import type { ReactNode } from 'react'

type SectionProps = {
  children: ReactNode
  /** Vertical padding utilities; override per section as needed. */
  py?: string
  className?: string
  id?: string
}

/**
 * Standard section wrapper: centers content at the design's 1272px content
 * width with responsive horizontal padding and configurable vertical padding.
 */
export function Section({ children, py = 'py-16 md:py-24', className, id }: SectionProps) {
  const classes = ['mx-auto w-full max-w-[1272px] px-6 md:px-20', py, className]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={classes}>
      {children}
    </section>
  )
}
