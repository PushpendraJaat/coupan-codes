import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Sample coupon codes
    const coupons = [
      { code: "SAVE10", description: "10% off your purchase", active: true, claimCount: 0 },
      { code: "SAVE20", description: "20% off your purchase", active: true, claimCount: 0 },
      { code: "FREESHIP", description: "Free shipping on your order", active: true, claimCount: 0 },
      { code: "BOGO50", description: "Buy one get one 50% off", active: true, claimCount: 0 },
      { code: "WELCOME15", description: "15% off for new customers", active: true, claimCount: 0 },
    ]

    // Clear existing coupons and insert new ones
    await db.collection("coupons").deleteMany({})
    await db.collection("coupons").insertMany(coupons)

    // Clear user activity for testing
    await db.collection("user_activity").deleteMany({})

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      couponsAdded: coupons.length,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}

