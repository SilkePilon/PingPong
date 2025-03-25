import { MatchVsScreen } from "@/components/match-vs-screen"
import { Navigation } from "@/components/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"

interface MatchPageProps {
  params: {
    id: string
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  const supabase = createServerSupabaseClient()

  // Check if match exists
  const { data } = await supabase.from("matches").select("id").eq("id", params.id).single()

  if (!data) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">
        <div className="container px-4 py-6 md:py-8">
          <MatchVsScreen matchId={params.id} />
        </div>
      </main>
      <Navigation />
    </div>
  )
}

