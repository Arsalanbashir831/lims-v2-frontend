import { z } from 'zod'

export const CalibrationTestingSchema = z.object({
  id: z.string().optional(),
  equipmentName: z.string().min(1, 'Equipment name is required'),
  equipmentSerial: z.string().nullable().optional(),
  calibrationVendor: z.string().nullable().optional(),
  calibrationDate: z.union([z.string(), z.date()]).nullable().optional(),
  calibrationDueDate: z.union([z.string(), z.date()]).nullable().optional(),
  calibrationCertification: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
})

export type CalibrationTesting = z.infer<typeof CalibrationTestingSchema>

export const CalibrationTestingResponseSchema = CalibrationTestingSchema.extend({ id: z.string() })
export type CalibrationTestingResponse = z.infer<typeof CalibrationTestingResponseSchema>

export const CalibrationTestingListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(CalibrationTestingResponseSchema),
})
export type CalibrationTestingListResponse = z.infer<typeof CalibrationTestingListResponseSchema>

export const CreateCalibrationTestingSchema = CalibrationTestingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CreateCalibrationTestingData = z.infer<typeof CreateCalibrationTestingSchema>

export const UpdateCalibrationTestingSchema = CreateCalibrationTestingSchema.partial()
export type UpdateCalibrationTestingData = z.infer<typeof UpdateCalibrationTestingSchema>


