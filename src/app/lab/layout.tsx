import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { QueryProvider } from "@/components/ui/query-provider"
import { RequireAuth } from "@/components/auth/require-auth"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // <QueryProvider>
      <RequireAuth>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 mx-2 my-4 bg-background rounded-2xl overflow-hidden shadow">
            <AppHeader />
            <div className="p-2 md:p-6">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </RequireAuth>
    // </QueryProvider>
  )
}


