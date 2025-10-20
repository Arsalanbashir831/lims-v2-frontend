import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  ClientResponse,
  ClientListResponse as ClientListResponseType,
  CreateClientData as CreateClientDataType,
  UpdateClientData as UpdateClientDataType,
  ClientResponseSchema,
} from "@/lib/schemas/client"

export type Client = ClientResponse
export type ClientListResponse = ClientListResponseType
export type CreateClientData = CreateClientDataType
export type UpdateClientData = UpdateClientDataType

export const clientService = {
  async getAll(page: number = 1): Promise<ClientListResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_CLIENTS
    const response = await api.get(endpoint, {
      searchParams: {
        page: page.toString()
      }
    }).json<{
      status: string
      data: Client[]
      total: number
      pagination?: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django client data to our Client format
      const clients: Client[] = response.data.map(client => ({
        id: client.id,
        client_name: client.client_name,
        email: client.email,
        phone: client.phone,
        contact_person: client.contact_person,
        address: client.address,
        city: client.city,
        state: client.state,
        postal_code: client.postal_code,
        country: client.country,
        is_active: client.is_active,
        created_at: client.created_at,
        updated_at: client.updated_at,
        created_by: client.created_by,
        updated_by: client.updated_by
      }))
      
      return {
        results: clients,
        count: response.total,
        next: null, // Django doesn't provide pagination URLs in this format
        previous: null,
        pagination: response.pagination
      }
    }
    
    throw new Error("Failed to get clients")
  },

  async getById(id: string | number): Promise<Client> {
    const endpoint = API_ROUTES.Lab_MANAGERS.CLIENT_BY_ID(id.toString())
    const response = await api.get(endpoint).json<{
      status: string
      message: string
      data: {
        id: string
        client_name: string
        company_name?: string
        email: string
        phone?: string
        contact_person?: string
        address?: string
        city?: string
        state?: string
        postal_code?: string
        country?: string
        is_active: boolean
        created_at: string
        updated_at?: string
        created_by?: string
        updated_by?: string
      }
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map the API response to our schema format
      const clientData = {
        id: response.data.id,
        client_name: response.data.client_name,
        company_name: response.data.company_name || null,
        email: response.data.email || null,
        phone: response.data.phone || null,
        contact_person: response.data.contact_person || null,
        address: response.data.address,
        city: response.data.city || null,
        state: response.data.state || null,
        postal_code: response.data.postal_code || null,
        country: response.data.country || null,
        is_active: response.data.is_active,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        created_by: response.data.created_by || undefined,
        updated_by: response.data.updated_by || undefined
      }
      
      try {
        const parsedClient = ClientResponseSchema.parse(clientData)
        return parsedClient
      } catch (error) {
        console.error("Zod parsing error:", error)
        console.error("Failed to parse client data:", clientData)
        throw error
      }
    }
    
    throw new Error(response.message || "Failed to get client")
  },

  async create(data: CreateClientData): Promise<Client> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_CLIENT
    const response = await api.post(endpoint, {
      json: data
    }).json<{
      status: string
      message: string
      data: {
        id: string
        client_id: number
        client_name: string
        email: string
      }
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django response to our Client schema format
      const clientData: Client = {
        id: response.data.id,
        client_name: response.data.client_name,
        email: response.data.email,
        phone: undefined,
        contact_person: undefined,
        address: undefined,
        city: undefined,
        state: undefined,
        postal_code: undefined,
        country: undefined,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: undefined,
        created_by: undefined,
        updated_by: undefined
      }
      
      return clientData
    }
    
    throw new Error(response.message || "Failed to create client")
  },

  async update(id: string | number, data: UpdateClientData): Promise<Client> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_CLIENT(id.toString())
    const response = await api.put(endpoint, {
      json: data
    }).json<{
      status: string
      message: string
      data: {
        id: string
        client_id: number
        client_name: string
        email: string
      }
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django response to our Client schema format
      const clientData: Client = {
        id: response.data.id,
        client_name: response.data.client_name,
        email: response.data.email,
        phone: undefined,
        contact_person: undefined,
        address: undefined,
        city: undefined,
        state: undefined,
        postal_code: undefined,
        country: undefined,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: undefined,
        updated_by: undefined
      }
      return clientData
    }
    
    throw new Error(response.message || "Failed to update client")
  },

  async delete(id: string | number): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_CLIENT(id.toString())
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: Client[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_CLIENTS
    const response = await api.get(endpoint, {
      searchParams: { name: query, page: page.toString() }
    }).json<{
      status: string
      data: Client[]
      total: number
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django client data to our Client format
      const clients: Client[] = response.data.map(client => ({
        id: client.id,
        client_name: client.client_name,
        email: client.email,
        phone: client.phone,
        contact_person: client.contact_person,
        address: client.address,
        city: client.city,
        state: client.state,
        postal_code: client.postal_code,
        country: client.country,
        is_active: client.is_active,
        created_at: client.created_at,
        updated_at: client.updated_at,
        created_by: client.created_by,
        updated_by: client.updated_by
      }))
      
      return {
        results: clients,
        count: response.total,
        next: null, // Django doesn't provide pagination URLs in this format
        previous: null,
      }
    }
    
    throw new Error("Failed to search clients")
  }
}
