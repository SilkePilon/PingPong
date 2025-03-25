"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback"
import { Trophy, Award, Target } from "lucide-react"

interface PlayerStats {
  matches_played: number
  matches_won: number
  total_points_scored: number
}

interface PlayerCardProps {
  player: {
    id: string
    name: string
    profile_image_url: string | null
  }
  stats: PlayerStats
  index: number
}

export function PlayerCard({ player, stats, index }: PlayerCardProps) {
  const winRate = stats.matches_played > 0 ? Math.round((stats.matches_won / stats.matches_played) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden h-full">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <AvatarWithFallback name={player.name} src={player.profile_image_url} className="h-12 w-12" />
          <div>
            <h3 className="font-medium">{player.name}</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <Trophy className="h-4 w-4 mb-1 text-muted-foreground" />
              <span className="text-lg font-semibold">{stats.matches_won}</span>
              <span className="text-xs text-muted-foreground">Wins</span>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-4 w-4 mb-1 text-muted-foreground" />
              <span className="text-lg font-semibold">{winRate}%</span>
              <span className="text-xs text-muted-foreground">Win Rate</span>
            </div>
            <div className="flex flex-col items-center">
              <Target className="h-4 w-4 mb-1 text-muted-foreground" />
              <span className="text-lg font-semibold">{stats.total_points_scored}</span>
              <span className="text-xs text-muted-foreground">Points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

