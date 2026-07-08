import React from 'react'

import { getPublishedPages } from '@/lib/pages'
import './styles.css'

// Statically rendered: content is fetched at build time from the accp Payload
// API and baked into the exported HTML.
export default async function HomePage() {
  const pages = await getPublishedPages()

  return (
    <div className="home">
      <div className="content">
        <h1>burojazz</h1>
        {pages.length === 0 ? (
          <p>No published pages yet.</p>
        ) : (
          <ul className="links">
            {pages.map((page) => (
              <li key={page.id}>
                <a href={`/${page.slug}`}>{page.title}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
