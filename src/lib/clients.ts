export interface Client {
  id?: string
  name: string
  phone?: string
  contact_person?: string
  email?: string
  address_line_1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  createdAt?: string
  updatedAt?: string
}

// Mock data for development
const mockClients: Client[] = [
  {
    id: "1",
    name: "Saudi Aramco",
    phone: "+966-13-874-0000",
    contact_person: "Ahmed Al-Rashid",
    email: "ahmed.rashid@aramco.com",
    address_line_1: "Dhahran 31311",
    city: "Dhahran",
    state: "Eastern Province",
    postal_code: "31311",
    country: "Saudi Arabia",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "SABIC",
    phone: "+966-13-330-2000",
    contact_person: "Fatima Al-Zahra",
    email: "fatima.zahra@sabic.com",
    address_line_1: "P.O. Box 5101",
    city: "Riyadh",
    state: "Riyadh Province",
    postal_code: "11422",
    country: "Saudi Arabia",
    createdAt: "2024-01-20T14:15:00Z",
    updatedAt: "2024-01-20T14:15:00Z"
  },
  {
    id: "3",
    name: "ACWA Power",
    phone: "+966-11-203-8000",
    contact_person: "Mohammed Al-Sheikh",
    email: "mohammed.sheikh@acwapower.com",
    address_line_1: "King Fahd Road",
    city: "Riyadh",
    state: "Riyadh Province",
    postal_code: "12345",
    country: "Saudi Arabia",
    createdAt: "2024-02-01T09:45:00Z",
    updatedAt: "2024-02-01T09:45:00Z"
  }
]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const clientService = {
  async getAll(): Promise<Client[]> {
    await delay(500)
    return [...mockClients]
  },

  async getById(id: string): Promise<Client | null> {
    await delay(300)
    return mockClients.find(client => client.id === id) || null
  },

  async create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    await delay(800)
    const newClient: Client = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockClients.push(newClient)
    return newClient
  },

  async update(id: string, data: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Client> {
    await delay(600)
    const index = mockClients.findIndex(client => client.id === id)
    if (index === -1) {
      throw new Error('Client not found')
    }
    
    const updatedClient: Client = {
      ...mockClients[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    mockClients[index] = updatedClient
    return updatedClient
  },

  async delete(id: string): Promise<void> {
    await delay(400)
    const index = mockClients.findIndex(client => client.id === id)
    if (index === -1) {
      throw new Error('Client not found')
    }
    mockClients.splice(index, 1)
  },

  async search(query: string): Promise<Client[]> {
    await delay(300)
    const lowercaseQuery = query.toLowerCase()
    return mockClients.filter(client => 
      client.name.toLowerCase().includes(lowercaseQuery) ||
      client.contact_person?.toLowerCase().includes(lowercaseQuery) ||
      client.email?.toLowerCase().includes(lowercaseQuery) ||
      client.city?.toLowerCase().includes(lowercaseQuery)
    )
  }
}
