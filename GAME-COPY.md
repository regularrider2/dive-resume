`# Deep Dive — All Game Copy (Living Document)

This document lists every user-facing text string in the game. Update this file when you change copy; the game reads most content from `src/config/content.json` — only strings that are hardcoded in code are listed here with their file locations.

**Last updated:** March 2025

---

## Meta & Page

| Location | Key / Context | Text |
|----------|----------------|------|
| `index.html` | `<title>` | DEEP DIVE — Interactive Resume |
| `content.json` → `meta.title` | Page/brand | DEEP DIVE: DAVID GORDON |
| `content.json` → `meta.subtitle` | Tagline | An underwater interactive resume. Discover treasures to learn about my career, projects, and how I think. |
| `content.json` → `meta.resumePageUrl` | Link | /resume.pdf |

---

## Title / Start Screen

| Location | Key / Context | Text |
|----------|----------------|------|
| `content.json` → `startScreen.instructions` | Instruction 1 | Arrow keys / WASD / joystick to swim |
| | Instruction 2 | Swim over glowing items to discover them — no button needed |
| | Instruction 3 | Find the lobster deep in The Trench and bring it back to the boat for dinner |
| | Instruction 4 | Watch your depth — ascend too fast and it's game over |
| | Instruction 5 | Discover everything to complete the dive |
| `content.json` → `startScreen.buttonLabel` | Primary CTA | DIVE IN |
| `TitleScreen.jsx` | Card eyebrow | Interactive Resume |
| `TitleScreen.jsx` | Main title | DEEP DIVE |
| `TitleScreen.jsx` | Author | David Gordon |
| `TitleScreen.jsx` | Card left column title | Interactive Resume |
| `TitleScreen.jsx` | Card left column body | Swim over glowing items to discover his work. |
| `TitleScreen.jsx` | Card right column title | Find the Lobster |
| `TitleScreen.jsx` | Card right column body | It's deep in the trench. Bring it back to the boat. |
| `TitleScreen.jsx` | Primary button | 🤿 DIVE IN |
| `TitleScreen.jsx` | Divider | or |
| `TitleScreen.jsx` | Secondary link | View Resume |
| `TitleScreen.jsx` | Diver quips (rotating) | 👋 Hi! I'm looking for David's career. |
| | | 📦 Apparently he shipped AI to tens of millions of people. |
| | | 🦞 Find the lobster. Bring it back. |
| | | ⬇️ Deeper = more interesting. |
| | | 🐿️ Something about squirrels and crows? Let's find out. |

---

## Zones (HUD & Announcements)

| Location | Zone id | label | announcement | flavor |
|----------|---------|-------|--------------|--------|
| `content.json` → `zones` | surface | THE SURFACE | THE SURFACE — Who I Am | A message for whoever finds it. |
| | shallows | THE SHALLOWS | THE SHALLOWS — What I Build | Where tens of millions of customers meet generative AI. |
| | reef | THE REEF | THE REEF — How I Grew the Business | The commercial foundation under the AI work. |
| | deep | THE DEEP | THE DEEP — Earlier Career | The career before product management. |
| | trench | THE TRENCH | THE TRENCH — The Personal Side | Not on the resume. Still part of the story. |

---

## Item Dialog Copy (When You Open Each Item)

This is the full text shown in the dialog when the player opens each discoverable item. Source: `content.json` → `treasures[]`, `delhi`, `lobsters[]`, `camera`.

---

### Treasure: Message in a Bottle (Why Hire Me)  
**id:** `why-hire-me` · **Dialog title:** Why Hire Me  

**Content (body):**
```
To whoever found this —

I'm David. Technical product manager and SSI-certified scuba diver. I've spent seven years at Amazon across product management, growth, and partnerships, most recently building AI features for Alexa that ship to tens of millions of customers. I'm looking for my next opportunity to build AI-powered products at scale.

There's more scattered across the ocean floor. Swim over the glowing items to learn about my career, and if you find the lobster, bring it back to the boat.

— David
```

**Post-dialog reaction:** 🤿 Alright David, let's see what else is down here.

---

### Treasure: Alexa Smart Home Cameras  
**id:** `alexa-cameras` · **Dialog title:** Alexa Smart Home Cameras  

**Content (body):**
```
I built AI-powered features that integrate Ring cameras with Alexa+. The system helps customers understand what's happening at home: it organizes camera activity into summaries, describes who's at the door, lets you set custom alerts in plain English, and notices when a household routine breaks. Demoed on stage at Amazon's 2025 Alexa+ launch event.
```

**Post-dialog reaction:** 🤿 "Alexa, let me know when you see a shark."

---

### Treasure: Alexa Map View  
**id:** `map-view` · **Dialog title:** Alexa Map View  

**Content (body):**
```
I owned customer acquisition for a product that let customers build a digital floorplan of their home. Setup abandonment was high, so I dug into the funnel, identified where customers were dropping off, and ran a mix of re-engagement campaigns, exit modals, and customer surveys to bring them back, which significantly reduced abandonment.
```

**Post-dialog reaction:** 🤿 A digital floorplan. I could use one of those down here.

---

### Treasure: Alexa Smart Home Growth  
**id:** `growth-strategy` · **Dialog title:** Alexa Smart Home Growth  

**Content (body):**
```
I owned P&L for Amazon's smart home hardware portfolio, with full control over pricing, launch timing, and channel strategy across every major retail event. The insight that drove the biggest results was treating a low-cost device as a gateway into the ecosystem, building an LTV model that proved we could discount aggressively and still come out ahead on lifetime value.
```

**Post-dialog reaction:** 🤿 A Smart Plug bundled with a Christmas tree? That's either genius or unhinged.

---

### Treasure: The Deal Expert  
**id:** `deal-expert` · **Dialog title:** The Deal Expert  

**Content (body):**
```
I was the lead deal subject matter expert across all of Amazon's hardware portfolio. I built the processes and validation checks that every deal team followed before a promotion could go live. The process caught a pricing error where a device had been set to sell at zero dollars, which would have sold out the entire inventory at no revenue. One catch, millions in prevented losses.
```

**Post-dialog reaction:** 🤿 Someone had to make sure the deals actually worked. Apparently it was him.

---

### Treasure: Amazon Retail  
**id:** `amazon-retail` · **Dialog title:** Amazon Retail  

**Content (body):**
```
Amazon, Strategic Account Services — Senior Account Manager | Sep 2018 – Mar 2020

I managed Tier-1 vendor partnerships (Wilson Sporting Goods, Rawlings, PLANO Outdoors) and delivered 40% year-over-year revenue growth. I built a financial modeling automation tool that became the standard across the organization and cut analysis time 30% for a 50+ person org. Won the Little Big Shoe Award and Star of the Quarter.
```

**Post-dialog reaction:** 🤿 Little Big Shoe Award. That's a real thing.

---

### Treasure: Centric Brands  
**id:** `centric-brands` · **Dialog title:** Centric Brands  

**Content (body):**
```
Centric Brands — Innovation Fellow | Aug 2017 – Aug 2018

Selected for a competitive one-year fellowship at a $100M global apparel company. I built an automated content generation system that replaced manual copywriting across hundreds of SKUs — cutting listing creation from hours to minutes.
```

**Post-dialog reaction:** 🤿 This guy has been automating workflows for a while.

---

### Treasure: Education  
**id:** `education` · **Dialog title:** Education  

**Content (body):**
```
University of Pennsylvania, Class of 2016. Economics degree. Turns out studying incentives and tradeoffs is just product management with homework.
```

**Post-dialog reaction:** 🤿 Economics, not Wharton. But that explains the LTV models.

---

### Delhi (dog)  
**Dialog title:** Delhi  

**Message (body):**
```
This is Delhi. He's my three-legged best friend. My wife rescued him off the side of the road in India in 2017. Like us, he loves adventure. Three-wheel drive and all.
```

**Photo caption:** `[PLACEHOLDER] Delhi caption`

---

### Lobster  
**Dialog title:** 🦞 (emoji only in dialog)  

**Message (body):**
```
I love lobstering. I'm SSI-certified and have pulled my fair share out of the deep. Bring this one up — dinner's waiting!
```

---

### Camera  
**Dialog title:** 📷 (emoji only in dialog)  

**Message (body):**
```
You found my camera. I'm an award-winning wildlife and nature photographer. Here's a look at the world through my lens.
```

**Button:** View Gallery  

**Photo captions (gallery):** `[PLACEHOLDER]` for each of photo1, photo2, photo3

---

## Treasures — Quick Reference (id → title)

| id | title |
|----|--------|
| why-hire-me | Why Hire Me |
| alexa-cameras | Alexa Smart Home Cameras |
| map-view | Alexa Map View |
| growth-strategy | Alexa Smart Home Growth |
| deal-expert | The Deal Expert |
| amazon-retail | Amazon Retail |
| centric-brands | Centric Brands |
| education | Education |

---

## In-World Item Labels (Bubbles / Hover)

| Location | Context | Text |
|----------|---------|------|
| `GameCanvas.jsx` → ITEM_LABELS | bottle | 🔵 Why Hire Me |
| | ring-doorbell | 📷 Alexa Cameras |
| | blueprint | 🏠 Alexa Map View |
| | echo-show | 📺 Alexa Smart Home Growth |
| | treasure-chest | 💰 The Deal Expert |
| | amazon | 📦 Amazon Retail |
| | lio | 🧭 Centric Brands |
| | penn | 🎓 Education |
| `GameCanvas.jsx` | Re-read hint (desktop) | [SPACE] Re-read: \<label\> |
| `GameCanvas.jsx` | Re-read hint (touch) | 👆 Re-read: \<label\> |
| `GameCanvas.jsx` | Camera undiscovered | 📸 Award Winning Photographer |
| `GameCanvas.jsx` | Delhi undiscovered | Woof! |
| `GameCanvas.jsx` | Boat bubble line 1 | Dive! Dive! Dive! |
| `GameCanvas.jsx` | Boat bubble line 2 | Use arrow keys to move |
| `GameCanvas.jsx` | Shark bubble | 🦈 Oh look, a shark! |

---

## Post-Dialog Reactions (Diver Thought Bubbles)

| Icon type | Text |
|-----------|------|
| bottle | 🤿 Alright David, let's see what else is down here. |
| ring-doorbell | 🤿 "Alexa, let me know when you see a shark." |
| blueprint | 🤿 A digital floorplan. I could use one of those down here. |
| echo-show | 🤿 Alexa, turn off the lights |
| treasure-chest | 🤿 Someone had to make sure the deals actually worked. Apparently it was him. |
| amazon | 🤿 Little Big Shoe Award. That's a real thing. |
| lio | 🤿 This guy has been automating workflows for a while. |
| penn | 🤿 Economics, not Wharton. But that explains the LTV models. |

---

## NPC (Ghost Diver — 👻)

| Location | Context | Text |
|----------|---------|------|
| `GameCanvas.jsx` → NPC_QUIPS | When not exhausted | 👻 I know his whole career. Ask me anything. |
| | | 👻 I've got answers. For now. |
| | | 👻 I've been down here a while. Come say hi. |
| `GameCanvas.jsx` → NPC_EXHAUSTED_QUIPS | When out of questions | 👻 Out of tokens. David's broke. |
| | | 👻 GPT-4 isn't free, you know. |
| | | 👻 My lips are sealed. And rate-limited. |
| | | 👻 Budget: $0.00. Questions: closed. |
| `NPCChatOverlay.jsx` | Header | Ghost Diver |
| `NPCChatOverlay.jsx` | Greeting (template) | I used to be a product manager. Now I'm whatever this is. You've got \<remaining\> questions about the guy who built this place. I know his career suspiciously well. |
| `NPCChatOverlay.jsx` | Token pips | X left / OUT OF TOKENS |
| `NPCChatOverlay.jsx` | Suggested questions | What did he actually build at Amazon? |
| | | What's his strongest technical skill? |
| | | What kind of role is he looking for? |
| | | What's unusual about his background? |
| `NPCChatOverlay.jsx` | BROKE_JOKE (after last answer) | And that's it. I'd keep going but David is funding this on vibes and a free-tier API key. The tokens are gone. The wisdom lives on. Swim along. |
| `NPCChatOverlay.jsx` | Input placeholder | Ask about David's experience... |
| `NPCChatOverlay.jsx` | Submit button | Ask → |
| `NPCChatOverlay.jsx` | Section label | QUICK QUESTIONS |
| `NPCChatOverlay.jsx` | Exhausted footer | 🪙 TOKEN BUDGET EXHAUSTED — SWIM ALONG |
| `npcChat.js` | Placeholder (no API) 1 | I know everything about David, but my radio's on the fritz. Check back once the AI is connected! |
| | 2 | Great question. I'd tell you, but the signal down here is terrible. Ask again when I'm fully wired up. |
| | 3 | I've read his entire resume — twice. Once the API key is in place, I'll spill everything. |
| | 4 | The reef has many secrets. David's career is one of them. Come back when I'm connected to the surface. |
| | 5 | I'm still loading his CV into my wetsuit pockets. Give it a moment... or a deployment. |
| `npcChat.js` | Error fallback | My regulator's acting up — couldn't get a response. Try again? |

---

## Delhi, Lobster, Camera (quick ref)

Full dialog copy for Delhi, Lobster, and Camera is in **Item Dialog Copy (When You Open Each Item)** above. Keys: `content.json` → `delhi.message`, `delhi.photo.caption`; `lobsters[0].message`; `camera.message`, `camera.buttonText`, `camera.photos[].caption`.

---

## Decompression / Safety Stop

| Location | Key | Text |
|----------|-----|------|
| `content.json` → `decompressionDiver.name` | Name | Safety Stop |
| `content.json` → `decompressionDiver.message` | Message while waiting | This is a safety stop. Real divers hold here to let the nitrogen leave their bloodstream before surfacing. You're doing it because David thought it would be funny to make you wait. |
| `content.json` → `decompressionDiver.warningText` | Warning (ascending) | You'll get the bends! Get back down! |
| `content.json` → `decompressionDiver.gameOverText` | Game over (no lobster) | You ascended too fast. Every diver knows you never skip a safety stop. |
| `content.json` → `decompressionDiver.gameOverWithLobsterText` | Game over (with lobster) | You rushed to the surface with a lobster and paid the price. There's always another lobster, but there's only one you. Safety first. |
| `DecompressionOverlay.jsx` | Timer label (calm) | SAFETY STOP |
| `DecompressionOverlay.jsx` | Timer label (warning) | ⚠️ WARNING |
| `DecompressionOverlay.jsx` | Warning callout | GO DOWN |

---

## HUD (In-Game)

| Location | Context | Text |
|----------|---------|------|
| `hud.js` | Discovery counter | Discovered: X / Y |
| `hud.js` | Lobster counter | 🦞 X / Y |
| `hud.js` | Depth bar label | DEPTH |
| `hud.js` | Depth tick marks | 0ft, 30ft, 60ft, 90ft, 120ft |
| `hud.js` | Air timer (carrying lobster) | AIR: Xs |
| `hud.js` | Air sub (normal) | ⬆ Get that lobster to the boat! |
| `hud.js` | Air sub (≤10s) | ⬆ GET TO THE SURFACE! |

---

## Connect Button & CTAs

| Location | Key | Text |
|----------|-----|------|
| `content.json` → `connectButton.label` | Button | Let's Connect |
| `content.json` → `connectButton.links` | Email | Email Me |
| | LinkedIn | LinkedIn |
| | Phone | 610-772-6451 |
| `ConnectButton.jsx` | Link | View Resume |

---

## Interact Button

| Location | Text |
|----------|------|
| `InteractButton.jsx` | TAP TO INTERACT |

---

## Lobster Delivered Overlay

| Location | Context | Text |
|----------|---------|------|
| `LobsterDeliveredOverlay.jsx` | Title | LOBSTER CAUGHT! 🍽️ |
| `LobsterDeliveredOverlay.jsx` | Message (all items found) | 🏆 You got them all! A true lobsterman. Dinner for the whole boat. |
| `LobsterDeliveredOverlay.jsx` | Message (more to find) | There's more down there. Keep diving. |
| `LobsterDeliveredOverlay.jsx` | Tank swap note | The boat crew swapped your tank — you're good to keep diving. |
| `LobsterDeliveredOverlay.jsx` | Button | Keep Diving |
| `LobsterDeliveredOverlay.jsx` | Hint | ESC or SPACE to continue |

---

## Lobster Reward Overlay (Placeholder)

| Location | Text |
|----------|------|
| `LobsterRewardOverlay.jsx` | Title | LOBSTER DELIVERED! |
| `LobsterRewardOverlay.jsx` | Body | [PLACEHOLDER — You brought Larry back to the surface! He's thrilled. Add a personal message here about your lobstering adventures.] |
| `LobsterRewardOverlay.jsx` | Sub | [PLACEHOLDER — Maybe a fun fact about the dive, or a thank-you note from Larry.] |
| `LobsterRewardOverlay.jsx` | Button | Keep Diving |

---

## Completion Overlay

| Location | Key | Text |
|----------|-----|------|
| `content.json` → `completion.message` | Main message | You've seen everything. Now let's talk about what I can do for you. |
| `content.json` → `completion.ctaLinks` | Same labels as connectButton | Email Me, LinkedIn, 610-772-6451 |
| `content.json` → `completion.diveAgainLabel` | Button | Dive Again |
| `content.json` → `completion.keepExploringLabel` | (Reserved) | Keep Exploring |
| `CompletionOverlay.jsx` | View Resume link | View Resume |
| `CompletionOverlay.jsx` | With-lobster header | LOBSTER CAUGHT! 🍽️ |
| `CompletionOverlay.jsx` | With-lobster sub | Everything found. Lobster caught. Dinner and a resume. |

---

## Game Over Screen

| Reason | Headline | Subheadline | Body text |
|--------|----------|-------------|-----------|
| outOfAir | NO AIR, NO GLORY | — | More ambition than oxygen. Happens to the best of us. |
| decompression | YOU GOT THE BENDS | — | There's a reason divers take it slow on the way up. You found out. |
| sharkBite | YOU ARE LUNCH | — | You came down here looking for lobster. The shark came down here looking for you. |
| decompressionWithLobster | DROPPED THE LOBSTER | ⚡ AND GOT THE BENDS | Lobsters are replaceable. You are not. Don't rush next time. |
| (fallback) | GAME OVER | — | Something went wrong down there. The ocean is unforgiving. |
| `App.jsx` | Retry button | Try Again | |
| `App.jsx` | Contact section label | OR JUST REACH OUT DIRECTLY | |

---

## Dialog (Generic)

| Location | Context | Text |
|----------|---------|------|
| `Dialog.jsx` | Delhi title | Delhi |
| `Dialog.jsx` | Close button (aria) | Close |
| `PhotoCarousel.jsx` | Close button (aria) | Close |
| `PhotoCarousel.jsx` | Pagination | 1 / N (e.g. 1 / 3) |

---

## Treasure Sprite Labels (On-Sprite Text)

| Location | Sprite | Text |
|----------|--------|------|
| `treasures.js` | Echo Show | alexa |
| `treasures.js` | Ring doorbell | ring |
| `treasures.js` | Compass | N, E, S, W |

---

## Where Copy Lives

- **Single source of truth:** `src/config/content.json` — meta, startScreen, zones, treasures, delhi, lobsters, camera, connectButton, decompressionDiver, completion.
- **Hardcoded in code:** TitleScreen card copy, diver/quips, boat & shark bubbles, item labels, NPC quips, NPC chat UI, game over copy, HUD strings, InteractButton, Dialog titles (e.g. Delhi), LobsterDelivered/LobsterReward/Completion overlay strings that aren’t in content.json.
- **Placeholders:** Delhi photo caption, camera photo captions, LobsterRewardOverlay body text — replace in content or components as needed.

When you add or change copy, update this file and, when possible, add new strings to `content.json` so one doc and one config stay in sync.
`