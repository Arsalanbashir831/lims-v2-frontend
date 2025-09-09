import { api } from "./api/api"
import { API_ROUTES } from "@/constants/api-routes"
import {
  EquipmentResponseSchema,
  EquipmentListResponseSchema,
  EquipmentResponse as Equipment,
  CreateEquipmentData,
  UpdateEquipmentData,
} from "@/lib/schemas/equipment"

export type { Equipment }
export type { CreateEquipmentData, UpdateEquipmentData }

export const equipmentService = {
  async getAll(page: number = 1): Promise<{ results: Equipment[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_EQUIPMENTS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { page: page.toString() }
    }).json()
    const validated = EquipmentListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },

  async getById(id: string | number): Promise<Equipment> {
    const endpoint = API_ROUTES.Lab_MANAGERS.EQUIPMENT_BY_ID(String(id)).replace(/^\//, "")
    const response = await api.get(endpoint).json()
    return EquipmentResponseSchema.parse(response)
  },

  async create(data: CreateEquipmentData): Promise<Equipment> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_EQUIPMENT.replace(/^\//, "")
    const response = await api.post(endpoint, { json: data }).json()
    return EquipmentResponseSchema.parse(response)
  },

  async update(id: string | number, data: UpdateEquipmentData): Promise<Equipment> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_EQUIPMENT(String(id)).replace(/^\//, "")
    const response = await api.patch(endpoint, { json: data }).json()
    return EquipmentResponseSchema.parse(response)
  },

  async delete(id: string | number): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_EQUIPMENT(String(id)).replace(/^\//, "")
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: Equipment[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_EQUIPMENTS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { q: query, page: page.toString() }
    }).json()
    const validated = EquipmentListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },
}

