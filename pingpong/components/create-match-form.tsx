"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Player {
  id: string
  name: string
  profile_image_url: string | null
}

export function CreateMatchForm() {
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlayer1, setSelectedPlayer1] = useState<Player | null>(null)
  const [selectedPlayer2, setSelectedPlayer2] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingMatch, setCreatingMatch] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase.from("players").select("id, name, profile_image_url").order("name")

        if (error) throw error

        setPlayers(data || [])
        setFilteredPlayers(data || [])
      } catch (error) {
        console.error("Error fetching players:", error)
        toast({
          title: "Error",
          description: "Failed to load players",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [supabase, toast])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlayers(players)
    } else {
      const filtered = players.filter((player) => player.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredPlayers(filtered)
    }
  }, [searchQuery, players])

  const handlePlayerSelect = (player: Player, playerNumber: 1 | 2) => {
    if (playerNumber === 1) {
      // If player is already selected as player 2, swap them
      if (selectedPlayer2 && selectedPlayer2.id === player.id) {
        setSelectedPlayer2(selectedPlayer1)
      }
      setSelectedPlayer1(player)
    } else {
      // If player is already selected as player 1, swap them
      if (selectedPlayer1 && selectedPlayer1.id === player.id) {
        setSelectedPlayer1(selectedPlayer2)
      }
      setSelectedPlayer2(player)
    }
  }

  const createMatch = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      toast({
        title: "Error",
        description: "Please select two players",
        variant: "destructive",
      })
      return
    }

    if (selectedPlayer1.id === selectedPlayer2.id) {
      toast({
        title: "Error",
        description: "Please select two different players",
        variant: "destructive",
      })
      return
    }

    setCreatingMatch(true)

    try {
      const { data, error } = await supabase
        .from("matches")
        .insert({
          player1_id: selectedPlayer1.id,
          player2_id: selectedPlayer2.id,
          player1_score: 0,
          player2_score: 0,
          status: "pending",
        })
        .select("id")
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Match created successfully",
      })

      // Redirect to the match page
      router.push(`/matches/${data.id}`)
    } catch (error) {
      console.error("Error creating match:", error)
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive",
      })
    } finally {
      setCreatingMatch(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="player1" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="player1" disabled={!!selectedPlayer1}>
            {selectedPlayer1 ? selectedPlayer1.name : "Select Player 1"}
          </TabsTrigger>
          <TabsTrigger value="player2" disabled={!!selectedPlayer2}>
            {selectedPlayer2 ? selectedPlayer2.name : "Select Player 2"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="player1" className="mt-0">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer ${selectedPlayer1?.id === player.id ? "border-2 border-primary" : ""}`}
                  onClick={() => handlePlayerSelect(player, 1)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <AvatarWithFallback src={player.profile_image_url} name={player.name} className="h-10 w-10" />
                    <div className="font-medium">{player.name}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="player2" className="mt-0">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer ${selectedPlayer2?.id === player.id ? "border-2 border-primary" : ""}`}
                  onClick={() => handlePlayerSelect(player, 2)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <AvatarWithFallback src={player.profile_image_url} name={player.name} className="h-10 w-10" />
                    <div className="font-medium">{player.name}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedPlayer1 && selectedPlayer2 && (
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-md p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-center">Match Preview</h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <AvatarWithFallback
                  src={selectedPlayer1.profile_image_url}
                  name={selectedPlayer1.name}
                  className="h-16 w-16"
                />
                <div className="mt-2 text-center">
                  <p className="font-medium">{selectedPlayer1.name}</p>
                </div>
              </div>

              <div className="text-xl font-bold text-muted-foreground">VS</div>

              <div className="flex flex-col items-center">
                <AvatarWithFallback
                  src={selectedPlayer2.profile_image_url}
                  name={selectedPlayer2.name}
                  className="h-16 w-16"
                />
                <div className="mt-2 text-center">
                  <p className="font-medium">{selectedPlayer2.name}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button size="lg" onClick={createMatch} disabled={creatingMatch}>
                {creatingMatch ? "Creating..." : "Start Match"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

