import { z } from 'zod'

export const WelderSchema = z.object({
  id: z.string().optional(),
  operator_name: z.string().min(1, "Operator name is required"),
  operator_id: z.string().min(1, "Operator ID is required"),
  iqama: z.string().min(1, "IQAMA is required"),
  profile_image: z.string().nullable().optional(),
  profile_image_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
})

export type Welder = z.infer<typeof WelderSchema>

export const WelderResponseSchema = WelderSchema.extend({
  id: z.string(),
})

export type WelderResponse = z.infer<typeof WelderResponseSchema>

export const WelderListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(WelderResponseSchema),
})

export type WelderListResponse = z.infer<typeof WelderListResponseSchema>

export const CreateWelderSchema = WelderSchema.omit({
  id: true,
  profile_image: true,
  profile_image_url: true,
  is_active: true,
  created_at: true,
  updated_at: true,
})

export type CreateWelderData = z.infer<typeof CreateWelderSchema>

export const UpdateWelderSchema = CreateWelderSchema.partial()

export type UpdateWelderData = z.infer<typeof UpdateWelderSchema>

export const WelderCardSchema = z.object({
  id: z.string(),
  company: z.string(),
  welder_id: z.string(),
  welder_info: z.object({
    welder_id: z.string(),
    operator_name: z.string(),
    operator_id: z.string(),
    iqama: z.string(),
    profile_image: z.string().nullable(),
  }).optional(),
  authorized_by: z.string(),
  welding_inspector: z.string(),
  law_name: z.string(),
  card_no: z.string(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type WelderCard = z.infer<typeof WelderCardSchema>

export const WelderCardResponseSchema = WelderCardSchema.extend({
  id: z.string(),
})

export type WelderCardResponse = z.infer<typeof WelderCardResponseSchema>

export const WelderCardListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(WelderCardResponseSchema),
})

export type WelderCardListResponse = z.infer<typeof WelderCardListResponseSchema>

export const CreateWelderCardSchema = z.object({
  company: z.string().min(1, "Company is required"),
  welder_id: z.string().min(1, "Welder is required"),
  authorized_by: z.string().min(1, "Authorized by is required"),
  welding_inspector: z.string().min(1, "Welding inspector is required"),
  law_name: z.string().min(1, "Law name is required"),
  card_no: z.string().min(1, "Card number is required"),
  attributes: z.record(z.string(), z.unknown()),
})

export type CreateWelderCardData = z.infer<typeof CreateWelderCardSchema>

export const UpdateWelderCardSchema = CreateWelderCardSchema.partial()

export type UpdateWelderCardData = z.infer<typeof UpdateWelderCardSchema>
