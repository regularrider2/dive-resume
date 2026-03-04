# Deep Dive — Content Worksheet

Fill out every section below, then re-upload this file. Anything you leave unchanged will be used as-is. Delete any items you don't want. Add new items by copying the format.

---

## 1. Start Screen

```
Game Title:          DEEP DIVE: DAVID GORDON
Subtitle:            An underwater interactive resume. Discover treasures to learn about my career, projects, and how I think.
Button Label:        DIVE IN
```

**Instructions:**

```
1. Arrow keys or WASD to swim
2. SPACE to interact with glowing items
3. ESC to close dialogs
4. Discover all items to complete the dive
```

---

## 2. Zones

| Zone ID    | Display Name   | Announcement Text                              |
|------------|----------------|-------------------------------------------------|
| `surface`  | THE SURFACE    | THE SURFACE — Who I Am                          |
| `shallows` | THE SHALLOWS   | THE SHALLOWS — Current Role & Key Projects      |
| `reef`     | THE REEF       | THE REEF — How I Think                          |
| `deep`     | THE DEEP       | THE DEEP — Where I've Been                      |
| `trench`   | THE TRENCH     | THE TRENCH — The Personal Side                  |

---

## 3. Treasure Items

**Icon types available:** `chest`, `gem`, `scroll`

### THE SURFACE — Who I Am

**Treasure 1**
```
ID:        who-i-am
Title:     Who I Am
Icon:      chest
Zone:      surface
Enabled:   true
Content:
David Gordon. Senior PM-T at Amazon, based in Seattle. UPenn '16.

I build products, grow them, and make hard tradeoffs along the way. Most recently I owned the Alexa smart home camera experience for tens of millions of customers. Dive deeper to get the full story.

When I'm not building products, I'm underwater. Award-winning wildlife photographer, SSI-certified scuba diver, and the reason this resume is a game about the ocean.
```

---

### THE SHALLOWS — Current Role & Key Projects

**Treasure 2**
```
ID:        alexa-role
Title:     Amazon — Sr PM-T, Alexa
Icon:      chest
Zone:      shallows
Enabled:   true
Content:
Alexa Smart Home Product | Mar 2023 – Present | Seattle, WA

Owned the Alexa smart home camera experience for tens of millions of customers. Worked directly with 20+ engineers, applied scientists, and designers across 12+ teams. Two major workstreams: integrating Ring cameras with Echo Show devices (AI-powered features, live viewing, device controls) and Map View (digital floorplan creation and customer acquisition).

Features were demoed on stage at the 2025 Amazon Alexa+ launch event. Managed a 100+ person beta through launch readiness.
```

**Treasure 3**
```
ID:        ring-camera
Title:     Alexa and Ring Cameras Integration
Icon:      scroll
Zone:      shallows
Enabled:   true
Content:
Drove four generative AI camera features through parallel 12-month workstreams, each solving a different customer problem:

Curated Summaries: auto-organized camera recordings into categorized playlists (Wildlife, Coming & Going, Packages, Pets). Partnered with Applied Science to optimize the categorization model and led beta testing to validate accuracy.

SVD Announcements: descriptive doorbell alerts ("The pizza delivery person is at the front door" instead of "Someone is at the front door"). Devised the latency mitigation strategy using pre-cached motion event descriptions.

Tell Me When You See: custom camera alerts via natural language ("Tell me when the gardener arrives"). Required cross-team work with the Routines platform to enable a new automation capability.

Missed Habits: proactive detection when household routines are missed ("The dog hasn't been walked by 4 PM"). Conducted customer research during alpha that led to design improvements.

Built the quality evaluation framework for AI model output from scratch. Reviewed hundreds of outputs, defined category-specific quality criteria, and co-developed production prompts with Applied Science. Drove accuracy to 90%+.

Increased Ring Smart Video Search adoption 16% by redesigning the activation funnel with QR-code upsell flows that addressed subscription and settings barriers.
```

**Treasure 4**
```
ID:        map-view
Title:     Alexa Map View
Icon:      scroll
Zone:      shallows
Enabled:   true
Content:
Led go-to-market and customer acquisition for Map View, a feature that lets customers create a digital floorplan using an iPhone's LIDAR sensor.

Reduced setup abandonment 33% through systematic funnel analysis: exit modals, re-engagement campaigns across email, push, and in-app channels, and customer feedback surveys. Those surveys surfaced the key insight: customers wanted Map View but didn't own an iPhone Pro with LIDAR.

That led to the Raster to Vector feature. I authored a strategic recommendation for leadership to build floor plan import, letting customers upload a PDF or photo of an existing plan. Partnered with Applied Science on the conversion model. This opened the feature to any smartphone user, not just iPhone Pro owners.
```

---

### THE REEF — How I Think

**Treasure 5**
```
ID:        tradeoffs
Title:     Technical Tradeoffs
Icon:      gem
Zone:      reef
Enabled:   true
Content:
A few examples of how I make scoping and architecture decisions:

Doorbell latency: Adding AI descriptions to doorbell announcements introduced delay. My solution: use the description from a motion event that fires seconds before the press as pre-cached content. Some wasted compute on motion events that don't lead to a press, but the latency improvement was worth it.

QR code upsell: Full on-device subscription management would have required deep integration with Ring's billing system and app settings APIs. I chose QR codes that linked customers to the right place, shipped on time, and aligned with Ring to build the on-device replacement for the following year.

One-time automations: The routines platform couldn't represent natural-language automations in its existing management UI. Rather than wait for a full re-architecture, I scoped to one-time automations with a minimal management UX (view and delete only), and defined the requirements for the platform change.
```

**Treasure 6**
```
ID:        ai-tools
Title:     AI-Assisted Product Development
Icon:      gem
Zone:      reef
Enabled:   true
Content:
I brought AI tools into our team's daily product work. Used Claude and GPT-4 to cut BRD creation time 70%, from multiple days to under a day. Trained teammates on prompt engineering workflows for writing specs, analyzing data, and structuring documents.

I build with AI tools too. This game was built using Cursor. I prototype fast and iterate in code. I think the best PMs don't just ship AI products for customers, they use AI to change how they work.
```

**Treasure 7**
```
ID:        cross-team
Title:     Cross-Team Leadership
Icon:      gem
Zone:      reef
Enabled:   true
Content:
The camera features I owned touched more teams than almost anything else on Alexa. Some of the cross-team work:

Routines & Automations: Partnered with the routines PM to enable a new one-off automation capability that didn't exist on the platform. My requirements defined the scope of the platform change.

Ring: Aligned on a 2026 roadmap for on-device subscription enablement, SVS settings, and free trial activation to replace the QR code flows.

Reminders: Coordinated integration for Missed Habits notifications and automation triggers.

Sharing: Advocated for Moments integration with the universal sharing platform. Positioned the feature for a Panos demo.

Competitive intelligence: Authored a competitive analysis on Apple's anticipated smart home and camera strategy. Connected the analysis to specific feature prioritization and roadmap sequencing.
```

---

### THE DEEP — Where I've Been

**Treasure 8**
```
ID:        growth-role
Title:     Smart Home Growth
Icon:      chest
Zone:      deep
Enabled:   true
Content:
Amazon, Alexa Smart Home Growth — Senior Product Manager | Mar 2020 – Mar 2023

Owned post-launch strategy and P&L for six Amazon smart home devices. Full ownership of pricing, launch timing, and channel strategy across every major retail event (Prime Day, Black Friday).

Delivered 7M+ units sold and exceeded revenue targets. Brought 500K+ new customers into the Alexa smart home ecosystem through targeted promotional strategy. Scaled Amazon Smart Plug to the #1 smart home SKU on Amazon.com, with customer lifetime value up 456% and offline retail partner sales growth of 940%.
```

**Treasure 9**
```
ID:        earlier-career
Title:     Earlier Career
Icon:      scroll
Zone:      deep
Enabled:   true
Content:
Amazon, Strategic Account Services — Senior Account Manager | Sep 2018 – Mar 2020
Managed Tier-1 vendor partnerships: Wilson Sporting Goods, Rawlings, PLANO Outdoors. Delivered 40% year-over-year revenue growth. Built a financial modeling automation tool that improved analysis efficiency 30% across a 50+ person org. Won the Little Big Shoe Award and Star of the Quarter.

Centric Brands — Innovation Fellow | Aug 2017 – Aug 2018
Selected for a competitive 1-year program at a $100M global apparel company. Built an automated product content generation system that replaced manual copywriting across hundreds of SKUs, cutting listing creation time from hours to minutes.
```

**Treasure 10**
```
ID:        deal-expert
Title:     The Deal Expert
Icon:      gem
Zone:      deep
Enabled:   true
Content:
During my time on Smart Home Growth, I served as the lead deal subject matter expert across Amazon's full hardware portfolio: Echo, Fire TV, Kindle, Ring, and more.

Built global promotional validation systems that prevented pricing errors and generated $20M+ in cost savings. Planned and executed promotional strategy across every major retail event, determining which products to feature, at what price, and in what deal structure. This wasn't just smart home. It was Amazon-wide hardware deals.
```

---

### THE TRENCH — The Personal Side

No treasures in The Trench. This zone contains the Delhi and Lobster special NPCs only.

---

## 4. Connect Button (HUD)

A persistent button in the top-right corner of the screen, always visible during gameplay. Opens a small overlay with contact links.

```
Button Label:  Let's Connect
```

**Contact Links:**

```
Link 1:
  Label: Email Me
  URL:   mailto:dgordon2393@icloud.com

Link 2:
  Label: LinkedIn
  URL:   https://linkedin.com/in/david-gordon-a2200945

Link 3:
  Label: Call Me
  URL:   tel:610-772-6451
```

---

## 5. Reference Divers

NPC divers that deliver endorsement quotes. 9 divers across three zones. Quotes are still needed for all.

### THE SHALLOWS

**Reference Diver 1**
```
Zone:           shallows
Name:           Pavan Nyama
Title:          Product Manager, Technical
Relationship:   PM Colleague, Alexa Smart Home
Quote:          [STILL NEEDED]
Enabled:        true
```

**Reference Diver 2**
```
Zone:           shallows
Name:           Brendan Gotch
Title:          Principal Product Manager, Technical
Relationship:   PM Colleague, Alexa Smart Home
Quote:          [STILL NEEDED]
Enabled:        true
```

**Reference Diver 3**
```
Zone:           shallows
Name:           Brittany West
Title:          Product Manager, Technical
Relationship:   PM Colleague, Alexa Smart Home
Quote:          [STILL NEEDED]
Enabled:        true
```

### THE REEF

**Reference Diver 4**
```
Zone:           reef
Name:           Prasad Akula
Title:          Software Development Manager
Relationship:   Engineering Partner, Moments
Quote:          [STILL NEEDED]
Enabled:        true
```

**Reference Diver 5**
```
Zone:           reef
Name:           Dinesh Nair
Title:          Sr. Manager, Applied Science
Relationship:   Science Partner, Moments
Quote:          [STILL NEEDED]
Enabled:        true
```

**Reference Diver 6**
```
Zone:           reef
Name:           Giulio Finestrali
Title:          Principal Software Engineer
Relationship:   Engineering Partner, Moments
Quote:          [STILL NEEDED]
Enabled:        true
```

### THE DEEP

**Reference Diver 7**
```
Zone:           deep
Name:           James Weng
Title:          Principal Product Manager
Relationship:   Former Manager
Quote:          [STILL NEEDED]
Enabled:        true
```

**Reference Diver 8**
```
Zone:           deep
Name:           Emily Burke
Title:          Principal Product Manager
Relationship:   Senior PM Colleague
Quote:          [STILL NEEDED]
Enabled:        true
```

**Reference Diver 9**
```
Zone:           deep
Name:           Lindsay Saletta
Title:          [STILL NEEDED]
Relationship:   Former Manager, Centric Brands
Quote:          [STILL NEEDED]
Enabled:        true
```

> **To add/remove:** Copy or delete any block. Valid zones: `surface`, `shallows`, `reef`, `deep`, `trench`.

---

## 6. Delhi the Dog (Special NPC)

A special NPC in The Trench — your dog Delhi, wearing pixel art scuba gear. Displays an inline photo in the dialog. Counts toward the discovery total. The name "Delhi" is hardcoded.

```
Enabled:   true
Zone:      trench
Message:   This is Delhi. He's my three-legged best friend. My wife rescued him off the side of the road in India in 2017. Like us, he loves adventure. Three-wheel drive and all.
```

**Photo** (single photo shown inline in the dialog):
```
Photo URL:     [STILL NEEDED — Supabase Storage URL for Delhi's photo]
Photo Caption: [STILL NEEDED — e.g., "Delhi on an adventure"]
```

---

## 7. Larry the Lobster (Special NPC — Photography Gallery)

A talking lobster NPC in The Trench. Shows a message and a "View Gallery" button that opens a fullscreen photo carousel. Counts toward the discovery total. The name "Larry the Lobster" is hardcoded.

```
Enabled:      true
Zone:         trench
Message:      You made it all the way down here. Most people turn back after the first few treasures. Since you're clearly thorough, here's something different: a look at what I see when I'm the one underwater.
Button Text:  View Gallery
```

**Gallery photos** (add or remove entries as needed):

```
Photo 1:
  URL:      [STILL NEEDED — Supabase Storage URL]
  Caption:  [STILL NEEDED — or leave blank]

Photo 2:
  URL:      [STILL NEEDED]
  Caption:  [STILL NEEDED]

Photo 3:
  URL:      [STILL NEEDED]
  Caption:  [STILL NEEDED]
```

> Add more photos by copying the block. Remove photos by deleting blocks.
> Photos are your wildlife/nature photography hosted in Supabase Storage.

---

## 8. Decompression Diver

```
Name:      Dive Master Dan
Message:   Hold up. You've been deep, and good divers don't rush to the surface. While you wait: the person who built this game also built AI features used by tens of millions of people. He once spent three months getting a model to stop calling squirrels crows. Stick around. There's more to find up top.
```

---

## 9. Completion Screen

```
Congratulatory Message:       You've explored everything. Thanks for diving deep.
"Dive Again" Button Label:    Dive Again
"Keep Exploring" Button Label: Keep Exploring
```

**CTA Links:**

```
CTA 1:
  Label: Email Me
  URL:   mailto:dgordon2393@icloud.com

CTA 2:
  Label: LinkedIn
  URL:   https://linkedin.com/in/david-gordon-a2200945

CTA 3:
  Label: Call Me
  URL:   tel:610-772-6451
```

---

## 10. Ambient Creatures

Non-interactable background creatures that add life to each zone. Adjust counts or remove entries to change what appears. Set count to `0` or delete the row to remove a creature type from a zone.

| Creature   | Zone      | Count | Notes                                      |
|------------|-----------|-------|--------------------------------------------|
| fish       | shallows  | 6     | Small fish swimming horizontally            |
| school     | shallows  | 1     | Group of 5–8 fish that scatter when nearby  |
| fish       | reef      | 5     |                                             |
| school     | reef      | 1     |                                             |
| turtle     | reef      | 1     | Slow-moving, sine-wave drift               |
| fish       | deep      | 3     |                                             |
| shark      | deep      | 1     | Dark silhouette in the background           |
| orca       | deep      | 1     | Large black-and-white, background layer     |
| fish       | trench    | 2     |                                             |

> No creatures in THE SURFACE zone.

---

## What's Still Needed

| Item | What's Missing |
|------|----------------|
| Reference Diver quotes (all 9) | Endorsement quote text for each diver |
| Lindsay Saletta's title | Job title |
| Delhi photo | Supabase Storage URL and caption |
| Larry gallery photos | Supabase Storage URLs and captions (however many you want) |
