import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function generateAffiliateCode(firstName: string, lastName: string): string {
  const base = (firstName.substring(0, 3) + lastName.substring(0, 3)).toLowerCase()
  const random = Math.random().toString(36).substring(2, 6)
  return `${base}${random}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, paypalEmail } = body

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Generate unique affiliate code
    const affiliateCode = generateAffiliateCode(firstName, lastName)

    const { data, error } = await supabase
      .from("affiliates")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          password_hash: passwordHash,
          paypal_email: paypalEmail || email,
          affiliate_code: affiliateCode,
          status: "approved",
          commission_rate: 30.00
        }
      ])
      .select()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true, affiliateCode })
  } catch (error) {
    console.error("Affiliate signup error:", error)
    return NextResponse.json({ error: "Failed to create affiliate account" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const password = searchParams.get("password")

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (error || !affiliate) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, affiliate.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Get stats
    const { data: clicks } = await supabase
      .from("affiliate_clicks")
      .select("id")
      .eq("affiliate_code", affiliate.affiliate_code)

    const { data: conversions } = await supabase
      .from("affiliate_conversions")
      .select("amount, commission, status")
      .eq("affiliate_code", affiliate.affiliate_code)

    const totalClicks = clicks?.length || 0
    const totalConversions = conversions?.length || 0
    const totalEarnings = conversions?.reduce((sum, c) => sum + parseFloat(c.commission), 0) || 0
    const pendingEarnings = conversions?.filter(c => c.status === "pending").reduce((sum, c) => sum + parseFloat(c.commission), 0) || 0

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        firstName: affiliate.first_name,
        lastName: affiliate.last_name,
        email: affiliate.email,
        affiliateCode: affiliate.affiliate_code,
        commissionRate: affiliate.commission_rate,
        paypalEmail: affiliate.paypal_email,
        status: affiliate.status
      },
      stats: {
        totalClicks,
        totalConversions,
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : "0.00",
        totalEarnings: totalEarnings.toFixed(2),
        pendingEarnings: pendingEarnings.toFixed(2)
      }
    })
  } catch (error) {
    console.error("Affiliate login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
