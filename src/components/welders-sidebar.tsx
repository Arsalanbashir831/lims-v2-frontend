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
import { Home, Award, Users, CreditCard, FileText, BookOpenText, UserPlus } from "lucide-react"
import { ROUTES } from "@/constants/routes"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { useTheme } from "next-themes"
import { LogoutButton } from "@/components/logout-button"
import Image from "next/image"

const navItems = [
  { href: ROUTES.APP.WELDERS.DASHBOARD, label: "Dashboard", icon: Home },
  { href: ROUTES.APP.WELDERS.WELDERS, label: "Welders", icon: UserPlus },
  { href: ROUTES.APP.WELDERS.WELDER_CARDS.ROOT, label: "Welder Card", icon: CreditCard },
  { href: ROUTES.APP.WELDERS.WELDER_QUALIFICATION.ROOT, label: "Welder Qualification Certificate", icon: Award },
  { href: ROUTES.APP.WELDERS.OPERATOR_PERFORMANCE.ROOT, label: "Operator Performance Certificate", icon: Users },
  { href: ROUTES.APP.WELDERS.TESTING_REPORTS.ROOT, label: "Testing Reports", icon: FileText },
  { href: ROUTES.APP.WELDERS.PQR.ROOT, label: "PQR Records", icon: BookOpenText },
]

export function WeldersSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

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
          <span className="text-xs">Welders Dashboard v1.0.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
