"use client"


import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, UserRound } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { login as loginApi } from "@/lib/api/auth"
import { toast } from "sonner"
import { getHomeRouteForRole } from "@/lib/auth/roles"
import { getUser } from "@/lib/auth/storage"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const { mutateAsync: doLogin } = useMutation({
    mutationFn: (p: { username: string; password: string }) => loginApi(p),
  })

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const username = (form.username as any).value.trim()
    const password = (form.password as any).value
    if (!username || !password) return
    setIsLoading(true)
    try {
      await doLogin({ username, password })
      toast.success("Signed in")
      const role = getUser<{ role?: string }>()?.role as any
      router.push(getHomeRouteForRole(role))
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-6 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign In</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      {/* Login Form */}

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="username" name="username" type="text" placeholder="Enter your Username" className="h-11 pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-11 pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="h-11 w-full text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* For now comment forgot password link */}
        {/* <div className="text-center text-sm">
                <Link href={ROUTES.AUTH.FORGOT_PASSWORD} className="text-primary hover:underline">Forgot Password?</Link>
              </div> */}
      </form>
    </div>
  )
}


