import { reactive } from 'vue'

export type ToastSeverity = 'success' | 'info' | 'warn' | 'warning' | 'error' | 'danger'

export interface ToastMessage {
  severity?: ToastSeverity
  summary?: string
  detail?: string
  /** Auto-close delay in ms; omit or 0 to keep the toast until closed. */
  life?: number
}

export interface ToastEntry extends ToastMessage {
  id: number
}

const toasts = reactive<ToastEntry[]>([])
let nextId = 1

const remove = (id: number) => {
  const index = toasts.findIndex((t) => t.id === id)
  if (index >= 0) toasts.splice(index, 1)
}

/** Shared toast queue; render it once with <UiToast />. */
export function useToast() {
  return {
    toasts,
    add(message: ToastMessage) {
      const entry: ToastEntry = { id: nextId++, severity: 'info', ...message }
      toasts.push(entry)
      if (entry.life) setTimeout(() => remove(entry.id), entry.life)
      return entry.id
    },
    remove,
    clear() {
      toasts.splice(0, toasts.length)
    }
  }
}
