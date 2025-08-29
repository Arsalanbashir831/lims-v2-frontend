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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {sent ? "Check your email" : "Reset your password"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {sent 
            ? "We've sent you a password reset link" 
            : "Enter your email and we'll send you a reset link"
          }
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          {sent ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  If an account with that email exists, we've sent a password reset link.
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your spam folder if you don't see it in your inbox.
                </p>
              </div>
              <Button asChild className="w-full h-11">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    className="pl-10 h-11" 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium" 
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
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


