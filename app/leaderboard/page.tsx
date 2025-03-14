import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { connectToDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

async function getLeaderboardData() {
  try {
    const { db } = await connectToDatabase()

    // Aggregate user activity to get counts by IP
    const ipLeaderboard = await db
      .collection("user_activity")
      .aggregate([{ $group: { _id: "$ip", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }])
      .toArray()

    // Get total coupons claimed
    const totalClaimed = await db.collection("user_activity").countDocuments()

    return { ipLeaderboard, totalClaimed }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error)
    return { ipLeaderboard: [], totalClaimed: 0, error: "Failed to fetch leaderboard data" }
  }
}

export default async function LeaderboardPage() {
  const { ipLeaderboard, totalClaimed, error } = await getLeaderboardData()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Coupon Leaderboard</CardTitle>
          <CardDescription>Total coupons claimed: {totalClaimed}</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Top Claimers</h3>
              <div className="rounded-md border">
                <div className="grid grid-cols-2 border-b bg-muted/50 p-2 font-medium">
                  <div>IP Address</div>
                  <div className="text-right">Coupons Claimed</div>
                </div>
                {ipLeaderboard.length > 0 ? (
                  ipLeaderboard.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 p-2 even:bg-muted/20">
                      <div>
                        {item._id === "unknown"
                          ? "Unknown"
                          : `${item._id.substring(0, 3)}***${item._id.substring(item._id.length - 3)}`}
                      </div>
                      <div className="text-right">{item.count}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground">No data available</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

