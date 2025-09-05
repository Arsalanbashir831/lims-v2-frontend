import { api } from "./api/ky"
import { z } from "zod"
import { API_ROUTES } from "@/constants/api-routes"

// Backend payload and response schemas
export const EquipmentSchema = z.object({
  id: z.string(),
  equipmentName: z.string(),
  equipmentSerial: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  lastVerification: z.string().nullable().optional(),
  verificationDue: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  created_by_username: z.string().optional(),
  is_verification_overdue: z.boolean().nullable().optional(),
  days_until_verification: z.number().nullable().optional(),
  verification_status_display: z.string().optional(),
})

export const EquipmentListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
  results: z.array(EquipmentSchema),
})

export type Equipment = z.infer<typeof EquipmentSchema>
export type EquipmentListResponse = z.infer<typeof EquipmentListResponseSchema>

export type CreateEquipmentData = {
  equipmentName: string
  equipmentSerial?: string
  status?: string
  lastVerification?: string // yyyy-mm-dd
  verificationDue?: string // yyyy-mm-dd
  remarks?: string
  createdBy?: string
  updatedBy?: string
}

export type UpdateEquipmentData = Partial<CreateEquipmentData>

export const equipmentService = {
  async getAll(page: number = 1): Promise<{ results: Equipment[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_EQUIPMENTS, {
      searchParams: { page, is_active: true }
    }).json()
    const validated = EquipmentListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },

  async getById(id: string | number): Promise<Equipment> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.EQUIPMENT_BY_ID(String(id))).json()
    return EquipmentSchema.parse(response)
  },

  async create(data: CreateEquipmentData): Promise<Equipment> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_EQUIPMENT, { json: data }).json()
    return EquipmentSchema.parse(response)
  },

  async update(id: string | number, data: UpdateEquipmentData): Promise<Equipment> {
    const response = await api.patch(API_ROUTES.Lab_MANAGERS.UPDATE_EQUIPMENT(String(id)), { json: data }).json()
    return EquipmentSchema.parse(response)
  },

  async delete(id: string | number): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_EQUIPMENT(String(id)))
  },

  async search(query: string, page: number = 1): Promise<{ results: Equipment[]; count: number; next: string | null; previous: string | null }> {
    const qEncoded = encodeURIComponent(query)
    const url = `${API_ROUTES.Lab_MANAGERS.SEARCH_EQUIPMENTS}?q=${qEncoded}&page=${page}`
    const response = await api.get(url).json()
    const validated = EquipmentListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },
}

