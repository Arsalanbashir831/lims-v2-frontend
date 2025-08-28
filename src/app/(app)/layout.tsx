import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 mx-2 my-4 bg-background rounded-2xl overflow-hidden shadow">
        <AppHeader />
        <div className="p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}


