import type { TextField } from 'payload'

type IconFieldOptions = {
  /** Field name (defaults to `icon`). */
  name?: string
  label?: string
  description?: string
}

/**
 * A reusable "pick a Tabler icon" field. Stores the icon's component name
 * (e.g. `IconHeart`) as text; the admin UI is the searchable visual
 * `IconSelector`, and the frontend renders it with `<Icon name={...} />`.
 *
 * Optional by design: leave it empty to fall back to the block's default icon.
 */
export const iconField = ({ name = 'icon', label = 'Icon', description }: IconFieldOptions = {}): TextField => ({
  name,
  type: 'text',
  label,
  admin: {
    description:
      description ?? 'Zoek en kies een Tabler-icoon. Laat leeg voor het standaardicoon.',
    components: {
      Field: '/components/IconSelector#IconSelector',
    },
  },
})
