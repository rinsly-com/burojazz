import { z } from 'zod'

/** Renderable post. Shared by the worker and the phone overlay. */
export const instagramPostSchema = z.object({
  id: z.string().min(1),
  permalink: z.string().min(1),
  caption: z.string().nullable(),
  imageUrl: z.string().min(1),
  mediaType: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']),
  timestamp: z.string().nullable(),
})

export type InstagramPost = z.infer<typeof instagramPostSchema>

export const instagramCacheSchema = z.object({
  fetchedAt: z.number(),
  post: instagramPostSchema.nullable(),
})

const mediaNodeSchema = z.looseObject({
  id: z.string().min(1),
  caption: z.string().nullish(),
  media_type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']).optional(),
  media_url: z.string().min(1).optional(),
  thumbnail_url: z.string().min(1).optional(),
  permalink: z.string().min(1).optional(),
  timestamp: z.string().nullish(),
})

export const instagramMediaSchema = z.looseObject({
  data: z.array(z.unknown()).optional(),
})

export const instagramRefreshSchema = z.object({
  access_token: z.string().min(1),
})

/** Map one Graph API media node. Null when it cannot be rendered. */
export function mediaNodeToPost(node: unknown): InstagramPost | null {
  const parsed = mediaNodeSchema.safeParse(node)
  if (!parsed.success) return null
  const mediaType = parsed.data.media_type ?? 'IMAGE'
  const imageUrl = mediaType === 'VIDEO' ? parsed.data.thumbnail_url : parsed.data.media_url
  if (!imageUrl || !parsed.data.permalink) return null
  return {
    id: parsed.data.id,
    permalink: parsed.data.permalink,
    caption: parsed.data.caption ?? null,
    imageUrl,
    mediaType,
    timestamp: parsed.data.timestamp ?? null,
  }
}

/** The phone overlay only needs the fields it renders. */
export const instagramClientPostSchema = z.object({
  permalink: z.string().min(1),
  imageUrl: z.string().min(1),
  caption: z.string().nullable().optional(),
})
