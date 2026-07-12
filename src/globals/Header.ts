import type { GlobalConfig } from 'payload'

import { navLinkFields } from '../fields/link'
import { triggerStaticDeployAfterGlobalChange } from '../hooks/triggerStaticDeploy'

/**
 * Header — site navigation menu and the header call-to-action button.
 * Menu items reference actual Pages documents (or an external URL), so links
 * follow a page when its slug changes. Publicly readable so the static
 * frontend can fetch it over HTTP.
 */
export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  hooks: {
    // Globals have no draft stage — every change is immediately part of the
    // published site, so rebuild the static production site right away.
    afterChange: [triggerStaticDeployAfterGlobalChange],
  },
  fields: [
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    {
      name: 'navItems',
      label: 'Menu items',
      type: 'array',
      labels: { singular: 'Menu item', plural: 'Menu items' },
      admin: {
        description: 'The navigation links shown in the header, in order.',
      },
      fields: navLinkFields(),
    },
    {
      name: 'cta',
      label: 'Call to action',
      type: 'group',
      admin: {
        description:
          'The button on the right side of the header (teal pill). Leave the label empty to hide it.',
      },
      fields: navLinkFields({ requiredLabel: false }),
    },
  ],
}
