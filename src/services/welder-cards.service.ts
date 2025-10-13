import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  WelderCard,
  WelderCardResponse,
  WelderCardListResponse,
  CreateWelderCardData,
  UpdateWelderCardData,
} from "@/lib/schemas/welder"

// Re-export types for use in hooks
export type { CreateWelderCardData, UpdateWelderCardData }

export const welderCardService = {
  async getAll(page: number = 1, limit: number = 10, showInactive: boolean = false): Promise<WelderCardListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_ALL_WELDER_CARDS, {
      searchParams: {
        page: page.toString(),
        limit: limit.toString(),
        show_inactive: showInactive.toString(),
        include_inactive: showInactive.toString(),
      }
    }).json<{
      status: string
      data: WelderCardResponse[]
      pagination: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()

    if (response.status === "success" && response.data) {
      return {
        results: response.data,
        count: response.pagination.total_records,
        next: response.pagination.has_next ? 'next' : null,
        previous: response.pagination.current_page > 1 ? 'prev' : null,
      }
    }
    
    throw new Error("Failed to get welder cards")
  },

  async getById(id: string): Promise<WelderCardResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.GET_WELDER_CARD_BY_ID(id)).json<{
      status: string
      data: WelderCardResponse
    }>()

    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to get welder card")
  },

  async create(data: CreateWelderCardData): Promise<WelderCardResponse> {
    const response = await api.post(API_ROUTES.WELDERS_API.CREATE_WELDER_CARD, {
      json: data
    }).json<{
      status: string
      data: WelderCardResponse
    }>()

    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to create welder card")
  },

  async update(id: string, data: UpdateWelderCardData): Promise<WelderCardResponse> {
    const response = await api.put(API_ROUTES.WELDERS_API.UPDATE_WELDER_CARD(id), {
      json: data
    }).json<{
      status: string
      data: WelderCardResponse
    }>()

    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to update welder card")
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.WELDERS_API.DELETE_WELDER_CARD(id))
  },

  async search(welder_name: string, page: number = 1, limit: number = 10): Promise<WelderCardListResponse> {
    const response = await api.get(API_ROUTES.WELDERS_API.SEARCH_WELDER_CARDS, {
      searchParams: {
        welder_name: welder_name,
        page: page.toString(),
        limit: limit.toString(),
      }
    }).json<{
      status: string
      data: WelderCardResponse[]
      pagination: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()

    if (response.status === "success" && response.data) {
      return {
        results: response.data,
        count: response.pagination.total_records,
        next: response.pagination.has_next ? 'next' : null,
        previous: response.pagination.current_page > 1 ? 'prev' : null,
      }
    }
    
    throw new Error("Failed to search welder cards")
  }
}
