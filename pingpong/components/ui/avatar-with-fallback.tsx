"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarWithFallbackProps {
  name: string
  src: string | null
  className?: string
}

export function AvatarWithFallback({ name, src, className = "" }: AvatarWithFallbackProps) {
  // Generate initials from name
  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <Avatar className={className}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}

