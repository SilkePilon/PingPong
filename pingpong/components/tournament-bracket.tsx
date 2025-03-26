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

interface Match extends Omit<RawMatch, 'player1' | 'player2'> {
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

      // Calculate number of rounds needed
      const numPlayers = players.length
      const numRounds = Math.ceil(Math.log2(numPlayers))
      const totalMatchesNeeded = Math.pow(2, numRounds) - 1

      // Shuffle players array
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)
      const matchInserts = []
      
      // Create first round matches
      const firstRoundMatches = Math.ceil(numPlayers / 2)
      for (let i = 0; i < firstRoundMatches; i++) {
        const player1 = shuffledPlayers[i * 2]
        const player2 = shuffledPlayers[i * 2 + 1]
        
        if (!player1?.id) continue

        const matchInsert = {
          tournament_id: tournamentId,
          round: 1,
          position: i,
          player1_id: player1.id,
          player2_id: player2?.id || null,
          player1_score: 0,
          player2_score: 0,
          status: "pending" as const,
          winner_id: null
        }
        matchInserts.push(matchInsert)
      }

      // Create placeholder matches for subsequent rounds
      let currentPosition = 0
      for (let round = 2; round <= numRounds; round++) {
        const matchesInRound = Math.pow(2, numRounds - round)
        for (let i = 0; i < matchesInRound; i++) {
          matchInserts.push({
            tournament_id: tournamentId,
            round: round,
            position: currentPosition + i,
            player1_id: null,
            player2_id: null,
            player1_score: 0,
            player2_score: 0,
            status: "pending" as const,
            winner_id: null
          })
        }
        currentPosition += matchesInRound
      }

      // Insert matches into database
      const { data: createdMatches, error } = await supabase
        .from("matches")
        .insert(matchInserts)
        .select(`
          id,
          round,
          position,
          tournament_id,
          player1_id,
          player2_id,
          player1_score,
          player2_score,
          status,
          winner_id,
          player1:players!player1_id(id, name, profile_image_url),
          player2:players!player2_id(id, name, profile_image_url)
        `)
        .order('round', { ascending: true })
        .order('position', { ascending: true })

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
        description: `Created tournament bracket with ${createdMatches.length} matches`,
      })

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

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = []
    }
    acc[match.round].push(match)
    return acc
  }, {} as Record<number, Match[]>)

  const rounds = Object.entries(matchesByRound).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <div className="w-full max-w-[1400px] mx-auto overflow-x-auto">
      {matches.length === 0 ? (
        <div className="text-center">
          <Button
            onClick={generateRandomMatches}
            size="lg"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Tournament Bracket"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-8 p-4 min-w-[800px]">
          {rounds.map(([round, roundMatches]) => (
            <div 
              key={round} 
              className="flex-1"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                minWidth: '250px'
              }}
            >
              <div className="text-center mb-4 font-semibold">
                Round {round}
              </div>
              <div className="space-y-4">
                {roundMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 relative
                        ${match.status === "active" ? "border-2 border-blue-500" : ""}
                        ${match.status === "completed" ? 
                          match.winner_id === match.player1_id ? 
                            "border-l-4 border-l-green-500" : 
                            match.winner_id === match.player2_id ? 
                              "border-r-4 border-r-green-500" : "" 
                          : ""
                        }`}
                      onClick={() => handleMatchClick(match)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <AvatarWithFallback
                                src={match.player1?.profile_image_url || null}
                                name={match.player1?.name || "TBD"}
                                className="h-8 w-8"
                              />
                              <span className="font-medium truncate">{match.player1?.name || "TBD"}</span>
                            </div>
                            <div className="w-8 text-center font-bold">{match.player1_score}</div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <AvatarWithFallback
                                src={match.player2?.profile_image_url || null}
                                name={match.player2?.name || "TBD"}
                                className="h-8 w-8"
                              />
                              <span className="font-medium truncate">{match.player2?.name || "TBD"}</span>
                            </div>
                            <div className="w-8 text-center font-bold">{match.player2_score}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {Number(round) < rounds.length && (
                      <div className="absolute right-0 h-1/2 border-r-2 border-muted-foreground w-4" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}