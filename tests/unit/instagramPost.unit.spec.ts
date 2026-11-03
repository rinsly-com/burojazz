/**
 * Instagram Graph payloads. A node that is not a renderable post becomes null
 * so the phone stays on the static mockup. The access token is not part of
 * this parser.
 */
import { describe, expect, it } from 'vitest'

import { mediaNodeToPost } from '@/lib/instagramPost'

describe('mediaNodeToPost', () => {
  it('maps a photo and uses the thumbnail for a video', () => {
    expect(
      mediaNodeToPost({
        id: '1',
        media_type: 'IMAGE',
        media_url: 'https://cdn.example/p.jpg',
        permalink: 'https://instagram.com/p/1',
        caption: 'Hallo',
      }),
    ).toMatchObject({ id: '1', imageUrl: 'https://cdn.example/p.jpg', mediaType: 'IMAGE' })

    expect(
      mediaNodeToPost({
        id: '2',
        media_type: 'VIDEO',
        media_url: 'https://cdn.example/v.mp4',
        thumbnail_url: 'https://cdn.example/t.jpg',
        permalink: 'https://instagram.com/p/2',
      })?.imageUrl,
    ).toBe('https://cdn.example/t.jpg')
  })

  it('returns null for a node that cannot be rendered', () => {
    expect(mediaNodeToPost({ id: '3', media_url: 'https://cdn.example/p.jpg' })).toBeNull()
    expect(mediaNodeToPost(null)).toBeNull()
    expect(mediaNodeToPost({ id: 4, permalink: 'https://instagram.com/p/4' })).toBeNull()
  })
})
