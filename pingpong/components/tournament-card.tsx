"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { CalendarDays, Users } from "lucide-react"

interface TournamentCardProps {
  tournament: {
    id: string
    name: string
    description: string | null
    start_date: string | null
    end_date: string | null
    status: string
  }
  index: number
}

export function TournamentCard({ tournament, index }: TournamentCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return format(parseISO(dateString), "MMM d, yyyy")
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{tournament.name}</CardTitle>
            {getStatusBadge(tournament.status)}
          </div>
        </CardHeader>
        <CardContent>
          {tournament.description && <p className="text-muted-foreground mb-4">{tournament.description}</p>}

          <div className="flex flex-col space-y-2">
            {(tournament.start_date || tournament.end_date) && (
              <div className="flex items-center text-sm">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  {formatDate(tournament.start_date) || "TBD"} - {formatDate(tournament.end_date) || "TBD"}
                </span>
              </div>
            )}

            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>View Players</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

