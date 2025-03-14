# Coupon Distribution System

A Next.js application that distributes coupons to users in a round-robin manner with abuse prevention mechanisms.

## Features

- **Round-Robin Coupon Distribution**: Coupons are distributed sequentially to ensure even distribution.
- **Guest Access**: Users can claim coupons without creating an account.
- **Abuse Prevention**:
  - IP tracking to prevent multiple claims from the same IP address
  - Cookie-based tracking to identify returning users
  - Cooldown periods between coupon claims (1 hour by default)
- **Rate Limiting**: Prevents API abuse with request rate limiting
- **Leaderboard**: Displays statistics on coupon claims
- **User Feedback**: Clear messages about coupon claims and cooldown periods

## Tech Stack

- **Frontend**: Next.js 14+ with App Router and TypeScript
- **Database**: MongoDB
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks and Context API
- **Authentication**: Cookie-based identification

## Setup Instructions

### Prerequisites

- Node.js 18.17 or later
- MongoDB database (local or Atlas)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:
