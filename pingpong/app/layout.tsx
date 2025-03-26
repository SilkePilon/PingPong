import type React from "react"
import "./globals.css"
import { SupabaseProvider } from "@/components/supabase-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AdminAuthProvider } from "@/components/admin-auth-provider"
import { NavigationProgress } from "@/components/navigation-progress"

export const metadata = {
  title: "Ping Pong Tournament",
  description: "A tournament management system for ping pong matches",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <AdminAuthProvider>
              <NavigationProgress />
              {children}
              <Toaster />
            </AdminAuthProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}