import { z } from 'zod'

export const EquipmentSchema = z.object({
  id: z.string().optional(),
  equipmentName: z.string().min(1, 'Equipment name is required'),
  equipmentSerial: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  lastVerification: z.union([z.string(), z.date()]).nullable().optional(),
  verificationDue: z.union([z.string(), z.date()]).nullable().optional(),
  createdBy: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
})

export type Equipment = z.infer<typeof EquipmentSchema>

export const EquipmentResponseSchema = EquipmentSchema.extend({
  id: z.string(),
})
export type EquipmentResponse = z.infer<typeof EquipmentResponseSchema>

export const EquipmentListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(EquipmentResponseSchema),
})
export type EquipmentListResponse = z.infer<typeof EquipmentListResponseSchema>

export const CreateEquipmentSchema = EquipmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CreateEquipmentData = z.infer<typeof CreateEquipmentSchema>

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial()
export type UpdateEquipmentData = z.infer<typeof UpdateEquipmentSchema>


