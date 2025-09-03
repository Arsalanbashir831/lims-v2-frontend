import { Welder } from "@/components/welders/welder-form"

// Mock data - replace with actual API calls
let mockWelders: Welder[] = [
  {
    id: "1",
    operatorName: "Ahmed Al-Rashid",
    operatorId: "W001",
    iqamaPassport: "1234567890",
    operatorImage: null
  },
  {
    id: "2",
    operatorName: "Mohammed Hassan",
    operatorId: "W002",
    iqamaPassport: "0987654321",
    operatorImage: null
  },
  {
    id: "3",
    operatorName: "Ali Abdullah",
    operatorId: "W003",
    iqamaPassport: "1122334455",
    operatorImage: null
  }
]

export const welderService = {
  // Get all welders
  getAll: async (): Promise<Welder[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockWelders]
  },

  // Get welder by ID
  getById: async (id: string): Promise<Welder | null> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const welder = mockWelders.find(w => w.id === id)
    return welder ? { ...welder } : null
  },

  // Create new welder
  create: async (welder: Omit<Welder, 'id'>): Promise<Welder> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const newWelder: Welder = {
      ...welder,
      id: (mockWelders.length + 1).toString()
    }
    mockWelders.push(newWelder)
    return { ...newWelder }
  },

  // Update welder
  update: async (id: string, updates: Partial<Welder>): Promise<Welder | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = mockWelders.findIndex(w => w.id === id)
    if (index === -1) return null
    
    mockWelders[index] = { ...mockWelders[index], ...updates }
    return { ...mockWelders[index] }
  },

  // Delete welder
  delete: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = mockWelders.findIndex(w => w.id === id)
    if (index === -1) return false
    
    mockWelders.splice(index, 1)
    return true
  },

  // Search welders
  search: async (query: string): Promise<Welder[]> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    const filtered = mockWelders.filter(welder =>
      welder.operatorName.toLowerCase().includes(query.toLowerCase()) ||
      welder.operatorId.toLowerCase().includes(query.toLowerCase()) ||
      welder.iqamaPassport.includes(query)
    )
    return [...filtered]
  }
}

export type { Welder }
