'use client'

import { useCallback, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>([])

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const node = (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs shadow-card backdrop-blur animate-toast-in',
            t.tone === 'success' && 'border-success/30 bg-white/95 dark:bg-[#0d1a12]/95 text-success',
            t.tone === 'error' && 'border-destructive/30 bg-white/95 dark:bg-[#1a0f0f]/95 text-destructive',
            t.tone === 'info' && 'border-border bg-card/95 text-foreground',
          )}
        >
          {t.tone === 'success' ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : t.tone === 'error' ? (
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          )}
          <span className="flex-1 leading-relaxed">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )

  return { show, node }
}