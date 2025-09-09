import { RegisterForm } from "@/components/auth/register-form"
import { ROUTES } from "@/constants/routes"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-6 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Register for a new account. Your account will need admin verification.</p>
      </div>
      <RegisterForm />

      <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href={ROUTES.AUTH.LOGIN} className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
    </div>
  )
}
