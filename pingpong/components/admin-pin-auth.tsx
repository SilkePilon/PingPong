"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { motion } from "framer-motion"

// In a real app, this would be stored securely in a database or environment variable
// For demo purposes, we're using a hardcoded PIN
const ADMIN_PIN = "1234"

export function AdminPinAuth() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Check if already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth === "true") {
      setIsAuthenticated(true)
      router.push("/admin/dashboard")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (pin === ADMIN_PIN) {
      // Store authentication in localStorage
      localStorage.setItem("adminAuth", "true")
      setIsAuthenticated(true)
      // Explicitly navigate to dashboard
      router.push("/admin/dashboard")
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
            <CardDescription className="text-center">Enter the admin PIN to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className={`pl-10 ${error ? "border-red-500 animate-shake" : ""}`}
                  maxLength={4}
                />
              </div>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: error ? "auto" : 0,
                  opacity: error ? 1 : 0,
                }}
                className="text-red-500 text-sm mt-2 overflow-hidden"
              >
                Incorrect PIN. Please try again.
              </motion.div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit} disabled={pin.length !== 4}>
              Unlock Admin Access
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

