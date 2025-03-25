import { PageHeader } from "@/components/page-header"
import { Navigation } from "@/components/navigation"
import { PlayerCard } from "@/components/player-card"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlayerStats {
  matches_played: number;
  matches_won: number;
  total_points_scored: number;
}

interface Player {
  id: string;
  name: string;
  profile_image_url: string | null;
  tournament_id: string;
  player_stats: PlayerStats[];
  stats: PlayerStats;
}

interface Tournament {
  id: string;
  name: string;
}

export default async function PlayersPage() {
  const supabase = await createServerSupabaseClient()

  // Fetch tournaments with proper typing
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name")
    .order("name")

  // Get the first tournament as default
  const defaultTournament = tournaments && tournaments.length > 0 ? tournaments[0].id : null

  // Fetch players for the default tournament
  const { data: rawPlayers } = await supabase
    .from("players")
    .select(`
      id, 
      name, 
      profile_image_url,
      tournament_id,
      player_stats(matches_played, matches_won, total_points_scored)
    `)
    .eq("tournament_id", defaultTournament)
    .order("name")

  // Format the data for the component with proper type safety
  const formattedPlayers = (rawPlayers || []).map((player) => {
    const defaultStats: PlayerStats = {
      matches_played: 0,
      matches_won: 0,
      total_points_scored: 0
    }

    // Ensure we have valid stats object even if player_stats is null or empty
    const stats = player.player_stats?.[0] || defaultStats

    return {
      id: player.id,
      name: player.name,
      profile_image_url: player.profile_image_url,
      tournament_id: player.tournament_id,
      player_stats: player.player_stats || [],
      stats: stats
    }
  })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">
        <div className="container px-4 py-6 md:py-8">
          <PageHeader title="Players" description="View players in tournaments" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Tournament Players</h2>
          </div>
          {tournaments && tournaments.length > 0 ? (
            <>
              <div className="mb-6">
                <form action="/api/select-tournament" className="max-w-xs">
                  <Select name="tournamentId" defaultValue={defaultTournament || ""}>
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
                </form>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formattedPlayers.length > 0 ? (
                  formattedPlayers.map((player, index) => (
                    <PlayerCard key={player.id} player={player} stats={player.stats} index={index} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-muted rounded-lg">
                    <h3 className="text-lg font-medium">No players in this tournament</h3>
                    <p className="text-muted-foreground mt-1">Add players to get started</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <h3 className="text-lg font-medium">No tournaments available</h3>
              <p className="text-muted-foreground mt-1">Create a tournament first</p>
            </div>
          )}
        </div>
      </main>
      <Navigation />
    </div>
  )
}

