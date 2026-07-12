'use client'

import { useId, type ReactNode } from 'react'

import { STEPS } from './formData'

/* -------------------------------------------------------------------------- */
/* Inline icons (client-safe — no Tabler barrel in the client bundle)         */
/* -------------------------------------------------------------------------- */

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className={className}>
      <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
      <path
        d="M3.75 0.5L0.75 3.5L3.75 6.5M0.75 3.5H8.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
      <path
        d="M5.25 0.5L8.25 3.5L5.25 6.5M8.25 3.5H0.75"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Step indicator                                                             */
/* -------------------------------------------------------------------------- */

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-start justify-between gap-1">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.key} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              {/* connector before (hidden on first) */}
              <span
                className={`h-px flex-1 ${i === 0 ? 'opacity-0' : done || active ? 'bg-brand' : 'bg-[#eae9e6]'}`}
              />
              <span
                aria-hidden="true"
                className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold transition-colors md:size-14 ${
                  active
                    ? 'border-brand bg-brand text-white'
                    : done
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-[#eae9e6] bg-white text-ink/50'
                }`}
              >
                {done ? <CheckIcon className="size-5" /> : i + 1}
              </span>
              {/* connector after (hidden on last) */}
              <span
                className={`h-px flex-1 ${
                  i === STEPS.length - 1 ? 'opacity-0' : done ? 'bg-brand' : 'bg-[#eae9e6]'
                }`}
              />
            </div>
            <span
              className={`text-center text-xs font-medium leading-tight md:text-sm ${
                active ? 'text-brand' : 'text-ink'
              }`}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/* -------------------------------------------------------------------------- */
/* Field primitives                                                           */
/* -------------------------------------------------------------------------- */

const inputBase =
  'w-full rounded-xl border border-transparent bg-white px-4 py-3.5 text-sm font-medium text-ink shadow-sm outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/30'

export function Field({
  label,
  required,
  error,
  children,
  htmlFor,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={htmlFor}>
      <span className="text-sm font-medium text-black">
        {label}
        {required && <span className="text-[#f04438]"> *</span>}
      </span>
      {children}
      {error && <span className="text-xs font-medium text-[#f04438]">{error}</span>}
    </label>
  )
}

type InputProps = {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  error?: string
  type?: 'text' | 'email' | 'tel' | 'date'
  placeholder?: string
  autoComplete?: string
}

export function TextField({
  label,
  value,
  onChange,
  required,
  error,
  type = 'text',
  placeholder,
  autoComplete,
}: InputProps) {
  const id = useId()
  return (
    <Field label={label} required={required} error={error} htmlFor={id}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} ${error ? 'border-[#f04438]' : ''}`}
      />
    </Field>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  required,
  error,
  placeholder,
  rows = 4,
}: Omit<InputProps, 'type' | 'autoComplete'> & { rows?: number }) {
  const id = useId()
  return (
    <Field label={label} required={required} error={error} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} resize-y ${error ? 'border-[#f04438]' : ''}`}
      />
    </Field>
  )
}

/** A single checkbox with a label. Works for multi-select groups and booleans. */
export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-ink">
      <span
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          checked ? 'border-brand bg-brand text-white' : 'border-white bg-white'
        }`}
      >
        {checked && <CheckIcon className="size-4" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="leading-snug">{label}</span>
    </label>
  )
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2.5 rounded-pill bg-brand px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3fadb7] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
      <ArrowRightIcon />
    </button>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2.5 rounded-pill border border-[#eae9e6] bg-white px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand"
    >
      <ArrowLeftIcon />
      Terug
    </button>
  )
}
