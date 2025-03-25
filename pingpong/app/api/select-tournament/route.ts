import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const tournamentId = formData.get("tournamentId") as string

  if (!tournamentId) {
    return NextResponse.json({ error: "Tournament ID is required" }, { status: 400 })
  }

  // Redirect to the players page with the selected tournament
  return NextResponse.redirect(new URL(`/?tournament=${tournamentId}`, request.url))
}

