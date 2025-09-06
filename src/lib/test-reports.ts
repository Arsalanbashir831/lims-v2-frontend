import type { DynamicColumn, DynamicRow } from "@/components/pqr/form/dynamic-table"

export type CertificateDetails = {
  date_of_sampling: string
  date_of_testing: string
  issue_date: string
  gripco_ref_no: string
  revision_no: string
  client_name: string
  customer_name_no: string
  atten: string
  customer_po: string
  project_name: string
  name_of_laboratory: string
  address: string
  tested_by: string
  reviewed_by: string
}

export type ReportItem = {
  id: string
  preparationItemId: string
  specimenId: string
  testMethodId: string
  testMethodName: string
  testEquipment: string
  testEquipmentId: string
  samplePrepMethod: string
  sampleDescription: string
  materialGrade: string
  heatNo: string
  temperature: string
  humidity: string
  comments: string
  columns: DynamicColumn[]
  data: DynamicRow[]
}

export type TestReport = {
  id: string
  reportNo: string
  preparationId: string
  certificate: CertificateDetails
  items: ReportItem[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "lims:test_reports"

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

export function generateReportNo(): string {
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g, "")
  const rand = generateId().slice(0,6).toUpperCase()
  return `TR-${datePart}-${rand}`
}

function readAll(): TestReport[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TestReport[]) : []
  } catch {
    return []
  }
}

function writeAll(items: TestReport[]) {
  if (typeof window === "undefined") return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export function listTestReports(): TestReport[] { return readAll().sort((a,b)=>b.updatedAt-a.updatedAt) }
export function getTestReport(id: string): TestReport | null { return readAll().find(r=>r.id===id) ?? null }

export function createTestReport(payload: Omit<TestReport, "id" | "createdAt" | "updatedAt">): TestReport {
  const now = Date.now()
  const rec: TestReport = { id: generateId(), createdAt: now, updatedAt: now, ...payload }
  const all = readAll(); all.push(rec); writeAll(all); return rec
}

export function updateTestReport(id: string, updates: Partial<Omit<TestReport, "id" | "createdAt">>): TestReport | null {
  const all = readAll()
  const idx = all.findIndex(r=>r.id===id)
  if (idx === -1) return null
  const updated: TestReport = { ...all[idx], ...updates, updatedAt: Date.now() }
  all[idx] = updated; writeAll(all); return updated
}

export function deleteTestReport(id: string) { writeAll(readAll().filter(r=>r.id!==id)) }


