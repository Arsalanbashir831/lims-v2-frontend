"use client"

export type TestMethod = {
  id: string
  name: string
  description?: string
  columns: string[]
  comments?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "lims:test-methods"

function readAll(): TestMethod[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TestMethod[]) : []
  } catch {
    return []
  }
}

function writeAll(items: TestMethod[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function listTestMethods(): TestMethod[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function getTestMethod(id: string): TestMethod | undefined {
  return readAll().find((m) => m.id === id)
}

export function createTestMethod(data: Omit<TestMethod, "id" | "createdAt" | "updatedAt">): TestMethod {
  const now = new Date().toISOString()
  const method: TestMethod = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  const items = readAll()
  items.push(method)
  writeAll(items)
  return method
}

export function updateTestMethod(id: string, updates: Partial<Omit<TestMethod, "id" | "createdAt">>): TestMethod | undefined {
  const items = readAll()
  const idx = items.findIndex((m) => m.id === id)
  if (idx === -1) return undefined
  const updated: TestMethod = {
    ...items[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  items[idx] = updated
  writeAll(items)
  return updated
}

export function deleteTestMethod(id: string): boolean {
  const items = readAll()
  const next = items.filter((m) => m.id !== id)
  writeAll(next)
  return next.length !== items.length
}


