'use client'

import { useRef, useState } from 'react'

import {
  DSM_OPTIONS,
  PROBLEMATIEK_OPTIONS,
  SIBLING_TYPE_OPTIONS,
  VORM_VAN_HULP_OPTIONS,
} from '@/lib/aanmeldingOptions'
import {
  BackButton,
  CheckboxField,
  Field,
  PlusIcon,
  PrimaryButton,
  StepIndicator,
  TextAreaField,
  TextField,
} from './fields'
import {
  EMPTY_AANMELDING,
  STEPS,
  toSubmitBody,
  validateStep,
  type AanmeldenData,
  type Errors,
} from './formData'

/** Base URL of the Payload API. Empty in dev (same-origin); the static build
 *  bakes in the accp/production worker URL via NEXT_PUBLIC_PAYLOAD_API_URL. */
const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_API_URL ?? ''

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

/** Teal panel wrapper matching the design. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-brand p-6 md:p-8">{children}</div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-bold tracking-tight text-black md:text-2xl">{children}</h3>
}

const grid = 'grid grid-cols-1 gap-4 md:grid-cols-2'

export function AanmeldenForm({
  privacyHref = '/privacyverklaring',
  onDone,
}: {
  privacyHref?: string
  /** Called after a successful submission (e.g. to let the dialog auto-close). */
  onDone?: () => void
}) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<AanmeldenData>(EMPTY_AANMELDING)
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<SubmitState>('idle')
  const topRef = useRef<HTMLDivElement>(null)

  const set = <K extends keyof AanmeldenData>(key: K, value: AanmeldenData[K]) => {
    setData((d) => ({ ...d, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const toggleInArray = (key: 'problematiek' | 'vormVanHulp', value: string) => {
    setData((d) => {
      const list = d[key]
      return {
        ...d,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      }
    })
  }

  const scrollTop = () => topRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })

  const next = () => {
    const stepErrors = validateStep(step, data)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    scrollTop()
  }

  const back = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
    scrollTop()
  }

  const submit = async () => {
    const stepErrors = validateStep(step, data)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setState('submitting')
    try {
      const res = await fetch(`${API_BASE}/api/aanmeldingen/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Honeypot field `website` stays empty for real users (see endpoint).
        body: JSON.stringify({ ...toSubmitBody(data), website: '' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setState('success')
      scrollTop()
      onDone?.()
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div ref={topRef} className="flex flex-col items-center gap-4 rounded-3xl bg-brand/5 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5L10 17.5L19 6.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="text-2xl font-bold text-black">Bedankt voor uw aanmelding</h3>
        <p className="max-w-md text-sm font-medium text-ink">
          We hebben uw aanmelding ontvangen en nemen zo snel mogelijk contact met u op.
        </p>
      </div>
    )
  }

  const isLast = step === STEPS.length - 1

  return (
    <div ref={topRef} className="flex flex-col gap-8">
      <StepIndicator current={step} />

      {step === 0 && (
        <Panel>
          <SectionHeading>Persoonsgegevens</SectionHeading>
          <div className={grid}>
            <TextField
              label="Naam client"
              required
              value={data.clientNaam}
              error={errors.clientNaam}
              onChange={(v) => set('clientNaam', v)}
            />
            <TextField
              label="Geboortedatum"
              type="date"
              required
              value={data.clientGeboortedatum}
              error={errors.clientGeboortedatum}
              onChange={(v) => set('clientGeboortedatum', v)}
            />
          </div>
          <TextField
            label="Adres en woonplaats"
            required
            value={data.clientAdres}
            error={errors.clientAdres}
            onChange={(v) => set('clientAdres', v)}
          />

          <SectionHeading>Gegevens verwijzer</SectionHeading>
          <div className={grid}>
            <TextField
              label="Naam verwijzer"
              required
              value={data.verwijzerNaam}
              error={errors.verwijzerNaam}
              onChange={(v) => set('verwijzerNaam', v)}
            />
            <TextField
              label="Organisatie"
              required
              value={data.verwijzerOrganisatie}
              error={errors.verwijzerOrganisatie}
              onChange={(v) => set('verwijzerOrganisatie', v)}
            />
            <TextField
              label="Email adres"
              type="email"
              required
              value={data.verwijzerEmail}
              error={errors.verwijzerEmail}
              onChange={(v) => set('verwijzerEmail', v)}
            />
            <TextField
              label="Telefoonnr."
              type="tel"
              required
              value={data.verwijzerTelefoon}
              error={errors.verwijzerTelefoon}
              onChange={(v) => set('verwijzerTelefoon', v)}
            />
          </div>
        </Panel>
      )}

      {step === 1 && (
        <Panel>
          <SectionHeading>Ouders / verzorgers</SectionHeading>
          <div className={grid}>
            <TextField
              label="Naam moeder/verzorgster"
              required
              value={data.moederNaam}
              error={errors.moederNaam}
              onChange={(v) => set('moederNaam', v)}
            />
            <TextField
              label="Adres en woonplaats moeder/verzorgster"
              required
              value={data.moederAdres}
              error={errors.moederAdres}
              onChange={(v) => set('moederAdres', v)}
            />
            <TextField
              label="Email adres"
              type="email"
              required
              value={data.moederEmail}
              error={errors.moederEmail}
              onChange={(v) => set('moederEmail', v)}
            />
            <TextField
              label="Telefoonnr."
              type="tel"
              required
              value={data.moederTelefoon}
              error={errors.moederTelefoon}
              onChange={(v) => set('moederTelefoon', v)}
            />
          </div>

          <div className="h-px bg-white/40" />

          <div className={grid}>
            <TextField
              label="Naam vader/verzorger"
              required
              value={data.vaderNaam}
              error={errors.vaderNaam}
              onChange={(v) => set('vaderNaam', v)}
            />
            <TextField
              label="Adres en woonplaats"
              placeholder="(indien afwijkend van moeder/verzorgster)"
              value={data.vaderAdres}
              onChange={(v) => set('vaderAdres', v)}
            />
            <TextField
              label="Email adres"
              type="email"
              placeholder="(indien afwijkend van moeder/verzorgster)"
              value={data.vaderEmail}
              error={errors.vaderEmail}
              onChange={(v) => set('vaderEmail', v)}
            />
            <TextField
              label="Telefoonnr."
              type="tel"
              placeholder="(indien afwijkend van moeder/verzorgster)"
              value={data.vaderTelefoon}
              onChange={(v) => set('vaderTelefoon', v)}
            />
          </div>

          <div className="h-px bg-white/40" />

          <SectionHeading>Zusjes/broertjes</SectionHeading>
          <div className="flex flex-col gap-4">
            {data.siblings.map((sib, i) => (
              <div key={i} className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                <input
                  type="text"
                  value={sib.leeftijd}
                  placeholder="Leeftijd"
                  onChange={(e) =>
                    set(
                      'siblings',
                      data.siblings.map((s, j) => (j === i ? { ...s, leeftijd: e.target.value } : s)),
                    )
                  }
                  className="w-full rounded-xl border border-transparent bg-white px-4 py-3.5 text-sm font-medium text-ink shadow-sm outline-none placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/30 md:max-w-xs"
                />
                <div className="flex flex-wrap gap-6">
                  {SIBLING_TYPE_OPTIONS.map((opt) => (
                    <CheckboxField
                      key={opt.value}
                      label={opt.label}
                      checked={sib.type === opt.value}
                      onChange={() =>
                        set(
                          'siblings',
                          data.siblings.map((s, j) =>
                            j === i
                              ? { ...s, type: s.type === opt.value ? '' : (opt.value as SiblingType) }
                              : s,
                          ),
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set('siblings', [...data.siblings, { leeftijd: '', type: '' }])}
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-black transition-colors hover:text-white"
            >
              <PlusIcon />
              verdere broers en zussen
            </button>
          </div>
        </Panel>
      )}

      {step === 2 && (
        <Panel>
          <SectionHeading>Reden van aanmelden</SectionHeading>
          <TextAreaField
            label="Beschrijf kort en bondig de reden van aanmelden"
            required
            rows={5}
            value={data.redenAanmelden}
            error={errors.redenAanmelden}
            onChange={(v) => set('redenAanmelden', v)}
          />
          <div className="h-px bg-white/40" />
          <SectionHeading>Hulpverleningsgeschiedenis</SectionHeading>
          <TextAreaField
            label="Beschrijf de organisatie en (indien bekend) de behandeling/begeleiding"
            rows={5}
            placeholder="(indien aanwezig)"
            value={data.hulpverleningsgeschiedenis}
            onChange={(v) => set('hulpverleningsgeschiedenis', v)}
          />
        </Panel>
      )}

      {step === 3 && (
        <Panel>
          <SectionHeading>Hulpvraag</SectionHeading>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PROBLEMATIEK_OPTIONS.map((opt) => (
              <CheckboxField
                key={opt.value}
                label={opt.label}
                checked={data.problematiek.includes(opt.value)}
                onChange={() => toggleInArray('problematiek', opt.value)}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <CheckboxField
              label={<span className="sr-only">Overig</span>}
              checked={data.problematiekOverig.trim() !== ''}
              onChange={(c) => !c && set('problematiekOverig', '')}
            />
            <input
              type="text"
              value={data.problematiekOverig}
              placeholder="Overig, namelijk:"
              onChange={(e) => set('problematiekOverig', e.target.value)}
              className="w-full rounded-xl border border-transparent bg-white px-4 py-3.5 text-sm font-medium text-ink shadow-sm outline-none placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <Field label="DSM diagnose bekend?">
            <div className="flex gap-6">
              {DSM_OPTIONS.map((opt) => (
                <CheckboxField
                  key={opt.value}
                  label={opt.label}
                  checked={data.dsmDiagnoseBekend === opt.value}
                  onChange={() =>
                    set('dsmDiagnoseBekend', data.dsmDiagnoseBekend === opt.value ? '' : (opt.value as DsmValue))
                  }
                />
              ))}
            </div>
          </Field>

          <div className="h-px bg-white/40" />

          <SectionHeading>Welke vorm van hulp is gewenst?</SectionHeading>
          <p className="-mt-3 text-sm font-medium text-black/70">
            (indien bekend, dit kan ook besproken worden in een intakegesprek)
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {VORM_VAN_HULP_OPTIONS.map((opt) => (
              <CheckboxField
                key={opt.value}
                label={opt.label}
                checked={data.vormVanHulp.includes(opt.value)}
                onChange={() => toggleInArray('vormVanHulp', opt.value)}
              />
            ))}
          </div>

          <div className="h-px bg-white/40" />

          <div className="flex flex-col gap-1.5">
            <CheckboxField
              checked={data.privacyAkkoord}
              onChange={(c) => set('privacyAkkoord', c)}
              label={
                <span>
                  Ik ga akkoord met de verwerking van mijn gegevens in overeenstemming met{' '}
                  <a href={privacyHref} target="_blank" rel="noopener noreferrer" className="underline">
                    de privacyverklaring
                  </a>{' '}
                  van Buro J.A.Z.Z. <span className="text-[#f04438]">*</span>
                </span>
              }
            />
            {errors.privacyAkkoord && (
              <span className="text-xs font-medium text-[#f04438]">{errors.privacyAkkoord}</span>
            )}
          </div>
        </Panel>
      )}

      {state === 'error' && (
        <p className="rounded-xl bg-[#fdecec] px-4 py-3 text-sm font-medium text-[#b42318]">
          Er ging iets mis bij het versturen. Controleer de gegevens en probeer het opnieuw.
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        {step > 0 ? <BackButton onClick={back} /> : <span />}
        {isLast ? (
          <PrimaryButton type="button" onClick={submit} disabled={state === 'submitting'}>
            {state === 'submitting' ? 'Versturen…' : 'Verstuur bericht'}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={next}>Verder</PrimaryButton>
        )}
      </div>
    </div>
  )
}

type SiblingType = '' | 'broer' | 'zus' | 'nvt'
type DsmValue = '' | 'ja' | 'nee'

export default AanmeldenForm
