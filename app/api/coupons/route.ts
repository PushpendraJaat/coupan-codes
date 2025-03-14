import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get all active coupons with their claim counts
    const coupons = await db
      .collection("coupons")
      .find({ active: true })
      .project({ code: 1, claimCount: 1, _id: 0 })
      .sort({ claimCount: 1 })
      .toArray()

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

