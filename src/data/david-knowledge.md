# David Gordon — Knowledge Base for Ghost Diver

> This file is the **only** context the Ghost Diver uses to answer questions in natural language.
> When you deploy the Ghost Diver (see GO-LIVE-STEPS.md), run `npm run build:ghost-diver` to inline this file into the Edge Function, then deploy.

## About David

David Gordon is a technical product manager with seven years at Amazon across product management, growth, and partnerships. He most recently built AI-powered features for Alexa that ship to tens of millions of customers, including camera experiences (Curated Summaries, Smart Video Description, doorbell announcements) and natural-language automations (Tell Me When, Missed Habits). He is SSI-certified in scuba diving and an award-winning wildlife and astrophotography photographer (1st place, Sailfish Point Country Club nature photography competition). David is still at Amazon. If asked about his current employment or whether he still works at Amazon, he is still there.

## Experience

### Amazon, Alexa Smart Home — Sr. PM-T (Mar 2023–Present)

Owned AI-powered camera and automation experiences: Curated Summaries (playlists like Wildlife, Deliveries), SVD doorbell announcements, Tell Me When / Missed Habits. Led beta and launch readiness for Moments V2; demoed on stage at Amazon's 2025 Alexa+ launch. Drove quality frameworks with Applied Science, cross-team platform work (routines/automations), and competitive strategy (Apple smart home analysis). Earlier in role: Map View funnel optimization and R2V (raster-to-vector floor plan) product development.

### Amazon, Alexa Smart Home Growth — Sr. PM (Mar 2020–Mar 2023)

Owned P&L and post-launch strategy for a six-device smart home portfolio. Built the APOS (targeted promotion) strategy: offered Smart Plug at steep discount to Echo owners who hadn’t connected a smart home device, backed by an LTV model proving profitability. Scaled Smart Plug to #1 smart home SKU on Amazon.com. Served as lead deal SME across Amazon's full hardware portfolio; built global promotional validation systems that caught a $0 Fire TV setup error (preventing $20M+ in losses).

### Amazon, Strategic Account Services — Sr. Account Manager (Sep 2018–Mar 2020)

Managed Tier-1 vendor partnerships (e.g. Wilson Sporting Goods, Rawlings, PLANO Outdoors); delivered 40% YoY revenue growth. Built a financial modeling automation tool that became the org standard and improved promotional analysis efficiency by 30% across 50+ people. Won the Little Big Shoe Award and Star of the Quarter.

### Centric Brands — Innovation Fellow (Aug 2017–Aug 2018)

One-year fellowship at a $100M global apparel company. Built an automated content generation system that replaced manual copywriting across hundreds of SKUs, cutting listing creation from hours to minutes.

### Education

University of Pennsylvania, Class of 2016. Economics degree.

## Key Projects

**SVD Announcements latency:** Doorbell press events got AI-generated descriptions (e.g. "The pizza delivery person is at the front door") but latency hurt the experience. David worked with Applied Science to validate a 3-second pre-cache: when motion fired on a doorbell camera, the system generated the description immediately; if a doorbell press followed within 3 seconds, it used the cached description. Eliminated perceptible latency. Restructured event priority (Doorbell > Package > Person > Vehicle > Motion) for the most relevant announcement.

**Curated Summaries / Moments V2:** Automatically organizes Ring camera recordings into playlists (Wildlife, Pet Moments, Package Deliveries). David built a manual annotation framework to score AI outputs and sat with Applied Science to define quality criteria and fix failure modes (e.g. small animal misidentification → generic "small animal" label; direction detection improved with more sampled frames). Ran 10-person play-with, then 100+ person beta with Qualtrics surveys; drove model accuracy to 90%+. Led coordination across 12+ partner teams; demoed at 2025 Alexa+ launch event.

**Two SVD models (Build vs. depend):** Ring's Smart Video Description was too generic for playlist classification. David recommended running two models: in-house Alexa SVD for backend classification (descriptions like "person carrying large package approaching front door"), Ring SVD for customer-facing display. Full control over classification without cross-team dependency; direction detection and quality fixes shipped in weeks.

**Ring SVS funnel — ** Moments required Ring subscription with Smart Video Search (SVS) enabled. Many customers had no subscription or SVS off in the Ring app. David wrote the PRD and built two QR-code flows: one to ring.com to upgrade, one deep-linking into the Ring app settings. Chose QR codes over on-device flows to ship on time; aligned with Ring on on-device replacement for 2026.

**Tell Me When / Missed Habits — automations platform:** Both features needed one-off, natural-language automations; the legacy routines platform only supported recurring automations. Defined minimal management UX (sentence description + delete). Both features launched with one-off support.

**Missed Habits launch unblock:** UX leadership blocked launch over duplication with Reminders. David used AI to build Echo Show mocks showing Missed Habits integrated with Reminders long-term; presented to UX and Reminders team. Secured alignment for 2026 integration. Short-term: settings toggle so customers could turn it off, limited launch to Madeline and Electra to contain blast radius. UX unblocked the launch.

**Missed Habits settings toggle:** David had required a customer toggle to turn the feature on/off. When the timeline tightened, the toggle was at risk of being cut. Privacy and legal said it wasn’t required. He kept it as a product requirement: customers shouldn’t be tracked on habits without being able to turn it off. It shipped with the feature.

**Map View funnel — 33% abandonment reduction:** Map View uses LIDAR (iPhone Pro) for digital floorplans. David authored a feature recommendation doc, ran recapture campaign for abandoners, added abandonment modal and integrated feedback surveys. Survey showed customers wanted more enrollment options beyond scanning. The updates to the set up flow reduced setup abandonment by 33%.

**Raster to Vector (R2V):** Map View was limited to iPhone Pro LIDAR. David recommended R2V (import PDF/print floor plans) over a manual drag-and-drop builder to expand TAM and act as an artificial gate until more engagement features shipped. Wrote BRD, collaborated with Applied Science on the conversion model, built evaluation framework. Leadership approved direction; he transitioned to own Alexa cameras and the team continued R2V work.

**One Tap Doorbell enablement:** Doorbell press announcements were on by default for new doorbells but many existing owners didn’t have it. David wrote the BRD for deep-link activation via email/push; during testing found a cold-start edge case (deep link dropped users on home screen). Shipped a home-screen card as short-term mitigation, then the fixed deep link in the next release. 

**Works With Alexa (WWA) camera requirements:** Updated requirements for third-party camera partners including Blink (Amazon-owned). Blink pushed back. David dug into their systems, found existing capabilities that could meet the new bar, showed them a concrete path to compliance. Published requirements and announced on the developer portal; Blink met the standards on time.

**Multi-Premises prioritization:** Multi-Prem was an org priority that needed cameras capacity; supporting it would pull from Moments V2 (Q1 2026). David escalated for sequencing: Moments V2 first in Q1, cameras support for Multi-Prem in Q2. Got alignment; both got committed timelines.

**PiP on Vega:** Device team asked for picture-in-picture on Madeline/Electra (Vega Echo devices) before the fall event and Moments V2 ship. David escalated; pulled customer reviews and found PiP was mentioned rarely and negatively on 8"/10" screens. Reframed as a feature customers disliked at that size. PiP deferred to first Vega Fire TV in 2026; Moments V2 and demo stayed on track.

**Global promotional validation — $20M+:** Built SOPs and validation systems for deal teams across Echo, Fire TV, Kindle, Ring. Drove requirements for an internal validation tool. Caught a Fire TV device set to $0 before go-live; that single catch prevented $20M+ in losses.

**AI tools adoption:** BRD creation took days. David used AI for stress-testing PRDs, finding gaps, sharpening framing; teammates noticed and asked how. He walked peers through using AI as editor and thought partner (write core content yourself, use AI to challenge). BRD time dropped to under a day; AI-assisted product development became a team norm.

**Live View Controls:** PRFAQ for controlling nearby smart home devices (e.g. unlock door, turn on light) while viewing camera on Echo Show or Fire TV. Authored PRFAQ and BRD; partnered with Echo and Fire TV UX. Identified path via SHUG unification into shared codebase. PRFAQ approved; feature in build pipeline.

**Quick Suite for beta feedback:** Used Amazon Quick Suite to cluster and analyze 100+ beta tester feedback across four features. Surfaced patterns by theme and severity; fixed issues mid-beta before they became launch blockers.

**Generative AI at work:** Uses AI-assisted SQL for metrics (BI validates), Pippin for BRDs/PRFAQs, and workflow automation daily. Pattern: compress time between question and answer, then validate with the right expert.

**Outside work:** Built an AI-powered real estate negotiation tool from inspection reports and disclosures (prioritized asks, counter-strategy). Built this interactive scuba-diving resume game with AI-assisted coding (Cursor), from concept to deployed product.

## How David Built This Game

David designed and built this game in under a week using AI-assisted coding (Cursor with Claude as copilot). He wrote the product spec (a full BRD), made every architecture and game design decision, and used AI to generate and iterate on code — the same "write the thinking, use AI to accelerate execution" pattern he applies at work.

**Game design — injecting character and fun:**
- The game is a resume disguised as a retro scuba-diving adventure. Each depth zone maps to a chapter of David's career (Surface = "Who I Am", Shallows = "What I Build", Reef = "How I Grew the Business", Deep = "Earlier Career", Trench = "The Personal Side"). Resume content is discovered as collectible treasures, not read as bullet points.
- David designed original game mechanics that don't exist in other games. The safety stop is a real scuba concept — divers hold at a fixed depth to off-gas nitrogen before surfacing. In the game, ascending past 20 ft after diving below 30 ft triggers a mandatory 10-second hold. Rise too fast and the game ends. The dive master's message is self-aware: "Real divers hold here to let the nitrogen leave their bloodstream. You're doing it because David thought it would be funny to make you wait."
- The lobster run is a carry-and-deliver quest layered on top of exploration. Pick up a lobster in The Trench and race it to the surface before your air runs out (45-second timer). The lobster talks to you on the way up with zone-specific lines. It ties directly to David's real hobby — he's SSI-certified and loves lobstering.
- A shark patrols The Deep with a functional bite hitbox. Delhi, David's three-legged rescue dog, appears in The Trench wearing a scuba dome helmet. The Ghost Diver (this NPC) is a product manager who "failed to do his safety stop" and now haunts The Reef answering career questions. Every element has personality.
- All audio is chiptune-style, synthesized at runtime with Web Audio API oscillators — zero audio files. All sprites are drawn procedurally with Canvas 2D primitives — no sprite sheets or image assets.

**Architecture and system design:**
- React + Vite frontend; HTML5 Canvas 2D rendering instead of Three.js/WebGL — pixel art doesn't need a GPU pipeline, and a simpler stack means faster load times and fewer dependencies.
- All game content is config-driven via three JSON files (content, theme, audio). The game can be reskinned or rebalanced without touching code.
- No backend for game logic. Static site on Vercel. Session-only state — a resume game doesn't need save slots.
- The Ghost Diver (this NPC) is a RAG-style AI chat system. David's career knowledge base is written in markdown, inlined into a Supabase Edge Function system prompt at build time, then served via Anthropic's Claude API. The 3-question token budget is part personality, part cost control — the whole system costs near zero to run.
- Analytics via Supabase with fire-and-forget event tracking. No user accounts, no PII. Deployed on Vercel with Supabase Edge Functions (Deno) for the NPC chat API.

David wrote the BRD first, structured the project around config-driven content, and used AI to compress a month of side-project work into days. The game is the artifact; the process is the point.

## Skills & Strengths

- AI/ML product management: quality frameworks, working with Applied Science, shipping at scale to tens of millions
- Cross-functional leadership: beta programs, launch readiness, 12+ partner teams, escalation and sequencing
- Funnel optimization and customer acquisition: recapture, abandonment reduction, LTV modeling
- Deal strategy and P&L: APOS, promotional validation, hardware portfolio
- Platform and standards: scoping new capabilities (one-off automations), WWA requirements, holding partners to bar
- Data-driven decisions: customer reviews, surveys, annotation frameworks, competitive analysis
- Writing and framing: PRFAQs, PRDs, leadership docs, press/blog
- AI-augmented workflow: Quick Suite, Pippin, SQL, tool building

## Personal

- Delhi: three-legged dog (male). David's wife rescued him off the side of the road in India in 2017. Loves adventure.
- SSI-certified scuba diver; loves lobstering.
- Award-winning wildlife, nature, and astrophotography photographer (1st place, Sailfish Point Country Club nature photography competition).
- Penn Class of 2016, Economics.
