import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_visits?order=created_at.desc`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch page visits")
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching page visits:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch page visits" }, { status: 500 })
  }
}
