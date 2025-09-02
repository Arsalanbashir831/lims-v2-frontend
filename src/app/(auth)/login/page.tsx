"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, UserRound, BadgeCheck, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"supervisor" | "inspector" | "welder" | null>("supervisor")

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: integrate Django auth endpoint
    setTimeout(() => {
      setIsLoading(false)
      // Redirect based on role
      if (role === "welder") {
        window.location.href = "/welders/dashboard"
      } else {
        window.location.href = "/dashboard"
      }
    }, 1000)
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
              <Label htmlFor="userid" className="text-sm font-medium">User ID</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="userid" type="text" placeholder="Enter your User ID" className="h-11 pl-10" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="password" 
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

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Role</Label>
              <Select value={role || ""} onValueChange={(value) => setRole(value as "supervisor" | "inspector" | "welder")}>
                <SelectTrigger className="h-11">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select your role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="inspector">Inspector</SelectItem>
                  <SelectItem value="welder">Welder</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="text-center text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">Forgot Password?</Link>
            </div>
          </form>
    </div>
  )
}


