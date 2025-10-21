import Image from "next/image"
import { QueryProvider } from "@/components/ui/query-provider"
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-auth"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <RedirectIfAuthenticated>
          <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Login Form */}
            <div className="relative min-h-screen lg:min-h-auto flex flex-col justify-center bg-background">
              {/* Logo at top */}
              <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
                <Image src="/gripco-logo.webp" alt="GRIPCO" width={160} height={48} className="object-contain" />
              </div>
              
              {/* Form Container - Centered */}
              <div className="flex items-center justify-center px-8 lg:px-12 py-16">
                <div className="w-full max-w-md">
                  {children}
                </div>
              </div>
            </div>

            {/* Right Side - Branding with Lab Image */}
            <div className="relative bg-gradient-to-tr from-violet-950 to-gray-950 flex flex-col justify-between p-8 lg:p-12 text-white min-h-screen lg:min-h-auto">
              {/* Laboratory Image */}
              <div className="flex items-center justify-center flex-1 my-8">
                <div className="relative w-full h-64 lg:h-full">
                  <Image 
                    src="/lab.jpg" 
                    alt="Laboratory Equipment" 
                    fill 
                    className="object-cover rounded-lg shadow-lg" 
                    priority
                  />
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4 text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  Laboratory Information Management
                </h1>
                <p className="text-base lg:text-lg text-slate-200/90">
                  Streamlining lab operations with precision and efficiency. Access your dashboard to manage samples, tests, and reports.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center lg:text-left">
                <p className="text-sm text-slate-200/80">© {new Date().getFullYear()} GRIPCO. All rights reserved.</p>
              </div>
            </div>
        </div>
      </RedirectIfAuthenticated>
    </QueryProvider>
  )
}


