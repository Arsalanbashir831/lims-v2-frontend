import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  EquipmentResponse,
  EquipmentListResponse as EquipmentListResponseType,
  CreateEquipmentData as CreateEquipmentDataType,
  UpdateEquipmentData as UpdateEquipmentDataType,
  EquipmentResponseSchema,
  EquipmentListResponseSchema
} from "@/lib/schemas/equipment"

export type Equipment = EquipmentResponse
export type EquipmentListResponse = EquipmentListResponseType
export type CreateEquipmentData = CreateEquipmentDataType
export type UpdateEquipmentData = UpdateEquipmentDataType

export const equipmentService = {
  async getAll(page: number = 1): Promise<{ results: Equipment[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_EQUIPMENTS
    const response = await api.get(endpoint, {
      searchParams: {
        page: page.toString()
      }
    }).json()
    const validated = EquipmentListResponseSchema.parse(response)
    return {
      results: validated.data,
      count: validated.pagination.total_records,
      next: validated.pagination.has_next ? 'next' : null,
      previous: validated.pagination.current_page > 1 ? 'prev' : null
    }
  },

  async getById(id: string | number): Promise<Equipment> {
    const endpoint = API_ROUTES.Lab_MANAGERS.EQUIPMENT_BY_ID(id.toString()).replace(/^\//, "")
    const response = await api.get(endpoint).json<{ data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return EquipmentResponseSchema.parse(responseData)
  },

  async create(data: CreateEquipmentData): Promise<Equipment> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_EQUIPMENT.replace(/^\//, "")
    const response = await api.post(endpoint, {
      json: data
    }).json<{ data: unknown } | unknown>()

    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return EquipmentResponseSchema.parse(responseData)
  },

  async update(id: string | number, data: UpdateEquipmentData): Promise<Equipment> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_EQUIPMENT(id.toString()).replace(/^\//, "")
    const response = await api.put(endpoint, {
      json: data
    }).json<{ data: unknown } | unknown>()

    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return EquipmentResponseSchema.parse(responseData)
  },

  async delete(id: string | number): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_EQUIPMENT(id.toString()).replace(/^\//, "")
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: Equipment[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_EQUIPMENTS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { equipment_name: query, page: page.toString() }
    }).json()

    const validated = EquipmentListResponseSchema.parse(response)
    return {
      results: validated.data,
      count: validated.pagination.total_records,
      next: validated.pagination.has_next ? 'next' : null,
      previous: validated.pagination.current_page > 1 ? 'prev' : null
    }
  }
}
