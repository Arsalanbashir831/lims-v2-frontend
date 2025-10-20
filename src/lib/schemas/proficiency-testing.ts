import { z } from 'zod'

export const ProficiencyTestingSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  provider1: z.string().nullable().optional(),
  provider2: z.string().nullable().optional(),
  last_test_date: z.union([z.string(), z.date()]).nullable().optional(),
  next_scheduled_date: z.union([z.string(), z.date()]).nullable().optional(),
  due_date: z.union([z.string(), z.date()]).nullable().optional(),
  status: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
})

export type ProficiencyTesting = z.infer<typeof ProficiencyTestingSchema>

export const ProficiencyTestingResponseSchema = ProficiencyTestingSchema.extend({ id: z.string() })
export type ProficiencyTestingResponse = z.infer<typeof ProficiencyTestingResponseSchema>

export const ProficiencyTestingListResponseSchema = z.object({
  status: z.string().optional(),
  data: z.array(ProficiencyTestingResponseSchema),
  pagination: z.object({
    current_page: z.number(),
    limit: z.number(),
    total_records: z.number(),
    total_pages: z.number(),
    has_next: z.boolean(),
  }).optional(),
  // Support old format
  count: z.number().optional(),
  next: z.union([z.number(), z.string()]).nullable().optional(),
  previous: z.union([z.number(), z.string()]).nullable().optional(),
  results: z.array(ProficiencyTestingResponseSchema).optional(),
})
export type ProficiencyTestingListResponse = z.infer<typeof ProficiencyTestingListResponseSchema>

export const CreateProficiencyTestingSchema = ProficiencyTestingSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})
export type CreateProficiencyTestingData = z.infer<typeof CreateProficiencyTestingSchema>

export const UpdateProficiencyTestingSchema = CreateProficiencyTestingSchema.partial()
export type UpdateProficiencyTestingData = z.infer<typeof UpdateProficiencyTestingSchema>


