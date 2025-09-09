"use client"

import { PropsWithChildren, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getHomeRouteForRole } from "@/lib/auth/roles"
import { UserRole } from "@/lib/schemas/user"

export function RedirectIfAuthenticated({ children }: PropsWithChildren) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const homeRoute = getHomeRouteForRole(session.user.role as UserRole)
      router.replace(homeRoute)
    }
  }, [session, status, router])
  
  return <>{children}</>
}


