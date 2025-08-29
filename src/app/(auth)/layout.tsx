import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 text-white p-8">
        <div className="w-full h-full flex flex-col justify-between items-center">
          {/* Logo */}
          <div className="mb-8">
           <Image src="/gripco-logo.webp" alt="GRIPCO" width={300} height={100} className="object-contain" />
          </div>
          
          {/* Main Content */}
          <div className="space-y-6 text-center self-center justify-self-center">
            <h1 className="text-4xl font-bold leading-tight">
              Laboratory Information Management
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Streamlining lab operations with precision and efficiency. Access your dashboard to manage samples, tests, and reports.
            </p>
          </div>
          
          {/* Footer */}
          <div className="pt-8">
            <p className="text-sm text-slate-400">© {new Date().getFullYear()} GRIPCO. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}


