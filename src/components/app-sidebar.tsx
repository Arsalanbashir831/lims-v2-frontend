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
import { ROUTES } from "@/constants/routes"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { useTheme } from "next-themes"
import { LogoutButton } from "@/components/logout-button"
import Image from "next/image"

const navItems = [
  { href: ROUTES.APP.DASHBOARD, label: "Dashboard", icon: Home },
  { href: ROUTES.APP.TEST_METHODS.ROOT, label: "Test Methods", icon: FlaskConical },
  { href: ROUTES.APP.LAB_EQUIPMENTS, label: "Lab Equipments", icon: Microscope },
  { href: ROUTES.APP.PROFICIENCY_TESTING.ROOT, label: "Proficiency Testing", icon: ClipboardList },
  { href: ROUTES.APP.CALIBRATION_TESTING, label: "Calibration Testing", icon: ClipboardList },
  { href: ROUTES.APP.SAMPLE_RECEIVING.ROOT, label: "Sample Receiving", icon: FileText },
  { href: ROUTES.APP.SAMPLE_PREPARATION, label: "Sample Preparation", icon: FileText },
  { href: ROUTES.APP.TEST_REPORTS, label: "Test Reports", icon: FileText },
  { href: ROUTES.APP.MATERIAL_DISCARDS, label: "Material Discards", icon: Archive },
  { href: ROUTES.APP.TRACKING_DATABASE, label: "Tracking Database", icon: Route },
  { href: ROUTES.APP.PQR.ROOT, label: "PQR Records", icon: BookOpenText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <Sidebar>
      <SidebarHeader>
      <div className="flex items-center gap-2">
          <Image src="/gripco-logo.webp" alt="Gripco" width={120} height={28} className="h-16 w-auto object-contain mx-auto" />
        </div>
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
        <div className="px-2 py-3 grid gap-3">
          <ThemeSwitcher value={(theme as any) ?? "system"} onChange={(t) => setTheme(t)} />
          <div className="flex items-center gap-2">
            <LogoutButton />
          </div>
          <span className="text-xs">Lims Pro v2.0.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}


