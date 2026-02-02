import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateCode = searchParams.get("code")

    if (!affiliateCode) {
      return NextResponse.json({ error: "Affiliate code required" }, { status: 400 })
    }

    // Get recent clicks
    const { data: recentClicks } = await supabase
      .from("affiliate_clicks")
      .select("*")
      .eq("affiliate_code", affiliateCode)
      .order("created_at", { ascending: false })
      .limit(50)

    // Get recent conversions
    const { data: recentConversions } = await supabase
      .from("affiliate_conversions")
      .select("*")
      .eq("affiliate_code", affiliateCode)
      .order("created_at", { ascending: false })
      .limit(50)

    // Get daily stats for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: clicksLast30 } = await supabase
      .from("affiliate_clicks")
      .select("created_at")
      .eq("affiliate_code", affiliateCode)
      .gte("created_at", thirtyDaysAgo.toISOString())

    const { data: conversionsLast30 } = await supabase
      .from("affiliate_conversions")
      .select("created_at, amount, commission")
      .eq("affiliate_code", affiliateCode)
      .gte("created_at", thirtyDaysAgo.toISOString())

    return NextResponse.json({
      recentClicks: recentClicks || [],
      recentConversions: recentConversions || [],
      last30Days: {
        clicks: clicksLast30?.length || 0,
        conversions: conversionsLast30?.length || 0,
        earnings: conversionsLast30?.reduce((sum, c) => sum + parseFloat(c.commission), 0) || 0
      }
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
