/**
 * Vacancy card photos (src/components/frontend/blocks/Vacancies.tsx).
 *
 * REGRESSION: the card photo was a raw <img> over a hardcoded CARD_IMAGES
 * array, with no upload field in the block config — an editor could change
 * every text on the card but not the photo. The card must render the CMS
 * upload when one is set, and only fall back to the design images shipped in
 * /public when it is not.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Media } from '../../src/payload-types'
import { Vacancies } from '../../src/components/frontend/blocks/Vacancies'

type VacanciesProps = Parameters<typeof Vacancies>[0]

const mediaDoc = (url: string): Media =>
  ({
    id: 1,
    alt: 'Teamfoto',
    url,
    updatedAt: '2026-07-29T00:00:00.000Z',
    createdAt: '2026-07-29T00:00:00.000Z',
  }) as Media

const renderVacancies = (cards: VacanciesProps['cards']) => {
  const props = { blockType: 'vacancies', cards } as VacanciesProps
  return render(<Vacancies {...props} />).container
}

/** The photo of card `i`: the first <img> inside its <article>. */
const cardPhoto = (container: HTMLElement, i: number) =>
  container.querySelectorAll('article')[i]?.querySelector('img')

describe('vacancy card photos come from the CMS', () => {
  it('renders the uploaded media, not the hardcoded design image', () => {
    const container = renderVacancies([
      { id: 'a', title: 'Vacature', image: mediaDoc('/api/media/file/team.jpg'), link: { label: 'Bekijk vacature' } },
    ])

    const photo = cardPhoto(container, 0)
    expect(photo, 'the card should render a photo').toBeTruthy()
    expect(photo!.getAttribute('src')).toContain('/api/media/file/team.jpg')
    expect(photo!.getAttribute('src')).not.toContain('/images/vacancies/')
  })

  it('falls back to the design images only when no upload is set', () => {
    const container = renderVacancies([
      { id: 'a', title: 'Met foto', image: mediaDoc('/api/media/file/team.jpg'), link: { label: 'Bekijk vacature' } },
      { id: 'b', title: 'Zonder foto', link: { label: 'Bekijk vacature' } },
    ])

    expect(cardPhoto(container, 0)!.getAttribute('src')).toContain('/api/media/file/team.jpg')
    expect(cardPhoto(container, 1)!.getAttribute('src')).toContain('/images/vacancies/')
  })
})
