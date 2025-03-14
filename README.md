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

## Abuse Prevention

### IP Tracking

The app stores the IP address of every user that claims a coupon. This is done in the `claimCoupon` server action:

- The IP address of the user is taken from the request headers
- On claim, the IP is saved to the database with the timestamp
- When allowing a new claim, the system first checks if the same IP claimed a coupon during the cooldown time


### Cookie Tracking

Aside from IP tracking, the application also employs HTTP cookies to track returning users:

- A random user ID is created and saved in an HTTP-only cookie
- The ID is verified against the database when a user tries to redeem a coupon
- The cookie lasts for 30 days, enabling long-term tracking

### Rate Limiting

To avoid API abuse, the application employs rate limiting through middleware:

- Restricts the number of API calls from a single IP address
- Supports configurable window size and request limit
- Returns proper HTTP 429 status codes with Retry-After headers

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

- MONGODB_URI=your_mongodb_connection_string


### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PushpendraJaat/coupan-codes.git
   cd coupan-codes


2. Install dependencies:

```shellscript
npm install
```


3. Seed the database with initial coupons:
- Start the development server:

```shellscript
npm run dev
```


- Visit `http://localhost:3000/api/seed` in your browser to seed the database with sample coupons




4. Access the application at `http://localhost:3000`