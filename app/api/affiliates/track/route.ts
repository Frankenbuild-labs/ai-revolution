import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { affiliateCode, pageUrl, referrer, userAgent } = body

    // Get IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor?.split(",")[0] || "unknown"

    // Verify affiliate exists
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("affiliate_code", affiliateCode)
      .single()

    if (!affiliate) {
      return NextResponse.json({ error: "Invalid affiliate code" }, { status: 400 })
    }

    // Record click
    await supabase.from("affiliate_clicks").insert([
      {
        affiliate_id: affiliate.id,
        affiliate_code: affiliateCode,
        page_url: pageUrl,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer
      }
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track click error:", error)
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 })
  }
}
