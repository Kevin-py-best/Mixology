# Mixology — Figma update: dedicated quiz flow

## What's changing
The homepage previously had a single quiz question embedded directly in the hero. Replace this with a dedicated, multi-step quiz screen.

## 1. Homepage hero (new user / no history)
- Remove the inline quiz form entirely
- Hero now shows only: small uppercase eyebrow label, headline, subhead, and one button — "Take the Taste Quiz"
- Button navigates to the new Quiz screen

## 2. New screen — Taste Quiz
- Full-screen flow, centered content column, max width ~640px
- Hide the global navbar on this screen — no header chrome, so the quiz feels focused. Replace it with a text link "← Back to home" at the bottom-left of the screen
- Thin 2px progress bar at the top: 4 segments, filled left-to-right with the caramel accent as the user advances
- "Question X of 4" label above each question, small uppercase stone-colored text
- One question per screen, four questions total:
  1. **What spirit do you reach for?** — Vodka / Gin / Whiskey / Rum / Tequila / Surprise me
  2. **What flavor profile calls to you?** — Citrus & Bright / Rich & Stirred / Tropical / Bitter & Herbal / Floral & Delicate / Smoky & Dark (each with a one-line description)
  3. **How strong do you like it?** — Light & Easy / Balanced / Strong & Bold
  4. **What's the occasion, most often?** — After Dinner / First Date / Business Drinks / Weekend Unwind (each with a one-line description)
- Each option is a full-width selectable list item. Selected state: caramel border + faint caramel background tint (not a solid fill)
- Bottom row: "← Back" on the left (previous question, or back to home on question 1), primary button on the right — labeled "Next" until the last question, then "See my recommendations"
- Primary button is muted/disabled until an option on that screen is selected

## 3. Homepage — after quiz completion
- Hero switches to the "returning user" state: personalized greeting, a strip of 2–3 Go-To cocktail cards, single CTA ("Find a bar nearby")
- New section appears directly below the hero: **Your Go-To Cocktails** — a cocktail card grid (same card style as Popular in Singapore), with a small eyebrow line above it: "Because you said you like [flavor answer from quiz]"
- "Popular in Singapore" section stays exactly as before — its label and copy no longer change based on quiz state

## Color reference (unchanged, for consistency)
- Background: `#1A1918`
- Surface / cards: `#232220`
- Surface alt / hover: `#2C2A27`
- Primary accent — buttons, links, progress bar fill, active states: `#B8863E` (caramel), text on it `#2E1F0C`
- Premium/featured accent — Featured Bar badges only: `#C9B896` (champagne), text on it `#3D2E14`
- Text primary: `#F0EBE1` (ivory)
- Text secondary/muted: `#9C9589` (stone)

## Typography reference (unchanged)
- Headlines / cocktail names: serif (Fraunces), light weight, italic for hero moments
- UI, labels, body: sans (Inter)
