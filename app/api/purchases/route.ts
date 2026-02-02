import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, amount, cardLastFour, transactionId, productType } = body

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/purchases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        amount: amount,
        card_last_four: cardLastFour,
        transaction_id: transactionId,
        product_type: productType,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ success: false, message: "Failed to save purchase" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving purchase:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/purchases?order=created_at.desc`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error fetching purchases:", errorText)
      return NextResponse.json({ success: false, data: [], error: errorText }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ success: false, data: [], error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "Purchase ID is required" }, { status: 400 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/purchases?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Error deleting purchase:", error)
      return NextResponse.json({ success: false, message: "Failed to delete purchase" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting purchase:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
