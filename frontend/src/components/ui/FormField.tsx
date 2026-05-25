import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const inputClass = `
  w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm
  placeholder:text-neutral-300
  focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800
  disabled:bg-neutral-50 disabled:text-neutral-400
`

interface BaseProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string | number; label: string }[] }
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function InputField({ label, error, required, hint, ...props }: InputProps) {
  return (
    <div>
      <Label text={label} required={required} />
      <input className={`${inputClass} ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`} {...props} />
      {hint  && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
    </div>
  )
}

export function SelectField({ label, error, required, hint, options, ...props }: SelectProps) {
  return (
    <div>
      <Label text={label} required={required} />
      <select className={`${inputClass} ${error ? 'border-error-500' : ''}`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint  && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
    </div>
  )
}

export function TextareaField({ label, error, required, hint, ...props }: TextareaProps) {
  return (
    <div>
      <Label text={label} required={required} />
      <textarea
        rows={3}
        className={`${inputClass} resize-none ${error ? 'border-error-500' : ''}`}
        {...props}
      />
      {hint  && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
    </div>
  )
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-medium text-neutral-700">
      {text}
      {required && <span className="ml-0.5 text-primary-800">*</span>}
    </label>
  )
}
