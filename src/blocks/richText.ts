import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { textEditor } from '../fields/textEditor'

export const richTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: {
    singular: { en: 'Rich text', nl: 'Opgemaakte tekst' },
    plural: { en: 'Rich text sections', nl: 'Secties opgemaakte tekst' },
  },
  fields: [
    // Explicitly the shared textEditor, not the config default: the default is
    // Payload's full feature set, which also offers Upload/Relationship/Blocks
    // nodes that nothing on this site renders or styles.
    { name: 'content', label: { en: 'Content', nl: 'Inhoud' }, type: 'richText', editor: textEditor },
    {
      name: 'width',
      label: { en: 'Width', nl: 'Breedte' },
      type: 'select',
      defaultValue: 'narrow',
      options: [
        { label: { en: 'Narrow (reading width)', nl: 'Smal (leesbreedte)' }, value: 'narrow' },
        { label: { en: 'Wide', nl: 'Breed' }, value: 'wide' },
      ],
    },
    anchorField(),
  ],
}
