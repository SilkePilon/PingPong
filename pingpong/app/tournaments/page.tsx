import { PageHeader } from "@/components/page-header"
import { Navigation } from "@/components/navigation"
import { TournamentCard } from "@/components/tournament-card"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import Link from "next/link"

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export default async function TournamentsPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch tournaments
  const { data: rawTournaments } = await supabase
    .from("tournaments")
    .select(`
      id, 
      name, 
      description, 
      start_date, 
      end_date,
      status
    `)
    .order("created_at", { ascending: false });

  // Transform and sanitize data for serialization
  const tournaments: Tournament[] = (rawTournaments || []).map(tournament => ({
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    start_date: tournament.start_date,
    end_date: tournament.end_date,
    status: tournament.status
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">
        <div className="container px-4 py-6 md:py-8">
          <PageHeader title="Tournaments" description="View all ping pong tournaments" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments && tournaments.length > 0 ? (
              tournaments.map((tournament, index) => (
                <Link href={`/tournaments/${tournament.id}`} key={tournament.id}>
                  <TournamentCard tournament={tournament} index={index} />
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium">No tournaments yet</h3>
                <p className="text-muted-foreground mt-1">Check back later for upcoming tournaments</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Navigation />
    </div>
  )
}

