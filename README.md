# Loan Offer Ranking

This is a loan comparison tool built with React and TypeScript. Think of it as a way to browse and compare different loan offers, filter them based on what you need, and find the best deal for you.

## What does it do?

This app helps users find the right loan by letting them:
- Enter how much money they need and for how long
- Filter through offers based on amount, loan period, and special features (tags)
- Sort offers by APR (lowest first) or by rating (highest rated first)
- Expand offer cards to see all the details
- Track what users are doing with simple analytics (stored in localStorage)

## Getting Started

You'll need Node.js 18 or newer installed. Then just:

```bash
# Install everything
npm install --ignore-scripts
npm install @rollup/rollup-win32-x64-msvc@4.53.0 --save-optional

# Fire it up
npm run dev

# Build it
npm run build

# Run the tests
npm test

# Check out the production build
npm run preview
```

**Quick note for Windows users**: If you're getting "program not found" errors in Git Bash, just switch to PowerShell or CMD. Check out [WINDOWS_SETUP.md](WINDOWS_SETUP.md) if you need help.

## How it's organized

```
src/
├── components/          # All the React components
│   ├── InputForm.tsx   # Where users enter amount and loan period
│   ├── OfferCard.tsx   # Individual offer cards (the expandable ones)
│   ├── OffersList.tsx  # The main list with all the filtering magic
│   ├── LoadingSkeleton.tsx  # Those nice loading placeholders
│   └── ErrorState.tsx  # When things go wrong (with a retry button!)
├── utils/
│   ├── api.ts         # Fetching and filtering offers
│   └── analytics.ts   # Tracking user interactions
├── types/
│   └── index.ts       # TypeScript definitions
├── App.tsx            # Where everything comes together
└── main.tsx           # Entry point
```

## The tech decisions

### Why I built it this way

**Vite instead of Next.js** - For a project this size, Vite is perfect. It's fast and I didn't need all the server-side stuff Next.js brings.

**Tailwind CSS** - the production bundle stays small and the responsive utilities are great.

**Component structure** - I tried to keep things clean and separated. Each component has its own job, props are typed properly, and I used a compound component pattern for the expandable offer cards.

**State management** - Just good old React hooks. No Redux, no fancy state libraries. useState for simple stuff, useMemo for expensive filters, and lifted the shared state up to the App component when needed.

**Accessibility matters** - Added proper semantic HTML, ARIA labels, keyboard navigation, focus management, and screen reader support.

**Testing** - Went with Vitest because it's fast and works great with Vite. Wrote unit tests for the utilities and component tests with Testing Library. Got 192 test cases total, which is way more than the "at least 2" requirement.

### How data flows through the app

When you first load the page, it fetches offers from `/offers.json`. There's a 10% chance it'll fail (on purpose, for testing error states), and while it's loading you'll see nice skeleton placeholders.

When users start playing with the filters - changing the amount, picking a different loan period, or selecting tags - the offer list updates automatically. Same goes for sorting.

Click on an offer to expand it and see more details. Hit the "Sprawdź ofertę" button and it'll simulate a redirect (with a 600ms delay so you can see the loading state).

### The analytics thing

Everything users do gets logged to localStorage under `youmoney_analytics_events`. It's basically a pseudo-Google-Analytics that tracks:

- When offers load (`view_list`)
- When filters change (`filter_change`)
- When sorting changes (`sort_change`)
- When offers get expanded (`expand_offer`)
- When someone clicks through to an offer (`cta_click`)

It's not real analytics obviously, but it shows how you'd track user behavior in a real app.

## What's implemented

Everything from the requirements is in there:
- Amount stepper and loan period input with validation (min 200, period between 1-60 months)
- Filtering by amount, period, and tags
- Sorting by APR or rating
- Expandable offer cards with all the details
- Click tracking and simulated redirects
- Loading states and error handling (with retry)
- That fun 10% random API failure for testing
- Analytics logging to localStorage
- TypeScript everywhere with proper types
- Modular, clean architecture
- Works great on mobile
- Fully accessible with ARIA, keyboard navigation, the works
- 192 test cases

## If I had more time...

Here's what I'd add next if this were a real product:

### More features
- Range sliders for filters instead of just inputs
- A "decision time" filter (instant approval, 15 mins, 24 hours, etc.)
- Let users save their filter preferences
- Comparison mode - select a few offers and see them side by side
- Dark mode
- Favorite/bookmark offers
- Actually hook up to Google Analytics or Mixpanel instead of localStorage

---

Built as a recruitment task • Took about 3-4 hours • Focus was on clean code, accessibility, and good UX
