import React from 'react'

import type { Page } from '@/payload-types'

/**
 * Renders a single published Page's title for pages built without block layout.
 * The top padding clears the floating pill header (absolutely positioned over
 * the page). Server component (no client runtime) so it is safe in the
 * static export. This is the shared rendering unit for page routes.
 */
export const PageView: React.FC<{ page: Page }> = ({ page }) => {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 pb-20 pt-40 md:pt-48">
      <h1 className="text-3xl font-semibold text-ink md:text-4xl">{page.title}</h1>
    </article>
  )
}

export default PageView
