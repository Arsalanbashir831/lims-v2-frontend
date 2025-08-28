export type SpecimenId = string

export type PreparationItem = {
  id: string
  indexNo: number
  sampleReceivingId: string
  sampleItemId: string
  jobItemLabel: string // e.g., SMP-... / Item 1 - desc
  description: string
  heatNo: string
  testMethodId: string
  testMethodName: string
  dimensionSpecLocation: string
  numSpecimens: number
  plannedTestDate: string
  requestedBy: string
  specimenIds: SpecimenId[]
  remarks: string
}

export type SamplePreparation = {
  id: string
  prepNo: string
  sampleReceivingId: string
  createdAt: number
  updatedAt: number
  items: PreparationItem[]
}

const STORAGE_KEY = "lims:sample_preparations"

function cryptoRandom(len: number): Uint8Array {
  const arr = new Uint8Array(len)
  if (typeof crypto !== "undefined" && (crypto as any)?.getRandomValues) {
    ;(crypto as any).getRandomValues(arr)
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

export function generatePrepNo(): string {
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g, "")
  const rand = generateId().slice(0,6).toUpperCase()
  return `SPR-${datePart}-${rand}`
}

function readAll(): SamplePreparation[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SamplePreparation[]) : []
  } catch {
    return []
  }
}

function writeAll(items: SamplePreparation[]) {
  if (typeof window === "undefined") return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export function listSamplePreparations(): SamplePreparation[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getSamplePreparation(id: string): SamplePreparation | null {
  return readAll().find(r => r.id === id) ?? null
}

export function createSamplePreparation(payload: Omit<SamplePreparation, "id" | "createdAt" | "updatedAt">): SamplePreparation {
  const now = Date.now()
  const record: SamplePreparation = { id: generateId(), createdAt: now, updatedAt: now, ...payload }
  const all = readAll()
  all.push(record)
  writeAll(all)
  return record
}

export function updateSamplePreparation(id: string, updates: Partial<Omit<SamplePreparation, "id" | "createdAt">>): SamplePreparation | null {
  const all = readAll()
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return null
  const updated: SamplePreparation = { ...all[idx], ...updates, updatedAt: Date.now() }
  all[idx] = updated
  writeAll(all)
  return updated
}

export function deleteSamplePreparation(id: string) {
  const remaining = readAll().filter(r => r.id !== id)
  writeAll(remaining)
}

export function createPreparationItem(partial?: Partial<PreparationItem>): PreparationItem {
  return {
    id: generateId(),
    indexNo: partial?.indexNo ?? 1,
    sampleReceivingId: partial?.sampleReceivingId ?? "",
    sampleItemId: partial?.sampleItemId ?? "",
    jobItemLabel: partial?.jobItemLabel ?? "",
    description: partial?.description ?? "",
    heatNo: partial?.heatNo ?? "",
    testMethodId: partial?.testMethodId ?? "",
    testMethodName: partial?.testMethodName ?? "",
    dimensionSpecLocation: partial?.dimensionSpecLocation ?? "",
    numSpecimens: partial?.numSpecimens ?? 1,
    plannedTestDate: partial?.plannedTestDate ?? "",
    requestedBy: partial?.requestedBy ?? "",
    specimenIds: partial?.specimenIds ?? [],
    remarks: partial?.remarks ?? "",
  }
}


