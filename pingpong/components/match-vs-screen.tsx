"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface MatchVsScreenProps {
  matchId: string
  isAdmin?: boolean
}

interface Player {
  id: string
  name: string
  profile_image_url: string | null
}

interface Match {
  id: string
  player1_id: string
  player2_id: string
  player1_score: number
  player2_score: number
  status: string
  player1: Player
  player2: Player
}

export function MatchVsScreen({ matchId, isAdmin = false }: MatchVsScreenProps) {
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select(`
            id, 
            player1_id, 
            player2_id, 
            player1_score, 
            player2_score, 
            status,
            player1:player1_id(id, name, profile_image_url),
            player2:player2_id(id, name, profile_image_url)
          `)
          .eq("id", matchId)
          .single()

        if (error) throw error

        if (data) {
          setMatch(data as unknown as Match)

          // If match is pending, set it to active
          if (data.status === "pending") {
            await supabase.from("matches").update({ status: "active" }).eq("id", matchId)

            setMatch((prev) => (prev ? { ...prev, status: "active" } : null))
          }
        }
      } catch (error) {
        console.error("Error fetching match:", error)
        toast({
          title: "Error",
          description: "Failed to load match details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMatch()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`match_${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMatch = payload.new as any
          setMatch((prev) => {
            if (!prev) return null
            return {
              ...prev,
              player1_score: updatedMatch.player1_score,
              player2_score: updatedMatch.player2_score,
              status: updatedMatch.status,
            }
          })
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [matchId, supabase, toast])

  const updateScore = async (playerId: string, increment: boolean) => {
    if (!match) return

    try {
      const isPlayer1 = playerId === match.player1_id
      const scoreField = isPlayer1 ? "player1_score" : "player2_score"
      const currentScore = isPlayer1 ? match.player1_score : match.player2_score

      // Don't allow negative scores
      if (!increment && currentScore <= 0) return

      const newScore = increment ? currentScore + 1 : currentScore - 1

      await supabase
        .from("matches")
        .update({ [scoreField]: newScore })
        .eq("id", match.id)

      // Update local state for immediate feedback
      setMatch((prev) => {
        if (!prev) return null
        return {
          ...prev,
          [scoreField]: newScore,
        }
      })
    } catch (error) {
      console.error("Error updating score:", error)
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      })
    }
  }

  const endMatch = async () => {
    if (!match) return

    try {
      const winnerId =
        match.player1_score > match.player2_score
          ? match.player1_id
          : match.player2_score > match.player1_score
            ? match.player2_id
            : null // Tie

      await supabase
        .from("matches")
        .update({
          status: "completed",
          winner_id: winnerId,
        })
        .eq("id", match.id)

      // Update player stats
      if (winnerId) {
        // Update winner stats
        await supabase.rpc("increment_player_stats", {
          p_id: winnerId,
          matches_played_inc: 1,
          matches_won_inc: 1,
          points_scored_inc: winnerId === match.player1_id ? match.player1_score : match.player2_score,
        })

        // Update loser stats
        const loserId = winnerId === match.player1_id ? match.player2_id : match.player1_id
        await supabase.rpc("increment_player_stats", {
          p_id: loserId,
          matches_played_inc: 1,
          matches_won_inc: 0,
          points_scored_inc: loserId === match.player1_id ? match.player1_score : match.player2_score,
        })
      } else {
        // In case of a tie, update both players
        await supabase.rpc("increment_player_stats", {
          p_id: match.player1_id,
          matches_played_inc: 1,
          matches_won_inc: 0,
          points_scored_inc: match.player1_score,
        })

        await supabase.rpc("increment_player_stats", {
          p_id: match.player2_id,
          matches_played_inc: 1,
          matches_won_inc: 0,
          points_scored_inc: match.player2_score,
        })
      }

      toast({
        title: "Match Completed",
        description: winnerId
          ? `Winner: ${winnerId === match.player1_id ? match.player1.name : match.player2.name}`
          : "Match ended in a tie",
      })

      // Redirect to matches page
      router.push("/matches")
    } catch (error) {
      console.error("Error ending match:", error)
      toast({
        title: "Error",
        description: "Failed to end match",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Match not found</h2>
        <Button variant="link" onClick={() => router.push("/matches")} className="mt-4">
          Back to Matches
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 left-0 z-10"
        onClick={() => router.push("/matches")}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">
            {match.status === "active"
              ? "Match in Progress"
              : match.status === "completed"
                ? "Match Completed"
                : "Match Preview"}
          </h1>
        </motion.div>

        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          {/* Player 1 */}
          <motion.div
            className="flex-1 flex flex-col items-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AvatarWithFallback
              src={match.player1.profile_image_url}
              name={match.player1.name}
              className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary shadow-lg"
            />
            <h2 className="mt-4 text-2xl font-bold">{match.player1.name}</h2>
            <div className="mt-2 text-5xl font-bold">{match.player1_score}</div>

            {isAdmin && match.status === "active" && (
              <div className="mt-6 flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => updateScore(match.player1_id, false)}
                  disabled={match.player1_score <= 0}
                >
                  -
                </Button>
                <Button variant="default" size="lg" onClick={() => updateScore(match.player1_id, true)}>
                  +
                </Button>
              </div>
            )}
          </motion.div>

          {/* VS */}
          <motion.div
            className="flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <div className="text-4xl md:text-6xl font-extrabold text-muted-foreground">VS</div>
              <AnimatePresence>
                {match.status === "active" && (
                  <motion.div
                    className="absolute -top-4 -right-4 h-4 w-4 rounded-full bg-green-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Player 2 */}
          <motion.div
            className="flex-1 flex flex-col items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AvatarWithFallback
              src={match.player2.profile_image_url}
              name={match.player2.name}
              className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary shadow-lg"
            />
            <h2 className="mt-4 text-2xl font-bold">{match.player2.name}</h2>
            <div className="mt-2 text-5xl font-bold">{match.player2_score}</div>

            {isAdmin && match.status === "active" && (
              <div className="mt-6 flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => updateScore(match.player2_id, false)}
                  disabled={match.player2_score <= 0}
                >
                  -
                </Button>
                <Button variant="default" size="lg" onClick={() => updateScore(match.player2_id, true)}>
                  +
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {isAdmin && match.status === "active" && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button variant="destructive" size="lg" onClick={endMatch}>
              End Match
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

