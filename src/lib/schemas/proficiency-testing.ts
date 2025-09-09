import { z } from 'zod'

export const ProficiencyTestingSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  provider1: z.string().nullable().optional(),
  provider2: z.string().nullable().optional(),
  lastTestDate: z.union([z.string(), z.date()]).nullable().optional(),
  nextScheduledDate: z.union([z.string(), z.date()]).nullable().optional(),
  dueDate: z.union([z.string(), z.date()]).nullable().optional(),
  status: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
})

export type ProficiencyTesting = z.infer<typeof ProficiencyTestingSchema>

export const ProficiencyTestingResponseSchema = ProficiencyTestingSchema.extend({ id: z.string() })
export type ProficiencyTestingResponse = z.infer<typeof ProficiencyTestingResponseSchema>

export const ProficiencyTestingListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(ProficiencyTestingResponseSchema),
})
export type ProficiencyTestingListResponse = z.infer<typeof ProficiencyTestingListResponseSchema>

export const CreateProficiencyTestingSchema = ProficiencyTestingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CreateProficiencyTestingData = z.infer<typeof CreateProficiencyTestingSchema>

export const UpdateProficiencyTestingSchema = CreateProficiencyTestingSchema.partial()
export type UpdateProficiencyTestingData = z.infer<typeof UpdateProficiencyTestingSchema>


