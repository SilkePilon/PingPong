"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback"

interface Tournament {
  id: string
  name: string
}

export function AddPlayerForm() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<string>("")
  const [playerName, setPlayerName] = useState("")
  const [playerEmail, setPlayerEmail] = useState("")
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [addingPlayer, setAddingPlayer] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select("id, name")
          .order("created_at", { ascending: false })

        if (error) throw error

        setTournaments(data || [])
      } catch (error) {
        console.error("Error fetching tournaments:", error)
        toast({
          title: "Error",
          description: "Failed to load tournaments",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [supabase, toast])

  const addPlayer = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Error",
        description: "Player name is required",
        variant: "destructive",
      })
      return
    }

    if (!selectedTournament) {
      toast({
        title: "Error",
        description: "Please select a tournament",
        variant: "destructive",
      })
      return
    }

    setAddingPlayer(true)

    try {
      // Add player
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .insert({
          name: playerName.trim(),
          email: playerEmail.trim() || null,
          profile_image_url: profileImageUrl.trim() || null,
          tournament_id: selectedTournament,
        })
        .select("id")
        .single()

      if (playerError) throw playerError

      // Initialize player stats
      await supabase.from("player_stats").insert({
        player_id: playerData.id,
      })

      // Add player to tournament_players junction table
      await supabase.from("tournament_players").insert({
        tournament_id: selectedTournament,
        player_id: playerData.id,
      })

      toast({
        title: "Success",
        description: "Player added successfully",
      })

      // Reset form
      setPlayerName("")
      setPlayerEmail("")
      setProfileImageUrl("")
    } catch (error) {
      console.error("Error adding player:", error)
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
      })
    } finally {
      setAddingPlayer(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tournaments available. Create a tournament first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tournament">Tournament</Label>
        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
          <SelectTrigger>
            <SelectValue placeholder="Select a tournament" />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map((tournament) => (
              <SelectItem key={tournament.id} value={tournament.id}>
                {tournament.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Enter player name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter player email"
          value={playerEmail}
          onChange={(e) => setPlayerEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profileImage">Profile Image URL (optional)</Label>
        <Input
          id="profileImage"
          placeholder="Enter profile image URL"
          value={profileImageUrl}
          onChange={(e) => setProfileImageUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">If no image is provided, initials will be used</p>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <div className="flex-shrink-0">
          <AvatarWithFallback name={playerName || "New Player"} src={profileImageUrl || null} className="h-16 w-16" />
        </div>
        <div>
          <p className="font-medium">{playerName || "New Player"}</p>
          <p className="text-sm text-muted-foreground">Preview</p>
        </div>
      </div>

      <Button
        onClick={addPlayer}
        disabled={addingPlayer || !playerName.trim() || !selectedTournament}
        className="w-full"
      >
        {addingPlayer ? "Adding..." : "Add Player"}
      </Button>
    </div>
  )
}

