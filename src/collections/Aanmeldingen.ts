import type { CollectionConfig, PayloadRequest } from 'payload'
import { withTurnstile } from '@rinsly-com/site-core/lib/turnstile'

import { authenticated, adminOnly } from '../access/roles'
import { parseAanmeldingSubmit } from '../lib/aanmeldingSubmit'
import { sendAanmeldingNotification, sendAanmeldingConfirmation } from '../lib/email'
import { LogCode, logCode } from '../lib/logCode'
import {
  DSM_OPTIONS,
  PROBLEMATIEK_OPTIONS,
  SIBLING_TYPE_OPTIONS,
  VORM_VAN_HULP_OPTIONS,
} from '../lib/aanmeldingOptions'

/** Presentational collapsible wrapper — groups fields in the admin without
 *  nesting them in the DB (fields stay top-level columns). */
const section = (label: string, fields: CollectionConfig['fields']): CollectionConfig['fields'][number] => ({
  type: 'collapsible',
  label,
  admin: { initCollapsed: false },
  fields,
})

const options = (list: { value: string; label: string }[]) =>
  list.map(({ value, label }) => ({ value, label }))

/**
 * Aanmeldingen — submissions from the public "Direct aanmelden" intake wizard.
 *
 * The public static site cannot create rows directly (create access is locked
 * to signed-in staff); instead it POSTs to the unauthenticated custom endpoint
 * `/api/aanmeldingen/submit`, which drops honeypot spam and creates the row with
 * `overrideAccess`. An afterChange hook then emails the team (see src/lib/email).
 *
 * The data is sensitive (youth-care intake incl. health/DSM info), so it is
 * stored in the team's own D1 and only readable by authenticated staff.
 */
export const Aanmeldingen: CollectionConfig = {
  slug: 'aanmeldingen',
  labels: { singular: 'Aanmelding', plural: 'Aanmeldingen' },
  admin: {
    useAsTitle: 'clientNaam',
    defaultColumns: ['clientNaam', 'status', 'createdAt'],
    group: 'Formulieren',
  },
  access: {
    // Public creation goes through the /submit endpoint (overrideAccess); the
    // REST create route itself stays staff-only.
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'status',
      label: { en: 'Status', nl: 'Status' },
      type: 'select',
      defaultValue: 'nieuw',
      options: [
        { value: 'nieuw', label: 'Nieuw' },
        { value: 'in-behandeling', label: 'In behandeling' },
        { value: 'afgehandeld', label: 'Afgehandeld' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          en: 'Handling status of this submission. New submissions start as “Nieuw”; update it as the team picks it up.',
          nl: 'Behandelstatus van deze aanmelding. Nieuwe aanmeldingen beginnen op “Nieuw”; werk deze bij zodra het team ermee aan de slag gaat.',
        },
      },
    },

    section('1 · Persoonsgegevens', [
      {
        type: 'row',
        fields: [
          { name: 'clientNaam', type: 'text', label: 'Naam client', required: true },
          { name: 'clientGeboortedatum', type: 'text', label: 'Geboortedatum', required: true },
        ],
      },
      { name: 'clientAdres', type: 'text', label: 'Adres en woonplaats', required: true },
      {
        type: 'row',
        fields: [
          { name: 'verwijzerNaam', type: 'text', label: 'Naam verwijzer', required: true },
          { name: 'verwijzerOrganisatie', type: 'text', label: 'Organisatie', required: true },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'verwijzerEmail', type: 'email', label: 'Email verwijzer', required: true },
          { name: 'verwijzerTelefoon', type: 'text', label: 'Telefoonnr. verwijzer', required: true },
        ],
      },
    ]),

    section('2 · Ouders / verzorgers', [
      {
        type: 'row',
        fields: [
          { name: 'moederNaam', type: 'text', label: 'Naam moeder/verzorgster', required: true },
          { name: 'moederAdres', type: 'text', label: 'Adres en woonplaats', required: true },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'moederEmail', type: 'email', label: 'Email moeder/verzorgster', required: true },
          { name: 'moederTelefoon', type: 'text', label: 'Telefoonnr.', required: true },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'vaderNaam', type: 'text', label: 'Naam vader/verzorger', required: true },
          { name: 'vaderAdres', type: 'text', label: 'Adres en woonplaats (indien afwijkend)' },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'vaderEmail', type: 'email', label: 'Email (indien afwijkend)' },
          { name: 'vaderTelefoon', type: 'text', label: 'Telefoonnr. (indien afwijkend)' },
        ],
      },
      {
        name: 'siblings',
        type: 'array',
        label: 'Zusjes / broertjes',
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'leeftijd', type: 'text', label: 'Leeftijd' },
              {
                name: 'type',
                type: 'select',
                label: 'Relatie',
                options: options(SIBLING_TYPE_OPTIONS),
              },
            ],
          },
        ],
      },
    ]),

    section('3 · Reden van aanmelden', [
      {
        name: 'redenAanmelden',
        type: 'textarea',
        label: 'Reden van aanmelden',
        required: true,
      },
      {
        name: 'hulpverleningsgeschiedenis',
        type: 'textarea',
        label: 'Hulpverleningsgeschiedenis',
      },
    ]),

    section('4 · Hulpvraag', [
      {
        name: 'problematiek',
        type: 'select',
        hasMany: true,
        label: 'Problematiek',
        options: options(PROBLEMATIEK_OPTIONS),
      },
      { name: 'problematiekOverig', type: 'text', label: 'Overig, namelijk' },
      {
        name: 'dsmDiagnoseBekend',
        type: 'select',
        label: 'DSM diagnose bekend?',
        options: options(DSM_OPTIONS),
      },
      {
        name: 'vormVanHulp',
        type: 'select',
        hasMany: true,
        label: 'Welke vorm van hulp is gewenst?',
        options: options(VORM_VAN_HULP_OPTIONS),
      },
      {
        name: 'privacyAkkoord',
        type: 'checkbox',
        label: 'Akkoord met verwerking van gegevens (privacyverklaring)',
        required: true,
      },
    ]),
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        // Never let a mail failure roll back a stored submission — each send is
        // isolated so the confirmation still goes out if the team notice fails,
        // and vice versa.
        try {
          await sendAanmeldingNotification({
            payload: req.payload,
            // Collection hooks default `doc` to any unless the config is generic.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            doc,
          })
        } catch {
          logCode('error', LogCode.AANMELDING_NOTIFY_FAILED, undefined, req.payload.logger)
        }
        try {
          await sendAanmeldingConfirmation({
            payload: req.payload,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            doc,
          })
        } catch {
          logCode('error', LogCode.AANMELDING_CONFIRM_FAILED, undefined, req.payload.logger)
        }
      },
    ],
  },
  endpoints: [
    {
      path: '/submit',
      method: 'post',
      handler: withTurnstile(submitHandler, { action: 'aanmelding' }),
    },
  ],
  timestamps: true,
}

/**
 * Public submission endpoint. Runs unauthenticated (the static site posts here).
 * The body is checked against the submit schema (unknown keys such as `status`
 * are dropped, the honeypot short-circuits) and the row is created with
 * overrideAccess. Payload's own field validation still runs and returns 400 on
 * bad input.
 */
async function submitHandler(req: PayloadRequest): Promise<Response> {
  let body: unknown = {}
  try {
    body = req.json ? await req.json() : {}
  } catch {
    logCode('warn', LogCode.AANMELDING_BODY_INVALID, undefined, req.payload.logger)
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = parseAanmeldingSubmit(body)
  // Honeypot: real users never fill the hidden "website" field. Pretend success
  // so bots get no signal.
  if (parsed.kind === 'honeypot') {
    return Response.json({ ok: true }, { status: 200 })
  }
  if (parsed.kind === 'invalid') {
    logCode('warn', LogCode.AANMELDING_BODY_INVALID, undefined, req.payload.logger)
    return Response.json(
      { error: 'Er ging iets mis bij het versturen. Controleer de gegevens en probeer opnieuw.' },
      { status: 400 },
    )
  }

  try {
    const created = await req.payload.create({
      collection: 'aanmeldingen',
      data: parsed.data as never,
      overrideAccess: true,
    })
    return Response.json({ ok: true, id: created.id }, { status: 201 })
  } catch {
    logCode('warn', LogCode.AANMELDING_SUBMIT_REJECTED, undefined, req.payload.logger)
    return Response.json(
      { error: 'Er ging iets mis bij het versturen. Controleer de gegevens en probeer opnieuw.' },
      { status: 400 },
    )
  }
}

export default Aanmeldingen
