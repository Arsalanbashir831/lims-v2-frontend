import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  ClientResponse,
  ClientListResponse as ClientListResponseType,
  CreateClientData as CreateClientDataType,
  UpdateClientData as UpdateClientDataType,
  ClientResponseSchema,
  ClientListResponseSchema
} from "@/lib/schemas/client"

export type Client = ClientResponse
export type ClientListResponse = ClientListResponseType
export type CreateClientData = CreateClientDataType
export type UpdateClientData = UpdateClientDataType

export const clientService = {
  async getAll(page: number = 1): Promise<{ results: Client[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_CLIENTS
    const response = await api.get(endpoint, {
      searchParams: {
        page: page.toString()
      }
    }).json()
    const validated = ClientListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next as string | null,
      previous: validated.previous as string | null
    }
  },

  async getById(id: string | number): Promise<Client> {
    const endpoint = API_ROUTES.Lab_MANAGERS.CLIENT_BY_ID(id.toString()).replace(/^\//, "")
    const response = await api.get(endpoint).json()
    return ClientResponseSchema.parse(response)
  },

  async create(data: CreateClientData): Promise<Client> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_CLIENT.replace(/^\//, "")
    const response = await api.post(endpoint, {
      json: data
    }).json()

    return ClientResponseSchema.parse(response)
  },

  async update(id: string | number, data: UpdateClientData): Promise<Client> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_CLIENT(id.toString()).replace(/^\//, "")
    const response = await api.patch(endpoint, {
      json: data
    }).json()

    return ClientResponseSchema.parse(response)
  },

  async delete(id: string | number): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_CLIENT(id.toString()).replace(/^\//, "")
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: Client[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_CLIENTS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { q: query, page: page.toString() }
    }).json()

    const validated = ClientListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next as string | null,
      previous: validated.previous as string | null
    }
  }
}
