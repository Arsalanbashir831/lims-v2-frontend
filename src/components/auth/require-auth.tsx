"use client"

import { PropsWithChildren, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getAccessToken } from "@/lib/auth/storage"

export function RequireAuth({ children }: PropsWithChildren) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // skip check on login route
    if (pathname?.startsWith("/login")) {
      setChecked(true)
      return
    }
    if (getAccessToken()) { 
      setChecked(true)
      return 
    }
    router.replace("/login")
  }, [pathname, router])

  // Always render something, never return null
  if (!checked) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  return <>{children}</>
}


