import { z } from 'zod'

export const ClientSchema = z.object({
  id: z.string().optional(),
  client_name: z.string().min(1, "Name is required"),
  phone: z.string().nullable().optional(),
  contact_person: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]).nullable().optional(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
})

export type Client = z.infer<typeof ClientSchema>

// For API responses (with MongoDB _id as id)
export const ClientResponseSchema = ClientSchema.extend({
  id: z.string(),
})

export type ClientResponse = z.infer<typeof ClientResponseSchema>

// For list responses
export const ClientListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(ClientResponseSchema),
})

export type ClientListResponse = z.infer<typeof ClientListResponseSchema>

// For creating clients
export const CreateClientSchema = ClientSchema.omit({
  id: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
})

export type CreateClientData = z.infer<typeof CreateClientSchema>

// For updating clients
export const UpdateClientSchema = CreateClientSchema.partial()

export type UpdateClientData = z.infer<typeof UpdateClientSchema>
