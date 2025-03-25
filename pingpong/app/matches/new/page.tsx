import { PageHeader } from "@/components/page-header"
import { Navigation } from "@/components/navigation"
import { CreateMatchForm } from "@/components/create-match-form"

export default function NewMatchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">
        <div className="container px-4 py-6 md:py-8">
          <PageHeader title="Create New Match" description="Select two players to start a match" />

          <CreateMatchForm />
        </div>
      </main>
      <Navigation />
    </div>
  )
}

