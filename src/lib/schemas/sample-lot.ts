import { z } from "zod"

// Mongo document schema (as stored)
export const SampleLotSchema = z.object({
  _id: z.string().optional(),
  job_id: z.string(), // references jobs.job_id or jobs._id (we'll take string)
  item_no: z.string(), // e.g., MTL-2025-0003-001
  sample_type: z.string().nullable().optional(),
  material_type: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  heat_no: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  mtc_no: z.string().nullable().optional(),
  storage_location: z.string().nullable().optional(),
  test_method_oids: z.array(z.string()).default([]), // array of ObjectId strings
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).default(() => new Date()),
  updated_at: z.union([z.string(), z.date()]).default(() => new Date()),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
})

export type SampleLot = z.infer<typeof SampleLotSchema>

export const CreateSampleLotSchema = SampleLotSchema.omit({
  _id: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
}).extend({
  item_no: z.string().optional(),
})
export type CreateSampleLotData = z.infer<typeof CreateSampleLotSchema>

export const UpdateSampleLotSchema = CreateSampleLotSchema.partial()
export type UpdateSampleLotData = z.infer<typeof UpdateSampleLotSchema>

export const SampleLotResponseSchema = SampleLotSchema.extend({ id: z.string() }).omit({ _id: true })
export type SampleLotResponse = z.infer<typeof SampleLotResponseSchema>

export const SampleLotListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(SampleLotResponseSchema),
})
export type SampleLotListResponse = z.infer<typeof SampleLotListResponseSchema>


