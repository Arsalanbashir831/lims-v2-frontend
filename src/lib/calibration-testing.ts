"use client"

export type CalibrationTest = {
  id: string
  equipmentName: string
  equipmentSerial?: string
  vendor?: string
  calibrationDate?: string
  calibrationDueDate?: string
  certification?: string
  createdBy?: string
  updatedBy?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "lims:calibration-tests"

function readAll(): CalibrationTest[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CalibrationTest[]) : []
  } catch {
    return []
  }
}

function writeAll(items: CalibrationTest[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Fallback UUID
function generateId(): string {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) return (crypto as any).randomUUID()
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function listCalibrationTests(): CalibrationTest[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function getCalibrationTest(id: string): CalibrationTest | undefined {
  return readAll().find((m) => m.id === id)
}

export function createCalibrationTest(data: Omit<CalibrationTest, "id" | "createdAt" | "updatedAt">): CalibrationTest {
  const now = new Date().toISOString()
  const item: CalibrationTest = { ...data, id: generateId(), createdAt: now, updatedAt: now }
  const items = readAll()
  items.push(item)
  writeAll(items)
  return item
}

export function updateCalibrationTest(id: string, updates: Partial<Omit<CalibrationTest, "id" | "createdAt">>): CalibrationTest | undefined {
  const items = readAll()
  const idx = items.findIndex((m) => m.id === id)
  if (idx === -1) return undefined
  const updated: CalibrationTest = { ...items[idx], ...updates, updatedAt: new Date().toISOString() }
  items[idx] = updated
  writeAll(items)
  return updated
}

export function deleteCalibrationTest(id: string): boolean {
  const items = readAll()
  const next = items.filter((m) => m.id !== id)
  writeAll(next)
  return next.length !== items.length
}


