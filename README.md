# 🇩🇪 Goethe Trainer — Next.js

A scalable, SSR-ready German learning platform built with **Next.js 16 App Router**, **TypeScript**, **Tailwind CSS v4**, and **Firebase Auth**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, SSR/SSG) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Auth (Google + Email/Password) |
| State | React Context + custom hooks |
| Fonts | Plus Jakarta Sans + Lora (via `next/font`) |
| Icons | Lucide React |

## Project Structure

```
goethe-trainer/
├── app/
│   ├── layout.tsx                 # Root layout (fonts + AuthProvider)
│   ├── page.tsx                   # Landing page at /
│   └── (dashboard)/               # Route group — shares sidebar layout
│       ├── layout.tsx             # Sidebar + AuthModal wrapper
│       ├── home/page.tsx          # /home — Dashboard home
│       ├── fortschritt/page.tsx   # /fortschritt — Progress tracking
│       ├── favoriten/page.tsx     # /favoriten — Saved vocab (protected)
│       ├── pruefungsinfo/page.tsx # /pruefungsinfo — Free exam info
│       └── ...                    # Add vocab, quiz, write pages here
├── components/
│   ├── ui/           # Reusable: Button, Card, Badge
│   ├── auth/         # AuthModal
│   ├── layout/       # Sidebar, Topbar
│   ├── vocab/        # VocabCard (with right-click → favourites)
│   ├── pronunciation/ # PronunciationPanel (translate + TTS)
│   └── favourites/   # FavouritesPage (grid + flashcard mode)
├── context/
│   └── AuthContext.tsx  # Firebase auth state, Google + email login
├── hooks/
│   ├── useProgress.ts   # Per-user progress (localStorage)
│   └── useFavourites.ts # Saved vocab favourites (localStorage)
├── lib/
│   └── firebase.ts      # Firebase app + auth init (no duplicate init)
└── types/
    └── index.ts         # Shared TypeScript types
```

## Key Features Implemented

- ✅ **Firebase Auth** — Google Sign-In + Email/Password, `AuthProvider` via React Context
- ✅ **Protected routes** — Lock icon + modal prompt for unauthenticated users
- ✅ **Progress tracking** — Weighted grade (A–E) across all exercise types, persisted in `localStorage`
- ✅ **Vocab Favourites** — Right-click any vocab card → add to favourites; grid view + flashcard mode + read-aloud
- ✅ **Pronunciation Panel** — MyMemory translation API + Web Speech API TTS (DE + EN)
- ✅ **SSR metadata** — `export const metadata` on every page for SEO + OpenGraph
- ✅ **Route Groups** — `(dashboard)` shares sidebar layout without affecting URLs
- ✅ **TypeScript strict** — Zero type errors

## Development

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (checks types + lints)
npm run start    # Start production server
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Set environment variable: `NEXT_PUBLIC_FIREBASE_API_KEY` (optional if using hardcoded config)
4. Deploy — Vercel auto-detects Next.js

### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add the Netlify Next.js plugin: `npm install @netlify/plugin-nextjs`

## Adding New Pages

1. Create `app/(dashboard)/[route]/page.tsx` (server component for SEO metadata)
2. Create `app/(dashboard)/[route]/[Route]Client.tsx` (client component for interactivity)
3. Add the route to the sidebar nav in `components/layout/Sidebar.tsx`

## Firebase Setup

The Firebase config is in `lib/firebase.ts`. For production, move credentials to environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

Add your deployment domain to Firebase Console → Authentication → Authorized Domains.
