"use client"

export type Equipment = {
  id: string
  name: string
  serial?: string
  status?: string
  lastInternalVerificationDate?: string
  internalVerificationDueDate?: string
  createdBy?: string
  updatedBy?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "lims:equipments"

function readAll(): Equipment[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Equipment[]) : []
  } catch {
    return []
  }
}

function writeAll(items: Equipment[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function generateId(): string {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) return (crypto as any).randomUUID()
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function listEquipments(): Equipment[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function getEquipment(id: string): Equipment | undefined {
  return readAll().find((m) => m.id === id)
}

export function createEquipment(data: Omit<Equipment, "id" | "createdAt" | "updatedAt">): Equipment {
  const now = new Date().toISOString()
  const item: Equipment = { ...data, id: generateId(), createdAt: now, updatedAt: now }
  const items = readAll()
  items.push(item)
  writeAll(items)
  return item
}

export function updateEquipment(id: string, updates: Partial<Omit<Equipment, "id" | "createdAt">>): Equipment | undefined {
  const items = readAll()
  const idx = items.findIndex((m) => m.id === id)
  if (idx === -1) return undefined
  const updated: Equipment = { ...items[idx], ...updates, updatedAt: new Date().toISOString() }
  items[idx] = updated
  writeAll(items)
  return updated
}

export function deleteEquipment(id: string): boolean {
  const items = readAll()
  const next = items.filter((m) => m.id !== id)
  writeAll(next)
  return next.length !== items.length
}


