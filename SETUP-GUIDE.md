# Deep Dive — Setup & Customization Guide

This guide walks you through everything you need to get the Deep Dive interactive resume game running locally, deployed to the web, and customized with your own content.

---

## Table of Contents

1. [Running Locally](#1-running-locally)
2. [How the Game Works](#2-how-the-game-works)
3. [Editing Content (Strings & Text)](#3-editing-content-strings--text)
4. [Editing Visuals (Colors & Sizes)](#4-editing-visuals-colors--sizes)
5. [Editing Sounds](#5-editing-sounds)
6. [Setting Up Supabase (Analytics + Photo Storage)](#6-setting-up-supabase-analytics--photo-storage)
7. [Adding Photos (Lobster Gallery & Delhi)](#7-adding-photos-lobster-gallery--delhi)
8. [Deploying to Vercel](#8-deploying-to-vercel)
9. [Connecting a Custom Domain](#9-connecting-a-custom-domain)
10. [Using the ?ref= Attribution Tag](#10-using-the-ref-attribution-tag)
11. [What Can Be Automated by AI](#11-what-can-be-automated-by-ai)
12. [Quick Reference: File Map](#12-quick-reference-file-map)
13. [Setting Up the Wise Diver AI Chatbot](#13-setting-up-the-wise-diver-ai-chatbot)

---

## 1. Running Locally

### Prerequisites
- **Node.js** (version 18 or newer) — download from https://nodejs.org
- A terminal (Terminal.app on Mac, or the built-in terminal in Cursor)

### Steps

```bash
# 1. Navigate to the project folder
cd ~/dive-resume

# 2. Install dependencies (only needed once, or after adding packages)
npm install

# 3. Start the development server
npm run dev
```

This starts a local server at **http://localhost:5173**. Open it in your browser.

**Hot reload**: Any changes you make to files will instantly appear in the browser without refreshing. This includes JSON config changes.

### Building for Production

```bash
npm run build    # Creates optimized files in dist/
npm run preview  # Preview the production build locally
```

---

## 2. How the Game Works

The game is entirely controlled by **three JSON config files**. You never need to edit code to change content, colors, or sounds.

| File | What it controls |
|------|-----------------|
| `src/config/content.json` | All text, treasure items, reference divers, Delhi, lobster, creatures |
| `src/config/theme.json` | All colors, sizes, world dimensions, pixel size, zone boundaries |
| `src/config/audio.json` | All sound effects, ambient sound, volumes |

**Rule**: If you want to change what the game says or shows → edit `content.json`. If you want to change how it looks → edit `theme.json`. If you want to change how it sounds → edit `audio.json`.

---

## 3. Editing Content (Strings & Text)

Open `src/config/content.json` in Cursor. Here's what each section controls:

### Title Screen

```json
"meta": {
  "title": "DEEP DIVE",           ← Big title text
  "subtitle": "An Interactive Resume",  ← Below the title
  "author": "David T. Gordon",     ← Your name
  "tagline": "Product Manager — AI-Powered...",  ← One-line description
  "location": "Seattle, WA"        ← Your location
}
```

To change: edit the string values directly. Save the file. If the dev server is running, changes appear instantly.

### Instructions (Start Screen)

```json
"startScreen": {
  "instructions": [
    "Arrow keys or WASD to swim",
    "SPACE to interact with glowing items",
    "ESC to close dialogs",
    "Discover all items to complete the dive"
  ],
  "buttonLabel": "DIVE IN"    ← The start button text
}
```

### Zone Names & Announcements

```json
"zones": [
  { "id": "surface", "label": "THE SURFACE", "announcement": "THE SURFACE — Overview" },
  ...
]
```

- `label`: The persistent zone name shown at the top of the screen
- `announcement`: The big text that fades in when you enter a new zone

### Treasure Items (Your Resume Content)

Each treasure is a discoverable item placed in the game world:

```json
{
  "id": "summary",          ← Unique ID (don't change unless you know what you're doing)
  "x": 0.5,                 ← Horizontal position (0 = left edge, 1 = right edge)
  "y": 100,                 ← Vertical position in pixels (0 = top, 2400 = bottom)
  "zone": "surface",        ← Which zone it belongs to (for tracking)
  "title": "Who I Am",      ← Dialog heading when opened
  "content": "Product Manager specializing in...",  ← Dialog body text
  "iconType": "scroll",     ← Visual type: "chest", "gem", or "scroll"
  "enabled": true            ← Set to false to hide without deleting
}
```

**To add a new treasure**: Copy an existing treasure object, change the `id` to something unique, adjust `x`, `y`, and fill in `title` and `content`.

**To remove a treasure**: Set `"enabled": false` (preferred) or delete the entire object.

**Text formatting**: Use `\n` for line breaks within content strings.

### Reference Divers (Endorsement Quotes)

```json
{
  "id": "ref-1",
  "x": 0.2, "y": 500,
  "zone": "shallow",
  "name": "[Placeholder Name]",      ← Person's real name
  "title": "[Placeholder Title]",     ← Their job title
  "relationship": "Former Manager",   ← Label shown above the quote
  "quote": "[Placeholder quote]",     ← Their endorsement
  "enabled": true
}
```

Replace the `[Placeholder]` values with real names, titles, and quotes.

### Delhi the Dog

```json
"delhi": {
  "enabled": true,
  "x": 0.65, "y": 1200,
  "zone": "midzone",
  "message": "[PLACEHOLDER] Delhi's story goes here.",
  "photo": {
    "src": "[PLACEHOLDER_SUPABASE_URL]/delhi.jpg",   ← Replace with real Supabase URL
    "caption": "[PLACEHOLDER] Delhi caption"
  }
}
```

### Larry the Lobster (Photo Gallery)

```json
"lobster": {
  "enabled": true,
  "x": 0.5, "y": 2300,
  "message": "...",
  "buttonText": "View Gallery",
  "photos": [
    { "src": "https://your-project.supabase.co/storage/v1/object/public/photos/photo1.jpg", "caption": "Caption" },
    ...
  ]
}
```

Add/remove photo entries to change the gallery. Each needs a `src` (Supabase Storage URL) and optional `caption`.

### Decompression Diver

```json
"decompressionDiver": {
  "name": "Dive Master Dan",
  "message": "Easy there — you've been deep..."
}
```

### Completion Screen

```json
"completion": {
  "message": "You've explored everything. Thanks for diving in.",
  "ctaLinks": [
    { "label": "Email", "url": "mailto:dgordon2393@icloud.com", "type": "email" },
    { "label": "LinkedIn", "url": "https://linkedin.com/in/...", "type": "linkedin" },
    { "label": "Phone", "url": "tel:610-772-6451", "type": "phone" }
  ],
  "diveAgainLabel": "Dive Again",
  "keepExploringLabel": "Keep Exploring"
}
```

### Ambient Creatures

```json
"creatures": [
  { "type": "fish", "zone": "surface", "count": 4 },
  { "type": "school", "zone": "shallow", "count": 1 },
  { "type": "turtle", "zone": "midzone", "count": 1 },
  { "type": "shark", "zone": "deep", "count": 1 },
  { "type": "orca", "zone": "deep", "count": 1 },
  ...
]
```

Adjust `count` to add/remove creatures. Types: `fish`, `school`, `turtle`, `shark`, `orca`.

---

## 4. Editing Visuals (Colors & Sizes)

Open `src/config/theme.json`.

### Pixel Size (Chunkiness)

```json
"pixelSize": 3
```

Higher = chunkier/bigger pixels. Lower = finer detail. Try 2–4.

### World Dimensions

```json
"world": { "width": 800, "height": 2400 }
```

**Warning**: Changing world height means you should also update zone boundaries and item Y positions.

### Zone Boundaries

```json
"zones": [
  { "id": "surface", "startY": 0, "endY": 300 },
  { "id": "shallow", "startY": 300, "endY": 800 },
  ...
]
```

### Water Colors (Per Zone)

```json
"colors": {
  "water": {
    "surface": ["#1a8fc4", "#1578a8"],    ← [top gradient, bottom gradient]
    "shallow": ["#1578a8", "#0e5f8c"],
    ...
  }
}
```

Each zone has a two-color gradient. Adjacent zones should share endpoint colors for smooth transitions.

### Diver Colors

```json
"diver": {
  "colors": {
    "suit": "#222222",
    "skin": "#f0c08a",
    "mask": "#44aadd",
    "tank": "#666666",
    "fins": "#228844"
  }
}
```

### Other Visual Settings

- `interactionRadius`: How close the player must be to interact (in pixels)
- `camera.lerpFactor`: How smoothly the camera follows (0.01 = very smooth, 0.2 = snappy)
- `camera.verticalOffsetRatio`: Where the player sits on screen (0.3 = upper third)
- `particles.bubbleCount`, `particles.discoveryBurstCount`: Particle amounts
- `joystick.size`, `joystick.offset`: Mobile joystick sizing
- `carousel.maxWidth`, `carousel.maxHeight`: Photo gallery sizing

### Lobster Colors

```json
"lobster": {
  "shellColor": "#CC3333",
  "clawColor": "#DD4444",
  "antennaeColor": "#AA2222",
  "glowColor": "#FF6644"
}
```

### Delhi Colors

```json
"delhi": {
  "furColor": "#C4915E",
  "gearColor": "#336699",
  "maskColor": "#88CCEE",
  "glowColor": "#FFAA44"
}
```

### UI Colors

```json
"colors": {
  "ui": {
    "background": "rgba(0, 20, 40, 0.85)",    ← Dialog/HUD background
    "border": "#4488aa",                        ← Borders
    "text": "#e0f0ff",                          ← Body text
    "prompt": "#88ccff",                        ← Secondary text
    "title": "#ffdd44"                          ← Headings (gold)
  }
}
```

---

## 5. Editing Sounds

Open `src/config/audio.json`.

### Global Controls

```json
"masterVolume": 0.3,    ← Overall volume (0 = silent, 1 = full)
"enabled": true          ← Set to false to mute everything
```

### Sound Effects

Each effect has:

```json
"discover": {
  "frequencies": [523, 659, 784],  ← Musical notes (Hz). Multiple = ascending arpeggio
  "duration": 300,                  ← How long in milliseconds
  "type": "sine",                   ← Oscillator type: sine, triangle, square, sawtooth
  "volume": 0.4                     ← Per-effect volume (multiplied by masterVolume)
}
```

**Available effects**: `discover`, `swim`, `bubble`, `zoneChange`, `dialogOpen`, `dialogClose`, `decompressionStart`, `decompressionComplete`

**Tips**:
- `sine` = smooth, clean tone
- `triangle` = slightly buzzy
- `square` = retro/8-bit feel
- `sawtooth` = harsh/bright
- Higher Hz = higher pitch. Middle C = 262 Hz. C5 = 523 Hz.

### Ambient Hum

```json
"ambient": {
  "enabled": true,
  "baseFrequency": 80,    ← Low hum frequency (lowers as player dives deeper)
  "volume": 0.06,
  "type": "sine"
}
```

---

## 6. Setting Up Supabase (Analytics + Photo Storage)

Supabase provides two things: **analytics event tracking** and **photo storage** for the lobster gallery and Delhi.

**The game works perfectly without Supabase** — analytics are silently skipped and placeholder photos are used. Set up Supabase when you're ready.

### Step-by-Step

1. **Create a Supabase account**: Go to https://supabase.com and sign up (free tier is plenty)

2. **Create a new project**: Click "New Project", give it a name (e.g. "deep-dive"), choose a region close to you, set a database password (save it somewhere)

3. **Get your project URL and anon key**:
   - Go to **Settings → API** in the Supabase dashboard
   - Copy the **Project URL** (looks like `https://abcdefg.supabase.co`)
   - Copy the **anon / public** key (a long string starting with `eyJ...`)

4. **Add them to your `.env` file**:
   Open `.env` in your project root and replace the placeholders:
   ```
   VITE_SUPABASE_URL=https://abcdefg.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Create the events table**:
   - Go to the **SQL Editor** in the Supabase dashboard
   - Run this SQL:

   ```sql
   CREATE TABLE events (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at timestamptz DEFAULT now(),
     session_id text NOT NULL,
     ref text,
     event_type text NOT NULL,
     data jsonb
   );

   -- Allow anonymous inserts (using the anon key)
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Allow anonymous inserts"
     ON events
     FOR INSERT
     TO anon
     WITH CHECK (true);
   ```

6. **Create the photos storage bucket** (for lobster gallery + Delhi photo):
   - Go to **Storage** in the Supabase dashboard
   - Click **New Bucket**
   - Name it `photos`
   - Toggle **Public bucket** to ON (so images can be loaded without auth)
   - Click **Create bucket**

7. **Restart your dev server** (so it picks up the new `.env` values):
   ```bash
   # Stop the server (Ctrl+C) then:
   npm run dev
   ```

### Verify It Works

Open the game, click "DIVE IN", swim around. Then go to the Supabase dashboard → **Table Editor → events**. You should see rows appearing.

---

## 7. Adding Photos (Lobster Gallery & Delhi)

Photos are stored in Supabase Storage and referenced by URL in `content.json`.

### Upload Photos

1. Go to **Storage → photos** bucket in the Supabase dashboard
2. Click **Upload files** and select your photos
3. After upload, click on a photo filename
4. Click **Get URL** (or copy the URL from the detail panel)
5. The URL looks like: `https://abcdefg.supabase.co/storage/v1/object/public/photos/my-photo.jpg`

### Update content.json with Photo URLs

**For the lobster gallery**, update the `photos` array:

```json
"lobster": {
  "photos": [
    { "src": "https://abcdefg.supabase.co/storage/v1/object/public/photos/wildlife1.jpg", "caption": "Reef shark encounter, Bahamas" },
    { "src": "https://abcdefg.supabase.co/storage/v1/object/public/photos/wildlife2.jpg", "caption": "Sea turtle at sunrise" },
    { "src": "https://abcdefg.supabase.co/storage/v1/object/public/photos/wildlife3.jpg", "caption": "" }
  ]
}
```

**For Delhi**, update the photo object:

```json
"delhi": {
  "photo": {
    "src": "https://abcdefg.supabase.co/storage/v1/object/public/photos/delhi.jpg",
    "caption": "Delhi enjoying the beach"
  }
}
```

Save, push, done.

---

## 8. Deploying to Vercel

### First-Time Setup

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Then create a repo on github.com and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/deep-dive.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com and sign up with your GitHub account
   - Click **Add New → Project**
   - Import your `deep-dive` repository
   - Vercel auto-detects it's a Vite project — no config needed
   - Click **Deploy**

3. **Add environment variables**:
   - In the Vercel dashboard, go to your project → **Settings → Environment Variables**
   - Add these two:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Click **Save**
   - Go to **Deployments** → click the three dots on the latest deployment → **Redeploy** (to pick up the env vars)

4. **Enable Vercel Web Analytics** (optional):
   - In the Vercel dashboard → your project → **Analytics** tab
   - Toggle it on — zero code changes needed
   - This gives you visitor counts, referrers, countries, devices

### Ongoing Deploys

After the initial setup, every `git push` to `main` automatically triggers a deploy:

```bash
# Edit content.json, theme.json, or any file
git add .
git commit -m "Update resume content"
git push
```

Vercel deploys in ~30 seconds. Your changes are live.

---

## 9. Connecting a Custom Domain

1. Buy a domain (e.g. from Namecheap, Google Domains, Cloudflare)
2. In the Vercel dashboard → your project → **Settings → Domains**
3. Type your domain (e.g. `deepdive.davidgordon.com`) and click **Add**
4. Vercel shows you DNS records to add. Go to your domain registrar and add them:
   - Usually a CNAME record pointing to `cname.vercel-dns.com`
   - Or A records pointing to Vercel's IP addresses
5. Wait for DNS propagation (usually minutes, sometimes up to 48 hours)
6. Vercel auto-provisions SSL — your site will be available at `https://yourdomain.com`

---

## 10. Using the ?ref= Attribution Tag

When sending the game link to specific people, add a `?ref=` parameter:

```
https://your-game.vercel.app?ref=jane-google
https://your-game.vercel.app?ref=recruiter-meta
```

This tag is invisible to the visitor but is attached to every analytics event for that session. You can then query Supabase to see exactly what each person did:

```sql
-- Did Jane from Google play the game?
SELECT event_type, data, created_at
FROM events
WHERE ref = 'jane-google'
ORDER BY created_at;
```

---

## 11. What Can Be Automated by AI

Here's what you can ask me (the AI) to do for you:

### I CAN do these directly:
- Edit any text in `content.json` — just tell me what to change
- Add/remove/reorder treasure items, reference divers, creatures
- Change colors, sizes, and visual settings in `theme.json`
- Adjust sound effects in `audio.json`
- Add new photo entries to the lobster gallery (you provide URLs, I add them)
- Update CTA links, zone names, button labels
- Modify game logic (speeds, timers, interaction radius)
- Create the Supabase SQL table (I already provided the SQL above — but you need to run it in the Supabase dashboard)
- Push code to GitHub (`git add`, `commit`, `push`)

### YOU need to do these manually:
- **Create accounts**: Supabase, Vercel, GitHub (one-time, takes ~5 minutes each)
- **Create the Supabase project**: Click "New Project" in the dashboard
- **Run the SQL**: Copy the SQL from Section 6 and paste it into Supabase's SQL Editor
- **Create the storage bucket**: Click "New Bucket" in Supabase Storage
- **Upload photos**: Drag and drop in the Supabase Storage UI
- **Copy URLs**: Copy the Supabase project URL, anon key, and photo URLs
- **Import project in Vercel**: Click "Import" in the Vercel dashboard
- **Add env vars in Vercel**: Paste them in the Vercel Settings
- **DNS setup**: Add records at your domain registrar

### Rough time estimates:
| Task | Time |
|------|------|
| GitHub account + repo | 5 min |
| Supabase account + project + table + bucket | 10 min |
| Vercel account + deploy + env vars | 5 min |
| Upload photos + update content.json | 10 min |
| Custom domain | 5 min (+ DNS propagation wait) |

**Total from zero to live**: ~35 minutes of manual work.

---

## 12. Quick Reference: File Map

```
dive-resume/
├── .env                          ← Supabase credentials (NEVER commit this)
├── index.html                    ← HTML shell
├── package.json                  ← Dependencies
├── vite.config.js                ← Build config
├── SETUP-GUIDE.md                ← This file
├── deep-dive-brd.md              ← Requirements document
└── src/
    ├── App.jsx                   ← Root component, state orchestration
    ├── main.jsx                  ← Entry point
    ├── config/
    │   ├── content.json          ← ALL TEXT & CONTENT — edit this most
    │   ├── theme.json            ← ALL VISUALS — colors, sizes
    │   └── audio.json            ← ALL SOUNDS — effects, volumes
    ├── engine/
    │   ├── GameCanvas.jsx        ← Main game loop & rendering
    │   ├── input.js              ← Keyboard handler
    │   ├── touchInput.js         ← Touch/mobile handler
    │   ├── camera.js             ← Camera follow logic
    │   └── collision.js          ← Proximity detection
    ├── rendering/
    │   ├── diver.js              ← Player sprite
    │   ├── treasures.js          ← Chest/gem/scroll sprites
    │   ├── lobster.js            ← Lobster sprite
    │   ├── delhi.js              ← Delhi dog sprite
    │   ├── creatures.js          ← Fish, turtle, shark, orca
    │   ├── scenery.js            ← Background, seaweed, coral, rocks
    │   ├── hud.js                ← Depth meter, counter, zone label
    │   └── effects.js            ← Particles, screen flash
    ├── audio/
    │   └── soundEngine.js        ← Web Audio oscillator system
    ├── analytics/
    │   └── tracker.js            ← Supabase event tracking
    ├── screens/
    │   ├── TitleScreen.jsx       ← Start screen
    │   ├── CompletionOverlay.jsx ← Win screen with CTAs
    │   └── DecompressionOverlay.jsx ← Easter egg timer
    ├── ui/
    │   ├── Dialog.jsx            ← Content dialogs
    │   ├── PhotoCarousel.jsx     ← Photo gallery overlay
    │   ├── VirtualJoystick.jsx   ← Mobile joystick visual
    │   └── InteractButton.jsx    ← Mobile interact button
    ├── state/
    │   └── gameState.js          ← State management
    ├── data/
    │   └── david-knowledge.md    ← Knowledge base for the AI diver chatbot
    └── engine/
        └── npcChat.js            ← AI chat handler (placeholder + live modes)
```

---

## 13. Setting Up the Wise Diver AI Chatbot

The Wise Diver is an NPC in The Reef zone that players can talk to using natural language to ask questions about your experience. It's currently in **placeholder mode** — it responds with canned messages until you connect a real AI.

Here's everything you need to do to make it live:

---

### Step 1: Fill in your knowledge base

Edit `src/data/david-knowledge.md` with your actual background. This file is the AI's source of truth — the more detail you add, the better the answers.

Include:
- A short bio (2–3 sentences)
- Each job: company, role, years, what you built, and the impact
- Skills and strengths
- What kind of role you're looking for
- Any fun facts or talking points you want to highlight

---

### Step 2: Choose an AI approach

You have two options. **Option A (Supabase Edge Function)** is recommended for production because it keeps your API key server-side. **Option B (Direct OpenAI)** is simpler but exposes your API key in the browser — only use it for local testing.

---

#### Option A: Supabase Edge Function (Recommended)

**2a. Create the Edge Function**

In your Supabase project, create a new Edge Function called `npc-chat`:

```bash
supabase functions new npc-chat
```

Paste this into `supabase/functions/npc-chat/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY')!;

// Paste the full contents of your david-knowledge.md here as a string,
// or load it dynamically from Supabase Storage.
const KNOWLEDGE_BASE = `
[PASTE YOUR david-knowledge.md CONTENT HERE]
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } });
  }

  const { question, history } = await req.json();

  const systemPrompt = `You are a wise, friendly scuba diver NPC in an underwater interactive resume game.
You know everything about David Gordon's professional background, experience, and skills.
Answer questions about David concisely and conversationally — you're underwater, keep it punchy (2–3 sentences max).
If asked something unrelated to David's career, gently redirect.

David's background:
${KNOWLEDGE_BASE}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history ?? []),
    { role: 'user', content: question },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 200, temperature: 0.7 }),
  });

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content ?? "My regulator's acting up — try again?";

  return new Response(JSON.stringify({ answer }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
```

**2b. Set the OpenAI secret in Supabase**

```bash
supabase secrets set OPENAI_API_KEY=sk-...your-key-here...
```

**2c. Deploy the function**

```bash
supabase functions deploy npc-chat
```

**2d. Add environment variables to your `.env` file (and Vercel)**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

On Vercel: go to **Project Settings → Environment Variables** and add both.

---

#### Option B: Direct OpenAI (Local/Dev Only)

Add to your `.env` file:

```
VITE_OPENAI_API_KEY=sk-...your-key-here...
```

The chat engine (`src/engine/npcChat.js`) will automatically detect this and call OpenAI directly. **Do not deploy this to production** — the key will be visible in the browser bundle.

---

### Step 3: Verify it works

1. Run `npm run dev`
2. Dive in, swim to The Reef zone (roughly 800–1500ft depth on the right side of the world)
3. Approach the gold-suited diver until you see `[SPACE] to chat!`
4. Press Space — the chat overlay should open
5. Ask a question — you should get a real AI response instead of the placeholder message

---

### Step 4: Customize the suggested questions

Open `src/screens/NPCChatOverlay.jsx` and edit the `SUGGESTED_QUESTIONS` array at the top to match your background:

```js
const SUGGESTED_QUESTIONS = [
  "What's David's background?",
  "What did he build at Amazon?",
  "What kind of role is he looking for?",
  "What are his strongest skills?",
];
```

---

### Step 5: Customize the NPC's speech bubbles

Open `src/engine/GameCanvas.jsx` and find the `NPC_QUIPS` array near the top of the file. Edit these to match your personality:

```js
const NPC_QUIPS = [
  '💬 Ask me about David!',
  '🤿 I know his whole story.',
  '📜 Years of experience — ask away.',
  '💡 Curious? Come talk to me.',
  '🦞 Not about lobsters. About David.',
];
```

---

### Files involved

| File | Purpose |
|------|---------|
| `src/data/david-knowledge.md` | Your background — the AI's source of truth |
| `src/engine/npcChat.js` | Chat engine — switches between placeholder and live AI |
| `src/screens/NPCChatOverlay.jsx` | Chat UI overlay |
| `src/rendering/npcDiver.js` | The gold-suited wise diver sprite |
| `src/engine/GameCanvas.jsx` | NPC position, proximity detection, speech bubbles |
| `supabase/functions/npc-chat/` | Edge Function (you create this) |
