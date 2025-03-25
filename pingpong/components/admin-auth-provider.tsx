"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminPinAuth } from "@/components/admin-pin-auth"

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated
    const adminAuth = localStorage.getItem("adminAuth")
    setIsAuthenticated(adminAuth === "true")
    setIsLoading(false)
  }, [])

  // If not on admin page, render children
  if (!pathname.startsWith("/admin")) {
    return <>{children}</>
  }

  // If on admin login page, render children
  if (pathname === "/admin") {
    return <>{children}</>
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated and on admin page, show auth screen
  if (!isAuthenticated) {
    return <AdminPinAuth />
  }

  // If authenticated, render children
  return <>{children}</>
}

