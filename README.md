# InternTrack

A first working internship and job application tracker built with Next.js App Router, TypeScript, Tailwind CSS, and Lucide icons.

## Preview locally

Open a terminal in this InternTrack folder, then run:

```powershell
pnpm dev
```

Open http://localhost:3000 for the landing page or http://localhost:3000/dashboard for the tracker. Keep the terminal open; press Ctrl+C to stop the server. If port 3000 is busy, use the address printed in the terminal.

Dependencies are already installed. After downloading a fresh copy, run `pnpm install` first.

### If commands are missing in your own terminal

The build environment has Node.js 24 and pnpm, but not npm. Your regular terminal may have a different PATH. If `node` or `pnpm` is not recognized, install Node.js LTS from https://nodejs.org (includes npm), reopen your terminal, then run:

```powershell
npm install --global pnpm@11
pnpm install
pnpm dev
```

Use Node.js 24 LTS or later. No database, API keys, payment account, or authentication setup is needed.

## Included

- Responsive landing page, feature cards, and free pricing preview.
- Dashboard summary cards, application table, and upcoming deadlines view.
- Add/edit dialog with company, position, location, deadline, status, and notes.
- Delete confirmation, keyword search (including notes), and status filters.
- Six clearly fictional example applications on the first visit.
- Browser localStorage persistence and JSON backup export.
- Keyboard-accessible native dialogs and loading, empty, and storage-error states.

Company and position are required. Other fields are optional. Statuses are Wishlist, Applied, Interview, Offer, and Rejected. Upcoming deadlines show active applications due today through seven days from today, using your local date. In progress counts Applied and Interview.

## Data and limitations

Data is stored under `interntrack.applications.v1` in this browser for this site's origin. It survives refreshes, but does not sync between browsers, devices, or different localhost ports. Clearing site data removes applications. Deleting all applications intentionally leaves an empty workspace; it does not regenerate examples. Use Export to download a JSON backup. Backup import is not included yet. Multiple open tabs do not synchronize live; use one tab for edits.

No Neon, Stripe, login, backend persistence, email reminders, or paid plan is connected. Pricing describes this free local demo. Landing-page preview figures are illustrative; dashboard counts reflect your actual local data.

## Checks

```powershell
pnpm lint
pnpm typecheck
pnpm build
```

For browser tests, install the test browser inside this project and run:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD\.browsers"
pnpm exec playwright install chromium
pnpm build
pnpm test:e2e
```

Tests cover desktop and mobile: landing navigation, adding/editing/deleting, refresh persistence, search and filters, deletion cancellation, empty storage, corrupted storage, and keyboard dialog dismissal. Tests use isolated browser contexts, so they do not modify your personal browser's applications.

To preview a production build: `pnpm build`, then `pnpm start`.

## Project map

- `src/app/page.tsx`: landing page
- `src/app/dashboard/page.tsx`: dashboard route
- `src/components/dashboard.tsx`: interactive tracker and forms
- `src/lib/applications.ts`: types, data validation, sample data, and dates
- `src/app/globals.css`: Tailwind import and responsive visual styles
- `tests/app.spec.ts`: browser tests

Next steps can add authentication, database persistence, and billing separately.
