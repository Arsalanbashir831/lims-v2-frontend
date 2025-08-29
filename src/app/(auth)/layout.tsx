import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 p-4">
      <div className="mx-auto grid w-full max-w-5xl min-h-[600px] grid-cols-1 overflow-hidden rounded-3xl bg-background shadow-xl md:grid-cols-2">
        {/* Left Side - Branding */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-950 to-gray-950" />
          <div className="relative z-10 flex h-full flex-col items-center justify-between p-10 text-white">
            {/* Logo */}
            <div className="mt-4">
              <Image src="/gripco-logo.webp" alt="GRIPCO" width={160} height={48} className="object-contain" />
            </div>

            {/* Main Content */}
            <div className="mx-auto w-full max-w-md space-y-6 text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Laboratory Information Management</h2>
              <p className="text-sm text-slate-200/90">
              Streamlining lab operations with precision and efficiency. Access your dashboard to manage samples, tests, and reports.</p>
            </div>

            {/* Footer */}
            <div className="pt-2">
              <p className="text-xs text-slate-200/80">© {new Date().getFullYear()} GRIPCO. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}


