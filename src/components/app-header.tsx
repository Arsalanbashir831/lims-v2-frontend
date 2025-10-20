"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { ROUTES } from "@/constants/routes"
import Link from "next/link"
import React from "react"

function toTitle(s: string) {
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
}

function getBreadcrumbs(pathname: string): Array<{ label: string; href?: string }> {
  if (pathname === "/" || pathname === ROUTES.APP.DASHBOARD) {
    return [{ label: "Dashboard" }]
  }

  // Dynamic route mapping for automatic breadcrumb generation
  const routeMappings: Record<string, { label: string; root: string }> = {
    "test-methods": { label: "Test Methods", root: ROUTES.APP.TEST_METHODS.ROOT },
    "proficiency-testing": { label: "Proficiency Testing", root: ROUTES.APP.PROFICIENCY_TESTING.ROOT },
    "pqr": { label: "PQR", root: ROUTES.APP.WELDERS.PQR.ROOT },
    "test-reports": { label: "Test Reports", root: ROUTES.APP.TEST_REPORTS.ROOT },
    "sample-receiving": { label: "Sample Receiving", root: ROUTES.APP.SAMPLE_RECEIVING.ROOT },
    "sample-preparation": { label: "Sample Preparation", root: ROUTES.APP.SAMPLE_PREPARATION.ROOT },
    "lab-equipments": { label: "Lab Equipments", root: ROUTES.APP.LAB_EQUIPMENTS.ROOT },
    "calibration-testing": { label: "Calibration Testing", root: ROUTES.APP.CALIBRATION_TESTING.ROOT },
    "discarded-materials": { label: "Material Discards", root: ROUTES.APP.MATERIAL_DISCARDS.ROOT },
    "tracking-database": { label: "Tracking Database", root: ROUTES.APP.TRACKING_DATABASE },
  }

  // Split pathname into segments
  const segments = pathname.split("/").filter(Boolean)
  
  // Check if this is a known route
  const firstSegment = segments[0]
  const routeMapping = routeMappings[firstSegment]
  
  if (routeMapping) {
    const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: "Dashboard", href: ROUTES.APP.DASHBOARD }]
    
    // Add the main section
    if (segments.length === 1) {
      // Just the main route (e.g., /test-methods)
      breadcrumbs.push({ label: routeMapping.label })
    } else if (segments.length === 2) {
      // Main route + action (e.g., /test-methods/new, /test-methods/123)
      breadcrumbs.push({ label: routeMapping.label, href: routeMapping.root })
      
      if (segments[1] === "new") {
        breadcrumbs.push({ label: `New ${routeMapping.label.slice(0, -1)}` })
      } else {
        // It's likely an ID, show a generic label
        breadcrumbs.push({ label: "Details" })
      }
    } else if (segments.length === 3) {
      // Main route + ID + action (e.g., /test-methods/123/edit, /test-methods/123/view)
      breadcrumbs.push({ label: routeMapping.label, href: routeMapping.root })
      breadcrumbs.push({ label: "Details" })
      
      const action = segments[2]
      if (action === "edit") {
        breadcrumbs.push({ label: `Edit ${routeMapping.label}` })
      } else if (action === "view") {
        breadcrumbs.push({ label: `View ${routeMapping.label}` })
      } else {
        breadcrumbs.push({ label: toTitle(action) })
      }
    }
    
    return breadcrumbs
  }

  // Fallback: generate breadcrumbs dynamically from path segments
  const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: "Dashboard", href: ROUTES.APP.DASHBOARD }]
  let currentPath = ""
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const isLast = i === segments.length - 1
    
    if (isLast) {
      // Last segment - no href, just label
      breadcrumbs.push({ label: toTitle(segments[i]) })
    } else {
      // Middle segments - have href for navigation
      breadcrumbs.push({ label: toTitle(segments[i]), href: currentPath })
    }
  }
  
  return breadcrumbs
}

export function AppHeader() {
  const pathname = usePathname() || "/"
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <div className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
          <div className="flex items-center gap-2">
            <img src="/iaslogo.png" alt="IAS" width="120" height="28" className="h-8 w-auto object-contain" />
          </div>
      </div>
    </div>
  )
}


