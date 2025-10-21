import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
// import { AuthProvider } from "@/lib/auth/auth-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "GRIPCO LIMS",
  description: "Laboratory Information Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <QueryProvider>
          <AuthSessionProvider>
          {/* <AuthProvider> */}
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <Toaster position="top-right" richColors />
            </ThemeProvider>
          {/* </AuthProvider> */}
          </AuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
