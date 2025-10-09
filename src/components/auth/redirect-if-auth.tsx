"use client"

import { PropsWithChildren, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getHomeRouteForRole } from "@/lib/auth/roles"
import { UserRole } from "@/lib/schemas/user"

export function RedirectIfAuthenticated({ children }: PropsWithChildren) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role) {
      const homeRoute = getHomeRouteForRole(user.role as UserRole)
      router.replace(homeRoute)
    }
  }, [user, isAuthenticated, isLoading, router])
  
  return <>{children}</>
}


