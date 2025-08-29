export interface DiscardedMaterial {
  id: string
  jobId: string
  sampleId: string
  discardReason: string
  discardDate: string
  items: DiscardedItem[]
  discardedAt: string
  createdAt: string
  updatedAt: string
}

export interface DiscardedItem {
  itemNo: number
  itemDescription: string
  testMethod: string
  specimenId: string
  testConductedDate: string
}

export interface CreateDiscardedMaterialData {
  jobId: string
  sampleId: string
  discardReason: string
  discardDate: string
  items: DiscardedItem[]
}

export interface UpdateDiscardedMaterialData extends Partial<CreateDiscardedMaterialData> {}

// Generate a unique ID
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments where crypto.randomUUID is not available
  return `discard-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const STORAGE_KEY = 'discarded-materials'

// Create a new discarded material record
export function createDiscardedMaterial(data: CreateDiscardedMaterialData): DiscardedMaterial {
  const discardedMaterial: DiscardedMaterial = {
    id: generateId(),
    ...data,
    discardedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const existing = listDiscardedMaterials()
  existing.push(discardedMaterial)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

  return discardedMaterial
}

// Get all discarded materials
export function listDiscardedMaterials(): DiscardedMaterial[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Get a specific discarded material by ID
export function getDiscardedMaterial(id: string): DiscardedMaterial | null {
  const materials = listDiscardedMaterials()
  return materials.find(material => material.id === id) || null
}

// Update a discarded material
export function updateDiscardedMaterial(id: string, data: UpdateDiscardedMaterialData): DiscardedMaterial | null {
  const materials = listDiscardedMaterials()
  const index = materials.findIndex(material => material.id === id)
  
  if (index === -1) return null

  materials[index] = {
    ...materials[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(materials))
  return materials[index]
}

// Delete a discarded material
export function deleteDiscardedMaterial(id: string): boolean {
  const materials = listDiscardedMaterials()
  const filtered = materials.filter(material => material.id !== id)
  
  if (filtered.length === materials.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

// Delete multiple discarded materials
export function deleteMultipleDiscardedMaterials(ids: string[]): boolean {
  const materials = listDiscardedMaterials()
  const filtered = materials.filter(material => !ids.includes(material.id))
  
  if (filtered.length === materials.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}
