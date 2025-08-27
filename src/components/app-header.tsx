"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ROUTES } from "@/constants/routes"

function toTitle(s: string) {
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
}

function getPageTitle(pathname: string): string {
  if (pathname === "/" || pathname === ROUTES.APP.DASHBOARD) return "Dashboard"

  // Test Methods routes
  if (pathname.startsWith(ROUTES.APP.TEST_METHODS.ROOT)) {
    if (pathname === ROUTES.APP.TEST_METHODS.NEW) return "New Test Method"
    if (pathname.endsWith("/edit")) return "Edit Test Method"
    return "Test Methods"
  }

  // Proficiency Testing routes
  if (pathname.startsWith(ROUTES.APP.PROFICIENCY_TESTING.ROOT)) {
    if (pathname === ROUTES.APP.PROFICIENCY_TESTING.NEW) return "New Proficiency Testing"
    if (pathname.endsWith("/edit")) return "Edit Proficiency Testing"
    return "Proficiency Testing"
  }

  // Fallback: derive from last segment
  const parts = pathname.split("/").filter(Boolean)
  const last = parts[parts.length - 1] ?? ""
  return toTitle(last)
}

export function AppHeader() {
  const pathname = usePathname() || "/"
  const title = getPageTitle(pathname)

  return (
    <div className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/ias-logo.webp" alt="IAS" width={120} height={28} className="h-8 w-auto object-contain" />
        </div>
      </div>
    </div>
  )
}


