import { z } from 'zod'

export const SampleInformationSchema = z.object({
  id: z.string().optional(),
  job_id: z.string(),
  client_id: z.string(),
  end_user: z.string().nullable().optional(),
  receive_date: z.union([z.string(), z.date()]).nullable().optional(),
  received_by: z.string().nullable().optional(),
  project_name: z.string(),
  remarks: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
})

export type SampleInformation = z.infer<typeof SampleInformationSchema>

export const SampleInformationResponseSchema = SampleInformationSchema.extend({
  id: z.string(),
  // Server augments with client_name via aggregation
  client_name: z.string().optional(),
  // Server augments with sample_count via aggregation
  sample_lots_count: z.number().optional(),
})
export type SampleInformationResponse = z.infer<typeof SampleInformationResponseSchema>

export const SampleInformationListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(SampleInformationResponseSchema),
})
export type SampleInformationListResponse = z.infer<typeof SampleInformationListResponseSchema>

export const CreateSampleInformationSchema = SampleInformationSchema.omit({
  id: true,
  job_id: true,
  created_at: true,
  updated_at: true,
  is_active: true,
})
export type CreateSampleInformationData = z.infer<typeof CreateSampleInformationSchema>

export const UpdateSampleInformationSchema = CreateSampleInformationSchema.partial()
export type UpdateSampleInformationData = z.infer<typeof UpdateSampleInformationSchema>


