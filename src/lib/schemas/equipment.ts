import { z } from 'zod'

export const EquipmentSchema = z.object({
  id: z.string().optional(),
  equipment_name: z.string().min(1, 'Equipment name is required'),
  equipment_serial: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  last_verification: z.union([z.string(), z.date()]).nullable().optional(),
  verification_due: z.union([z.string(), z.date()]).nullable().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  is_verification_due: z.boolean().optional(),
  days_until_verification_due: z.number().nullable().optional(),
})

export type Equipment = z.infer<typeof EquipmentSchema>

export const EquipmentResponseSchema = EquipmentSchema.extend({
  id: z.string(),
})
export type EquipmentResponse = z.infer<typeof EquipmentResponseSchema>

export const EquipmentListResponseSchema = z.object({
  status: z.string(),
  data: z.array(EquipmentResponseSchema),
  pagination: z.object({
    current_page: z.number(),
    limit: z.number(),
    total_records: z.number(),
    total_pages: z.number(),
    has_next: z.boolean(),
  }),
})
export type EquipmentListResponse = z.infer<typeof EquipmentListResponseSchema>

export const CreateEquipmentSchema = EquipmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  is_verification_due: true,
  days_until_verification_due: true,
})
export type CreateEquipmentData = z.infer<typeof CreateEquipmentSchema>

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial()
export type UpdateEquipmentData = z.infer<typeof UpdateEquipmentSchema>


