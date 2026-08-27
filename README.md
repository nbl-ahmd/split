# TripSplit

Fast, family-first trip expense splitting with a Neon PostgreSQL backend.

## Run locally

```bash
npm install
cp .env.example .env.local
npm test
npm run dev
```

Set `DATABASE_URL` to a Neon connection string before running migrations:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

The current UI includes a seeded demo trip so the expense and settlement flow can be reviewed immediately. Database actions are the next wiring layer for production persistence.
