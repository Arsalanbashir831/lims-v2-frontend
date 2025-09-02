import { SidebarProvider } from "@/components/ui/sidebar"
import { WeldersSidebar } from "@/components/welders-sidebar"
import { AppHeader } from "@/components/app-header"

export default function WeldersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <WeldersSidebar />
      <main className="flex-1 mx-2 my-4 bg-background rounded-2xl overflow-hidden shadow">
        <AppHeader />
        <div className="p-2 md:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
