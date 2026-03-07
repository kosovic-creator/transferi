This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Push alarm podsjetnici

Aplikacija podržava mobilne push podsjetnike koji šalju notifikaciju u vrijeme transfera.

### Brzi početak

1. Generiši VAPID ključeve:
   ```bash
   npm run generate-vapid
   ```

2. Popuni `.env` sa potrebnim varijablama (vidi `.env.example`)

3. Primijeni migraciju:
   ```bash
   npx prisma migrate deploy
   ```

4. Deploy na Vercel (automatski postavlja cron iz `vercel.json`)

**Detaljno objašnjenje setup-a:** [SETUP_ALARMI.md](./SETUP_ALARMI.md)
