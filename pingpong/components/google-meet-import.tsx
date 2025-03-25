"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Users } from "lucide-react"

export function GoogleMeetImport() {
  const [meetLink, setMeetLink] = useState("")
  const [loading, setLoading] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  // This is a mock function since we can't actually access Google Meet API directly
  // In a real implementation, this would connect to a server endpoint that uses Google API
  const importFromGoogleMeet = async () => {
    if (!meetLink) {
      toast({
        title: "Error",
        description: "Please enter a Google Meet link",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Mock data - in a real app, this would come from the Google Meet API
      const mockAttendees = [
        { name: "John Smith", email: "john@example.com", profile_image_url: "/placeholder.svg?height=200&width=200" },
        {
          name: "Sarah Johnson",
          email: "sarah@example.com",
          profile_image_url: "/placeholder.svg?height=200&width=200",
        },
        {
          name: "Michael Brown",
          email: "michael@example.com",
          profile_image_url: "/placeholder.svg?height=200&width=200",
        },
        { name: "Emily Davis", email: "emily@example.com", profile_image_url: "/placeholder.svg?height=200&width=200" },
      ]

      // Create a tournament
      const meetId = meetLink.split("/").pop() || "unknown"
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .insert({
          name: `Tournament ${meetId}`,
          description: "Imported from Google Meet",
          google_meet_link: meetLink,
          start_date: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (tournamentError) throw tournamentError

      // Import players
      for (const attendee of mockAttendees) {
        // Check if player already exists
        const { data: existingPlayer } = await supabase
          .from("players")
          .select("id")
          .eq("email", attendee.email)
          .maybeSingle()

        let playerId

        if (existingPlayer) {
          playerId = existingPlayer.id
        } else {
          // Create new player
          const { data: playerData, error: playerError } = await supabase
            .from("players")
            .insert({
              name: attendee.name,
              email: attendee.email,
              profile_image_url: attendee.profile_image_url,
            })
            .select("id")
            .single()

          if (playerError) throw playerError
          playerId = playerData.id

          // Initialize player stats
          await supabase.from("player_stats").insert({
            player_id: playerId,
          })
        }

        // Add player to tournament
        await supabase.from("tournament_players").insert({
          tournament_id: tournamentData.id,
          player_id: playerId,
        })
      }

      toast({
        title: "Success",
        description: `Imported ${mockAttendees.length} players from Google Meet`,
      })
    } catch (error) {
      console.error("Error importing from Google Meet:", error)
      toast({
        title: "Error",
        description: "Failed to import from Google Meet",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Import from Google Meet
          </CardTitle>
          <CardDescription>Import players from a Google Meet appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter Google Meet link"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Example: https://meet.google.com/abc-defg-hij</p>
            </div>

            <Button onClick={importFromGoogleMeet} disabled={loading || !meetLink} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Importing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Import Attendees
                </span>
              )}
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              Note: This will create a new tournament and import all attendees who RSVP'd "Yes" to the meeting.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

