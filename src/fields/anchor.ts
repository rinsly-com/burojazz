import type { Field } from 'payload'

/**
 * Optional per-section anchor id. Rendered as the `id` on the section's
 * wrapper (see RenderBlocks) so a header menu item of type "Section on page"
 * can scroll to it — this is what enables onepager navigation.
 */
export const anchorField = (): Field => ({
  name: 'anchor',
  label: 'Anchor ID',
  type: 'text',
  admin: {
    description:
      'Optional. Gives this section an id so a menu item can scroll to it (e.g. “over-ons”). Use lowercase letters, numbers and dashes.',
  },
})
