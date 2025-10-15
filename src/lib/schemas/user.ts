import { z } from 'zod'

export const UserRoleSchema = z.enum(['admin', 'welding_coordinator', 'lab_engg'])

export const UserSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: UserRoleSchema,
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  lastLogin: z.date().optional(),
})

export type User = z.infer<typeof UserSchema>
export type UserRole = z.infer<typeof UserRoleSchema>

// For API responses (without password)
export const UserResponseSchema = UserSchema.omit({ password: true })
export type UserResponse = z.infer<typeof UserResponseSchema>

// For registration
export const RegisterUserSchema = UserSchema.omit({ 
  _id: true, 
  isVerified: true, 
  isActive: true, 
  createdAt: true, 
  updatedAt: true, 
  lastLogin: true 
})

export type RegisterUser = z.infer<typeof RegisterUserSchema>

// For login
export const LoginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export type LoginUser = z.infer<typeof LoginUserSchema>
