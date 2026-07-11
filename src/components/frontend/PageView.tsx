import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Page } from '@/payload-types'

/**
 * Renders a single published Page: its title and Lexical rich-text content.
 * The top padding clears the floating pill header (absolutely positioned over
 * the page). Server component (no client runtime) so it is safe in the
 * static export. This is the shared rendering unit for page routes.
 */
export const PageView: React.FC<{ page: Page }> = ({ page }) => {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 pb-20 pt-40 md:pt-48">
      <h1 className="text-3xl font-semibold text-ink md:text-4xl">{page.title}</h1>
      {page.content && (
        <div className="prose-a:text-brand mt-6 text-sm leading-relaxed text-ink/90">
          <RichText data={page.content} />
        </div>
      )}
    </article>
  )
}

export default PageView
