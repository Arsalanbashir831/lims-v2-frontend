"use client"

import { PropsWithChildren, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAccessToken } from "@/lib/auth/storage"
import { getHomeRouteForRole } from "@/lib/auth/roles"
import { getUser } from "@/lib/auth/storage"

export function RedirectIfAuthenticated({ children }: PropsWithChildren) {
  const router = useRouter()
  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      const user = getUser<{ role?: string }>()
      router.replace(getHomeRouteForRole(user?.role as any))
    }
  }, [router])
  return <>{children}</>
}


