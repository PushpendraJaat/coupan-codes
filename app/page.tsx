"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { claimCoupon, checkCooldown } from "@/lib/actions";

export default function Home() {
  const [coupon, setCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchCooldown = async () => {
      try {
        const cooldownData = await checkCooldown();
        if (cooldownData.onCooldown) {
          setCooldown(cooldownData.remainingTime ?? null);
        }
      } catch (err) {
        console.error("Error checking cooldown:", err);
      }
    };

    fetchCooldown();

    if (cooldown !== null && cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => (prev && prev > 0 ? prev - 1 : null));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [cooldown]);

  const handleClaimCoupon = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await claimCoupon();

      if (result.error) {
        setError(result.error);
        if (result.cooldown) {
          setCooldown(result.cooldown);
        }
      } else if (result.coupon) {
        setCoupon(result.coupon);
        toast({
          title: "Coupon Claimed!",
          description: `You've successfully claimed coupon: ${result.coupon}`,
        });
        setCooldown(3600); // 1 hour cooldown
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Error claiming coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Coupon Distribution
          </CardTitle>
          <CardDescription>
            Claim your exclusive coupon code below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}

          {coupon && (
            <Alert className="bg-green-100 border-green-300">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your coupon code:{" "}
                  <span className="font-bold">{coupon}</span>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {cooldown !== null && cooldown > 0 && (
            <Alert>
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <AlertTitle>Cooldown Period</AlertTitle>
                <AlertDescription>
                  You can claim another coupon in{" "}
                  <span className="font-bold">
                    {formatTime(cooldown)}
                  </span>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleClaimCoupon}
            disabled={loading || (cooldown !== null && cooldown > 0)}
          >
            {loading ? "Processing..." : "Claim Coupon"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
