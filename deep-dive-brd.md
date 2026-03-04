# Deep Dive — Interactive Resume Game

## Build Requirements Document (v2 — Consolidated)

---

## Overview

Deep Dive is a 16-bit pixel art scuba diving game that serves as an interactive resume. The player controls a diver who descends through five ocean depth zones — The Surface, The Shallows, The Reef, The Deep, and The Trench — discovering treasure items that reveal professional experience, meeting other divers who deliver endorsement quotes, finding a dog in scuba gear with a photo, collecting lobsters from the trench floor (one at a time, bring each to the surface), and discovering a floating DSLR camera that opens a photography gallery. The tone is chill and exploratory. No combat, no health bars, no fail states.

The target audience is hiring managers and recruiters. The primary platform is desktop browsers; mobile (touch) is supported. The game should be completable in 3–5 minutes.

---

## Tech Stack

- **Framework:** React (single-page app)
- **Build Tool:** Vite
- **Rendering:** HTML5 Canvas for game rendering
- **Sound:** Web Audio API (oscillator-based chiptune sounds, no external audio files)
- **Input:** Keyboard (desktop) + virtual joystick and tap (mobile/touch)
- **State:** In-memory session state only. No persistence, no save/load, no localStorage.
- **Browser Targets:** Chrome, Firefox, Safari, Edge (latest versions)

---

## System Design & Hosting

### Architecture

The game is a fully static site. There is no backend, no database, no API calls, and no server-side logic. The entire application — HTML, JavaScript, CSS, JSON configs, and photo assets — is bundled at build time and served as static files. This means zero loading states, zero network dependencies for content, and zero ongoing infrastructure costs.

### Hosting

- **Platform:** Vercel (free tier)
- **Deploy trigger:** Automatic on `git push` to the `main` branch via GitHub integration
- **Deploy time:** ~30 seconds from push to live
- **Domain:** Vercel URL (e.g. `deep-dive-resume.vercel.app`) for development; custom domain to be connected later

### Content Update Workflow

All game content, visuals, and sounds are controlled by three JSON config files bundled in the repo. No code changes are needed to update content.

**During development (local):**
1. Edit any JSON config file in Cursor
2. Vite hot-reloads instantly — changes appear in the browser without refreshing

**In production:**
1. Edit any JSON config file in Cursor (or directly on GitHub)
2. `git push` to `main`
3. Vercel auto-deploys in ~30 seconds
4. Changes are live

**What lives where:**

| Asset | Location | How to update |
|---|---|---|
| All game text (titles, descriptions, quotes) | `src/config/content.json` | Edit JSON, push |
| Sprite colors, sizes, world dimensions | `src/config/theme.json` | Edit JSON, push |
| Sound effects, volumes | `src/config/audio.json` | Edit JSON, push |
| Lobster gallery photos | Supabase Storage | Upload in Supabase dashboard, update URLs in `content.json`, push |
| Game logic, rendering, UI | `src/` | Edit code, push |

### Why No Backend for Game Content

- **Instant load:** Hiring managers clicking the link see the title screen in under a second. No API calls to wait for.
- **Zero failure modes:** No Supabase/database outage can break the game. It works as long as Vercel serves files.
- **Free forever:** Vercel free tier has no meaningful limits for a personal static site.
- **Simplicity:** One repo, one deploy target, three config files. Nothing else to manage.

### Analytics & Tracking

The game uses two layers of analytics. Neither affects gameplay — all tracking is fire-and-forget. If analytics fail, the game is completely unaffected.

**Layer 1: Vercel Web Analytics (traffic)**
- Enabled via toggle in the Vercel dashboard. Zero code changes.
- Provides: unique visitors, page views, referrers, countries, devices
- Answers: "How many people visited?"

**Layer 2: Supabase event tracking (engagement depth)**
- A single Supabase table receives anonymous gameplay events from the client.
- No auth, no user accounts, no cookies, no personal data, no cookie banner.
- Adds `@supabase/supabase-js` (~5KB) to the bundle.
- All inserts are async fire-and-forget — never block gameplay, fail silently.
- Data is queried via the Supabase dashboard using SQL.

**Supabase table: `events`**

| Column | Type | Description |
|---|---|---|
| `id` | uuid (auto) | Primary key |
| `created_at` | timestamptz (auto) | Event timestamp |
| `session_id` | text | Random UUID generated on page load (not tied to identity) |
| `ref` | text (nullable) | Attribution tag from URL `?ref=` parameter |
| `event_type` | text | Event name (see below) |
| `data` | jsonb (nullable) | Event-specific metadata |

**RLS policy:** Anonymous inserts allowed (using Supabase anon key). No client-side reads. Data is only viewable in the Supabase dashboard.

**Events tracked:**

| Event Type | When it fires | Data payload |
|---|---|---|
| `session_start` | Page loads | `{ userAgent, viewport, isTouchDevice }` |
| `dive_started` | Player clicks "DIVE IN" | — |
| `zone_entered` | Player enters a new zone | `{ zone }` |
| `item_discovered` | Player discovers any item (treasure, diver, Delhi, camera) or picks up a lobster | `{ itemId, itemType, zone }` |
| `completion` | All items discovered | `{ totalTime }` |
| `cta_clicked` | Player clicks a CTA link (completion, Connect overlay, or View Resume) | `{ linkType }` — `email`, `linkedin`, `phone`, or `resume_view` (View Resume from title screen, Connect button, or completion) |
| `lobster_delivered` | Player brings a lobster to the surface | `{ count }` (1, 2, or 3) |
| `connect_opened` | Player opens the "Let's Connect" overlay | — |
| `npc_chat_opened` | Player opens the Ghost Diver chat | — |
| `ghost_diver_chat` | Each Ghost Diver Q&A exchange (user question + model answer) | `{ question, answer }` (strings; truncated if very long) |

**Attribution via ref parameter:**

When sending the game link to a specific person, append a `?ref=` tag:
- `deep-dive.vercel.app?ref=jane-google` → all events for that session include `ref: "jane-google"`
- `deep-dive.vercel.app` → events have `ref: null` (anonymous/public traffic)

The game reads the `ref` query parameter on load and attaches it to every event. The visitor never sees it. This lets you query: *"Did jane-google complete the dive? Which items did she discover? Did she click the LinkedIn CTA?"*

**Example Supabase queries:**

```sql
-- How many people visited vs. actually played
SELECT
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'session_start') AS visitors,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'dive_started') AS players
FROM events;

-- Completion rate
SELECT
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'completion') * 100.0 /
  NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'dive_started'), 0) AS completion_pct
FROM events;

-- Did a specific person engage?
SELECT event_type, data, created_at
FROM events
WHERE ref = 'jane-google'
ORDER BY created_at;

-- Deepest zone reached per session
SELECT session_id, ref, MAX(data->>'zone') AS deepest_zone
FROM events
WHERE event_type = 'zone_entered'
GROUP BY session_id, ref;

-- CTA click-through rate (includes resume_view, email, linkedin, phone)
SELECT data->>'linkType' AS link, COUNT(*) AS clicks
FROM events
WHERE event_type = 'cta_clicked'
GROUP BY data->>'linkType';

-- How many sessions viewed the resume
SELECT COUNT(DISTINCT session_id) AS resume_views
FROM events
WHERE event_type = 'cta_clicked' AND data->>'linkType' = 'resume_view';

-- All Ghost Diver chat interactions (questions and answers)
SELECT session_id, ref, data->>'question' AS question, data->>'answer' AS answer, created_at
FROM events
WHERE event_type = 'ghost_diver_chat'
ORDER BY created_at;
```

### Future Considerations

- **Custom domain:** Connect via Vercel dashboard when purchased (one-time DNS change).
- **Photo CDN:** If the gallery grows large or needs image optimization (resize, compression), photos can be served through Cloudinary or a similar CDN in front of Supabase Storage.

---

## Config Architecture (Critical Requirement)

The entire game is driven by three JSON config files. **Zero content, visual values, or audio settings may be hardcoded in game logic.** This enables on-the-fly adjustments to text, visuals, and sounds without touching code. All values referenced in the game engine are read from these files at runtime.

During development, all text fields will contain placeholder content. The config files are the single source of truth for swapping in real content.

### `content.json`

All text, interactable data, and content definitions:

- **Meta:** Game title, subtitle
- **Start screen:** Instruction strings, button label
- **Zones:** Array of zone objects, each with `id`, `label`, `announcement` text
- **Treasures:** Array of objects — `id`, `x` (0–1 ratio), `y` (absolute px), `zone`, `title`, `content`, `iconType` (chest | gem | scroll), `enabled`
- **Reference divers:** Array of objects — `id`, `x`, `y`, `zone`, `name`, `title`, `relationship` (short label, e.g. "Former Manager"), `quote`, `enabled`
- **Delhi:** Single object — `enabled`, `x`, `y`, `zone`, `message`, `photo` (single object with `src` and `caption`). Name ("Delhi") is hardcoded. See Delhi section.
- **Lobsters:** Array of objects — each with `id`, `x`, `y`, `zone`, `message`, `enabled`. There are 3 lobsters. Player picks up one at a time and delivers to the surface. Tracked via a separate "🦞 X/3" HUD counter, NOT the discovery counter. See Lobster section.
- **Camera:** Single object — `enabled`, `x`, `y`, `zone`, `message`, `buttonText`, `photos` array. See Camera section.
- **Decompression diver:** `name`, `message`, `warningText`, `gameOverText`
- **Connect button:** Label string, links array (same format as completion CTA links) — persistent HUD button
- **Completion:** Congratulatory message, CTA links (email, LinkedIn, phone), "Dive Again" button label, "Keep Exploring" button label
- **Ambient creatures:** Array of objects — `type`, `zone`, `count`

### `theme.json`

All visual configuration:

- **Colors:** Water gradient per zone, sand, coral, seaweed, treasure glow, diver (suit, skin, mask, tank, fins), reference diver colors, lobster colors (shell, claws, antennae, glow), camera colors (body, lens, flash, glow), shipwreck colors, UI (background, border, text, prompt). Lobster colors are shared by all 3 lobsters.
- **Pixel size multiplier** (base reference for all sprites)
- **Diver:** Width, height, swim speed
- **World:** Width (fixed), height (fixed at 2400)
- **Zone boundaries:** Array of `{ id, startY, endY }` in world-pixel coordinates
- **Interaction radius:** Single global value (pixels) for all interactables
- **Creature visuals:** Fish sizes, colors, speeds; turtle size; shark opacity; school scatter radius
- **Particles:** Bubble count, speed, lifetime; discovery burst count
- **Joystick:** Size, offset from screen edge (for mobile)
- **Carousel:** Max width, max height, image max dimensions
- **Camera:** Lerp factor, vertical offset ratio

### `audio.json`

All sound configuration:

- **Master volume** (0–1)
- **Enabled** flag (global kill switch)
- **Effects:** Object keyed by effect name. Each has `frequencies` (array), `duration` (ms), `type` (oscillator type), `volume`
- **Required effect keys:** `discover`, `swim`, `bubble`, `zoneChange`, `dialogOpen`, `dialogClose`, `decompressionStart`, `decompressionComplete`
- **Ambient:** `enabled`, `baseFrequency`, `volume`, `type`

### Sound Triggers

| Effect | When it plays |
|---|---|
| `discover` | Player opens a treasure, reference diver, or camera for the first time; also plays when picking up or delivering a lobster |
| `swim` | On a repeating timer (~400ms) while the player is actively moving |
| `bubble` | When bubble particles spawn from the diver |
| `zoneChange` | Player crosses a zone boundary |
| `dialogOpen` | Any dialog or overlay opens |
| `dialogClose` | Any dialog or overlay closes |
| `decompressionStart` | Decompression sequence begins |
| `decompressionComplete` | Decompression timer reaches zero |

### Enabled Flag Behavior

Every treasure item, reference diver, Delhi, and the camera have an `enabled` field (boolean, defaults to true). When `enabled` is false, the entity does not render and is excluded from the discovery counter total. Lobsters also have an `enabled` field but are tracked via their own separate "🦞 X/3" HUD counter — they do NOT count toward the main discovery counter. This allows hiding items without deleting config entries — useful during development.

---

## Game Screens

### 1. Title Screen

Displayed on load. The game world is not visible yet.

**Elements:**
- Game title (from `content.json`) in large pixel-style text
- Subtitle
- Instruction list explaining controls (from `content.json`)
- "DIVE IN" button (label from `content.json`) — clicking this is the first user interaction, which unlocks Web Audio for the rest of the session

**Behavior:**
- Pressing the button transitions to gameplay
- No sound plays until the button is clicked (browser autoplay policy)
- Animated background: bubbles rising, water gradient

### 2. Gameplay Screen

The main game view. A canvas element renders the game world. HUD elements overlay the canvas. All overlays (dialogs, decompression, carousel) render on top of the canvas as React components.

### 3. Completion Screen

An overlay triggered when all enabled items have been discovered. See Completion Reward section.

---

## World Structure

The world is a vertically scrolling 2D space. The world dimensions are fixed: width and height defined in `theme.json` (height defaults to 2400px). All interactable positions use `x` as a 0–1 ratio of world width and `y` as absolute pixel position in world space. These positions remain valid regardless of viewport size.

### Zones (top to bottom)

| Zone ID | Display Name | Content Theme | Default Y Range |
|---|---|---|---|
| `surface` | THE SURFACE | Who I Am | 0 – 75 |
| `shallows` | THE SHALLOWS | Current role & key projects | 75 – 800 |
| `reef` | THE REEF | How I think | 800 – 1500 |
| `deep` | THE DEEP | Where I've been | 1500 – 2000 |
| `trench` | THE TRENCH | The personal side | 2000 – 2400 |

Zone boundaries (start/end Y) are defined in `theme.json` in world-pixel coordinates. Each zone has a distinct water color with gradient transitions between zones.

---

## Responsive Viewport

### Sizing
- Canvas fills the full browser window (`100vw × 100vh`), no page scrolling
- Viewport is fluid — reshapes to match the device screen, no fixed aspect ratio
- World width/height in `theme.json` define the game world, not the viewport
- On resize (including orientation change), canvas and HUD reflow

### Scaling
- Pixel size multiplier from `theme.json` is the base reference
- On viewports narrower than 500px, the engine reduces effective pixel size by one step
- HUD elements position relative to viewport dimensions, not hardcoded pixels
- Dialogs: max-width constrained, centered, responsive padding

### Orientation
- Both portrait and landscape supported
- No orientation lock required

---

## Input

### Desktop (Keyboard)
- Arrow keys or WASD: directional movement (8-way + diagonals)
- SPACE or ENTER: interact with nearby items
- ESC: close dialogs and overlays
- Left/Right arrows: navigate carousel (only when carousel is open — must not move the diver)

### Mobile (Touch)

**Virtual Joystick:**
- Bottom-left corner, circular base (semi-transparent) + thumb handle
- 360-degree movement, speed scales with drag distance from center
- Size and offset configurable in `theme.json`
- Only renders when touch is detected

**Tap to Interact:**
- When player is near an interactable, a "TAP TO INTERACT" button appears bottom-right
- Replaces the "Press SPACE" prompt on touch devices

**Dialog Dismissal:**
- Tap outside dialog to close, or tap the close button (✕)

**Touch Detection:**
- Detected on load via `'ontouchstart' in window || navigator.maxTouchPoints > 0`
- Touch controls and keyboard can coexist (tablets with keyboards)

---

## Player Character

A pixel art scuba diver rendered on canvas.

**Visual:** Dimensions and colors from `theme.json`. Sprite flips horizontally based on movement direction. Animated limbs (two-frame cycle while moving). Bubble particles emit periodically.

**Movement:** Speed from `theme.json`. Clamped to world boundaries (top, bottom, left, right with small padding).

---

## Camera

- Follows diver vertically with smooth interpolation (lerp factor from `theme.json`)
- Diver sits in the upper third of viewport (offset ratio from `theme.json`)
- Clamps at world top and bottom

---

## Interactables

All interactables share the same interaction model: player moves within the global interaction radius (from `theme.json`) and presses SPACE/ENTER (or taps the interact button on mobile).

### Treasure Items

Static objects placed throughout the world. Three visual types: `chest`, `gem`, `scroll` (per-item `iconType` in `content.json`).

**States:**
- **Undiscovered:** Full opacity, glowing pulse (sine wave)
- **Nearby:** Prompt appears at bottom of viewport: "Press SPACE to interact" (desktop) or "TAP TO INTERACT" button (mobile)
- **Discovered:** 40% opacity, glow removed, particle burst on first discovery

**Dialog:** Shows item `title` and `content` text. Closes on ESC, click outside, or close button. Plays `dialogOpen`/`dialogClose` sounds. First open plays `discover` sound.

### Reference Divers

NPC divers visually distinct from the player (different suit color in `theme.json`).

**States:**
- **Undiscovered:** Speech bubble with "?" above head, gentle vertical bob
- **Nearby:** Same prompt as treasures
- **Discovered:** Speech bubble removed, reduced opacity, still bobs

**Dialog:** Shows `name`, `title`, `relationship` label (above the quote), and `quote` in italics. Same close/sound behavior as treasures.

### Lobster

There are 3 lobster NPCs in The Trench zone. This is a collection mini-game — the player picks up one lobster at a time, carries it to the surface, then returns for the next. **Lobsters do NOT count toward the main discovery counter.** They have their own dedicated "🦞 X/3" counter in the HUD. They are defined as an array in `content.json` under the `lobsters` key.

**Visual:**
- Pixel art lobster sprite, roughly 2x the size of a fish, smaller than the diver
- 3 lobsters at different positions in The Trench
- When being carried, a smaller lobster renders next to the diver with a "🦞 → Surface!" label
- Colors (shell, claws, antennae) from `theme.json`
- Idle animation: claws open/close slowly, antennae sway, gentle vertical bob
- Glow effect (reddish, color from `theme.json`) to signal interactability
- 🦞 emoji label bubble when available; disappears once collected
- When being carried: smaller lobster renders next to diver with "🦞 → Surface!" label
- Collected lobsters no longer render

**Interaction Flow:**
1. Player approaches a lobster within interaction radius, presses SPACE/ENTER
2. If not already carrying a lobster: dialog opens with that lobster's `message`, lobster attaches to the diver
3. Player swims back to The Surface while carrying the lobster
4. On reaching The Surface zone, the lobster is "delivered" — a "LOBSTER DELIVERED!" overlay shows the running count (e.g. "2 / 3")
5. Player returns to The Trench for the next lobster
6. If already carrying a lobster, other lobsters are not interactable

**Dialog:** Shows 🦞 as the title and the lobster's message text. Same close behavior as treasures.

**content.json structure:**
```json
{
  "lobsters": [
    {
      "id": "lobster-1",
      "x": 0.2, "y": 2200,
      "zone": "trench",
      "message": "You got one! David loves lobstering. He's SSI-certified and has pulled his fair share out of the deep. Bring me to the surface!",
      "enabled": true
    },
    {
      "id": "lobster-2",
      "x": 0.7, "y": 2280,
      "zone": "trench",
      "message": "That's two! You're getting the hang of this. Now bring me up top.",
      "enabled": true
    },
    {
      "id": "lobster-3",
      "x": 0.45, "y": 2350,
      "zone": "trench",
      "message": "All three! A true lobsterman. You know the drill — bring me to the surface.",
      "enabled": true
    }
  ]
}
```

**theme.json additions:**
```json
{
  "lobster": {
    "shellColor": "#CC3333",
    "clawColor": "#DD4444",
    "antennaeColor": "#AA2222",
    "glowColor": "#FF6644"
  }
}
```

### DSLR Camera (Photography Gallery)

A floating DSLR camera in The Trench zone. This is a unique interactable that opens a fullscreen photography carousel showcasing David's award-winning wildlife and nature photography. **The camera counts toward the discovery counter total.** It is defined once in `content.json` under the `camera` key.

**Visual:**
- Pixel art DSLR camera sprite, roughly the size of a treasure chest
- Colors (body, lens, flash) from `theme.json`
- Idle animation: gentle vertical bob, slow rotation
- Glow effect (color from `theme.json`) to signal interactability
- No speech bubble — uses the standard treasure-style glow pulse when undiscovered
- After discovery: reduced opacity, glow removed (same as treasures)

**Interaction Flow:**
1. Player approaches within interaction radius, presses SPACE/ENTER
2. Dialog opens with the camera's `message` text (from `content.json`)
3. Below the message, a button labeled with `buttonText` (e.g. "View Gallery") appears
4. Clicking the button opens the Photography Carousel as a fullscreen overlay
5. First interaction triggers the `discover` sound and marks the camera as discovered
6. After discovery, the player can re-interact to reopen the carousel

**Photography Carousel:**
- Fullscreen overlay, game dimmed behind it (same treatment as completion overlay)
- Displays one photo at a time from the `photos` array in `content.json`
- Each photo: `{ "src": "https://...supabase.../photo1.jpg", "caption": "Optional caption" }`
- Navigation: left/right arrow keys or clickable arrow buttons on each side
- Position indicator: "3 / 12" counter
- Caption text below image in monospace font
- Images scale to fit within the overlay maintaining aspect ratio (contain, not cover)
- Close: ESC, close button (top-right), or click outside
- If an image fails to load, skip it gracefully (no broken image icon)
- Subtle slide transition between images
- Arrow keys navigate the carousel only — they must not move the diver while carousel is open

**content.json structure:**
```json
{
  "camera": {
    "enabled": true,
    "x": 0.35,
    "y": 2150,
    "zone": "trench",
    "message": "You found David's camera. He's an award-winning wildlife and nature photographer. Here's a look at the world through his lens.",
    "buttonText": "View Gallery",
    "photos": [
      { "src": "[PLACEHOLDER_SUPABASE_URL]/photo1.jpg", "caption": "[PLACEHOLDER]" },
      { "src": "[PLACEHOLDER_SUPABASE_URL]/photo2.jpg", "caption": "[PLACEHOLDER]" },
      { "src": "[PLACEHOLDER_SUPABASE_URL]/photo3.jpg", "caption": "[PLACEHOLDER]" }
    ]
  }
}
```

**theme.json additions:**
```json
{
  "camera": {
    "bodyColor": "#222222",
    "lensColor": "#444444",
    "flashColor": "#CCCCCC",
    "glowColor": "#FFDD44"
  },
  "carousel": {
    "maxWidth": 900,
    "maxHeight": 600,
    "imageMaxWidth": 850,
    "imageMaxHeight": 500
  }
}
```

**Asset note:** Photos are the one exception to the "no external assets" rule. Photo files are hosted in Supabase Storage and referenced by URL in `content.json`. To add or swap photos: upload to the `photos` bucket in Supabase, copy the public URL, and update `content.json`. No redeploy needed to change which photos are displayed (only a `content.json` push). All other game visuals are programmatically rendered on canvas. The carousel UI renders as a React component overlaid on the game.

### Shipwreck (Scenery)

A pixel art shipwreck rendered as a background scenery element in The Trench zone. This is non-interactable — purely visual atmosphere.

**Visual:**
- Pixel art ship hull resting on the ocean floor, tilted at a slight angle
- Partially buried in sand, covered in seaweed growth
- Colors from `theme.json` (hull, mast, seaweed accents)
- Static — no animation (seaweed on it can sway with the global seaweed animation)
- Rendered behind interactables but in front of the deep background

**theme.json additions:**
```json
{
  "shipwreck": {
    "hullColor": "#5C4033",
    "mastColor": "#7A5C3E",
    "accentColor": "#3A6B35"
  }
}
```

---

## Ambient Creatures (Non-Interactable)

These add life to the world. They cannot be clicked or interacted with. Zone placement is defined in `content.json`; visual properties in `theme.json`. Creatures are distributed by depth to reflect realistic ocean ecology — no creatures at The Surface, colorful life in shallows and reef, large predators in the deep, and only jellyfish in the trench.

### Fish
- Small tropical fish swim horizontally at varying speeds
- **Zones:** The Shallows (6), The Reef (4), The Deep (2)
- Not present at The Surface or The Trench (too deep for tropical fish)
- Reverse direction at world edges
- Vary in size and color (from `theme.json`)

### Sea Turtle
- Larger, slow-moving creature drifting through The Reef
- **Zones:** The Reef (1)
- Gentle sine-wave horizontal path
- Does not react to the player

### Jellyfish
- Translucent, pulsing bell with flowing tentacles and a soft glow
- **Zones:** The Reef (2), The Deep (1), The Trench (2)
- Drifts slowly sideways; bobs gently up and down
- Bell pulses rhythmically (expanding/contracting)
- Increasingly common at depth — the only creature in The Trench

### Shark Silhouette
- **Zones:** The Deep (1)
- Large dark silhouette, slightly transparent
- Moves slowly from one side to the other and loops

### Manta Ray
- **Zones:** The Deep (1)
- Wide, flat body with graceful wing-flapping motion
- Long trailing tail with gentle wave
- Slow, sweeping movement across the screen

---

## Delhi the Dog (Special NPC)

A special interactable NPC — David's dog Delhi, wearing pixel art scuba gear, bobbing around in The Trench. This is a unique interactable distinct from treasures, reference divers, lobsters, and the camera. **Delhi counts toward the discovery counter total.**

### Visual
- Pixel art dog sprite with scuba gear, roughly the size of the diver
- Colors (fur, gear, mask) configurable in `theme.json`
- Idle animation: gentle vertical bob, tail wag, bubble particles
- Speech bubble with a paw print icon ("🐾" rendered as pixel art) when undiscovered; removed after discovery (reduced opacity like other discovered items)

### Interaction
- Same proximity + SPACE/ENTER trigger as other interactables
- Dialog opens with Delhi's `message` text (from `content.json`)
- Below the message, a single photo of Delhi is displayed inline in the dialog
- Photo is hosted in Supabase Storage, URL defined in `content.json`
- First interaction triggers the `discover` sound and marks Delhi as discovered
- After discovery, player can re-interact to reopen the dialog

### content.json structure
```json
{
  "delhi": {
    "enabled": true,
    "x": 0.65,
    "y": 2100,
    "zone": "trench",
    "message": "This is Delhi. He's my three-legged best friend. My wife rescued him off the side of the road in India in 2017. Like us, he loves adventure. Three-wheel drive and all.",
    "photo": {
      "src": "[PLACEHOLDER_SUPABASE_URL]/delhi.jpg",
      "caption": "[PLACEHOLDER] Delhi caption"
    }
  }
}
```

### theme.json additions
```json
{
  "delhi": {
    "furColor": "#C4915E",
    "gearColor": "#336699",
    "maskColor": "#88CCEE",
    "glowColor": "#FFAA44"
  }
}
```

### Dialog Styling
- Same width as standard treasure/reference dialogs
- Photo scales to fit within the dialog maintaining aspect ratio
- Photo displayed below the message text
- If the photo fails to load, the dialog still shows the message text (no broken image)

---

## Decompression Easter Egg

### Trigger
- Player has descended past The Deep zone start threshold at any point
- Player then ascends back into the Surface zone
- Fires on the **first occurrence only** per session

### Behavior
1. `decompressionStart` sound plays
2. "DECOMPRESSION STOP" label appears on screen
3. A 12-second countdown timer displays prominently
4. A decompression diver NPC fades into view near the player
5. The decompression diver's `message` (from `content.json`) displays in a text box near the NPC
6. **Player can still move** — movement is NOT locked during decompression. Keyboard/joystick input works normally.
7. Timer counts down visually **only while the player remains in the Surface zone** (or does not ascend above the decompression threshold)
8. At zero: `decompressionComplete` sound plays, NPC fades out, decompression clears

### Ascending During Decompression (Death Mechanic)

If the player moves upward past the top of the Surface zone (tries to leave the decompression area) while the timer is still active:

1. **Warning phase (3 seconds):** A warning message appears on screen (e.g. "You need to decompress! Get back down!"). The player can still move.
2. **If the player returns downward within 3 seconds:** The warning dismisses, the decompression timer resumes from where it left off (not reset).
3. **If the player does NOT return within 3 seconds:** The game triggers a "death":
   - Screen flashes or fades to black
   - "GAME OVER" text displays prominently
   - A short message appears (e.g. "You ascended too fast. Every diver knows you never skip a safety stop.")
   - After a brief pause (~2 seconds), the page reloads (full reset, same as "Dive Again")

### Visual
- Subtle vignette / border effect while decompression is active
- Player diver is fully controllable (can swim around within the zone)
- Ambient creatures continue moving normally
- Warning text during ascent attempt should be urgent/distinct (e.g. red text, flashing)

---

## Completion Reward

### Trigger
All enabled treasure items, reference divers, **Delhi**, and **the camera** (if enabled) have been discovered. The discovery counter reaches its max. Note: lobsters have their own separate counter and do NOT affect the completion trigger.

### Behavior
1. Celebratory effect (screen flash, particle burst)
2. Completion overlay fades in over the dimmed game world
3. Overlay displays:
   - Congratulatory message (from `content.json`)
   - CTA links: email, LinkedIn, phone (from `content.json`)
   - **"Dive Again"** button — triggers a full page reload (clears all state)
   - **"Keep Exploring"** button — dismisses the overlay and returns to gameplay
4. ESC or click outside also dismisses the overlay (same as "Keep Exploring")

---

## HUD (Heads-Up Display)

All HUD elements render on top of the canvas, positioned relative to viewport dimensions (not hardcoded pixels). Styled with UI colors from `theme.json`.

| Element | Position | Description |
|---|---|---|
| **Depth Meter** | Right edge | Vertical bar; filled portion = player's world-Y position. Small marker shows exact depth. |
| **Discovery Counter** | Top-left | "Discovered: X / Y" — Y = count of all enabled items (treasures + divers + Delhi + camera). Lobsters are excluded. |
| **Lobster Counter** | Top-left (below discovery) | "🦞 X / 3" — separate counter for lobsters collected. Turns gold when carrying a lobster. |
| **Zone Label** | Top-center | Persistent small text showing current zone name (e.g. "THE REEF") |
| **Zone Announcement** | Center | Fades in/out over ~2.5s when entering a new zone. Shows zone label + subtitle (e.g. "THE REEF — How I Think") |
| **Interaction Prompt** | Bottom-center | "Press SPACE to interact" — appears when near an undiscovered interactable; hidden on mobile (replaced by tap button) |
| **Connect Button** | Top-right | Persistent "Let's Connect" button. Clicking opens a small overlay with contact links (email, LinkedIn, phone — same links as completion screen). Always visible during gameplay. Label and links from `content.json`. |

---

## Sound Design

All sounds generated via Web Audio API oscillators. No external audio files. Clicking "DIVE IN" on the title screen serves as the user gesture that unlocks Web Audio for the session.

### Ambient Sound
- Continuous low-frequency oscillator hum
- Frequency decreases (deepens) as the player descends
- Volume and type from `audio.json`
- Toggleable via the `enabled` flag

---

## Visual Style

- 16-bit pixel art aesthetic
- All sprites drawn programmatically on canvas using pixel-rectangle primitives (no sprite sheets)
- `imageRendering: pixelated` on the canvas element
- Pixel size multiplier (from `theme.json`) controls sprite chunkiness
- Water color transitions smoothly between zones via gradient
- Light rays near the surface, fading with depth
- Increasing darkness in deeper zones

### Background Elements
- **Seaweed:** Grows from the ground, sine-wave sway animation
- **Coral:** Static formations in The Shallows and The Reef
- **Shipwreck:** Static ship hull on the ocean floor in The Trench (see Shipwreck section)
- **Ambient bubbles:** Rise slowly from random positions

---

## Scope Exclusions (Not in V1)

- Save/load or persistence between sessions
- Parallax background layers
- Scoring, leaderboards, or gamification beyond the discovery counter
- Multiplayer or sharing features
- Water current / drift physics
- Per-entity interaction radius (using global value)
- Pause menu

---

## File Structure

```
deep-dive/
├── public/
│   └── index.html
├── src/
│   ├── config/
│   │   ├── content.json     # All text, interactables, creature placement
│   │   ├── theme.json       # All visual config: colors, sizes, world, zones
│   │   └── audio.json       # All sound config: effects, ambient, volumes
│   ├── engine/
│   │   ├── GameCanvas.jsx   # Main canvas component, game loop
│   │   ├── input.js         # Keyboard input handler
│   │   ├── touchInput.js    # Touch detection, virtual joystick logic
│   │   ├── camera.js        # Camera follow and clamping
│   │   └── collision.js     # Proximity detection for interactions
│   ├── rendering/
│   │   ├── diver.js         # Player and NPC diver sprite drawing
│   │   ├── treasures.js     # Treasure item rendering (chest, gem, scroll)
│   │   ├── lobster.js       # Lobster sprite rendering and animation
│   │   ├── delhi.js         # Delhi dog sprite rendering and animation
│   │   ├── camera.js        # DSLR camera sprite rendering and animation
│   │   ├── creatures.js     # Fish, turtle, shark, orca, school rendering
│   │   ├── scenery.js       # Seaweed, coral, rocks, bubbles
│   │   ├── hud.js           # Depth meter, counter, zone label, prompts
│   │   └── effects.js       # Particles, glow, screen flash
│   ├── audio/
│   │   └── soundEngine.js   # Web Audio API oscillator sound system
│   ├── analytics/
│   │   └── tracker.js       # Supabase event tracking (fire-and-forget)
│   ├── screens/
│   │   ├── TitleScreen.jsx
│   │   ├── CompletionOverlay.jsx
│   │   └── DecompressionOverlay.jsx
│   ├── ui/
│   │   ├── Dialog.jsx            # Shared dialog component (treasures, divers, lobsters, camera)
│   │   ├── PhotoCarousel.jsx     # Lobster photography carousel overlay
│   │   ├── VirtualJoystick.jsx   # Touch joystick component
│   │   └── InteractButton.jsx    # Mobile tap-to-interact button
│   ├── state/
│   │   └── gameState.js     # Session state: discovered items, current zone, flags
│   └── App.jsx              # Root component, screen routing
├── .env                     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── package.json
└── vite.config.js
```

---

## Content Map (from Resume)

The following maps David Gordon's resume to game zones and interactables. This is the source of truth for populating `content.json`.

### Title Screen

- **Title:** DEEP DIVE: DAVID GORDON
- **Subtitle:** An underwater interactive resume. Discover treasures to learn about my career, projects, and how I think.

### Zone → Treasure Mapping

**The Surface (y: 0–300) — Who I Am**

| ID | Title | Icon | Content Summary |
|---|---|---|---|
| `who-i-am` | Who I Am | chest | David Gordon. Senior PM-T at Amazon, Seattle. UPenn '16. Builds products, grows them, makes hard tradeoffs. Owned Alexa smart home camera experience. Award-winning wildlife photographer, SSI-certified scuba diver. |

**The Shallows (y: 300–800) — Current Role & Key Projects**

| ID | Title | Icon | Content Summary |
|---|---|---|---|
| `alexa-role` | Amazon — Sr PM-T, Alexa | chest | Owned Alexa smart home camera experience for tens of millions of customers. 20+ engineers, applied scientists, designers across 12+ teams. Ring camera integration and Map View workstreams. Featured at 2025 Alexa+ launch event. Mar 2023 – Present. |
| `ring-camera` | Alexa and Ring Cameras Integration | scroll | Four gen AI camera features (Curated Summaries, SVD Announcements, Tell Me When You See, Missed Habits). Built AI quality evaluation framework from scratch. Increased Ring SVS adoption 16% with QR-code upsell flows. |
| `map-view` | Alexa Map View | scroll | Led GTM and customer acquisition for Map View (LIDAR floorplan). Reduced setup abandonment 33%. Championed Raster to Vector feature to open Map View to any smartphone user. |

**The Reef (y: 800–1500) — How I Think**

| ID | Title | Icon | Content Summary |
|---|---|---|---|
| `tradeoffs` | Technical Tradeoffs | gem | Examples of scoping and architecture decisions: doorbell latency pre-caching, QR code upsell vs. on-device integration, one-time automations scoping. |
| `ai-tools` | AI-Assisted Product Development | gem | Brought AI tools into team's daily work. Cut BRD creation time 70%. Built this game with Cursor. Trained teammates on prompt engineering. |
| `cross-team` | Cross-Team Leadership | gem | Camera features touched more teams than almost anything on Alexa: Routines, Ring, Reminders, Sharing, competitive intelligence. |

**The Deep (y: 1500–2000) — Where I've Been**

| ID | Title | Icon | Content Summary |
|---|---|---|---|
| `growth-role` | Smart Home Growth | chest | Senior PM, Mar 2020 – Mar 2023. Owned P&L for six-device portfolio. 7M+ units sold. Scaled Amazon Smart Plug to #1 smart home SKU. 500K+ new ecosystem customers. |
| `earlier-career` | Earlier Career | scroll | Amazon Strategic Account Services (Sep 2018 – Mar 2020): Tier-1 vendor partnerships, 40% YoY revenue growth. Centric Brands Innovation Fellow (Aug 2017 – Aug 2018): automated product content generation. |
| `deal-expert` | The Deal Expert | gem | Lead deal SME across Amazon's full hardware portfolio (Echo, Fire TV, Kindle, Ring). Built global promotional validation systems, $20M+ cost savings. |

**The Trench (y: 2000–2400) — The Personal Side**

No treasures in The Trench. This zone contains the Delhi and Lobster special NPCs only. Contact info is accessible at all times via the persistent "Let's Connect" HUD button.

### Reference Divers

| ID | Zone | Name | Title | Relationship | Quote |
|---|---|---|---|---|---|
| `ref-1` | shallows | Pavan Nyama | Product Manager, Technical | PM Colleague, Alexa Smart Home | [PLACEHOLDER] |
| `ref-2` | shallows | Brendan Gotch | Principal Product Manager, Technical | PM Colleague, Alexa Smart Home | [PLACEHOLDER] |
| `ref-3` | shallows | Brittany West | Product Manager, Technical | PM Colleague, Alexa Smart Home | [PLACEHOLDER] |
| `ref-4` | reef | Prasad Akula | Software Development Manager | Engineering Partner, Moments | [PLACEHOLDER] |
| `ref-5` | reef | Dinesh Nair | Sr. Manager, Applied Science | Science Partner, Moments | [PLACEHOLDER] |
| `ref-6` | reef | Giulio Finestrali | Principal Software Engineer | Engineering Partner, Moments | [PLACEHOLDER] |
| `ref-7` | deep | James Weng | Principal Product Manager | Former Manager | [PLACEHOLDER] |
| `ref-8` | deep | Emily Burke | Principal Product Manager | Senior PM Colleague | [PLACEHOLDER] |
| `ref-9` | deep | Lindsay Saletta | [PLACEHOLDER] | Former Manager, Centric Brands | [PLACEHOLDER] |

### Delhi the Dog

- **Name:** Delhi (hardcoded)
- **Zone:** trench (y: ~2100)
- **Message:** "This is Delhi. He's my three-legged best friend. My wife rescued him off the side of the road in India in 2017. Like us, he loves adventure. Three-wheel drive and all."
- **Photo:** Single photo hosted in Supabase Storage (placeholder URL for now)

### Lobster

- **Count:** 3 lobsters in The Trench
- **Collection mechanic:** Pick up one at a time, carry to surface, HUD counter tracks progress (🦞 X/3)
- **Lobster 1:** id: lobster-1, y: 2200 — "You got one! David loves lobstering. He's SSI-certified and has pulled his fair share out of the deep. Bring me to the surface!"
- **Lobster 2:** id: lobster-2, y: 2280 — "That's two! You're getting the hang of this. Now bring me up top."
- **Lobster 3:** id: lobster-3, y: 2350 — "All three! A true lobsterman. You know the drill — bring me to the surface."

### DSLR Camera

- **Zone:** trench (y: ~2150)
- **Message:** "You found David's camera. He's an award-winning wildlife and nature photographer. Here's a look at the world through his lens."
- **Button:** "View Gallery"
- **Photos:** Placeholder entries — to be replaced with David's wildlife & nature photography (hosted in Supabase Storage)

### Decompression Diver

- **Name:** Dive Master Dan
- **Message:** "Hold up. You've been deep, and good divers don't rush to the surface. While you wait: the person who built this game also built AI features used by tens of millions of people. He once spent three months getting a model to stop calling squirrels crows. Stick around. There's more to find up top."

### Completion

- **Message:** "You've explored everything. Thanks for diving deep."
- **CTA Links:** Email Me (dgordon2393@icloud.com), LinkedIn (linkedin.com/in/david-gordon-a2200945), Call Me (610-772-6451)
- **Buttons:** "Dive Again" / "Keep Exploring"

---

## Draft content.json

Below is the full draft `content.json` ready for implementation. All resume content is populated; reference diver quotes, camera gallery photos, and Delhi's photo use placeholders marked with `[PLACEHOLDER]`.

```json
{
  "meta": {
    "title": "DEEP DIVE: DAVID GORDON",
    "subtitle": "An underwater interactive resume. Discover treasures to learn about my career, projects, and how I think."
  },
  "startScreen": {
    "instructions": [
      "Arrow keys or WASD to swim",
      "SPACE to interact with glowing items",
      "ESC to close dialogs",
      "Discover all items to complete the dive"
    ],
    "buttonLabel": "DIVE IN"
  },
  "zones": [
    { "id": "surface", "label": "THE SURFACE", "announcement": "THE SURFACE — Who I Am" },
    { "id": "shallows", "label": "THE SHALLOWS", "announcement": "THE SHALLOWS — Current Role & Key Projects" },
    { "id": "reef", "label": "THE REEF", "announcement": "THE REEF — How I Think" },
    { "id": "deep", "label": "THE DEEP", "announcement": "THE DEEP — Where I've Been" },
    { "id": "trench", "label": "THE TRENCH", "announcement": "THE TRENCH — The Personal Side" }
  ],
  "treasures": [
    {
      "id": "who-i-am",
      "x": 0.5,
      "y": 150,
      "zone": "surface",
      "title": "Who I Am",
      "content": "David Gordon. Senior PM-T at Amazon, based in Seattle. UPenn '16.\n\nI build products, grow them, and make hard tradeoffs along the way. Most recently I owned the Alexa smart home camera experience for tens of millions of customers. Dive deeper to get the full story.\n\nWhen I'm not building products, I'm underwater. Award-winning wildlife photographer, SSI-certified scuba diver, and the reason this resume is a game about the ocean.",
      "iconType": "chest",
      "enabled": true
    },
    {
      "id": "alexa-role",
      "x": 0.5,
      "y": 420,
      "zone": "shallows",
      "title": "Amazon — Sr PM-T, Alexa",
      "content": "Alexa Smart Home Product | Mar 2023 – Present | Seattle, WA\n\nOwned the Alexa smart home camera experience for tens of millions of customers. Worked directly with 20+ engineers, applied scientists, and designers across 12+ teams. Two major workstreams: integrating Ring cameras with Echo Show devices (AI-powered features, live viewing, device controls) and Map View (digital floorplan creation and customer acquisition).\n\nFeatures were demoed on stage at the 2025 Amazon Alexa+ launch event. Managed a 100+ person beta through launch readiness.",
      "iconType": "chest",
      "enabled": true
    },
    {
      "id": "ring-camera",
      "x": 0.3,
      "y": 570,
      "zone": "shallows",
      "title": "Alexa and Ring Cameras Integration",
      "content": "Drove four generative AI camera features through parallel 12-month workstreams, each solving a different customer problem:\n\nCurated Summaries: auto-organized camera recordings into categorized playlists (Wildlife, Coming & Going, Packages, Pets). Partnered with Applied Science to optimize the categorization model and led beta testing to validate accuracy.\n\nSVD Announcements: descriptive doorbell alerts (\"The pizza delivery person is at the front door\" instead of \"Someone is at the front door\"). Devised the latency mitigation strategy using pre-cached motion event descriptions.\n\nTell Me When You See: custom camera alerts via natural language (\"Tell me when the gardener arrives\"). Required cross-team work with the Routines platform to enable a new automation capability.\n\nMissed Habits: proactive detection when household routines are missed (\"The dog hasn't been walked by 4 PM\"). Conducted customer research during alpha that led to design improvements.\n\nBuilt the quality evaluation framework for AI model output from scratch. Reviewed hundreds of outputs, defined category-specific quality criteria, and co-developed production prompts with Applied Science. Drove accuracy to 90%+.\n\nIncreased Ring Smart Video Search adoption 16% by redesigning the activation funnel with QR-code upsell flows that addressed subscription and settings barriers.",
      "iconType": "scroll",
      "enabled": true
    },
    {
      "id": "map-view",
      "x": 0.7,
      "y": 700,
      "zone": "shallows",
      "title": "Alexa Map View",
      "content": "Led go-to-market and customer acquisition for Map View, a feature that lets customers create a digital floorplan using an iPhone's LIDAR sensor.\n\nReduced setup abandonment 33% through systematic funnel analysis: exit modals, re-engagement campaigns across email, push, and in-app channels, and customer feedback surveys. Those surveys surfaced the key insight: customers wanted Map View but didn't own an iPhone Pro with LIDAR.\n\nThat led to the Raster to Vector feature. I authored a strategic recommendation for leadership to build floor plan import, letting customers upload a PDF or photo of an existing plan. Partnered with Applied Science on the conversion model. This opened the feature to any smartphone user, not just iPhone Pro owners.",
      "iconType": "scroll",
      "enabled": true
    },
    {
      "id": "tradeoffs",
      "x": 0.3,
      "y": 950,
      "zone": "reef",
      "title": "Technical Tradeoffs",
      "content": "A few examples of how I make scoping and architecture decisions:\n\nDoorbell latency: Adding AI descriptions to doorbell announcements introduced delay. My solution: use the description from a motion event that fires seconds before the press as pre-cached content. Some wasted compute on motion events that don't lead to a press, but the latency improvement was worth it.\n\nQR code upsell: Full on-device subscription management would have required deep integration with Ring's billing system and app settings APIs. I chose QR codes that linked customers to the right place, shipped on time, and aligned with Ring to build the on-device replacement for the following year.\n\nOne-time automations: The routines platform couldn't represent natural-language automations in its existing management UI. Rather than wait for a full re-architecture, I scoped to one-time automations with a minimal management UX (view and delete only), and defined the requirements for the platform change.",
      "iconType": "gem",
      "enabled": true
    },
    {
      "id": "ai-tools",
      "x": 0.7,
      "y": 1150,
      "zone": "reef",
      "title": "AI-Assisted Product Development",
      "content": "I brought AI tools into our team's daily product work. Used Claude and GPT-4 to cut BRD creation time 70%, from multiple days to under a day. Trained teammates on prompt engineering workflows for writing specs, analyzing data, and structuring documents.\n\nI build with AI tools too. This game was built using Cursor. I prototype fast and iterate in code. I think the best PMs don't just ship AI products for customers, they use AI to change how they work.",
      "iconType": "gem",
      "enabled": true
    },
    {
      "id": "cross-team",
      "x": 0.4,
      "y": 1350,
      "zone": "reef",
      "title": "Cross-Team Leadership",
      "content": "The camera features I owned touched more teams than almost anything else on Alexa. Some of the cross-team work:\n\nRoutines & Automations: Partnered with the routines PM to enable a new one-off automation capability that didn't exist on the platform. My requirements defined the scope of the platform change.\n\nRing: Aligned on a 2026 roadmap for on-device subscription enablement, SVS settings, and free trial activation to replace the QR code flows.\n\nReminders: Coordinated integration for Missed Habits notifications and automation triggers.\n\nSharing: Advocated for Moments integration with the universal sharing platform. Positioned the feature for a Panos demo.\n\nCompetitive intelligence: Authored a competitive analysis on Apple's anticipated smart home and camera strategy. Connected the analysis to specific feature prioritization and roadmap sequencing.",
      "iconType": "gem",
      "enabled": true
    },
    {
      "id": "growth-role",
      "x": 0.5,
      "y": 1600,
      "zone": "deep",
      "title": "Smart Home Growth",
      "content": "Amazon, Alexa Smart Home Growth — Senior Product Manager | Mar 2020 – Mar 2023\n\nOwned post-launch strategy and P&L for six Amazon smart home devices. Full ownership of pricing, launch timing, and channel strategy across every major retail event (Prime Day, Black Friday).\n\nDelivered 7M+ units sold and exceeded revenue targets. Brought 500K+ new customers into the Alexa smart home ecosystem through targeted promotional strategy. Scaled Amazon Smart Plug to the #1 smart home SKU on Amazon.com, with customer lifetime value up 456% and offline retail partner sales growth of 940%.",
      "iconType": "chest",
      "enabled": true
    },
    {
      "id": "earlier-career",
      "x": 0.3,
      "y": 1780,
      "zone": "deep",
      "title": "Earlier Career",
      "content": "Amazon, Strategic Account Services — Senior Account Manager | Sep 2018 – Mar 2020\nManaged Tier-1 vendor partnerships: Wilson Sporting Goods, Rawlings, PLANO Outdoors. Delivered 40% year-over-year revenue growth. Built a financial modeling automation tool that improved analysis efficiency 30% across a 50+ person org. Won the Little Big Shoe Award and Star of the Quarter.\n\nCentric Brands — Innovation Fellow | Aug 2017 – Aug 2018\nSelected for a competitive 1-year program at a $100M global apparel company. Built an automated product content generation system that replaced manual copywriting across hundreds of SKUs, cutting listing creation time from hours to minutes.",
      "iconType": "scroll",
      "enabled": true
    },
    {
      "id": "deal-expert",
      "x": 0.7,
      "y": 1920,
      "zone": "deep",
      "title": "The Deal Expert",
      "content": "During my time on Smart Home Growth, I served as the lead deal subject matter expert across Amazon's full hardware portfolio: Echo, Fire TV, Kindle, Ring, and more.\n\nBuilt global promotional validation systems that prevented pricing errors and generated $20M+ in cost savings. Planned and executed promotional strategy across every major retail event, determining which products to feature, at what price, and in what deal structure. This wasn't just smart home. It was Amazon-wide hardware deals.",
      "iconType": "gem",
      "enabled": true
    },
  ],
  "referenceDivers": [
    {
      "id": "ref-1",
      "x": 0.15,
      "y": 480,
      "zone": "shallows",
      "name": "Pavan Nyama",
      "title": "Product Manager, Technical",
      "relationship": "PM Colleague, Alexa Smart Home",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    },
    {
      "id": "ref-2",
      "x": 0.85,
      "y": 620,
      "zone": "shallows",
      "name": "Brendan Gotch",
      "title": "Principal Product Manager, Technical",
      "relationship": "PM Colleague, Alexa Smart Home",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    },
    {
      "id": "ref-3",
      "x": 0.15,
      "y": 750,
      "zone": "shallows",
      "name": "Brittany West",
      "title": "Product Manager, Technical",
      "relationship": "PM Colleague, Alexa Smart Home",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    },
    {
      "id": "ref-4",
      "x": 0.85,
      "y": 1000,
      "zone": "reef",
      "name": "Prasad Akula",
      "title": "Software Development Manager",
      "relationship": "Engineering Partner, Moments",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    },
    {
      "id": "ref-5",
      "x": 0.15,
      "y": 1200,
      "zone": "reef",
      "name": "Dinesh Nair",
      "title": "Sr. Manager, Applied Science",
      "relationship": "Science Partner, Moments",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    },
    {
      "id": "ref-6",
      "x": 0.85,
      "y": 1400,
      "zone": "reef",
      "name": "Giulio Finestrali",
      "title": "Principal Software Engineer",
      "relationship": "Engineering Partner, Moments",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    },
    {
      "id": "ref-7",
      "x": 0.15,
      "y": 1650,
      "zone": "deep",
      "name": "James Weng",
      "title": "Principal Product Manager",
      "relationship": "Former Manager",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    },
    {
      "id": "ref-8",
      "x": 0.85,
      "y": 1830,
      "zone": "deep",
      "name": "Emily Burke",
      "title": "Principal Product Manager",
      "relationship": "Senior PM Colleague",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    },
    {
      "id": "ref-9",
      "x": 0.15,
      "y": 1950,
      "zone": "deep",
      "name": "Lindsay Saletta",
      "title": "[PLACEHOLDER]",
      "relationship": "Former Manager, Centric Brands",
      "quote": "[PLACEHOLDER]",
      "enabled": true
    }
  ],
  "delhi": {
    "enabled": true,
    "x": 0.65,
    "y": 2100,
    "zone": "trench",
    "message": "This is Delhi. He's my three-legged best friend. My wife rescued him off the side of the road in India in 2017. Like us, he loves adventure. Three-wheel drive and all.",
    "photo": {
      "src": "[PLACEHOLDER_SUPABASE_URL]/delhi.jpg",
      "caption": "[PLACEHOLDER] Delhi caption"
    }
  },
  "lobsters": [
    { "id": "lobster-1", "x": 0.2, "y": 2200, "zone": "trench", "message": "You got one! David loves lobstering...", "enabled": true },
    { "id": "lobster-2", "x": 0.7, "y": 2280, "zone": "trench", "message": "That's two! ...", "enabled": true },
    { "id": "lobster-3", "x": 0.45, "y": 2350, "zone": "trench", "message": "All three! ...", "enabled": true }
  ],
  "camera": {
    "enabled": true,
    "x": 0.35,
    "y": 2150,
    "zone": "trench",
    "message": "You found David's camera. He's an award-winning wildlife and nature photographer. Here's a look at the world through his lens.",
    "buttonText": "View Gallery",
    "photos": [
      { "src": "[PLACEHOLDER_SUPABASE_URL]/photo1.jpg", "caption": "[PLACEHOLDER]" },
      { "src": "[PLACEHOLDER_SUPABASE_URL]/photo2.jpg", "caption": "[PLACEHOLDER]" },
      { "src": "[PLACEHOLDER_SUPABASE_URL]/photo3.jpg", "caption": "[PLACEHOLDER]" }
    ]
  },
  "connectButton": {
    "label": "Let's Connect",
    "links": [
      { "label": "Email Me", "url": "mailto:dgordon2393@icloud.com" },
      { "label": "LinkedIn", "url": "https://linkedin.com/in/david-gordon-a2200945" },
      { "label": "Call Me", "url": "tel:610-772-6451" }
    ]
  },
  "decompressionDiver": {
    "name": "Dive Master Dan",
    "message": "Hold up. You've been deep, and good divers don't rush to the surface. While you wait: the person who built this game also built AI features used by tens of millions of people. He once spent three months getting a model to stop calling squirrels crows. Stick around. There's more to find up top.",
    "warningText": "You need to decompress! Get back down!",
    "gameOverText": "You ascended too fast. Every diver knows you never skip a safety stop."
  },
  "completion": {
    "message": "You've explored everything. Thanks for diving deep.",
    "ctaLinks": [
      { "label": "Email Me", "url": "mailto:dgordon2393@icloud.com" },
      { "label": "LinkedIn", "url": "https://linkedin.com/in/david-gordon-a2200945" },
      { "label": "Call Me", "url": "tel:610-772-6451" }
    ],
    "diveAgainLabel": "Dive Again",
    "keepExploringLabel": "Keep Exploring"
  },
  "creatures": [
    { "type": "fish", "zone": "shallows", "count": 6 },
    { "type": "school", "zone": "shallows", "count": 1 },
    { "type": "fish", "zone": "reef", "count": 5 },
    { "type": "school", "zone": "reef", "count": 1 },
    { "type": "turtle", "zone": "reef", "count": 1 },
    { "type": "fish", "zone": "deep", "count": 3 },
    { "type": "shark", "zone": "deep", "count": 1 },
    { "type": "orca", "zone": "deep", "count": 1 },
    { "type": "fish", "zone": "trench", "count": 2 }
  ]
}
```

---

## Design Decisions Log

These decisions resolve ambiguities in the original BRD. They are baked into the spec above.

| # | Topic | Decision |
|---|---|---|
| 1 | Lobster discovery counter | **Counts** toward completion total |
| 2 | Lobster content.json shape | `message` for text, `photos` for array, `buttonText` for gallery button |
| 3 | Photo asset path | Supabase Storage; `src` values are Supabase public URLs |
| 4 | Lobster speech bubble | "..." when undiscovered, removed after discovery |
| 5 | Lobster interaction flow | Dialog with message + "View Gallery" button → fullscreen carousel overlay |
| 6 | Interaction radius | Single global value in `theme.json` |
| 7 | Lobster count | 3 lobsters with a carry-one-at-a-time collection mechanic and their own HUD counter |
| 8 | Reference diver relationship | Short label (e.g. "PM Colleague, Alexa Smart Home"), displayed above the quote |
| 9 | Decompression movement | Player can move during decompression; ascending triggers 3s warning then game over if they don't return |
| 10 | "Dive Again" behavior | Full page reload (simplest, clears all state cleanly) |
| 11 | Completion overlay dismiss | Two buttons: "Dive Again" (reload) + "Keep Exploring" (dismiss overlay) |
| 12 | Mobile support | Must-have for v1 (touch, joystick, tap-to-interact) |
| 13 | Browser support | Chrome, Firefox, Safari, Edge (latest versions) |
| 14 | Performance target | Smooth via requestAnimationFrame; no strict 60fps throttle |
| 15 | Build tool | Vite |
| 16 | World height | Fixed at 2400px; positions are absolute pixel values |
| 17 | Zone boundaries | World-pixel coordinates; no engine enforcement of zone matching |
| 18 | Swim/bubble sound triggers | Swim: repeating timer (~400ms) while moving; Bubble: on particle spawn |
| 19 | Title screen / Web Audio unlock | "DIVE IN" click is the first user interaction, unlocks Web Audio |
| 20 | School of fish scatter | Fixed values for v1 (~3s reform delay) |
| 21 | Zone IDs | `surface`, `shallows`, `reef`, `deep`, `trench` |
| 22 | Delhi and Lobster zones | Both in The Trench (personal side) |
| 23 | Surface zone creatures | No ambient fish at The Surface |
| 24 | Delhi, Lobsters, and Camera as special interactables | Delhi has inline photo; 3 Lobsters have carry-to-surface collection mechanic with own HUD counter; Camera has photography gallery carousel |
| 25 | Photography gallery moved to camera | DSLR camera interactable owns the photo carousel |
| 26 | Shipwreck scenery | Non-interactable background element in The Trench |

---

## Testing Checklist

### Core Gameplay
- [ ] All five zones (Surface, Shallows, Reef, Deep, Trench) render with correct colors and boundaries
- [ ] Every enabled treasure (10 total) is discoverable and displays correct content
- [ ] Every enabled reference diver (9 total) is interactable with correct quote
- [ ] Disabled items (treasures, divers, Delhi, camera) do not render and are excluded from discovery counter
- [ ] Lobsters have their own HUD counter (🦞 X/3), separate from discovery counter
- [ ] Can only carry one lobster at a time; other lobsters not interactable while carrying
- [ ] Carrying a lobster to the surface delivers it (overlay shows count, lobster disappears)
- [ ] Carried lobster renders as smaller sprite next to diver with "🦞 → Surface!" label
- [ ] Decompression triggers exactly once when ascending from The Deep to The Surface
- [ ] Decompression timer counts down 12 seconds then clears
- [ ] Player can still move during decompression
- [ ] Ascending past the zone boundary during decompression shows warning for 3 seconds
- [ ] Returning downward within 3 seconds dismisses warning and resumes timer from where it left off
- [ ] Failing to return within 3 seconds triggers game over and page reload
- [ ] Game over screen shows "GAME OVER" text and message
- [ ] Completion overlay triggers when all enabled items are found (treasures + divers + Delhi + camera — lobsters excluded)
- [ ] "Let's Connect" HUD button is visible at all times during gameplay
- [ ] Clicking "Let's Connect" opens overlay with contact links (Email Me, LinkedIn, Call Me)
- [ ] Contact links open correct destinations
- [ ] Completion CTA links are correct ("Email Me", "LinkedIn", "Call Me")
- [ ] "Dive Again" reloads the page
- [ ] "Keep Exploring" dismisses overlay and resumes gameplay
- [ ] Discovery counter accurately reflects enabled items only
- [ ] Zone announcements fire on each zone transition
- [ ] Zone label updates correctly
- [ ] No ambient creatures at The Surface
- [ ] Ambient creatures (fish, school, turtle, shark, orca) move independently and don't block interaction
- [ ] Orca renders in The Deep zone, moves across background

### Delhi
- [ ] Delhi renders in The Trench with scuba gear, tail wag, and paw print speech bubble
- [ ] Delhi interaction opens dialog with message and inline photo
- [ ] Delhi photo loads from Supabase Storage URL
- [ ] Delhi photo handles missing image gracefully (shows message only)
- [ ] Delhi counts toward discovery counter total
- [ ] Delhi paw print bubble removed after first discovery
- [ ] Delhi can be re-interacted to reopen dialog
- [ ] Delhi `enabled: false` hides it and excludes from counter
- [ ] Delhi sprite colors are configurable via theme.json

### Lobster
- [ ] Lobster renders on the bow of the shipwreck in The Trench with animated claws and "..." speech bubble
- [ ] Lobster interaction opens dialog with message (no gallery button)
- [ ] Lobster counts toward discovery counter total
- [ ] Lobster "..." bubble removed after first discovery
- [ ] Lobster can be re-interacted to reopen dialog
- [ ] Lobster `enabled: false` hides it and excludes from counter
- [ ] Shipwreck renders as background scenery in The Trench

### Camera
- [ ] DSLR camera renders in The Trench with glow pulse
- [ ] Camera interaction opens dialog with message and "View Gallery" button
- [ ] Gallery button opens fullscreen carousel overlay
- [ ] Carousel displays photos from Supabase Storage URLs
- [ ] Carousel left/right navigation works (arrow keys + click)
- [ ] Arrow keys do NOT move diver while carousel is open
- [ ] Carousel handles missing images gracefully
- [ ] Carousel closes on ESC or close button
- [ ] Camera counts toward discovery counter total
- [ ] Camera glow removed after first discovery (reduced opacity)
- [ ] Camera can be re-interacted to reopen carousel
- [ ] Camera `enabled: false` hides it and excludes from counter

### Config Separation
- [ ] Modifying `content.json` changes game content without code changes
- [ ] Modifying `theme.json` changes visuals without code changes
- [ ] Modifying `audio.json` changes sounds without code changes

### Responsive and Mobile
- [ ] Canvas fills full window, no scroll on desktop (1440px+)
- [ ] Canvas fills full window, no scroll on mobile (390px portrait)
- [ ] Canvas fills full window on tablet (768px, both orientations)
- [ ] HUD repositions on all screen sizes
- [ ] Dialogs readable and constrained on mobile
- [ ] Virtual joystick appears on touch devices only
- [ ] Joystick controls diver with 360-degree movement and speed scaling
- [ ] Tap-to-interact button appears near interactables on touch devices only
- [ ] Dialogs dismiss on tap outside
- [ ] Orientation change reflows without breaking state
- [ ] Pixel size scales down on very small viewports
