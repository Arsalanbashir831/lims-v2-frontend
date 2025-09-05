import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./api/ky"
import { z } from "zod"

// API Response schemas
const ClientSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().nullable(),
  contact_person: z.string().nullable(),
  email: z.string().nullable(),
  address_line_1: z.string().nullable().optional(),
  address_line_2: z.string().nullable().optional(),
  city: z.string().nullable(),
  state: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_by_username: z.string().optional(),
  updated_by_username: z.string().optional(),
  full_address: z.string().optional(),
})

const ClientListResponseSchema = z.object({
  count: z.number(),
  // Some endpoints (e.g., search) may omit next/previous entirely
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
  results: z.array(ClientSchema),
})

export type Client = z.infer<typeof ClientSchema>
export type ClientListResponse = z.infer<typeof ClientListResponseSchema>

export interface CreateClientData {
  name: string
  phone: string
  contact_person?: string
  email?: string
  address_line_1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface UpdateClientData extends Partial<CreateClientData> {}

export const clientService = {
  async getAll(page: number = 1): Promise<{ results: Client[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_CLIENTS, {
      searchParams: { 
        is_active: true,
        page
      }
    }).json()
    
    const validated = ClientListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null
    }
  },

  async getById(id: string | number): Promise<Client> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.CLIENT_BY_ID(id.toString())).json()
    return ClientSchema.parse(response)
  },

  async create(data: CreateClientData): Promise<Client> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_CLIENT, {
      json: data
    }).json()
    
    return ClientSchema.parse(response)
  },

  async update(id: string | number, data: UpdateClientData): Promise<Client> {
    const response = await api.patch(API_ROUTES.Lab_MANAGERS.UPDATE_CLIENT(id.toString()), {
      json: data
    }).json()
    
    return ClientSchema.parse(response)
  },

  async delete(id: string | number): Promise<void> {
    await api.delete(`core/clients/${id}/`)
  },

  async search(query: string, page: number = 1): Promise<{ results: Client[]; count: number; next: string | null; previous: string | null }> {
    // Build URL manually so spaces remain encoded as %20 not +
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_CLIENTS, {
      searchParams: { q: query, page }
    }).json()
    
    const validated = ClientListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null
    }
  }
}
