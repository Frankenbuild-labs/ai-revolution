import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

// Generate tracking links with unique IDs
export async function POST(request: NextRequest) {
  try {
    const { email, page } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Generate unique tracking ID
    const trackingId = randomBytes(16).toString("hex")

    // Generate tracking URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airevolution.dev"
    const trackingUrl = `${baseUrl}${page}?tid=${trackingId}&email=${encodeURIComponent(email)}`

    return NextResponse.json({
      success: true,
      trackingId,
      trackingUrl,
      email,
    })
  } catch (error) {
    console.error("Error generating tracking link:", error)
    return NextResponse.json({ error: "Failed to generate tracking link" }, { status: 500 })
  }
}
