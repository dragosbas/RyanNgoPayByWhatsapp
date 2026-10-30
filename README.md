# GoodFund

A one-page site for GoodFund, an initiative of [Good Bureau](https://www.goodbureau.ro/). People leave a WhatsApp number. GoodFund stores it, with consent, so someone can contact them later about campaigns and donation requests.

This phase does not send WhatsApp messages, take payments, or include an admin panel. The database already has unused tables for a later Unipile sender and Stripe test-mode Payment Links.

All Romanian copy is placeholder text in [`content/copy.ts`](content/copy.ts). The hero photo is [`public/images/hero.jpg`](public/images/hero.jpg); replace that file to swap it (see `public/images/hero.txt`).

## Run locally

You need Node.js 22 and PostgreSQL.

```bash
cp .env.example .env
createdb goodfund  # or create the database in your own Postgres
npm install
npx prisma migrate deploy
npm run dev
```

Open http://localhost:3000.

`DATABASE_URL` in `.env` must point at your database. No other secrets are required. `.env` stays out of git.

## Checks

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

`npm test` runs the unit tests and then the end-to-end test. The end-to-end test starts `next start` on port 3100, so run `npm run build` first. It submits the real form against the Postgres database in `DATABASE_URL`.

GitHub Actions runs lint, unit tests, the production build, and that end-to-end test with a Postgres service container.

## Data

`Subscriber` stores `id`, `phone` (E.164, unique), `consentAt`, `consentTextVersion`, `optedOutAt`, and `createdAt`. Signing up again with the same number updates consent and clears `optedOutAt`. It does not create a second row.

`/unsubscribe` opts a number out. A number that is not on the list gets the same confirmation, so the page does not reveal who signed up.

Signup and unsubscribe are limited per IP in memory (8 requests / 10 minutes by default, overridable with `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`). A hidden honeypot field drops bot submissions without an error.
