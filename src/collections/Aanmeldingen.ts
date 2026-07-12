import type { CollectionConfig, PayloadRequest } from 'payload'

import { authenticated, adminOnly } from '../access/roles'
import { sendAanmeldingNotification } from '../lib/email'
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
        if (operation === 'create') {
          // Never let a mail failure roll back a stored submission.
          try {
            await sendAanmeldingNotification({ payload: req.payload, doc })
          } catch (err) {
            req.payload.logger.error({
              msg: 'Aanmelding notification email failed',
              err: err instanceof Error ? err.message : String(err),
            })
          }
        }
      },
    ],
  },
  endpoints: [
    {
      path: '/submit',
      method: 'post',
      handler: submitHandler,
    },
  ],
  timestamps: true,
}

/** Fields the public form is allowed to set (whitelist — never `status`). */
const SUBMITTABLE_FIELDS = [
  'clientNaam',
  'clientGeboortedatum',
  'clientAdres',
  'verwijzerNaam',
  'verwijzerOrganisatie',
  'verwijzerEmail',
  'verwijzerTelefoon',
  'moederNaam',
  'moederAdres',
  'moederEmail',
  'moederTelefoon',
  'vaderNaam',
  'vaderAdres',
  'vaderEmail',
  'vaderTelefoon',
  'redenAanmelden',
  'hulpverleningsgeschiedenis',
  'problematiek',
  'problematiekOverig',
  'dsmDiagnoseBekend',
  'vormVanHulp',
  'privacyAkkoord',
] as const

/**
 * Public submission endpoint. Runs unauthenticated (the static site posts here),
 * so it whitelists incoming fields, honours a honeypot, and creates the row with
 * overrideAccess. Payload's own field validation still runs and returns 400 on
 * bad input.
 */
async function submitHandler(req: PayloadRequest): Promise<Response> {
  let body: Record<string, unknown> = {}
  try {
    body = (req.json ? await req.json() : {}) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  // Honeypot: real users never fill the hidden "website" field. Pretend success
  // so bots get no signal.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return Response.json({ ok: true }, { status: 200 })
  }

  const data: Record<string, unknown> = {}
  for (const key of SUBMITTABLE_FIELDS) {
    if (key in body) data[key] = body[key]
  }
  // Siblings is a nested array; validate its shape defensively.
  if (Array.isArray(body.siblings)) {
    data.siblings = (body.siblings as unknown[])
      .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
      .map((s) => ({ leeftijd: s.leeftijd ?? '', type: s.type ?? undefined }))
  }

  try {
    const created = await req.payload.create({
      collection: 'aanmeldingen',
      data: data as never,
      overrideAccess: true,
    })
    return Response.json({ ok: true, id: created.id }, { status: 201 })
  } catch (err) {
    req.payload.logger.warn({
      msg: 'Aanmelding submit rejected',
      err: err instanceof Error ? err.message : String(err),
    })
    return Response.json(
      { error: 'Er ging iets mis bij het versturen. Controleer de gegevens en probeer opnieuw.' },
      { status: 400 },
    )
  }
}

export default Aanmeldingen
