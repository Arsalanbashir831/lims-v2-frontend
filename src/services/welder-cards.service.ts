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

  async search(query: string, page: number = 1, limit: number = 10): Promise<WelderCardListResponse> {
    // Backend doesn't support 'q' parameter - it only accepts specific filters
    // Available filters: card_no, company, welder_id (ObjectId only), authorized_by
    // Since we can't search multiple fields with OR logic, we'll search by card_no
    // which is the most commonly searched field for welder cards
    const response = await api.get(API_ROUTES.WELDERS_API.SEARCH_WELDER_CARDS, {
      searchParams: {
        card_no: query,
        page: page.toString(),
        limit: limit.toString(),
      }
    }).json<{
      status: string
      data: Array<{
        id: string
        card_no: string
        company: string
        welder_id: string
        welder_name?: string
        authorized_by: string
        is_active: boolean
      }>
      total: number
      filters_applied: {
        card_no: string
        company: string
        welder_id: string
        authorized_by: string
      }
    }>()

    if (response.status === "success" && response.data) {
      // Transform the flat search response to match the expected structure
      const transformedData = response.data.map(item => ({
        id: item.id,
        card_no: item.card_no,
        company: item.company,
        welder_id: item.welder_id,
        authorized_by: item.authorized_by,
        welding_inspector: "",
        law_name: "",
        attributes: null,
        is_active: item.is_active,
        created_at: "",
        updated_at: "",
        // If welder_name is present, create a minimal welder_info object
        // Note: operator_id is not returned by search API, using welder_id as fallback
        ...(item.welder_name ? {
          welder_info: {
            welder_id: item.welder_id,
            operator_name: item.welder_name,
            operator_id: item.welder_id, // Using welder_id as fallback since search doesn't return operator_id
            iqama: "",
            profile_image: null,
          }
        } : {})
      }))

      return {
        results: transformedData as WelderCardResponse[],
        count: response.total,
        next: null,
        previous: null,
      }
    }
    
    throw new Error("Failed to search welder cards")
  }
}
