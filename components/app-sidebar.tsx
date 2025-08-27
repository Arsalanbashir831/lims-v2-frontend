"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, FlaskConical, Microscope, ClipboardList, FileText, Archive, Route, BookOpenText } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/tests/methods", label: "Test Methods", icon: FlaskConical },
  { href: "/lab-equipments", label: "Lab Equipments", icon: Microscope },
  { href: "/tests/proficiency", label: "Proficiency Testing", icon: ClipboardList },
  { href: "/tests/calibration", label: "Calibration Testing", icon: ClipboardList },
  { href: "/samples/receiving", label: "Sample Receiving", icon: FileText },
  { href: "/samples/preparation-requests", label: "Sample Preparation", icon: FileText },
  { href: "/test-reports", label: "Test Reports", icon: FileText },
  { href: "/material-discards", label: "Material Discards", icon: Archive },
  { href: "/tracking", label: "Tracking Database", icon: Route },
  { href: "/pqr", label: "PQR Records", icon: BookOpenText },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2 text-sm font-semibold">LIMS</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname?.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-3 text-xs text-muted-foreground">v0.1.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}


