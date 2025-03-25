import { PageHeader } from "@/components/page-header"
import { Navigation } from "@/components/navigation"
import { MatchCard } from "@/components/match-card"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import Link from "next/link"
import { Plus } from "lucide-react"

// Define types for better type safety and serialization
interface Player {
  id: string;
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

interface RawMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  status: string;
  created_at: string;
  player1: Player[];
  player2: Player[];
}

export default async function MatchesPage() {
  const supabase = await createServerSupabaseClient()

  // Fetch matches with player details
  const { data: rawMatches } = await supabase
    .from("matches")
    .select(`
      id, 
      player1_id, 
      player2_id, 
      player1_score, 
      player2_score, 
      status,
      created_at,
      player1:players!player1_id(id, name, profile_image_url),
      player2:players!player2_id(id, name, profile_image_url)
    `)
    .order("created_at", { ascending: false })

  // Transform and sanitize the data for serialization
  const matches: Match[] = (rawMatches as RawMatch[] || []).map(match => ({
    id: match.id,
    player1_id: match.player1_id,
    player2_id: match.player2_id,
    player1_score: match.player1_score,
    player2_score: match.player2_score,
    status: match.status,
    created_at: match.created_at,
    player1: match.player1?.[0] || { id: '', name: 'Unknown', profile_image_url: null },
    player2: match.player2?.[0] || { id: '', name: 'Unknown', profile_image_url: null }
  }))

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">
        <div className="container px-4 py-6 md:py-8">
          <PageHeader title="Matches" description="View ongoing and completed matches" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Matches</h2>
            <Button asChild>
              <Link href="/matches/new">
                <Plus className="mr-2 h-4 w-4" />
                New Match
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches && matches.length > 0 ? (
              matches.map((match, index) => (
                <Link href={`/matches/${match.id}`} key={match.id}>
                  <MatchCard match={match} index={index} />
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium">No matches yet</h3>
                <p className="text-muted-foreground mt-1">Create a new match to get started</p>
                <Button asChild className="mt-4">
                  <Link href="/matches/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Match
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Navigation />
    </div>
  )
}

