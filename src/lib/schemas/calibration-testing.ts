import { z } from 'zod'

export const CalibrationTestingSchema = z.object({
  id: z.string().optional(),
  equipment_name: z.string().min(1, 'Equipment name is required'),
  equipment_serial: z.string().nullable().optional(),
  calibration_vendor: z.string().nullable().optional(),
  calibration_date: z.union([z.string(), z.date()]).nullable().optional(),
  calibration_due_date: z.union([z.string(), z.date()]).nullable().optional(),
  calibration_certification: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
  is_overdue: z.boolean().optional(),
  days_until_due: z.number().nullable().optional(),
  days_since_calibration: z.number().nullable().optional(),
})

export type CalibrationTesting = z.infer<typeof CalibrationTestingSchema>

export const CalibrationTestingResponseSchema = CalibrationTestingSchema.extend({ id: z.string() })
export type CalibrationTestingResponse = z.infer<typeof CalibrationTestingResponseSchema>

export const CalibrationTestingListResponseSchema = z.object({
  status: z.string().optional(),
  data: z.array(CalibrationTestingResponseSchema),
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
  results: z.array(CalibrationTestingResponseSchema).optional(),
})
export type CalibrationTestingListResponse = z.infer<typeof CalibrationTestingListResponseSchema>

export const CreateCalibrationTestingSchema = CalibrationTestingSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  is_overdue: true,
  days_until_due: true,
  days_since_calibration: true,
})
export type CreateCalibrationTestingData = z.infer<typeof CreateCalibrationTestingSchema>

export const UpdateCalibrationTestingSchema = CreateCalibrationTestingSchema.partial()
export type UpdateCalibrationTestingData = z.infer<typeof UpdateCalibrationTestingSchema>


