# Mixology — Figma design brief

## App overview
Mixology is a cocktail discovery platform for Singapore. Users browse cocktails by taste and experience, get personalized recommendations, and discover bars tied directly to the cocktails they like — not a generic bar directory. Aesthetic: modern, high-end, fine-dining. Restrained and elevated, not "nightlife neon."

## Visual style
- Dark mode by default, flat surfaces, no gradients, no drop shadows
- One accent color does all the "action" work (buttons, links, active states). A second, closely related accent is reserved only for marking premium or featured content — never used anywhere else
- Generous whitespace, hairline borders only (no heavy strokes)
- Typography: a serif display font for hero greetings and cocktail names (e.g. Canela, Fraunces, or similar), a clean sans for UI and body text (e.g. Inter, Söhne)

## Color system
- Background (charcoal): `#1A1918`
- Surface / cards: `#232220`
- Surface alt / hover: `#2C2A27`
- Primary accent (caramel) — buttons, links, avatar, active filter states: `#B8863E`
- Text on caramel: `#2E1F0C`
- Premium/featured accent (champagne) — used once per screen, featured/paid content only: `#C9B896`
- Text on champagne: `#3D2E14`
- Text primary (ivory): `#F0EBE1`
- Text secondary / muted (stone): `#9C9589`

## Global navigation
- Simple 3-item navbar: logo, nav links (Home / Cocktails / Bars), search
- Navbar search is global — typing a cocktail or bar name jumps straight to that item's detail page, no intermediate results list

---

## Page 1 — Homepage (new user, no history)
- Hero: value-prop headline + short taste quiz CTA (replaces personalized greeting since there's no history yet)
- "Popular in Singapore": cocktail card grid — safe default recommendation, no personalization required
- "Browse by Taste" / "Browse by Experience": category entry points
- Featured Bar: one partner bar card, business placement, uses the champagne accent
- Once the quiz is completed, "Popular in Singapore" can be swapped for a lightweight "Because you said you like X" section

## Page 2 — Homepage (existing user)
- Hero: personalized greeting ("Good evening, [name]") with time-of-day context, a quick-access strip of 2–3 Go-To cocktail cards (name + "last had at [bar]" or "viewed X times"), single contextual CTA ("Find a bar nearby")
- Go-To Cocktails section: computed from ratings + quiz answers + view frequency, weighted rather than pooled (a highly-viewed but low-rated cocktail shouldn't dominate)
- "Popular in Singapore": cocktail card grid
- "Bars serving your favorites": 2 personalized bar cards tied to the user's Go-To cocktails — name, which cocktail it serves, "View bar" button, promo badge if applicable
- Featured Bar card: champagne accent border + badge, visually distinct from the personalized cards above it

## Page 3 — Cocktail Explorer
- No search bar on this page (handled by navbar)
- Left sidebar filters:
  - Multi-select checkboxes: Flavour, Spirit, Occasion
  - Single-select dropdown: Alcohol Strength, Experience Level
- Active filter chips above the grid, removable, synced with sidebar state
- Sort dropdown above the grid: default "Popularity," with A–Z / Newest / Rating as options
- Cocktail card grid — clicking a card opens the Cocktail Detail page
- Empty state: "No cocktails match — try removing a filter" when a filter combination returns zero results
- Mobile: sidebar collapses into a "Filters" button that opens a bottom sheet

## Page 4 — Bars
- Partner carousel (top): user-swiped, partner bars only. Each card: photo, name, promo badge (if any), "View bar" button. Section hides or shows a placeholder state if fewer than 3 partner bars exist
- Map (below): shows all bars at once (not just partners), with marker clustering for dense areas (e.g. Clarke Quay, Tanjong Pagar, CBD)
- Pin tap opens a small preview popup: bar name, one vibe tag from a fixed vocabulary (e.g. speakeasy, rooftop, casual, live music, classic), "View more" button → Bar Detail page

---

## Not yet scoped — design separately
- Cocktail Detail page
- Bar Detail page
- Bar Business Dashboard (partner-facing: profile editor, promo scheduler, analytics, tiered plans)
