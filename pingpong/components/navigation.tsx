"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Users, Activity } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  // Don't show navigation on admin pages
  if (pathname.startsWith("/admin")) {
    return null
  }

  const links = [
    {
      href: "/",
      icon: Users,
      label: "Players",
      active: pathname === "/",
    },
    {
      href: "/tournaments",
      icon: Trophy,
      label: "Tournaments",
      active: pathname === "/tournaments" || pathname.startsWith("/tournaments/"),
    },
    {
      href: "/matches",
      icon: Activity,
      label: "Matches",
      active: pathname === "/matches" || pathname.startsWith("/matches/"),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-background border-t">
      <div className="container mx-auto">
        <div className="flex justify-around items-center h-16">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full text-xs ${
                link.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <link.icon className="h-5 w-5 mb-1" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

