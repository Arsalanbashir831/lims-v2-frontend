import { ROUTES } from "@/constants/routes"
import type { UserRole } from "./store"

export const ROLES = {
  SUPERVISOR: "supervisor",
  INSPECTOR: "inspector",
  WELDER: "welder",
  LAB_MANAGER: "lab_manager",
} as const

export function getHomeRouteForRole(role?: UserRole): string {
  switch (role) {
    case ROLES.WELDER:
      return ROUTES.APP.WELDERS.DASHBOARD
    case ROLES.SUPERVISOR:
    case ROLES.INSPECTOR:
    case ROLES.LAB_MANAGER:
    default:
      return ROUTES.APP.DASHBOARD
  }
}

export function hasAnyRole(role: UserRole | undefined, allowed: UserRole[]): boolean {
  if (!role) return false
  return allowed.includes(role)
}


