export type TestMethodRef = {
  id: string
  name: string
}

export type SampleItem = {
  id: string
  indexNo: number
  description: string
  mtcNo: string
  sampleType: string
  materialType: string
  heatNo: string
  storageLocation: string
  condition: string
  testMethods: TestMethodRef[]
}

export type SampleReceiving = {
  id: string
  sampleId: string
  projectName: string
  clientName: string
  endUser: string
  phone: string
  receiveDate: string // ISO date
  storageLocation: string
  remarks: string
  numItems: number
  items: SampleItem[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "lims:sample_receivings"

function cryptoRandom(len: number): Uint8Array {
  const arr = new Uint8Array(len)
  if (typeof crypto !== "undefined" && (crypto as any)?.getRandomValues) {
    (crypto as any).getRandomValues(arr)
    return arr
  }
  for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 256)
  return arr
}

function generateId(): string {
  if (typeof crypto !== "undefined" && (crypto as any)?.randomUUID) {
    try { return (crypto as any).randomUUID() } catch {}
  }
  const hex = [...cryptoRandom(32)].map(b => b.toString(16).padStart(2, "0")).join("")
  return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20,32)}`
}

export function generateSampleCode(): string {
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g, "")
  const randPart = generateId().slice(0, 6).toUpperCase()
  return `SMP-${datePart}-${randPart}`
}

function readAll(): SampleReceiving[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SampleReceiving[]) : []
  } catch {
    return []
  }
}

function writeAll(items: SampleReceiving[]) {
  if (typeof window === "undefined") return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export function listSampleReceivings(): SampleReceiving[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getSampleReceiving(id: string): SampleReceiving | null {
  return readAll().find(r => r.id === id) ?? null
}

export function createSampleReceiving(payload: Omit<SampleReceiving, "id" | "createdAt" | "updatedAt"> & Partial<Pick<SampleReceiving, "sampleId">>): SampleReceiving {
  const now = Date.now()
  const sampleId = payload.sampleId ?? generateSampleCode()
  const { sampleId: _omit, ...rest } = payload as any
  const record: SampleReceiving = { id: generateId(), createdAt: now, updatedAt: now, sampleId, ...rest }
  const all = readAll()
  all.push(record)
  writeAll(all)
  return record
}

export function updateSampleReceiving(id: string, updates: Partial<Omit<SampleReceiving, "id" | "createdAt">>): SampleReceiving | null {
  const all = readAll()
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return null
  const updated: SampleReceiving = { ...all[idx], ...updates, updatedAt: Date.now() }
  all[idx] = updated
  writeAll(all)
  return updated
}

export function deleteSampleReceiving(id: string) {
  const remaining = readAll().filter(r => r.id !== id)
  writeAll(remaining)
}

// Helper to build a sample item
export function createSampleItem(partial?: Partial<SampleItem>): SampleItem {
  return {
    id: generateId(),
    indexNo: partial?.indexNo ?? 1,
    description: partial?.description ?? "",
    mtcNo: partial?.mtcNo ?? "",
    sampleType: partial?.sampleType ?? "",
    materialType: partial?.materialType ?? "",
    heatNo: partial?.heatNo ?? "",
    storageLocation: partial?.storageLocation ?? "",
    condition: partial?.condition ?? "",
    testMethods: partial?.testMethods ?? [],
  }
}
