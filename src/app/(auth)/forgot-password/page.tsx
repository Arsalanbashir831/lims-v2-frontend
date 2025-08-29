"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: call Django password reset endpoint
    setTimeout(() => {
      setIsLoading(false)
      setSent(true)
    }, 1000)
  }

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-6 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {sent ? "Check your email" : "Reset your password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {sent 
            ? "We've sent you a password reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>
      </div>

      {/* Form Card */}
          {sent ? (
            <div className="space-y-6 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>If an account with that email exists, we've sent a password reset link.</p>
                <p>Check your spam folder if you don't see it in your inbox.</p>
              </div>
              <Button asChild className="h-11 w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    className="h-11 pl-10" 
                    required 
                  />
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
                    Sending...
                  </div>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}

      {!sent && (
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}


