import { z } from 'zod'

// Specimen schema
export const SpecimenSchema = z.object({
  id: z.string().optional(),
  specimen_id: z.string(),
  isFromInitialData: z.boolean().optional(),
})

export type Specimen = z.infer<typeof SpecimenSchema>

// Request item schema (no request_id here, it's at parent level)
export const RequestItemSchema = z.object({
  item_description: z.string(),
  planned_test_date: z.string(),
  dimension_spec: z.string(),
  request_by: z.string(),
  remarks: z.string().optional(),
  test_method_oid: z.string(),
  specimen_oids: z.array(z.string()).default([]),
})

export type RequestItem = z.infer<typeof RequestItemSchema>

// Base sample preparation schema
export const SamplePreparationSchema = z.object({
  id: z.string().optional(),
  request_no: z.string(),
  request_id: z.string(), // Single request_id (sample_lot id) at top level
  request_items: z.array(RequestItemSchema),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  is_active: z.boolean().default(true),
})

export type SamplePreparation = z.infer<typeof SamplePreparationSchema>

// Response schema (simplified for listing)
export const SamplePreparationResponseSchema = z.object({
  id: z.string(),
  job_id: z.string(),
  project_name: z.string(),
  client_name: z.string(),
  request_no: z.string(),
  created_at: z.string(),
  no_of_request_items: z.number(),
  specimen_ids: z.array(z.string()),
})

export type SamplePreparationResponse = z.infer<typeof SamplePreparationResponseSchema>

// List response schema
export const SamplePreparationListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(SamplePreparationResponseSchema),
})

export type SamplePreparationListResponse = z.infer<typeof SamplePreparationListResponseSchema>

// Create schema
export const CreateSamplePreparationSchema = SamplePreparationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  is_active: true,
})

export type CreateSamplePreparationData = z.infer<typeof CreateSamplePreparationSchema>

// Update schema
export const UpdateSamplePreparationSchema = CreateSamplePreparationSchema.partial()
export type UpdateSamplePreparationData = z.infer<typeof UpdateSamplePreparationSchema>

// Specimen create schema
export const CreateSpecimenSchema = z.object({
  specimen_id: z.string(),
})

export type CreateSpecimenData = z.infer<typeof CreateSpecimenSchema>

// Specimen update schema
export const UpdateSpecimenSchema = z.object({
  specimen_id: z.string(),
})

export type UpdateSpecimenData = z.infer<typeof UpdateSpecimenSchema>

// Specimen response schema
export const SpecimenResponseSchema = z.object({
  id: z.string(),
  specimen_id: z.string(),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
})

export type SpecimenResponse = z.infer<typeof SpecimenResponseSchema>
