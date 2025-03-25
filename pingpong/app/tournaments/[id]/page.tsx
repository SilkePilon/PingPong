import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Navigation } from "@/components/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarDays, Users, Trophy, ArrowLeft } from "lucide-react"

interface PageProps {
  params: {
    id: string
  }
}

export default async function TournamentDetailPage({ params }: PageProps) {
  // Ensure params is properly awaited before extracting id
  const paramsCopy = await Promise.resolve(params);
  const id = paramsCopy.id;
  
  const supabase = await createServerSupabaseClient();

  // Fetch tournament details
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      id, 
      name, 
      description, 
      start_date, 
      end_date,
      status
    `)
    .eq('id', id as string)
    .single();

  // Fetch players for this tournament
  const { data: players } = await supabase
    .from("players")
    .select(`
      id, 
      name, 
      profile_image_url,
      tournament_id,
      player_stats(matches_played, matches_won, total_points_scored)
    `)
    .eq('tournament_id', id as string)
    .order('name');

  // If tournament not found, return 404
  if (error || !tournament) {
    return notFound();
  }
  
  // TypeScript guards to ensure tournament and players data is correctly typed
  if (!tournament || !Array.isArray(players)) {
    return notFound();
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return format(parseISO(dateString), "MMM d, yyyy");
  }

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">
        <div className="container px-4 py-6 md:py-8">
          <Link href="/tournaments" className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to tournaments
          </Link>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <PageHeader title={tournament.name} description={tournament.description || "Tournament details"} />
            <div className="flex items-center gap-2">
              {getStatusBadge(tournament.status)}
              {(tournament.start_date || tournament.end_date) && (
                <div className="flex items-center text-sm">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(tournament.start_date) || "TBD"} - {formatDate(tournament.end_date) || "TBD"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5" /> Players ({players?.length || 0})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players && players.length > 0 ? (
                players.map((player) => (
                  <div key={player.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {player.profile_image_url ? (
                        <div 
                          className="h-10 w-10 rounded-full bg-cover bg-center" 
                          style={{ backgroundImage: `url(${player.profile_image_url})` }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{player.name}</h3>
                        <div className="text-xs text-muted-foreground">
                          Matches: {player.player_stats?.[0]?.matches_played || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-muted rounded-lg">
                  <h3 className="text-lg font-medium">No players yet</h3>
                  <p className="text-muted-foreground mt-1">No players have been added to this tournament</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Navigation />
    </div>
  )
}