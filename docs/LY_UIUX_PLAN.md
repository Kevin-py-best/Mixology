# LY Bar Experience UI/UX Plan

> **Owner:** LY
>
> **Frontend milestone:** 2026-10-19
>
> **Plan created:** 2026-09-26
>
> **Purpose:** Complete and validate the public bar-discovery frontend flow before real venue data, OneMap, or backend integration.

## 1. Goal for 19 October

Deliver a responsive frontend prototype that lets a visitor:

1. Open the Bars page.
2. Browse every bar through one large-image carousel.
3. See database-featured bars earlier in the carousel without different visual treatment.
4. Select a bar from a card, map preview, or accessible list.
5. Open a complete Bar Detail page.
6. See the bar's location, vibe, active promotion, and cocktails served.
7. Open a served cocktail and return to the previous bar-discovery context.

Cocktail education, serving-bar information, the Bars page, and Bar Detail pages are public. Login and quiz completion are required for personalized cocktails shown as **Featured for you**, not for general bar discovery.

This milestone validates the user flow and interface. Current bar names, images, coordinates, promotions, and descriptions are placeholders until verified real-world data is prepared.

## 2. LY ownership

LY owns:

- Bars page UI and interactions.
- Large-image bar carousel and unified bar presentation.
- Bar Detail page UI.
- Bar placeholder data requirements.
- Map presentation and selected-marker behavior.
- OneMap integration after the UI flow is stable.
- Neighborhood and vibe presentation.
- Cocktails-served presentation.
- Database-driven priority ordering and promotion states.
- Responsive and accessible behavior for bar-related interfaces.

Coordinate these shared areas with ZR instead of changing their contracts independently:

- `src/App.jsx` and shared routing.
- Cocktail Detail serving-bar cards.
- Cocktail and bar IDs.
- API response shapes.
- Database fields and bar-to-cocktail relationships.

## 3. Current starting point

The existing `src/pages/BarsPage.jsx` already provides:

- A dark editorial visual direction.
- A three-card partner carousel that should become one large-image carousel containing all bars.
- Offer labels.
- A stylized Singapore map.
- Hover and selected map-pin states.
- Basic bar name, neighborhood, vibe, image, and promotion content.

The following work is still incomplete:

- `View Bar` and `View more` do not navigate anywhere.
- There is no `BarDetailPage.jsx`.
- The map uses fixed percentages instead of coordinates.
- There is no accessible list alternative to the visual map.
- The layout is fixed to three columns and is not mobile-ready.
- Map popups depend heavily on hover.
- The current carousel uses small cards and separates partner bars even though the final carousel should include every bar with the same slide treatment.
- Bar data lacks the fields needed for a full detail page.
- Bar card code is embedded inside `BarsPage.jsx` rather than reusable.
- Loading, error, missing-image, no-promotion, and no-cocktail states are absent.

## 4. The flow to design first

```text
Navbar: Bars
    |
    v
Bars page
    |
    +--> Large carousel slide ----+
    |                             |
    +--> Map marker preview ------+--> Bar Detail page
    |                             |
    +--> Accessible bar list -----+
                                      |
                                      +--> Directions action
                                      +--> Active promotion
                                      +--> Cocktail served
                                                |
                                                v
                                      Cocktail Detail page
```

Do not begin with OneMap. First make this flow work with placeholder data and a map placeholder. OneMap should replace the map surface later without changing the surrounding page structure or selected-bar behavior.

## 5. Step-by-step work order

### Step 1 — Confirm the Bar Detail content hierarchy

**Do this first.** Sketch the desktop and mobile Bar Detail page before rewriting the Bars page.

Required content, in priority order:

1. Bar name and main image.
2. Neighborhood and vibe.
3. Short editorial description.
4. Address and `Get directions` action.
5. Active promotion when applicable.
6. Cocktails served at the bar.
7. Opening-hours placeholder if the team wants this for the prototype.
8. Back action that returns to the previous discovery context.

Recommended page structure:

```text
Back to bars

[Bar image]
                         Bar name
                         Neighborhood · Vibe
                         Short description
                         Address
                         [Get directions]

Active offer             Only when a promotion exists

Cocktails served         Cocktail cards linking to Cocktail Detail

Location                 Map preview or OneMap
```

**Acceptance check:** Another teammate can understand the page hierarchy from the wireframe without reading implementation notes.

### Step 2 — Define the placeholder bar data contract

Write the fields the UI needs before building components. Use placeholder values now and give the final requirement to ZR for the shared API and database contract.

```js
{
  id: "atlas-bar",
  name: "Atlas Bar",
  description: "Placeholder editorial description.",
  vibe: "Classic",
  neighborhood: "Bugis",
  address: "Placeholder address",
  latitude: 1.0,
  longitude: 103.0,
  featured: true,
  imageUrl: "https://...",
  cocktailIds: ["straits-sling"],
  promotion: {
    title: "Placeholder offer",
    description: "Placeholder promotion details.",
    callToAction: "View offer",
    terms: "Placeholder terms."
  }
}
```

For the frontend prototype, also support:

- `promotion: null`.
- An empty `cocktailIds` array.
- A missing or failed image.
- `featured: true` and `featured: false` records with exactly the same visible card design.

`featured` is an internal database ordering field. Featured bars appear earlier in the returned order, but the frontend does not render a Featured section, badge, label, color, border, or alternate card style.

Use stable string IDs in new LY work. Do not add a competing database schema; ZR owns the final persistence model.

**Acceptance check:** Every visible value on the wireframe maps to one named field.

### Step 3 — Extract reusable carousel components

Create a bar component folder and move repeated UI out of `BarsPage.jsx`:

```text
src/components/bars/
  BarCarousel.jsx
  BarCarouselSlide.jsx
  BarMapPreview.jsx
  BarList.jsx
  PromotionCard.jsx
  BarEmptyState.jsx
```

Keep components driven by props. Recommended interaction contract:

```js
<BarCarouselSlide
  bar={bar}
  onSelect={() => onSelectBar(bar.id)}
/>
```

The slide's `View Bar` action must be a real link or button and keyboard accessible. Carousel controls must have descriptive labels.

**Acceptance check:** Every bar can use the same large carousel slide without copying markup or adding featured-only styling.

### Step 4 — Complete the Bars page without OneMap

Refine the existing page in this order:

1. Page heading and short explanation.
2. One large-image carousel containing every bar.
3. One prominent bar per slide, with its image, name, neighborhood, vibe, optional active promotion, and `View Bar` button.
4. Previous, next, direct slide indicators, and touch/swipe behavior.
5. Database-featured bars first, followed by the remaining bars in the supplied order.
6. Map placeholder beneath the carousel with selected marker and preview.
7. Accessible bar list below or beside the map.
8. Every `View Bar` and map preview calls `onSelectBar(bar.id)`.

Do not expose the database `featured` flag in the interface. All bars use the same typography, colors, carousel slide layout, map marker treatment, and Bar Detail structure. A promotion may be shown when it is active, but it does not change the slide's base hierarchy.

Carousel behavior:

- No bars: show a clear empty state instead of carousel controls.
- One bar: show the large slide and hide unnecessary previous/next controls.
- Two or more bars: enable previous, next, slide indicators, keyboard navigation, and touch/swipe interaction.

**Acceptance check:** Every visible `View Bar` or `View more` action opens the correct placeholder Bar Detail page.

### Step 5 — Build `BarDetailPage.jsx`

Create:

```text
src/pages/BarDetailPage.jsx
```

Recommended props while shared routing is being coordinated:

```js
BarDetailPage({
  bar,
  cocktails,
  onBack,
  onSelectCocktail,
})
```

Display only applicable sections:

- No promotion: omit the promotion card and preserve spacing.
- No served cocktails: show “Cocktail information is coming soon.”
- Failed image: show a neutral branded placeholder.
- Missing directions data: disable or omit the directions action.

The served-cocktail cards should call ZR's cocktail selection contract. Do not duplicate cocktail detail UI inside the bar page.

**Acceptance check:** A visitor can move from a bar to a cocktail and return without losing the bar context.

### Step 6 — Coordinate navigation with ZR

LY should provide the screens and selection callbacks. ZR, as integration owner, coordinates shared route and `App.jsx` changes.

Required destinations:

```text
/bars
/bars/:barId
/cocktails/:cocktailId
```

Give ZR:

- The stable placeholder bar IDs.
- The `onSelectBar(barId)` callback requirement.
- The `onSelectCocktail(cocktailId)` callback requirement.
- The expected back-navigation behavior.

**Acceptance check:** Directly opening or refreshing `/bars/:barId` still shows the correct bar once URL routing is integrated.

### Step 7 — Make the bar experience responsive

Design at these three widths while keeping content order consistent:

| Viewport | Expected behavior |
|---|---|
| Desktop | One wide landscape carousel slide, wide map, two-column Bar Detail hero |
| Tablet | One reduced-height carousel slide, flexible Bar Detail layout |
| Mobile | One stacked carousel slide with readable text, stacked Bar Detail, full-width actions |

Mobile requirements:

- Stack or safely overlay carousel text so it remains readable over the image.
- Keep the carousel image from becoming excessively tall.
- Use at least 44px touch targets for map and navigation controls.
- Do not let map popups overflow the viewport.
- Provide the bar list even if the map is difficult to use on a small screen.
- Stack image, identity, promotion, cocktails, and map in a clear reading order.
- Keep `Get directions` reachable without scrolling through all cocktails.

**Acceptance check:** No horizontal page overflow at approximately 375px, 768px, and 1200px widths.

### Step 8 — Complete accessibility behavior

Verify:

- All bar cards are reachable and activatable by keyboard.
- Map markers have labels such as `Open Atlas Bar preview`.
- Selecting a marker exposes its preview without requiring hover.
- Escape or a close button dismisses an open preview where applicable.
- Focus indicators remain visible.
- Promotion meaning is present in text, not only color.
- Images have useful alt text.
- Heading order remains logical.
- The map has a list-based alternative containing the same bars.

**Acceptance check:** The complete Bars → Bar Detail → Cocktail flow can be completed using only the keyboard.

### Step 9 — Add all prototype states

Show and review these states before integrating OneMap:

- Bars loading.
- Bars failed to load.
- No bars.
- A mix of database-featured and ordinary bars rendered with identical cards.
- Bar with no promotion.
- Bar with an active promotion.
- Bar with no served cocktails.
- Missing bar image.
- Map unavailable.
- Unknown bar ID.

Use `Something went wrong.` for unexpected failures and provide a retry or return action where useful.

**Acceptance check:** Each state can be triggered with a fixture change and does not break the layout.

### Step 10 — Replace the placeholder map with OneMap

Begin this only after Steps 1–9 are stable.

OneMap integration must preserve:

- The same selected-bar state.
- The same preview card.
- The same `onSelectBar(bar.id)` action.
- The accessible list alternative.
- Real latitude and longitude values.
- A visible map-unavailable fallback.

Marker clustering is useful when real data becomes dense, but it should not block the 19 October frontend flow if verified coordinates or OneMap configuration are not ready.

**Acceptance check:** Replacing the placeholder map does not require redesigning BarCard or Bar Detail.

### Step 11 — Final integration and handoff

Before handing the LY work to ZR:

1. Confirm every bar card uses a stable ID.
2. Confirm every bar-to-cocktail relationship uses stable cocktail IDs.
3. Confirm database-featured bars are ordered first without visible featured treatment.
4. Confirm public visitors can access all bar screens.
5. Test desktop, tablet, mobile, keyboard, and touch behavior.
6. Run the frontend build.
7. Record changed files and any requested shared-contract changes.
8. Give ZR the route callbacks and data fields needed for integration.

## 6. Suggested schedule

| Date | Focus | Deliverable |
|---|---|---|
| 26–28 Sep | Flow and wireframes | Approved Bars and Bar Detail desktop/mobile hierarchy |
| 29 Sep–3 Oct | Bars page components | Large all-bars carousel, reusable slides, map placeholder, accessible list |
| 4–8 Oct | Bar Detail page | Complete placeholder Bar Detail and served-cocktail flow |
| 9–11 Oct | Responsive and accessibility | Mobile/tablet layouts and keyboard-complete journey |
| 12–14 Oct | States and polish | Empty, loading, error, no-promo, and missing-image states |
| 15–17 Oct | Shared integration | Routes, Cocktail Detail links, stable IDs, team review |
| 18 Oct | Final QA | Build check and cross-device walkthrough |
| 19 Oct | Frontend milestone | Demonstrable end-to-end frontend flow and handoff notes |

If time becomes tight, keep OneMap as the final stretch item. A complete bar journey using a polished placeholder map is more useful for validating the product than an incomplete journey using a live map.

## 7. Priority order

### P0 — Required for the frontend milestone

- Bar Detail wireframes and page.
- Working navigation from every bar card and preview.
- Reusable BarCarousel and BarCarouselSlide.
- Database-featured ordering with one consistent carousel-slide design.
- Served-cocktail section and cocktail navigation.
- Responsive desktop, tablet, and mobile layouts.
- Keyboard-accessible controls.
- Empty, no-promotion, and missing-image states.

### P1 — Complete if P0 is stable

- Touch/swipe carousel interaction and refined transitions across viewport sizes.
- Refined map selection and preview behavior.
- Loading and retry states.
- Directions action using placeholder coordinates.
- OneMap with real coordinates.

### P2 — Later work

- Dense-marker clustering beyond what the initial catalog requires.
- Advanced promotion scheduling.
- Internal drag-and-drop bar management.
- Bar-owner accounts or self-service editing.
- Analytics dashboards.

## 8. Definition of done

LY's frontend milestone is done when:

- [ ] Every bar uses the same large carousel slide and detail-page treatment.
- [ ] Database-featured bars appear first without a visible Featured section, badge, or label.
- [ ] Every `View Bar` and map-preview action opens the correct Bar Detail page.
- [ ] Bar Detail shows identity, neighborhood, vibe, description, location, applicable promotion, and served cocktails.
- [ ] Served cocktails open the correct Cocktail Detail experience.
- [ ] Public visitors can use the complete bar flow without logging in.
- [ ] The flow works at desktop, tablet, and mobile widths.
- [ ] The flow works with keyboard and touch input.
- [ ] Empty, error, no-promotion, no-cocktail, missing-image, and map-unavailable states are present.
- [ ] Placeholder content is not presented to the team as verified production data.
- [ ] Stable IDs and shared navigation requirements are handed to ZR.
- [ ] The production build passes.
