import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

// This is a protected route that should only be accessible in development
// or with proper authentication in production
export async function GET() {
  // Check if we're in development mode or if an admin token is provided
  if (process.env.NODE_ENV !== "development") {
    const isAuthorized = false // Implement proper auth check here
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

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

