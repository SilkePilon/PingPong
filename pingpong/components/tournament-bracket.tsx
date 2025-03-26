"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Player {
  id: string
  name: string
  profile_image_url: string | null
}

interface RawMatch {
  id: string
  round: number
  position: number
  tournament_id: string
  player1_id: string | null
  player2_id: string | null
  player1_score: number
  player2_score: number
  status: "pending" | "active" | "completed"
  winner_id: string | null
  player1: Player[] 
  player2: Player[]
}

interface Match {
  id: string
  round: number
  position: number
  tournament_id: string
  player1_id: string | null
  player2_id: string | null
  player1_score: number
  player2_score: number
  status: "pending" | "active" | "completed"
  winner_id: string | null
  player1: Player | null
  player2: Player | null
}

interface BracketProps {
  tournamentId: string
  players: Player[]
  existingMatches?: RawMatch[]
}

const transformMatch = (match: RawMatch): Match => ({
  ...match,
  player1: match.player1?.[0] || null,
  player2: match.player2?.[0] || null
})

export function TournamentBracket({ tournamentId, players, existingMatches = [] }: BracketProps) {
  const [matches, setMatches] = useState<Match[]>(existingMatches.map(transformMatch))
  const [loading, setLoading] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const generateRandomMatches = async () => {
    if (loading) return
    
    try {
      if (!tournamentId) {
        throw new Error("Tournament ID is required")
      }
      
      if (players.length < 2) {
        throw new Error("Need at least 2 players to generate matches")
      }

      setLoading(true)

      // Shuffle players array
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)
      const matchInserts = []
      
      // Create pairs of players
      for (let i = 0; i < shuffledPlayers.length - 1; i += 2) {
        const player1 = shuffledPlayers[i]
        const player2 = shuffledPlayers[i + 1]
        
        if (!player1?.id || !player2?.id) continue

        // Ensure we have all required fields according to the database schema
        const matchInsert = {
          tournament_id: tournamentId,
          player1_id: player1.id,
          player2_id: player2.id,
          player1_score: 0,
          player2_score: 0,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        matchInserts.push(matchInsert)
      }

      if (matchInserts.length === 0) {
        throw new Error("No valid player pairs could be created")
      }

      // Insert matches into database
      const { data: createdMatches, error } = await supabase
        .from("matches")
        .insert(matchInserts)
        .select(`
          id,
          tournament_id,
          player1_id,
          player2_id,
          player1_score,
          player2_score,
          status,
          player1:players!player1_id(id, name, profile_image_url),
          player2:players!player2_id(id, name, profile_image_url)
        `)

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      if (!createdMatches || createdMatches.length === 0) {
        throw new Error("No matches were created")
      }

      setMatches((createdMatches as RawMatch[]).map(transformMatch))
      toast({
        title: "Success",
        description: `Created ${createdMatches.length} tournament matches successfully`,
      })

      // Refresh the page to show the new matches
      router.refresh()
    } catch (error) {
      console.error("Error generating matches:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate tournament matches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMatchClick = (match: Match) => {
    if (match.id) {
      router.push(`/matches/${match.id}`)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {matches.length === 0 ? (
        <div className="text-center">
          <Button
            onClick={generateRandomMatches}
            size="lg"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Random Matchups"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-4">
            {matches.filter(match => match.player1_id !== null && match.player2_id !== null).map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleMatchClick(match)}
              >
                <Card className={`cursor-pointer transition-all duration-200 hover:scale-105 
                  ${match.status === "active" ? "border-2 border-blue-500" : ""}
                  ${match.status === "completed" ? 
                    match.winner_id === match.player1_id ? 
                      "border-l-4 border-l-green-500" : 
                      match.winner_id === match.player2_id ? 
                        "border-r-4 border-r-green-500" : "" 
                    : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <AvatarWithFallback
                          src={match.player1?.profile_image_url || null}
                          name={match.player1?.name || "TBD"}
                          className="h-10 w-10"
                        />
                        <div className="font-medium">{match.player1?.name || "TBD"}</div>
                        <div className="text-lg font-bold">{match.player1_score}</div>
                      </div>
                      <div className="text-xl font-bold text-muted-foreground">VS</div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold">{match.player2_score}</div>
                        <div className="font-medium text-right">{match.player2?.name || "TBD"}</div>
                        <AvatarWithFallback
                          src={match.player2?.profile_image_url || null}
                          name={match.player2?.name || "TBD"}
                          className="h-10 w-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}