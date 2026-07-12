import type { Block } from 'payload'

import { anchorField } from '../fields/anchor'
import { basicEditor } from '../fields/basicEditor'
import { linkGroup } from '../fields/link'
import { sectionHeader } from '../fields/sectionHeader'

export const aboutBlock: Block = {
  slug: 'about',
  interfaceName: 'AboutBlock',
  labels: {
    singular: { en: 'About', nl: 'Over ons' },
    plural: { en: 'About sections', nl: 'Over ons-secties' },
  },
  fields: [
    sectionHeader(['icon', 'eyebrow', 'title']),
    {
      name: 'image',
      label: { en: 'Photo', nl: 'Foto' },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          en: 'Photo shown next to the text.',
          nl: 'Foto die naast de tekst wordt getoond.',
        },
      },
    },
    { name: 'body', label: { en: 'Body', nl: 'Tekst' }, type: 'richText', editor: basicEditor },
    {
      name: 'email',
      label: { en: 'Email', nl: 'E-mail' },
      type: 'text',
      admin: {
        description: {
          en: 'Email address shown as a contact link in this section.',
          nl: 'E-mailadres dat als contactlink in deze sectie wordt getoond.',
        },
      },
    },
    linkGroup(),
    anchorField(),
  ],
}
