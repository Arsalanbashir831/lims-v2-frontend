"use client"

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

  // Split pathname into segments
  const segments = pathname.split("/").filter(Boolean)
  
  // Check if this is a lab or welders dashboard context
  const isLabContext = segments[0] === "lab"
  const isWeldersContext = segments[0] === "welders"
  
  // Remove the context segment (lab/welders) from processing
  const processedSegments = (isLabContext || isWeldersContext) ? segments.slice(1) : segments
  
  // Handle dashboard routes specifically
  if (processedSegments.length === 1 && processedSegments[0] === "dashboard") {
    return [{ label: "Dashboard" }]
  }

  // Dynamic route mapping for automatic breadcrumb generation
  const routeMappings: Record<string, { label: string; root?: string }> = {
    // Lab routes
    "clients": { label: "Clients" },
    "test-methods": { label: "Test Methods" },
    "proficiency-testing": { label: "Proficiency Testing" },
    "test-reports": { label: "Test Reports" },
    "sample-receiving": { label: "Sample Receiving" },
    "sample-preparation": { label: "Sample Preparation" },
    "sample-details": { label: "Sample Details" },
    "sample-information": { label: "Sample Information" },
    "lab-equipments": { label: "Lab Equipments" },
    "calibration-testing": { label: "Calibration Testing" },
    "discarded-materials": { label: "Material Discards" },
    "tracking-database": { label: "Tracking Database" },
    
    // Welder routes
    "welders": { label: "Welders" },
    "welder-cards": { label: "Welder Cards" },
    "welder-qualification": { label: "Welder Qualification" },
    "operator-performance": { label: "Operator Performance" },
    "testing-reports": { label: "Testing Reports" },
    "pqr": { label: "PQR" },
  }

  // Build breadcrumbs based on processed segments
  const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: "Dashboard", href: isLabContext ? "/lab/dashboard" : isWeldersContext ? "/welders/dashboard" : ROUTES.APP.DASHBOARD }]
  
  if (processedSegments.length === 0) {
    return breadcrumbs
  }

  const firstSegment = processedSegments[0]
  const routeMapping = routeMappings[firstSegment]
  
  if (routeMapping) {
    // Build the root path with context
    const contextPrefix = isLabContext ? "/lab" : isWeldersContext ? "/welders" : ""
    const rootPath = `${contextPrefix}/${firstSegment}`
    
    if (processedSegments.length === 1) {
      // Just the main route (e.g., /lab/clients, /welders/pqr)
      breadcrumbs.push({ label: routeMapping.label })
    } else if (processedSegments.length === 2) {
      // Main route + action (e.g., /lab/clients/new, /welders/pqr/123)
      breadcrumbs.push({ label: routeMapping.label, href: rootPath })
      
      if (processedSegments[1] === "new") {
        breadcrumbs.push({ label: `New ${routeMapping.label.endsWith('s') ? routeMapping.label.slice(0, -1) : routeMapping.label}` })
      } else {
        // It's likely an ID, show a generic label
        breadcrumbs.push({ label: "Details" })
      }
    } else if (processedSegments.length === 3) {
      // Main route + ID + action (e.g., /lab/clients/123/edit, /welders/pqr/123/view)
      breadcrumbs.push({ label: routeMapping.label, href: rootPath })
      breadcrumbs.push({ label: "Details" }) // No href - not clickable
      
      const action = processedSegments[2]
      if (action === "edit") {
        breadcrumbs.push({ label: `Edit ${routeMapping.label.endsWith('s') ? routeMapping.label.slice(0, -1) : routeMapping.label}` })
      } else if (action === "view") {
        breadcrumbs.push({ label: `View ${routeMapping.label.endsWith('s') ? routeMapping.label.slice(0, -1) : routeMapping.label}` })
      } else {
        breadcrumbs.push({ label: toTitle(action) })
      }
    } else if (processedSegments.length === 4) {
      // Main route + ID + sub-action + action (e.g., /lab/clients/123/sub/edit)
      breadcrumbs.push({ label: routeMapping.label, href: rootPath })
      breadcrumbs.push({ label: "Details" }) // No href - not clickable
      breadcrumbs.push({ label: toTitle(processedSegments[2]) })
      breadcrumbs.push({ label: toTitle(processedSegments[3]) })
    }
    
    return breadcrumbs
  }

  // Fallback: generate breadcrumbs dynamically from processed segments
  const contextPrefix = isLabContext ? "/lab" : isWeldersContext ? "/welders" : ""
  let currentPath = contextPrefix
  
  for (let i = 0; i < processedSegments.length; i++) {
    currentPath += `/${processedSegments[i]}`
    const isLast = i === processedSegments.length - 1
    
    if (isLast) {
      // Last segment - no href, just label
      breadcrumbs.push({ label: toTitle(processedSegments[i]) })
    } else {
      // Middle segments - have href for navigation
      breadcrumbs.push({ label: toTitle(processedSegments[i]), href: currentPath })
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


