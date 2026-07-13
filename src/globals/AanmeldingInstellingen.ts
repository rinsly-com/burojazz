import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/roles'

/**
 * Aanmelding — instellingen. Editable settings for the "Direct aanmelden" flow.
 *
 * Currently holds the personal message that staff can include in the
 * confirmation email sent back to the submitter (verwijzer). Read server-side
 * only (by the confirmation email sender in src/lib/email.ts) — it is NOT
 * consumed by the static frontend, so it does not need public read access or a
 * static-deploy trigger.
 */
export const AanmeldingInstellingen: GlobalConfig = {
  slug: 'aanmelding-instellingen',
  label: { en: 'Aanmelding settings', nl: 'Aanmelding – instellingen' },
  admin: { group: 'Formulieren' },
  access: {
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'bevestigingBericht',
      label: { en: 'Confirmation message', nl: 'Bericht in bevestigingsmail' },
      type: 'textarea',
      admin: {
        description: {
          en: 'Optional personal message included in the confirmation email sent to the person who submitted the form. Leave empty to send only the standard acknowledgement. Do not put sensitive information here — it is emailed to the submitter.',
          nl: 'Optioneel persoonlijk bericht dat wordt meegestuurd in de bevestigingsmail aan de aanmelder. Laat leeg om alleen de standaardbevestiging te sturen. Zet hier geen gevoelige informatie in — het wordt naar de aanmelder gemaild.',
        },
      },
    },
  ],
}

export default AanmeldingInstellingen
