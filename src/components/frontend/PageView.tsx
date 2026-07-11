import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Page } from '@/payload-types'

/**
 * Renders a single published Page: its title and Lexical rich-text content.
 * Server component (no client runtime) so it is safe in the static export.
 * This is the shared rendering unit for page routes.
 */
export const PageView: React.FC<{ page: Page }> = ({ page }) => {
  return (
    <article className="page">
      <h1>{page.title}</h1>
      {page.content && <RichText data={page.content} />}
    </article>
  )
}

export default PageView
