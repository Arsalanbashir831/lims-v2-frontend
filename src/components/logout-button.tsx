"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/api/auth"

export function LogoutButton() {
  const router = useRouter()

  const onLogout = () => {
    logout()
    try { window.localStorage.removeItem("lims:test-methods") } catch {}
    router.push("/login")
  }

  return (
    <Button variant="outline" size="sm" aria-label="Logout" onClick={onLogout} className="!border-red-400 text-red-400 !text-sm !font-normal !bg-red-100/50 dark:!bg-red-100/10 w-full hover:!bg-red-100/60 hover:!text-red-500 hover:!border-red-500 cursor-pointer">
      <LogOut className="size-4" /> <span>Logout</span>
    </Button>
  )
}


