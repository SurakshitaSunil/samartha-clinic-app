# Samartha Clinic — Dashboard

A clinic management app: patients, appointments, prescriptions (with printable
letterheads for each doctor), billing/e-receipts, and a revenue tracker —
shared live between doctors and reception across any device.

This project is packaged as a real, deployable website. It costs
**$0/month** to run on the free tiers below, unless your clinic's data
grows far beyond what a small practice needs.

---

## 1. Create a free Supabase project (your database)

1. Go to **[supabase.com](https://supabase.com)** → sign up (free) → **New Project**.
2. Pick any name/region, set a database password (save it somewhere safe — you won't need it day-to-day), and wait ~2 minutes for it to spin up.
3. In your new project, go to **SQL Editor → New query**, paste in the entire contents of **`supabase/schema.sql`** (included in this project), and click **Run**. This creates the one table the app needs and turns on live sync.
4. Go to **Settings → API**. You'll need two values from this page in the next step:
   - **Project URL**
   - **anon public** key (NOT the `service_role` key — that one must stay secret and is not used by this app)

## 2. Configure the app with your Supabase details

1. In this project folder, copy `.env.example` to a new file named `.env`:
   ```
   cp .env.example .env
   ```
2. Open `.env` and paste in your Project URL and anon key from step 1.4.

## 3. Run it locally (optional, to test before deploying)

You'll need [Node.js](https://nodejs.org) installed (version 18 or newer).

```
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Sign in with the
default codes (`1234` for either doctor, `0000` for reception) and confirm
everything loads and saves correctly.

## 4. Deploy it live (so it's reachable from any device, not just your computer)

The easiest option is **[Vercel](https://vercel.com)** (also free):

1. Push this project to a GitHub repository (create one on github.com, then
   `git init`, `git add .`, `git commit -m "Samartha Clinic app"`, `git push`).
2. Go to [vercel.com](https://vercel.com) → sign up with your GitHub account →
   **Add New Project** → select this repository.
3. Vercel will auto-detect it's a Vite project. Before clicking Deploy, open
   **Environment Variables** and add the same two values from your `.env`
   file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. In about a minute you'll get a live URL like
   `samartha-clinic-app.vercel.app` — that's it, live on the internet.

**Netlify** works the same way if you'd rather use that instead — same
steps, same free tier, same environment variables.

### Custom domain (optional)

Once deployed, both Vercel and Netlify let you attach a custom domain (e.g.
`app.samarthaclinic.com`) for free — you just need to own the domain and
add a couple of DNS records they'll show you. Look for "Domains" in your
project's dashboard on either platform.

## 5. Change the default sign-in codes

The database seed sets default codes (`1234` / `1234` / `0000`). **Change
these before real use** — sign in as a doctor, go to **Settings → Sign-in
Codes**, and set your own. These are simple access codes for separating
what doctors vs. reception can do inside the app, not a full security
system — don't reuse a sensitive password here.

---

## What's inside

```
samartha-clinic-app/
├── src/
│   ├── App.jsx              ← the entire app (all views, components, logic)
│   ├── main.jsx              ← React entry point
│   ├── index.css             ← Tailwind + fonts
│   └── lib/
│       ├── supabaseClient.js ← connects to your Supabase project
│       └── storage.js        ← save/load + live sync (Supabase-backed)
├── supabase/
│   └── schema.sql            ← run this once in Supabase's SQL Editor
├── .env.example               ← copy to .env and fill in your Supabase keys
└── package.json
```

## How data & sync work

Every piece of clinic data (patients, appointments, prescriptions, bills,
custom medicines, and clinic settings) lives in a single Supabase table
called `clinic_kv`, as one row per data type. When anyone saves something,
Supabase's Realtime feature pushes that change out, and every other open
device automatically refreshes — so a bill created at the front desk shows
up in the doctor's patient view without anyone refreshing the page.

## Notes & honest limitations

- **Sign-in codes are not a full auth system.** They're a simple way to
  separate "doctor" vs. "receptionist" views inside the app, stored in the
  same shared table as everything else. Anyone with the app's URL and a
  code can sign in. If you need real accounts, audit logs, or per-user
  passwords, that's a further step up (Supabase Auth) — ask if you'd like
  that built in.
- **Printing/PDF** uses the browser's native print dialog ("Save as PDF" is
  a standard print destination on every OS) — there's no separate PDF file
  generated or stored.
- **Uploaded prescription photos** are compressed and stored as text
  (base64) inside the `prescriptions` JSON blob. This is simple and works
  well for a single clinic's volume; if you start scanning a very large
  number of image-heavy prescriptions, migrating those to Supabase Storage
  (their dedicated file storage) would be a worthwhile upgrade later.
