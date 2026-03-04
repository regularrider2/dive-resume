# Go live — ship to hiring managers

Follow these steps in order. Check off each step when done. Every step has a time estimate.

**Tip:** Copy **GO-LIVE-NOTES-TEMPLATE.txt** into your Notes app and fill it in as you go — that’s where you’ll stash Project URL, API key, photo filenames, Vercel URL, etc. so everything is in one place. Don’t share that file or paste it in chat (it will contain secrets).

**Total time: ~55 min** (or ~50 min if your repo is already on GitHub and you’ve already drafted your Ghost Diver knowledge).

| Part | What | Time |
|------|------|------|
| 1 | Supabase (account, table, photos) | ~16 min |
| 2 | .env file | ~2 min |
| 3 | AI updates content.json (you send URL + filenames) | ~1 min |
| 4 | GitHub (if needed) | ~5 min |
| 5 | Vercel (deploy + env vars + analytics) | ~7 min |
| 6 | Ghost Diver (knowledge + deploy) | ~21–26 min |

---

## Part 1: Supabase (analytics + photo storage) — ~16 min total

### Step 1.1 — Create a Supabase account and project — ~5 min

1. Go to **https://supabase.com** and sign up (free tier is enough).
2. Click **New Project**.
3. Name it (e.g. `deep-dive` or `dive-resume`), pick a region near you, set a database password and **save it somewhere**.
4. Wait for the project to finish creating.

- [ ] Done

---

### Step 1.2 — Get your Project URL and API key — ~1 min

1. In the Supabase dashboard, open **Settings** (gear icon in the left sidebar).
2. **Project URL:** Go to **General**. You’ll see **Project ID** (e.g. `tpkhuaacsdbogjymxqve`). Your Project URL is: **`https://[your-project-id].supabase.co`** — replace `[your-project-id]` with that ID. Example: if Project ID is `tpkhuaacsdbogjymxqve`, the URL is `https://tpkhuaacsdbogjymxqve.supabase.co`. Copy or type that URL into your notes.
3. **API key (for the app):** Go to **Configuration → API Keys**. On the **“Publishable and secret API keys”** tab, find **Publishable key** (it starts with `sb_publishable_...`). Click the **Copy** icon next to it. That’s the key that goes in `.env` as `VITE_SUPABASE_ANON_KEY`. (If your dashboard has a **“Legacy anon, service_role API keys”** tab instead, use the **anon** key there — long string starting with `eyJ...` — either format works.)

Keep both handy — you’ll paste them into `.env` and Vercel later. **Don’t paste them into chat.** Use the template in **GO-LIVE-NOTES-TEMPLATE.txt** to collect everything in one place.

- [ ] Done

---

### Step 1.3 — Create the events table (for analytics) — ~2 min

1. In the left sidebar, click **SQL Editor**.
2. Click **New query**.
3. Copy the entire SQL below, paste it into the editor, then click **Run** (or press Cmd/Ctrl+Enter).

```sql
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  session_id text NOT NULL,
  ref text,
  event_type text NOT NULL,
  data jsonb
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
  ON events
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

4. You should see “Success.” You can confirm in **Table Editor** — there should be an `events` table.

- [ ] Done

---

### Step 1.4 — Create the photos bucket and upload images — ~8 min

1. In the left sidebar, click **Storage**.
2. Click **New bucket**.
3. Name it exactly: **photos**
4. Turn **Public bucket** ON (so the game can load images).
5. Click **Create bucket**.
6. Click into the **photos** bucket, then **Upload file** (or drag and drop).
7. Upload:
   - One image for Delhi (e.g. `delhi.jpg`)
   - Your camera gallery images (e.g. `photo1.jpg`, `photo2.jpg`, `photo3.jpg` — use the filenames you want)
8. After upload, note the **exact filenames** (e.g. `delhi.jpg`, `photo1.jpg`). You’ll send these to the AI so it can update `content.json` with the correct URLs.

- [ ] Done. My photo filenames: _____________________

---

## Part 2: Create your `.env` file (local only) — ~2 min

### Step 2.1 — Copy the template and add your values — ~2 min

1. In your project folder (`dive-resume`), find the file **`.env.example`**.
2. Duplicate it and rename the copy to **`.env`** (exactly, with the dot at the start).
3. Open **`.env`** in your editor.
4. Replace the placeholders with your real values:
   - **VITE_SUPABASE_URL** — paste the Project URL you copied in Step 1.2 (e.g. `https://xxxxxxxx.supabase.co`).
   - **VITE_SUPABASE_ANON_KEY** — paste the anon key you copied in Step 1.2.
5. Save the file.  
   Do **not** commit `.env` to git (it’s already in `.gitignore`).

- [ ] Done

---

## Part 3: Tell the AI so it can update the site — ~1 min

You need the game to use your real photo URLs. The AI can update `content.json` for you.

**Send a message** (in Cursor chat or wherever you’re working with the AI) with:

1. Your **Supabase project URL** (e.g. `https://xxxxxxxx.supabase.co`) — this is safe to paste; it’s public.
2. The **exact filenames** you uploaded to the `photos` bucket (e.g. `delhi.jpg`, `photo1.jpg`, `photo2.jpg`, `photo3.jpg`).
3. Optional: captions for Delhi and each gallery photo. If you don’t care, say “no captions.”

Example message:

> My Supabase URL is https://abcdefgh.supabase.co. I uploaded delhi.jpg, photo1.jpg, photo2.jpg, photo3.jpg. No captions needed.

The AI will update `src/config/content.json` so the game loads those images. You do **not** need to paste your anon key.

- [ ] Done (after you get the updated content back)

---

## Part 4: GitHub — ~5 min

If your repo is already on GitHub and connected, skip to Part 5 and just run `git add . && git commit -m "Go live" && git push` when you’re ready to deploy.

1. Go to **https://github.com** and sign in.
2. Click **New repository**. Name it (e.g. `dive-resume`), leave it empty, create.
3. On your laptop, in the project folder, open a terminal and run:

```bash
cd /Users/davidgordon/dive-resume
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

- [ ] Done (or skipped — repo already on GitHub)

---

## Part 5: Vercel (hosting) — ~7 min total

### Step 5.1 — Import the project — ~3 min

1. Go to **https://vercel.com** and sign in (use “Continue with GitHub” if you use GitHub).
2. Click **Add New…** → **Project**.
3. Import your **dive-resume** (or whatever the repo is called) from GitHub.
4. Vercel will detect Vite. Don’t change the defaults. Click **Deploy**.
5. Wait for the first deploy to finish. You’ll get a URL like `dive-resume.vercel.app`. The site is live, but it won’t have analytics or real photos until you add env vars and redeploy.

- [ ] Done

---

### Step 5.2 — Add environment variables and redeploy — ~3 min

1. In the Vercel project, go to **Settings** → **Environment Variables**.
2. Add two variables (use the same values as in your `.env`):

   - **Name:** `VITE_SUPABASE_URL`  
     **Value:** your Supabase Project URL (e.g. `https://xxxxxxxx.supabase.co`)

   - **Name:** `VITE_SUPABASE_ANON_KEY`  
     **Value:** your Supabase anon key

3. Save.
4. Go to **Deployments**, click the **⋯** on the latest deployment, and choose **Redeploy**. This makes the live site use the new env vars (analytics and photo URLs will work).

- [ ] Done

---

### Step 5.3 — Turn on Vercel Web Analytics — ~1 min

1. In your Vercel project, open the **Analytics** tab.
2. Turn **Web Analytics** on. No code changes. You get unique visitors, page views, referrers, countries, devices.

- [ ] Done

---

## Part 6: Ghost Diver (knowledge + deploy) — ~21–26 min total

The Ghost Diver is the NPC in The Reef that answers hiring managers’ questions **in natural language** about you and your work. It uses only the context you put in `src/data/david-knowledge.md` and runs with guardrails so it stays on topic.

### Step 6.1 — Fill in your knowledge file — ~15–20 min

1. Open **`src/data/david-knowledge.md`** in your editor.
2. Replace the placeholder sections with your real content: bio, roles, **descriptions of your work** (projects, features, impact), skills, what you’re looking for, fun facts. Use as much detail as you want — the Ghost Diver will use only this file and won’t invent details.
3. Save the file.

- [ ] Done

---

### Step 6.2 — Inline knowledge into the Edge Function — ~1 min

1. From the project root, in a terminal, run:  
   **`npm run build:ghost-diver`**  
2. This copies the contents of `david-knowledge.md` into the Supabase Edge Function so it’s bundled when you deploy.

- [ ] Done

---

### Step 6.3 — Set your OpenAI API key in Supabase — ~2 min

1. Get an API key from **https://platform.openai.com/api-keys** (you need an OpenAI account).
2. In Supabase: **Project Settings → Edge Functions → Secrets**, add **OPENAI_API_KEY** with your key.  
   Or use the CLI: **`supabase secrets set OPENAI_API_KEY=sk-your-key-here`**

- [ ] Done

---

### Step 6.4 — Deploy the Ghost Diver Edge Function — ~3 min

1. Install the Supabase CLI if you haven’t: **https://supabase.com/docs/guides/cli**
2. Log in and link your project: **`supabase login`** then **`supabase link`** (select your project).
3. From the project root, run: **`supabase functions deploy npc-chat`**
4. When it finishes, the Ghost Diver in the game will respond in natural language using your knowledge. No extra app env vars needed if you already set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

- [ ] Done

---

## You’re live — share with hiring managers

Your game is now:

- Hosted at your Vercel URL (e.g. `dive-resume.vercel.app`).
- Sending analytics to Supabase (events + ref tags).
- Showing your real Delhi and gallery photos.
- Ghost Diver answering questions about you in natural language (from `david-knowledge.md` only, with guardrails).

**Share the link.** When you send it to a specific hiring manager, add **`?ref=`** so you can see what they did later, e.g.:  
**`https://dive-resume.vercel.app?ref=jane-google`**

Every new push to `main` auto-deploys. To update what the Ghost Diver says: edit `david-knowledge.md`, run **`npm run build:ghost-diver`**, then **`supabase functions deploy npc-chat`**.

---

## Metrics and ref tags (what you’re tracking)

| Event             | When it fires                    | Data stored                          |
|-------------------|----------------------------------|--------------------------------------|
| `session_start`  | Page loads                       | userAgent, viewport, isTouchDevice   |
| `dive_started`    | Player clicks "DIVE IN"          | —                                    |
| `zone_entered`   | Player enters a new zone         | zone                                 |
| `item_discovered`| Player discovers an item or lobster | itemId, itemType, zone            |
| `completion`     | All items discovered             | totalTime                            |
| `cta_clicked`    | Player clicks a CTA              | linkType: email, linkedin, phone, **resume_view** |
| `lobster_delivered` | Player brings a lobster to the surface | count (1, 2, or 3)              |
| `connect_opened` | Player opens "Let's Connect"     | —                                    |
| `npc_chat_opened` | Player opens Ghost Diver chat   | —                                    |
| `ghost_diver_chat` | Each Ghost Diver Q&A exchange   | `question`, `answer` (both truncated if very long) |

Each row has `session_id`, `ref` (from `?ref=` in the URL), and `created_at`. Use ref when sharing with a specific person so you can query: **`SELECT * FROM events WHERE ref = 'jane-google' ORDER BY created_at;`** in Supabase → SQL Editor.

**Example queries:**  
Visitors vs players, completion rate, resume views, lobster deliveries — see **deep-dive-brd.md** (Analytics section) and **SETUP-GUIDE.md** (Section 10).  

**All Ghost Diver chat interactions:**  
`SELECT session_id, ref, data->>'question' AS question, data->>'answer' AS answer, created_at FROM events WHERE event_type = 'ghost_diver_chat' ORDER BY created_at;`

---

**Custom domain (optional):** If you want your own URL (e.g. `deepdive.yourname.com`), add it in Vercel → **Settings → Domains**, then add the DNS records at your registrar. — **~10 min**

If any step is unclear, say which number you’re on and what you see — we can fix it.
