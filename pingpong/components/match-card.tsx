"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface MatchCardProps {
  match: {
    id: string
    player1: {
      id: string
      name: string
      profile_image_url: string | null
    }
    player2: {
      id: string
      name: string
      profile_image_url: string | null
    }
    player1_score: number
    player2_score: number
    status: string
    created_at: string
  }
  index: number
  onClick?: () => void
}

export function MatchCard({ match, index, onClick }: MatchCardProps) {
  const getStatusBadge = () => {
    switch (match.status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
            Pending
          </Badge>
        )
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden cursor-pointer" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">{formatDate(match.created_at)}</div>
            {getStatusBadge()}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <AvatarWithFallback
                src={match.player1.profile_image_url}
                name={match.player1.name}
                className="h-12 w-12 md:h-16 md:w-16"
              />
              <div className="mt-2 text-center">
                <p className="font-medium truncate max-w-[100px]">{match.player1.name}</p>
                <p className="text-2xl font-bold">{match.player1_score}</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-muted-foreground">VS</div>
            </div>

            <div className="flex flex-col items-center">
              <AvatarWithFallback
                src={match.player2.profile_image_url}
                name={match.player2.name}
                className="h-12 w-12 md:h-16 md:w-16"
              />
              <div className="mt-2 text-center">
                <p className="font-medium truncate max-w-[100px]">{match.player2.name}</p>
                <p className="text-2xl font-bold">{match.player2_score}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

