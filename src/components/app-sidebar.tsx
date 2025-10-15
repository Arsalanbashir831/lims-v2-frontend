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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Home, FlaskConical, Microscope, ClipboardList, FileText, Route, ChevronDown, ChevronRight, Users, Wrench } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { useTheme } from "next-themes"
import { LogoutButton } from "@/components/logout-button"
import Image from "next/image"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

const navItems = [
  { href: ROUTES.APP.DASHBOARD, label: "Dashboard", icon: Home },
  { href: ROUTES.APP.CLIENTS.ROOT, label: "Clients", icon: Users },
  { href: ROUTES.APP.TEST_METHODS.ROOT, label: "Test Methods", icon: FlaskConical },
  { href: ROUTES.APP.LAB_EQUIPMENTS.ROOT, label: "Lab Equipments", icon: Microscope },
  { 
    label: "Testing", 
    icon: ClipboardList,
    items: [
      { href: ROUTES.APP.PROFICIENCY_TESTING.ROOT, label: "Proficiency Testing" },
      { href: ROUTES.APP.CALIBRATION_TESTING.ROOT, label: "Calibration Testing" },
    ]
  },
  { 
    label: "Sample Management", 
    icon: FileText,
    items: [
      // { href: ROUTES.APP.SAMPLE_RECEIVING.ROOT, label: "Sample Receiving" },
      { href: ROUTES.APP.SAMPLE_INFORMATION.ROOT, label: "Sample Information" },
      { href: ROUTES.APP.SAMPLE_DETAILS.NEW, label: "Sample Details" },
      { href: ROUTES.APP.SAMPLE_PREPARATION.ROOT, label: "Sample Preparation" },
    ]
  },
  { href: ROUTES.APP.TEST_REPORTS.ROOT, label: "Test Reports", icon: FileText },
  // { href: ROUTES.APP.MATERIAL_DISCARDS.ROOT, label: "Material Discards", icon: Archive },
  { href: ROUTES.APP.TRACKING_DATABASE, label: "Tracking Database", icon: Route },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const { user } = useAuth()

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionLabel) 
        ? prev.filter(label => label !== sectionLabel)
        : [...prev, sectionLabel]
    )
  }

  const renderNavItem = (item: { href?: string; label: string; icon: React.ElementType; items?: { href: string; label: string }[] }) => {
    if (item.items) {
      // This is a dropdown item
      const isActive = item.items.some((subItem: { href: string }) => pathname?.startsWith(subItem.href))
      const isExpanded = expandedSections.includes(item.label)
      
      return (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton 
            onClick={() => toggleSection(item.label)}
            isActive={isActive}
            className="justify-between"
          >
            <div className="flex items-center gap-2">
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </div>
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </SidebarMenuButton>
          
          {isExpanded && (
            <SidebarMenuSub>
              {item.items.map((subItem: { href: string; label: string }) => {
                const isSubActive = pathname?.startsWith(subItem.href)
                return (
                  <SidebarMenuSubItem key={subItem.href}>
                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                      <Link href={subItem.href}>
                        <span>{subItem.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      )
    } else if (item.href) {
      // This is a regular menu item
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
    }
    
    return null
  }

  return (
    <Sidebar className="border-none">
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
              {navItems.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-3 grid gap-3">
          {/* Role-based navigation for admin users */}
          {user?.role === 'admin' && (
            <div className="grid gap-2">
              <div className="text-xs font-medium text-muted-foreground">Switch Dashboard</div>
              <div className="grid gap-1">
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.APP.WELDERS.DASHBOARD} className="justify-start">
                    <Wrench className="size-4" />
                    <span>Welder Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </div>
            </div>
          )}
          
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


