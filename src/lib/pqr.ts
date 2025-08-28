export type PqrRecord = {
  id: string
  contractorName: string
  pqrNo: string
  supportingPwpsNo: string
  dateOfIssue: string
  dateOfWelding: string
  biNumber: string
  clientEndUser: string
  dateOfTesting: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "lims:pqrs"

function generateId(): string {
  if (typeof crypto !== "undefined" && (crypto as any)?.randomUUID) {
    try { return (crypto as any).randomUUID() } catch {}
  }
  const hex = [...cryptoRandom(32)].map((b) => b.toString(16).padStart(2, "0")).join("")
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`
}

function cryptoRandom(len: number): Uint8Array {
  const arr = new Uint8Array(len)
  if (typeof crypto !== "undefined" && (crypto as any)?.getRandomValues) {
    (crypto as any).getRandomValues(arr)
    return arr
  }
  for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 256)
  return arr
}

function readAll(): PqrRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PqrRecord[]) : []
  } catch {
    return []
  }
}

function writeAll(items: PqrRecord[]) {
  if (typeof window === "undefined") return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export function listPqrs(): PqrRecord[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getPqr(id: string): PqrRecord | null {
  const all = readAll()
  return all.find(r => r.id === id) ?? null
}

export function createPqr(payload: Omit<PqrRecord, "id" | "createdAt" | "updatedAt">): PqrRecord {
  const now = Date.now()
  const record: PqrRecord = { id: generateId(), createdAt: now, updatedAt: now, ...payload }
  const all = readAll()
  all.push(record)
  writeAll(all)
  return record
}

export function updatePqr(id: string, updates: Partial<Omit<PqrRecord, "id" | "createdAt">>): PqrRecord | null {
  const all = readAll()
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return null
  const updated: PqrRecord = { ...all[idx], ...updates, updatedAt: Date.now() }
  all[idx] = updated
  writeAll(all)
  return updated
}

export function deletePqr(id: string) {
  const all = readAll().filter(r => r.id !== id)
  writeAll(all)
}
