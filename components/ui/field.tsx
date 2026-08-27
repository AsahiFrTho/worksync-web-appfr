'use client'

import type * as React from 'react'
import { cn } from '@/lib/utils'

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

const inputClass =
  'h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors duration-200 focus:border-primary focus:ring-1 focus:ring-primary/25'

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, className)}
    />
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, 'h-auto min-h-[72px] py-2 leading-relaxed', className)}
    />
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type="search"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, className)}
    />
  )
}

export function Select({
  value,
  onChange,
  placeholder,
  options,
  allowAll = true,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  allowAll?: boolean
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, 'cursor-pointer pr-8', className)}
    >
      {allowAll && <option value="all">{placeholder || 'All'}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}