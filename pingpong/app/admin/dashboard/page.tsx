"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { LogOut, Trophy, Users, Activity, Home } from "lucide-react"
import { CreateTournamentForm } from "@/components/create-tournament-form"
import { AddPlayerForm } from "@/components/add-player-form"
import { TournamentManagement } from "@/components/tournament-management"
import { MatchManagement } from "@/components/match-management"

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const tournamentManagementRef = useRef<any>(null)
  const matchManagementRef = useRef<any>(null)

  const handleLogout = () => {
    // Clear admin authentication
    localStorage.removeItem("adminAuth")
    
    // Dispatch auth changed event for immediate UI update
    const authEvent = new CustomEvent("adminAuthChanged", { detail: { authenticated: false } });
    window.dispatchEvent(authEvent);
    
    // Redirect to main dashboard instead of admin
    router.push("/")
    
    // Force navigation to ensure we leave the admin area completely
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  }

  const refreshTournaments = () => {
    // Access the fetchTournaments method from the TournamentManagement component
    if (tournamentManagementRef.current?.fetchTournaments) {
      tournamentManagementRef.current.fetchTournaments();
    }
  };
  
  const refreshMatches = () => {
    // Access the fetchMatches method from the MatchManagement component
    if (matchManagementRef.current?.fetchMatches) {
      matchManagementRef.current.fetchMatches();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Main Dashboard</span>
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <div className="container px-4 py-6 md:py-8">
          <PageHeader title="Tournament Management" description="Create and manage tournaments, players, and matches" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Manage</div>
                  <p className="text-xs text-muted-foreground">Create and manage tournaments</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Players</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Manage</div>
                  <p className="text-xs text-muted-foreground">Add and manage players in tournaments</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matches</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Manage</div>
                  <p className="text-xs text-muted-foreground">Create and manage matches</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="tournaments" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
            </TabsList>

            <TabsContent value="tournaments" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Tournament</CardTitle>
                    <CardDescription>Create a new ping pong tournament</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CreateTournamentForm onSuccess={refreshTournaments} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Manage Tournaments</CardTitle>
                    <CardDescription>View and manage existing tournaments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TournamentManagement ref={tournamentManagementRef} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="players" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Player</CardTitle>
                    <CardDescription>Add a new player to a tournament</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AddPlayerForm />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Player Management</CardTitle>
                    <CardDescription>View and manage existing players</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Select a tournament to view and manage its players</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="matches" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Match Management</CardTitle>
                    <CardDescription>View and manage match scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">All Matches</h3>
                      <div className="flex gap-2">
                        <Button onClick={refreshMatches} variant="outline" size="sm">
                          Refresh
                        </Button>
                        <Button onClick={() => router.push("/matches/new")} size="sm">
                          Create New Match
                        </Button>
                      </div>
                    </div>
                    <MatchManagement ref={matchManagementRef} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

