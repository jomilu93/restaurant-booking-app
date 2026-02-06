# NYC Restaurant Booking App

A modern, full-stack restaurant booking application that helps users quickly find and book available NYC restaurants with personalized recommendations.

## Features

- **Smart Discovery**: Browse restaurants with real-time availability
- **Personalized Recommendations**: AI-powered suggestions based on your taste and booking history
- **Unified Booking**: Book through Resy or OpenTable in one seamless experience
- **User Profiles**: Save preferences and track your dining history

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: Vercel Postgres with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use Vercel Postgres)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/restaurant-booking-app.git
cd restaurant-booking-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database URL and other credentials.

4. Push database schema:
```bash
npm run db:push
```

5. Seed the database:
```bash
npm run db:seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Business logic, database, utilities
└── types/            # TypeScript type definitions
```

## Documentation

- [Product Requirements Document](./docs/PRD.md)
- [AI Reflection](./docs/AI_REFLECTION.md)

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database
```

## Deployment

This app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy!

## License

MIT
