import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_url, tracking_id, email, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = body

    // Get visitor information
    const referrer = request.headers.get("referer") || "direct"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    // Insert visit record
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        page_url,
        referrer,
        user_agent: userAgent,
        ip_address: ipAddress,
        tracking_id: tracking_id || null,
        email: email || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to track visit")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track visit error:", error)
    return NextResponse.json({ error: "Failed to track visit" }, { status: 500 })
  }
}
