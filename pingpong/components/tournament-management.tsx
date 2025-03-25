"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Edit, Trash2, Users } from "lucide-react"

interface Tournament {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: string
  created_at: string
}

export function TournamentManagement() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data, error } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false })

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            Upcoming
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
          <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const handleManagePlayers = (tournamentId: string) => {
    router.push(`/admin/tournaments/${tournamentId}/players`)
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
        <p className="text-muted-foreground">No tournaments created yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tournaments.map((tournament) => (
        <div key={tournament.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{tournament.name}</h3>
              {tournament.description && <p className="text-sm text-muted-foreground mt-1">{tournament.description}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {getStatusBadge(tournament.status)}
                <span className="text-xs text-muted-foreground">
                  {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleManagePlayers(tournament.id)}>
                <Users className="h-4 w-4 mr-1" />
                Players
              </Button>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

