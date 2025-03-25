"use client"

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Activity, Edit, CheckCircle, XCircle, Clock } from "lucide-react"
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback"
import { format } from "date-fns"

interface Player {
  name: string;
  profile_image_url: string | null;
}

interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  status: string;
  created_at: string;
  player1: Player;
  player2: Player;
}

export const MatchManagement = forwardRef((props, ref) => {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMatch, setEditingMatch] = useState<string | null>(null)
  const [player1Score, setPlayer1Score] = useState<number>(0)
  const [player2Score, setPlayer2Score] = useState<number>(0)
  const [updatingMatch, setUpdatingMatch] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    try {
      const { data: rawData, error } = await supabase
        .from("matches")
        .select(`
          id, 
          player1_id, 
          player2_id, 
          player1_score, 
          player2_score, 
          status, 
          created_at,
          player1:players!player1_id(name, profile_image_url),
          player2:players!player2_id(name, profile_image_url)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
      const transformedData = rawData?.map(match => ({
        ...match,
        player1: Array.isArray(match.player1) 
          ? match.player1[0] || { name: "Unknown", profile_image_url: null }
          : match.player1 || { name: "Unknown", profile_image_url: null },
        player2: Array.isArray(match.player2)
          ? match.player2[0] || { name: "Unknown", profile_image_url: null }
          : match.player2 || { name: "Unknown", profile_image_url: null }
      })) as Match[]

      setMatches(transformedData || [])
    } catch (error) {
      console.error("Error fetching matches:", error)
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Expose fetchMatches method via ref
  useImperativeHandle(ref, () => ({
    fetchMatches
  }))

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const handleEdit = (match: Match) => {
    setEditingMatch(match.id)
    setPlayer1Score(match.player1_score)
    setPlayer2Score(match.player2_score)
  }

  const handleCancel = () => {
    setEditingMatch(null)
    setPlayer1Score(0)
    setPlayer2Score(0)
  }

  const handleSave = async (matchId: string) => {
    if (player1Score < 0 || player2Score < 0) {
      toast({
        title: "Error",
        description: "Scores cannot be negative",
        variant: "destructive",
      })
      return
    }

    setUpdatingMatch(true)

    try {
      // Determine the match status based on scores
      let status = "active"
      if (player1Score >= 11 && player1Score - player2Score >= 2) {
        status = "completed"
      } else if (player2Score >= 11 && player2Score - player1Score >= 2) {
        status = "completed"
      }

      const { error } = await supabase
        .from("matches")
        .update({
          player1_score: player1Score,
          player2_score: player2Score,
          status: status
        })
        .eq("id", matchId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Match scores updated successfully",
      })

      // Reset editing state
      setEditingMatch(null)
      setPlayer1Score(0)
      setPlayer2Score(0)

      // Refresh matches
      fetchMatches()
    } catch (error) {
      console.error("Error updating match:", error)
      toast({
        title: "Error",
        description: "Failed to update match scores",
        variant: "destructive",
      })
    } finally {
      setUpdatingMatch(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        )
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>Active</span>
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDatetime = (datetimeString: string) => {
    return format(new Date(datetimeString), "MMM d, yyyy 'at' h:mm a")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No matches found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Match {match.id.slice(0, 8)}
            </CardTitle>
            {getStatusBadge(match.status)}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">
                  Created: {formatDatetime(match.created_at)}
                </div>
                <div className="flex items-center justify-between md:justify-around">
                  <div className="flex flex-col items-center space-y-2">
                    <AvatarWithFallback
                      src={match.player1?.profile_image_url}
                      name={match.player1?.name}
                      className="h-16 w-16"
                    />
                    <span className="font-semibold">{match.player1?.name}</span>
                    {editingMatch === match.id ? (
                      <Input
                        type="number"
                        value={player1Score}
                        onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="0"
                      />
                    ) : (
                      <div className="text-2xl font-bold">{match.player1_score}</div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground">VS</div>
                  <div className="flex flex-col items-center space-y-2">
                    <AvatarWithFallback
                      src={match.player2?.profile_image_url}
                      name={match.player2?.name}
                      className="h-16 w-16"
                    />
                    <span className="font-semibold">{match.player2?.name}</span>
                    {editingMatch === match.id ? (
                      <Input
                        type="number"
                        value={player2Score}
                        onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="0"
                      />
                    ) : (
                      <div className="text-2xl font-bold">{match.player2_score}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex md:flex-col justify-center gap-2">
                {editingMatch === match.id ? (
                  <>
                    <Button
                      onClick={() => handleSave(match.id)}
                      disabled={updatingMatch}
                      className="flex items-center gap-1"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex items-center gap-1"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleEdit(match)}
                    variant="outline"
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                    Update Scores
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/matches/${match.id}`)}
                  variant="ghost"
                  size="sm"
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})