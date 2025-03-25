"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"

export function CreateTournamentForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Tournament name is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("tournaments")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          start_date: startDate?.toISOString() || null,
          end_date: endDate?.toISOString() || null,
          status: "upcoming",
        })
        .select("id")
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Tournament created successfully",
      })

      // Reset form
      setName("")
      setDescription("")
      setStartDate(undefined)
      setEndDate(undefined)

      // Refresh the tournament list
      router.refresh()
    } catch (error) {
      console.error("Error creating tournament:", error)
      toast({
        title: "Error",
        description: "Failed to create tournament",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tournament Name</Label>
        <Input
          id="name"
          placeholder="Enter tournament name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Enter tournament description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date (optional)</Label>
          <div className="relative">
            <DatePicker selected={startDate} onSelect={setStartDate} disabled={loading} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (optional)</Label>
          <div className="relative">
            <DatePicker selected={endDate} onSelect={setEndDate} disabled={loading || !startDate} minDate={startDate} />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
        {loading ? "Creating..." : "Create Tournament"}
      </Button>
    </form>
  )
}

