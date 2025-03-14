"use server"

import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/db"
import { getClientIp } from "@/lib/utils"
import { headers } from "next/headers"

// Define the cooldown period in seconds (1 hour)
const COOLDOWN_PERIOD = 3600

export async function claimCoupon() {
  try {
    // Get client IP address
    const headersList = await headers()
    const ip = getClientIp(headersList) || "unknown"

    // Get or set a unique identifier in cookies
    const cookieStore = await cookies()
    let userId = cookieStore.get("user_id")?.value

    if (!userId) {
      userId = crypto.randomUUID()
      cookieStore.set("user_id", userId, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
        httpOnly: true,
        sameSite: "strict",
      })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user is on cooldown
    const userActivity = await db.collection("user_activity").findOne({
      $or: [
        { ip, lastClaim: { $gt: new Date(Date.now() - COOLDOWN_PERIOD * 1000) } },
        { userId, lastClaim: { $gt: new Date(Date.now() - COOLDOWN_PERIOD * 1000) } },
      ],
    })

    if (userActivity) {
      const remainingTime = Math.ceil((userActivity.lastClaim.getTime() + COOLDOWN_PERIOD * 1000 - Date.now()) / 1000)

      return {
        error: "You've recently claimed a coupon. Please wait before claiming another.",
        cooldown: remainingTime,
      }
    }

    // Get the next available coupon using round-robin
    const couponsCollection = db.collection("coupons")

    // Find a coupon that hasn't been claimed or has been claimed the least
    const coupon = await couponsCollection.find({ active: true }).sort({ claimCount: 1 }).limit(1).toArray()

    if (!coupon || coupon.length === 0) {
      return { error: "No coupons available at this time." }
    }

    // Update the coupon claim count
    await couponsCollection.updateOne({ _id: coupon[0]._id }, { $inc: { claimCount: 1 } })

    // Record user activity
    await db.collection("user_activity").insertOne({
      ip,
      userId,
      couponId: coupon[0]._id,
      couponCode: coupon[0].code,
      lastClaim: new Date(),
    })

    // Return the coupon code
    return { coupon: coupon[0].code }
  } catch (error) {
    console.error("Error claiming coupon:", error)
    return { error: "Failed to claim coupon. Please try again later." }
  }
}

export async function checkCooldown() {
  try {
    // Get client IP and user ID from cookies
    const headersList = await headers()
    const ip = getClientIp(headersList) || "unknown"

    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return { onCooldown: false }
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user is on cooldown
    const userActivity = await db.collection("user_activity").findOne(
      {
        $or: [
          { ip, lastClaim: { $gt: new Date(Date.now() - COOLDOWN_PERIOD * 1000) } },
          { userId, lastClaim: { $gt: new Date(Date.now() - COOLDOWN_PERIOD * 1000) } },
        ],
      },
      { sort: { lastClaim: -1 } },
    )

    if (userActivity) {
      const remainingTime = Math.ceil((userActivity.lastClaim.getTime() + COOLDOWN_PERIOD * 1000 - Date.now()) / 1000)

      return {
        onCooldown: true,
        remainingTime,
      }
    }

    return { onCooldown: false }
  } catch (error) {
    console.error("Error checking cooldown:", error)
    return { onCooldown: false }
  }
}

