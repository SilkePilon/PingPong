"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"

export function NavigationProgress() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    let progressInterval: NodeJS.Timeout

    const startNavigation = () => {
      setIsNavigating(true)
      setProgress(0)
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)
    }

    const completeNavigation = () => {
      setProgress(100)
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 200)
      clearInterval(progressInterval)
    }

    window.addEventListener('beforeunload', startNavigation)
    window.addEventListener('load', completeNavigation)

    return () => {
      window.removeEventListener('beforeunload', startNavigation)
      window.removeEventListener('load', completeNavigation)
      clearInterval(progressInterval)
    }
  }, [])

  if (!isNavigating) return null

  return (
    <Progress
      value={progress}
      className="fixed top-0 left-0 right-0 z-50 h-1 rounded-none bg-muted"
    />
  )
}