import { ROUTES } from "@/constants/routes"
import { UserRoleSchema } from "@/lib/schemas/user"
import { z } from "zod"

export type UserRole = z.infer<typeof UserRoleSchema>

export function getHomeRouteForRole(role?: UserRole): string {
  switch (role) {
    case UserRoleSchema.enum.welder:
      return ROUTES.APP.WELDERS.DASHBOARD
    case UserRoleSchema.enum.supervisor:
    case UserRoleSchema.enum.inspector:
    case UserRoleSchema.enum.lab_manager:
    default:
      return ROUTES.APP.DASHBOARD
  }
}

export function hasAnyRole(role: UserRole | undefined, allowed: UserRole[]): boolean {
  if (!role) return false
  return allowed.includes(role)
}


