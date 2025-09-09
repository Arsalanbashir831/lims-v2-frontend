import { z } from 'zod'

export const TestMethodSchema = z.object({
  id: z.string().optional(),
  test_name: z.string().min(1, 'Test name is required'),
  test_description: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
  test_columns: z.array(z.string()).min(1, 'At least one column is required'),
  hasImage: z.boolean().default(false),
  is_active: z.boolean().default(true),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
})

export type TestMethod = z.infer<typeof TestMethodSchema>

export const TestMethodResponseSchema = TestMethodSchema.extend({
  id: z.string(),
})
export type TestMethodResponse = z.infer<typeof TestMethodResponseSchema>

export const TestMethodListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(TestMethodResponseSchema),
})
export type TestMethodListResponse = z.infer<typeof TestMethodListResponseSchema>

export const CreateTestMethodSchema = TestMethodSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CreateTestMethodData = z.infer<typeof CreateTestMethodSchema>

export const UpdateTestMethodSchema = CreateTestMethodSchema.partial()
export type UpdateTestMethodData = z.infer<typeof UpdateTestMethodSchema>


