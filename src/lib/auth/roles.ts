import { ROUTES } from "@/constants/routes"
import { UserRoleSchema } from "@/lib/schemas/user"
import { z } from "zod"

export type UserRole = z.infer<typeof UserRoleSchema>

// Define role-based access control
export const ROLE_ACCESS = {
  admin: {
    allowedPaths: ['/lab', '/welders', '/public'],
    description: 'Can access all application pages'
  },
  welding_coordinator: {
    allowedPaths: ['/welders', '/public'],
    description: 'Can access only welder-related pages'
  },
  lab_engg: {
    allowedPaths: ['/lab', '/public'],
    description: 'Can access only lab-related pages'
  }
}

export function getHomeRouteForRole(role?: UserRole): string {
  switch (role) {
    case 'admin':
      return ROUTES.APP.DASHBOARD
    case 'welding_coordinator':
      return ROUTES.APP.WELDERS.DASHBOARD
    case 'lab_engg':
      return ROUTES.APP.DASHBOARD
    default:
      return ROUTES.AUTH.LOGIN
  }
}

// Helper function to check if user has access to a path
export function hasAccessToPath(userRole: string, pathname: string): boolean {
  const roleConfig = ROLE_ACCESS[userRole as keyof typeof ROLE_ACCESS]
  if (!roleConfig) return false

  return roleConfig.allowedPaths.some(allowedPath => 
    pathname.startsWith(allowedPath)
  )
}

export function hasAnyRole(role: UserRole | undefined, allowed: UserRole[]): boolean {
  if (!role) return false
  return allowed.includes(role)
}


