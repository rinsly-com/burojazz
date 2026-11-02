'use client'

import type { ReactNode } from 'react'

import { Button } from '@rinsly-com/ui/button'
import { Checkbox } from '@rinsly-com/ui/checkbox'
import { Field } from '@rinsly-com/ui/field'
import { Input } from '@rinsly-com/ui/input'

import { STEPS } from './formData'

/* -------------------------------------------------------------------------- */
/* Inline icons (client-safe — no Tabler barrel in the client bundle)         */
/* -------------------------------------------------------------------------- */

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M9 3.75V14.25M3.75 9H14.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
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

// Base UI has no Textarea part; Field.Control renders one.
// The id is on the element itself: Field's provider id is generated until a
// layout effect, so an `id` prop alone is missing from the server HTML.
const Textarea = ({ id, ...props }: React.ComponentProps<'textarea'>) => (
  // Field.Control is typed for <input>, so textarea props need this cast.
  <Field.Control id={id} render={<textarea id={id} />} {...(props as object)} />
)

type InputProps = {
  /** Explicit id so `label[for]` still matches after hydration. */
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  error?: string
  type?: 'text' | 'email' | 'tel' | 'date'
  placeholder?: string
  autoComplete?: string
  /** Extra classes on the field root (width in a flex row, for example). */
  className?: string
  /** Visually hide the label while keeping it associated with the control. */
  labelClassName?: string
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <Field.Error
      id={`${id}-error`}
      match
      render={<span />}
      className="text-xs font-medium text-[#f04438]"
    >
      {error}
    </Field.Error>
  )
}

function FieldLabelText({
  label,
  required,
  className,
  htmlFor,
}: {
  label: string
  required?: boolean
  className?: string
  /** Explicit id. On the rendered label so `for` matches in the server HTML. */
  htmlFor: string
}) {
  return (
    <Field.Label
      className={className ?? 'text-sm font-medium text-black'}
      render={<label htmlFor={htmlFor} />}
    >
      {label}
      {required && <span className="text-[#f04438]"> *</span>}
    </Field.Label>
  )
}

export function TextField({
  id,
  label,
  value,
  onChange,
  required,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  className,
  labelClassName,
}: InputProps) {
  return (
    <Field.Root className={className ?? 'flex flex-col gap-1.5'} invalid={Boolean(error)}>
      <FieldLabelText label={label} required={required} className={labelClassName} htmlFor={id} />
      <Input
        id={id}
        render={<input id={id} />}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} ${error ? 'border-[#f04438]' : ''}`}
      />
      <FieldError id={id} error={error} />
    </Field.Root>
  )
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  required,
  error,
  placeholder,
  rows = 4,
  className,
  labelClassName,
}: Omit<InputProps, 'type' | 'autoComplete'> & { rows?: number }) {
  return (
    <Field.Root className={className ?? 'flex flex-col gap-1.5'} invalid={Boolean(error)}>
      <FieldLabelText label={label} required={required} className={labelClassName} htmlFor={id} />
      <Textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} resize-y ${error ? 'border-[#f04438]' : ''}`}
      />
      <FieldError id={id} error={error} />
    </Field.Root>
  )
}

/** A single checkbox with a label. Works for multi-select groups and booleans. */
export function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  /** Explicit id so `label[for]` still matches after hydration. */
  id: string
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Field.Root>
      <Field.Label
        className="flex cursor-pointer items-start gap-3 text-sm font-medium text-ink"
        render={<label htmlFor={id} />}
      >
        <Checkbox.Root
          id={id}
          // Keep the native button. `nativeButton={false}` puts the id on the
          // hidden input, and the visible control's generated id no longer
          // matches the label. The id is also on the rendered button so the
          // server HTML carries it; Field only copies it across in an effect.
          nativeButton
          checked={checked}
          onCheckedChange={onChange}
          render={<button type="button" id={id} />}
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 p-0 transition-colors ${
            checked ? 'border-brand bg-brand text-white' : 'border-white bg-white'
          }`}
        >
          <Checkbox.Indicator>
            <CheckIcon className="size-4" />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <span className="leading-snug">{label}</span>
      </Field.Label>
    </Field.Root>
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
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2.5 rounded-pill bg-brand px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3fadb7] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
      <ArrowRightIcon />
    </Button>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2.5 rounded-pill border border-[#eae9e6] bg-white px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand"
    >
      <ArrowLeftIcon />
      Terug
    </Button>
  )
}
