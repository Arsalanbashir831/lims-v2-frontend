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

// Sample lot item schema for the new payload structure
export const SampleLotItemSchema = z.object({
  item_description: z.string(),
  sample_lot_id: z.string(),
  test_method_oid: z.string(),
  specimen_oids: z.array(z.string()),
  planned_test_date: z.string().optional(),
  dimension_spec: z.string().optional(),
  request_by: z.string().optional(),
  remarks: z.string().optional(),
})

export type SampleLotItem = z.infer<typeof SampleLotItemSchema>

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

// New sample preparation schema for the updated API
export const NewSamplePreparationSchema = z.object({
  sample_lots: z.array(SampleLotItemSchema),
})

export type SamplePreparation = z.infer<typeof SamplePreparationSchema>
export type NewSamplePreparation = z.infer<typeof NewSamplePreparationSchema>

// Sample lot item in response
export const SampleLotResponseSchema = z.object({
  item_description: z.string(),
  planned_test_date: z.string().nullable(),
  dimension_spec: z.string().nullable(),
  request_by: z.string().nullable(),
  remarks: z.string().nullable(),
  sample_lot_id: z.string(),
  test_method: z.object({
    test_method_oid: z.string(),
    test_name: z.string(),
  }),
  job_id: z.string(),
  item_no: z.string(),
  specimens: z.array(z.object({
    specimen_oid: z.string(),
    specimen_id: z.string(),
  })),
  specimens_count: z.number(),
})

export type SampleLotResponse = z.infer<typeof SampleLotResponseSchema>

// Response schema (updated for new API structure)
export const SamplePreparationResponseSchema = z.object({
  id: z.string(),
  request_no: z.string(),
  sample_lots: z.array(SampleLotResponseSchema),
  sample_lots_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type SamplePreparationResponse = z.infer<typeof SamplePreparationResponseSchema>

// List response schema (updated for Django response structure)
export const SamplePreparationListResponseSchema = z.object({
  status: z.string(),
  data: z.array(SamplePreparationResponseSchema),
  total: z.number(),
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
