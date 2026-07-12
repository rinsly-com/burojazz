import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/roles'
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
    // Any signed-in staff can edit site chrome (matches the collections). Public
    // read is required so the static frontend can fetch it over HTTP.
    update: authenticated,
  },
  hooks: {
    // Globals have no draft stage — every change is immediately part of the
    // published site, so rebuild the static production site right away.
    afterChange: [triggerStaticDeployAfterGlobalChange],
  },
  fields: [
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          en: 'Logo shown at the top-left of the header.',
          nl: 'Logo linksboven in de header.',
        },
      },
    },
    {
      name: 'navItems',
      label: { en: 'Menu items', nl: 'Menu-items' },
      type: 'array',
      labels: {
        singular: { en: 'Menu item', nl: 'Menu-item' },
        plural: { en: 'Menu items', nl: 'Menu-items' },
      },
      admin: {
        description: {
          en: 'The navigation links shown in the header, in order.',
          nl: 'De navigatielinks in de header, in volgorde.',
        },
      },
      fields: navLinkFields(),
    },
    {
      name: 'cta',
      label: { en: 'Call to action', nl: 'Actieknop' },
      type: 'group',
      admin: {
        description: {
          en: 'The button on the right side of the header (teal pill). Leave the label empty to hide it.',
          nl: 'De knop rechts in de header (turquoise knop). Laat het label leeg om hem te verbergen.',
        },
      },
      fields: navLinkFields({ requiredLabel: false }),
    },
  ],
}
