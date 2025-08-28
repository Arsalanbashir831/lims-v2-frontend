import type { PQRFormData } from "@/components/pqr/form/pqr-form"

const KEY_PREFIX = "lims:pqr:form:"

export function savePqrForm(id: string, data: PQRFormData) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY_PREFIX + id, JSON.stringify(data))
  } catch {}
}

export function loadPqrForm(id: string): PQRFormData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + id)
    return raw ? (JSON.parse(raw) as PQRFormData) : null
  } catch {
    return null
  }
}
