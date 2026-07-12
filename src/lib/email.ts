import type { EmailAdapter, Payload, SendEmailOptions } from 'payload'

import {
  DSM_OPTIONS,
  PROBLEMATIEK_OPTIONS,
  SIBLING_TYPE_OPTIONS,
  VORM_VAN_HULP_OPTIONS,
  labelFor,
} from './aanmeldingOptions'

/**
 * Email for the Buro J.A.Z.Z. site, delivered through Cloudflare Email Routing.
 *
 * The Worker gets a `send_email` binding (see wrangler.jsonc) that can send FROM
 * a burojazz.com address TO the verified team destination address. We wrap it in a
 * Payload email adapter so the rest of the app just calls `payload.sendEmail(...)`
 * and swapping providers later is a one-file change.
 *
 * Requirements (one-time, in Cloudflare):
 *  1. Enable Email Routing on burojazz.com (⚠ this sets Cloudflare MX records).
 *  2. Verify the destination address (EMAIL_TO) as an Email Routing destination.
 *  3. Keep the `send_email` binding name in sync: AANMELDING_EMAIL.
 *
 * In local dev / the Payload CLI the binding does not exist, so mail is logged
 * instead of sent — production (accp) sends for real.
 */

export const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || 'aanmelden@burojazz.com'
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Buro J.A.Z.Z. website'
export const EMAIL_TO = process.env.AANMELDING_NOTIFY_TO || 'aanmeldingen@burojazz.com'

/** The `send_email` binding shape (a subset of Cloudflare's SendEmail). */
type SendEmailBinding = { send: (message: unknown) => Promise<void> }

/** Resolve the Cloudflare `send_email` binding at runtime, or null outside the Worker. */
async function getEmailBinding(): Promise<SendEmailBinding | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const ctx = await getCloudflareContext({ async: true })
    const binding = (ctx.env as unknown as Record<string, unknown>).AANMELDING_EMAIL
    return binding && typeof (binding as SendEmailBinding).send === 'function'
      ? (binding as SendEmailBinding)
      : null
  } catch {
    return null
  }
}

/** Build a raw MIME message and hand it to the Cloudflare Email Routing binding. */
async function sendViaCloudflare(
  binding: SendEmailBinding,
  message: SendEmailOptions,
): Promise<void> {
  // `cloudflare:email` is a Workers built-in; keep it a runtime import so neither
  // the Node dev/CLI build nor the OpenNext esbuild bundling pass tries to resolve
  // it. The specifier is assembled at runtime (underscore stripped) so no bundler
  // can constant-fold it to a literal and attempt resolution — same guard style as
  // the sharp/wrangler imports in payload.config.ts.
  const { EmailMessage } = (await import(
    /* webpackIgnore: true */ `${'cloudflare:_email'.replaceAll('_', '')}`
  )) as { EmailMessage: new (from: string, to: string, raw: string) => unknown }
  const { createMimeMessage } = await import('mimetext')

  const to = String(Array.isArray(message.to) ? message.to[0] : (message.to ?? EMAIL_TO))
  const from = String(message.from ?? `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`)
  const fromAddr = from.match(/<([^>]+)>/)?.[1] ?? from

  const mime = createMimeMessage()
  mime.setSender({ name: EMAIL_FROM_NAME, addr: fromAddr })
  mime.setRecipient(to)
  mime.setSubject(message.subject ?? '')
  if (message.replyTo) mime.setHeader('Reply-To', String(message.replyTo))
  if (message.text) mime.addMessage({ contentType: 'text/plain', data: String(message.text) })
  if (message.html) mime.addMessage({ contentType: 'text/html', data: String(message.html) })
  if (!message.text && !message.html) {
    mime.addMessage({ contentType: 'text/plain', data: '' })
  }

  await binding.send(new EmailMessage(fromAddr, to, mime.asRaw()))
}

/** Payload email adapter backed by Cloudflare Email Routing (dev → log). */
export const cloudflareEmailAdapter: EmailAdapter = ({ payload }) => ({
  name: 'cloudflare-email-routing',
  defaultFromAddress: EMAIL_FROM,
  defaultFromName: EMAIL_FROM_NAME,
  sendEmail: async (message: SendEmailOptions) => {
    const binding = await getEmailBinding()
    if (!binding) {
      payload.logger.info({
        msg: '[email] no send_email binding (dev/CLI) — logging instead of sending',
        to: message.to,
        subject: message.subject,
      })
      return
    }
    await sendViaCloudflare(binding, message)
  },
})

// ---------------------------------------------------------------------------
// Aanmelding notification
// ---------------------------------------------------------------------------

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const nl2 = (v: unknown): string => esc(v).replace(/\n/g, '<br>')

type AanmeldingDoc = Record<string, unknown> & { id: string | number }

/** Turn a stored aanmelding into { subject, text, html } for the team email. */
export function buildAanmeldingEmail(doc: AanmeldingDoc): {
  subject: string
  text: string
  html: string
} {
  const g = (k: string) => (doc[k] == null ? '' : String(doc[k]))
  const arr = (k: string) => (Array.isArray(doc[k]) ? (doc[k] as string[]) : [])

  const problematiek = arr('problematiek').map((v) => labelFor(PROBLEMATIEK_OPTIONS, v))
  if (g('problematiekOverig')) problematiek.push(`Overig: ${g('problematiekOverig')}`)
  const vormVanHulp = arr('vormVanHulp').map((v) => labelFor(VORM_VAN_HULP_OPTIONS, v))
  const dsm = labelFor(DSM_OPTIONS, g('dsmDiagnoseBekend'))

  const siblings = (Array.isArray(doc.siblings) ? doc.siblings : []) as Record<string, unknown>[]
  const siblingLines = siblings
    .map((s) => `${s.leeftijd ?? ''} — ${labelFor(SIBLING_TYPE_OPTIONS, String(s.type ?? ''))}`.trim())
    .filter((l) => l !== '—')

  const subject = `Nieuwe aanmelding — ${g('clientNaam') || 'onbekend'}`

  const rows: [string, string][] = [
    ['— Persoonsgegevens', ''],
    ['Naam client', g('clientNaam')],
    ['Geboortedatum', g('clientGeboortedatum')],
    ['Adres en woonplaats', g('clientAdres')],
    ['— Verwijzer', ''],
    ['Naam verwijzer', g('verwijzerNaam')],
    ['Organisatie', g('verwijzerOrganisatie')],
    ['Email', g('verwijzerEmail')],
    ['Telefoon', g('verwijzerTelefoon')],
    ['— Ouders / verzorgers', ''],
    ['Naam moeder/verzorgster', g('moederNaam')],
    ['Adres', g('moederAdres')],
    ['Email', g('moederEmail')],
    ['Telefoon', g('moederTelefoon')],
    ['Naam vader/verzorger', g('vaderNaam')],
    ['Adres (indien afwijkend)', g('vaderAdres')],
    ['Email (indien afwijkend)', g('vaderEmail')],
    ['Telefoon (indien afwijkend)', g('vaderTelefoon')],
    ['Zusjes/broertjes', siblingLines.join('; ')],
    ['— Reden van aanmelden', ''],
    ['Reden', g('redenAanmelden')],
    ['Hulpverleningsgeschiedenis', g('hulpverleningsgeschiedenis')],
    ['— Hulpvraag', ''],
    ['Problematiek', problematiek.join(', ')],
    ['DSM diagnose bekend?', dsm],
    ['Gewenste vorm van hulp', vormVanHulp.join(', ')],
  ]

  const text = rows
    .map(([k, v]) => (v === '' && k.startsWith('—') ? `\n${k.slice(2)}` : `${k}: ${v}`))
    .join('\n')

  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#291f09;line-height:1.5">
    <h2 style="color:#51c2cc">Nieuwe aanmelding via de website</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
      ${rows
        .map(([k, v]) =>
          v === '' && k.startsWith('—')
            ? `<tr><td colspan="2" style="padding-top:14px;font-weight:700;color:#51c2cc">${esc(
                k.slice(2),
              )}</td></tr>`
            : `<tr><td style="vertical-align:top;color:#6b6455;white-space:nowrap">${esc(
                k,
              )}</td><td style="vertical-align:top;font-weight:600">${nl2(v)}</td></tr>`,
        )
        .join('')}
    </table>
    <p style="font-size:12px;color:#8a8577;margin-top:20px">Aanmelding #${esc(
      doc.id,
    )} · verstuurd vanaf de Buro J.A.Z.Z. website.</p>
  </body></html>`

  return { subject, text, html }
}

/** Email the team about a new aanmelding. Throws are handled by the caller. */
export async function sendAanmeldingNotification({
  payload,
  doc,
}: {
  payload: Payload
  doc: AanmeldingDoc
}): Promise<void> {
  const { subject, text, html } = buildAanmeldingEmail(doc)
  const replyTo = doc.verwijzerEmail ? String(doc.verwijzerEmail) : undefined
  await payload.sendEmail({ to: EMAIL_TO, subject, text, html, ...(replyTo ? { replyTo } : {}) })
}
