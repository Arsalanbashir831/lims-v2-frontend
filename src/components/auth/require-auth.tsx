"use client"

import { PropsWithChildren } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { ROUTES } from "@/constants/routes"
import { hasAccessToPath, getHomeRouteForRole } from "@/lib/auth/roles"

interface RequireAuthProps extends PropsWithChildren {
  allowedRoles?: string[]
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only check role-based access if we're authenticated
    if (!isLoading && isAuthenticated && user) {
      const userRole = user.role
      
      // Check if user has access to the current path
      if (!hasAccessToPath(userRole, pathname)) {
        // User doesn't have access to this path, redirect to appropriate dashboard
        const homeRoute = getHomeRouteForRole(userRole as any)
        router.replace(homeRoute)
        return
      }

      // Check if specific roles are required for this component
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // User doesn't have the required role, redirect to appropriate dashboard
        const homeRoute = getHomeRouteForRole(userRole as any)
        router.replace(homeRoute)
        return
      }
    } else if (!isLoading && !isAuthenticated) {
      // Not authenticated, redirect to login
      router.replace(ROUTES.AUTH.LOGIN)
    }
  }, [isAuthenticated, isLoading, user, pathname, router, allowedRoles])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!isAuthenticated || !user) {
    return null
  }

  return <>{children}</>
}


