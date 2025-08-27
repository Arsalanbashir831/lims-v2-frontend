"use client"

// Fallback UUID generator for browsers that don't support crypto.randomUUID()
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback: simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export type ProficiencyTest = {
  id: string
  description: string
  provider1?: string
  provider2?: string
  lastTestDate?: string
  dueDate?: string
  nextScheduledDate?: string
  status?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "lims:proficiency-tests"

function readAll(): ProficiencyTest[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProficiencyTest[]) : []
  } catch {
    return []
  }
}

function writeAll(items: ProficiencyTest[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function listProficiencyTests(): ProficiencyTest[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function getProficiencyTest(id: string): ProficiencyTest | undefined {
  return readAll().find((m) => m.id === id)
}

export function createProficiencyTest(data: Omit<ProficiencyTest, "id" | "createdAt" | "updatedAt">): ProficiencyTest {
  const now = new Date().toISOString()
  const item: ProficiencyTest = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  console.log("Creating proficiency test:", item)
  const items = readAll()
  console.log("Current items:", items)
  items.push(item)
  writeAll(items)
  console.log("Items after creation:", items)
  return item
}

export function updateProficiencyTest(id: string, updates: Partial<Omit<ProficiencyTest, "id" | "createdAt">>): ProficiencyTest | undefined {
  const items = readAll()
  const idx = items.findIndex((m) => m.id === id)
  if (idx === -1) return undefined
  const updated: ProficiencyTest = {
    ...items[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  items[idx] = updated
  writeAll(items)
  return updated
}

export function deleteProficiencyTest(id: string): boolean {
  const items = readAll()
  const next = items.filter((m) => m.id !== id)
  writeAll(next)
  return next.length !== items.length
}


