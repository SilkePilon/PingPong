import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Navigation } from "@/components/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { TournamentBracket } from "@/components/tournament-bracket"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Player {
  id: string
  name: string
  profile_image_url: string | null
}

interface RawMatch {
  id: string
  round: number
  position: number
  player1_id: string | null
  player2_id: string | null
  player1_score: number
  player2_score: number
  status: "pending" | "active" | "completed"
  winner_id: string | null
  player1: Player[]
  player2: Player[]
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function TournamentBracketPage({ params }: { params: { id: string } }) {
  // Ensure params is properly awaited
  const paramsCopy = await Promise.resolve(params)
  const tournamentId = paramsCopy.id

  const supabase = await createServerSupabaseClient()

  // Fetch tournament details
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, name")
    .eq("id", tournamentId)
    .single()

  if (!tournament) {
    return notFound()
  }

  // Fetch all players in this tournament
  const { data: players } = await supabase
    .from("players")
    .select("id, name, profile_image_url")
    .eq("tournament_id", tournamentId)
    .order("name")

  // Fetch existing matches for this tournament
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      round,
      position,
      player1_id,
      player2_id,
      player1_score,
      player2_score,
      status,
      winner_id,
      player1:players!player1_id(id, name, profile_image_url),
      player2:players!player2_id(id, name, profile_image_url)
    `)
    .eq("tournament_id", tournamentId)
    .order("round")
    .order("position")

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">
        <div className="container px-4 py-6 md:py-8">
          <Link 
            href={`/tournaments/${tournamentId}`} 
            className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to tournament
          </Link>

          <PageHeader 
            title="Tournament Bracket" 
            description={`Bracket view for ${tournament.name}`} 
          />

          <div className="mt-8">
            {players && players.length > 1 ? (
              <TournamentBracket 
                tournamentId={tournamentId}
                players={players}
                existingMatches={matches as RawMatch[] || []}
              />
            ) : (
              <div className="text-center py-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium">Not enough players</h3>
                <p className="text-muted-foreground mt-1">
                  Add at least 2 players to generate tournament matches
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Navigation />
    </div>
  )
}