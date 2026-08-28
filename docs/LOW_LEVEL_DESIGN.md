# Mixology — Low-Level Design

> **Status:** PHASE 1
>
> **Version:** 1.3
>
> **Date:** 2026-08-17
>
> **Related documents:** [High-Level Design](./HIGH_LEVEL_DESIGN.md), [Agent Handoff](./AGENT_HANDOFF.md)

## 1. Document purpose

This document describes the detailed implementation design for the Mixology web application, with the cocktail-learning detail experience as the primary Phase 1 product flow.

It records the current component structure and identifies the concrete implementation behavior required for the next functional version. It is intentionally editable. Sections marked `TODO`, `Proposed`, or `Future` require product or engineering decisions before implementation.

## 2. Implementation baseline

### Current stack

- React 19.
- React DOM 19.
- Vite.
- JavaScript/JSX application files.
- TypeScript configuration present for tooling and configuration files.
- Tailwind CSS v4 available through the Vite plugin.
- Most existing component styling implemented with inline style objects.
- Fraunces and Inter loaded through Google Fonts.
- Static data stored in JavaScript modules.

### Current entry points

- [`src/main.jsx`](../src/main.jsx): React entry point.
- [`src/App.jsx`](../src/App.jsx): application shell and page state.
- [`src/index.css`](../src/index.css): global styles, fonts, colors, and theme tokens.

### Current navigation model

The prototype already has working navigation between its main screens and opens the cocktail view when a user selects a cocktail card. Its current implementation does not use a routing library; `App.jsx` stores the active page as a string:

```js
const [page, setPage] = useState('home')
```

Current page values:

```text
home
quiz
explorer
bars
cocktail
```

The current `cocktail` page is opened by selecting a cocktail card. The selected cocktail object and the originating page are stored in `App.jsx` so the back action can return the user to Home or Explorer. This navigation is already available in the prototype and should be preserved during branch integration.

### Phase 1 routing target

Phase 1 will extend the working prototype navigation with URL-based routing for shareable detail pages:

```text
/
/quiz
/cocktails
/cocktails/:cocktailId
/bars
/bars/:barId
/search
```

Phase 1 routing requirements:

- Cocktail cards open `/cocktails/:cocktailId`.
- Bar cards and map previews open `/bars/:barId`.
- Search can route directly to an exact cocktail or bar match.
- Browser refresh and direct links preserve the selected detail page.
- Back navigation preserves the previous Explorer search and filter context where practical.

The current local page state is the working prototype implementation. Phase 1 should keep the existing screen flow while moving the selected cocktail and bar identity from in-memory objects to stable URL identifiers where shareable detail links are required. ZR coordinates these shared routing changes as the integration owner.

### Phase 1 backend and database boundary

Phase 1 will use a backend and database. The browser frontend will not be the production source of truth.

```mermaid
flowchart LR
    Browser["React frontend"] --> API["Node.js + Express.js API"]
    API --> DB["Supabase PostgreSQL"]
    API --> Services["Search, recommendations, analytics"]
    Browser --> Auth["Supabase Auth"]
    Browser --> Map["OneMap"]
    API --> Media["Supabase Storage"]
```

Phase 1 responsibilities:

- The frontend renders screens and sends user actions to the API.
- The Node.js/Express.js API validates requests and applies business rules.
- ZR owns the Node.js/Express.js API implementation, the shared API contracts, and the integration of CX and LY requirements into the backend.
- Supabase PostgreSQL stores cocktails, bars, promotions, preferences, saved cocktails, and approved activity.
- Supabase Auth provides account creation, login, and authenticated sessions.
- Quiz submission, preference storage, saved cocktails, serving-bar access, and personalized recommendations require an authenticated customer.
- Recommendation and search logic operate through the API boundary.
- Analytics events are accepted only after the event list and privacy expectations are approved.
- Static JavaScript data remains available as local fixtures and initial seed data, not as the production source of truth.

Phase 1 will use authenticated Supabase Auth customers for protected features. Anonymous visitors may browse public cocktail education and general bar content, but they cannot submit the quiz, save cocktails, or view the serving-bar slideshow for a cocktail until they sign in.

## 3. Repository structure

```text
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── Navbar.jsx
│   ├── CocktailCard.jsx
│   └── Cocktail3DViewer.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── QuizPage.jsx
│   ├── ExplorerPage.jsx
│   ├── CocktailDetailPage.jsx
│   └── BarsPage.jsx
├── data/
│   ├── cocktails.js
│   └── cocktailDetails.js
└── imports/
    ├── mixology-figma-prompt.md
    └── mixology-quiz-figma-update.md
```

### Phase 1 target backend structure

The existing `src/` structure describes the current frontend prototype. The Phase 1 backend can be organized separately so server logic, database access, and frontend rendering remain independent:

```text
server/
  app.js
  routes/
  controllers/
  services/
  repositories/
  middleware/
  db/

supabase/
  migrations/
  seed/
```

- `server/` contains the Node.js/Express.js API.
- `routes/` maps HTTP endpoints to controller actions.
- `services/` contains recommendation, search, promotion, and preference rules.
- `repositories/` contains database queries and keeps Supabase details out of the UI.
- `middleware/` verifies Supabase Auth tokens and applies access control.
- `supabase/migrations/` contains versioned database changes.
- `supabase/seed/` contains initial cocktail, bar, and promotion data imported from the prototype fixtures.
- The Phase 1 frontend should add `src/pages/LoginPage.jsx` for Supabase Auth sign-in and account creation.

### Data-file note

The running JSX components import [`src/data/cocktails.js`](../src/data/cocktails.js). Cocktail view metadata is stored in [`src/data/cocktailDetails.js`](../src/data/cocktailDetails.js). These files are prototype fixtures and migration seed inputs only; the Express API reading Supabase is the Phase 1 production source of truth. The project uses JavaScript/JSX for application code, with no competing TypeScript cocktail-data file.

The source-of-truth decision is resolved: frontend pages use the API in production, while static JavaScript data is permitted only for local fixtures, tests, and seed/import preparation.

## 4. Application shell design

### `App.jsx`

Responsibilities:

- Own the current page.
- Own the global search query.
- Own quiz completion answers.
- Render the correct page component.
- Hide the global navbar on the quiz page.
- Provide navigation callbacks.

Current state:

```js
const [page, setPage] = useState('home')
const [searchQuery, setSearchQuery] = useState('')
const [quizAnswers, setQuizAnswers] = useState(null)
const [selectedCocktail, setSelectedCocktail] = useState(null)
const [cocktailReturnPage, setCocktailReturnPage] = useState('explorer')
```

Current callbacks:

```text
handleQuizComplete(answers)
  1. Saves answers in App state.
  2. Navigates to home.

Navbar search submit
  1. Saves search query in App state.
  2. Navigates to explorer.

openCocktail(cocktail, returnPage)
  1. Saves the selected cocktail in App state.
  2. Saves whether the user came from home or explorer.
  3. Navigates to the cocktail view page.
```

Phase 1 target state:

```ts
type Page =
  | 'home'
  | 'login'
  | 'quiz'
  | 'explorer'
  | 'bars'
  | 'cocktail'
  | 'bar-detail'
```

The current implementation stores the selected cocktail object in state. The Phase 1 implementation will preserve the working screen flow while representing the selected cocktail and bar with stable URL identifiers for shareable detail pages. Local state may still hold temporary UI state such as the previous page or selected slide.

## 5. Navbar design

File: [`src/components/Navbar.jsx`](../src/components/Navbar.jsx)

### Responsibilities

- Render the Mixology logo.
- Navigate to Home, Cocktails, and Bars.
- Open and close the global search control.
- Submit a search query.

### Local state

```js
const [searchOpen, setSearchOpen] = useState(false)
const [query, setQuery] = useState('')
```

### Props

```text
currentPage: string
onNavigate(page): void
onSearch(query): void
```

### Current search behavior

- The search field is hidden until the search icon is selected.
- Submitting the form sends the query to `App.jsx`.
- The application navigates to the Explorer.
- The Explorer matches cocktail name, spirit, or bar name.

### Phase 1 search behavior

```text
1. Normalize the query.
2. Search cocktail names, bar names, spirits, tags, and other approved searchable fields.
3. If there is one clear exact match, open its detail page.
4. If there are multiple matches, show a results view grouped by cocktails and bars.
5. If there are no matches, show a useful empty state with a way to return to Explorer.
```

Phase 1 search requests will go through the Express API and use Supabase PostgreSQL queries. A dedicated search index is not required for the initial catalog and may be added later without changing the frontend search interface.

Phase 1 search ranking is deterministic:

1. Exact cocktail ID or exact cocktail/bar name match.
2. Name prefix match.
3. Partial match in approved searchable fields such as origin, taste tags, spirits, occasions, and bar neighborhood.
4. Alphabetical order by display name as the final tie-breaker.

If there is one exact match, the frontend opens its detail page directly. Otherwise, the frontend displays grouped cocktail and bar results. The API must normalize whitespace and case before searching.

## 6. Homepage design

File: [`src/pages/HomePage.jsx`](../src/pages/HomePage.jsx)

### Inputs

```text
onNavigate(page): void
quizAnswers: QuizAnswers | null
onSelectCocktail(cocktail): void
```

### Current sections

1. New-user or returning-user hero.
2. Your Go-To Cocktails, after quiz completion.
3. Popular in Singapore.
4. Browse by Taste.
5. Browse by Experience.
6. Featured Bar.

### Current derived data

```js
const featuredBar = bars[0]
const popularCocktails = cocktails.slice(0, 4)
const goToCocktails = cocktails.slice(0, 3)
const personalizedCocktails = cocktails.slice(2, 6)
```

The current “personalized” arrays are fixed slices and do not use recommendation scoring.

### Current card navigation

- Cocktail cards on the homepage receive an `onClick` callback.
- Selecting a card opens the cocktail view page.
- The source page is recorded so the detail page can return to Home.

### Phase 1 recommendation inputs

```ts
type RecommendationContext = {
  quizAnswers: QuizAnswers
  viewedCocktails?: UserActivity[]
  location?: UserLocation
}
```

### Phase 1 homepage behavior

- New visitors see a prominent invitation to explore cocktails, with the taste quiz presented as an optional supporting action.
- Completed quiz users see recommendations based on their answers.
- Popular cocktails remain a separate non-personalized section.
- Relevant bars can be derived from the recommended cocktails.
- The featured bar remains a distinct partner placement.

## 7. Quiz design

File: [`src/pages/QuizPage.jsx`](../src/pages/QuizPage.jsx)

### Quiz response model

```ts
type QuizAnswers = {
  spirit: string
  tasteTag: string
  strength: 1 | 2 | 3 | 4 | 5
  occasion: string
}
```

### Questions

| Step | Key | Question |
|---:|---|---|
| 1 | `spirit` | What spirit do you reach for? |
| 2 | `tasteTag` | What taste profile calls to you? |
| 3 | `strength` | How strong do you like it? |
| 4 | `occasion` | What’s the occasion, most often? |

### Current local state

```js
const [step, setStep] = useState(0)
const [answers, setAnswers] = useState({})
```

### Current interaction rules

- An unanswered question cannot advance.
- Selecting an option updates the answer for the current question.
- Back moves to the previous question.
- Back on question one returns to Home.
- Completing question four calls `onComplete(answers)`.
- Progress is calculated from the current step and whether that step is answered.

### Phase 1 validation and persistence

- Require an authenticated Supabase Auth session before allowing the user to start or submit the personalized quiz. Unauthenticated visitors should see a login or sign-up prompt.
- Validate that all required keys exist before submitting.
- Validate that each value belongs to the allowed option list.
- Return a structured response with a timestamp.
- Send the completed quiz response to the protected API through the `PreferenceStore` adapter.
- Restore the saved response when the user returns to the homepage.

## 8. Cocktail Explorer design

File: [`src/pages/ExplorerPage.jsx`](../src/pages/ExplorerPage.jsx)

### Inputs

```text
searchQuery: string
onSelectCocktail(cocktail): void
```

### Current filter state

```js
const [selectedFlavors, setSelectedFlavors] = useState([])
const [selectedSpirits, setSelectedSpirits] = useState([])
const [selectedOccasions, setSelectedOccasions] = useState([])
const [strength, setStrength] = useState('')
const [level, setLevel] = useState('')
const [sort, setSort] = useState('Popularity')
const [sidebarOpen, setSidebarOpen] = useState(false)
```

### Current filtering behavior

Currently implemented:

- Search by cocktail name, spirit, or bar name.
- Taste-tag filtering.
- Spirit filtering.
- A–Z sorting.
- Rating sorting.
- Active filter chips.
- Clear-all behavior.
- Empty state.

### Current card navigation

- Filtered cocktail cards receive an `onClick` callback.
- Selecting a card opens the cocktail view page.
- The source page is recorded so the detail page can return to Explorer.

Currently stored but not applied to results:

- Occasion.
- Alcohol strength.
- Experience level.

### Phase 1 filter model

```ts
type CocktailFilters = {
  tasteTags: string[]
  spirits: string[]
  occasions: string[]
  strength?: 1 | 2 | 3 | 4 | 5
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  search?: string
}
```

### Five-level alcoholic-intensity scale

Phase 1 will use the following simple five-level scale rather than the current low/medium/strong values:

| Level | Label | Meaning |
|---:|---|---|
| 1 | Very light | Low perceived alcoholic intensity; light and easy to approach |
| 2 | Light | Noticeable alcohol but generally gentle |
| 3 | Moderate | Balanced alcoholic presence |
| 4 | Strong | Alcohol is a clear part of the experience |
| 5 | Very strong | High perceived alcoholic intensity; intended for experienced drinkers |

This scale is accepted for Phase 1. It describes the user’s drinking experience, not only the alcohol percentage of one ingredient. Spirit quantity, dilution, serving size, mixers, and the final balance should be considered when assigning the level. Exact ABV should not be shown unless Mixology has reliable source data.

### Phase 1 filter semantics

```text
Within one filter group: OR
Across filter groups: AND
No selected values: do not restrict by that group
```

Example:

```text
Selected taste tags: Citrus, Floral
Selected spirits: Gin

Result:
  flavor is Citrus OR Floral
  AND spirit is Gin
```

### Phase 1 sort model

```ts
type CocktailSort = 'popularity' | 'a-z' | 'newest'
```

Required data fields:

```text
popularityScore: number
createdAt: date
```

`popularityScore` is a Mixology-managed numeric value used for the initial popularity sort. “Newest” uses the cocktail record’s `createdAt` value. Phase 1 does not use user ratings or review scores.

### Empty state

When no cocktails match the active search and filters:

```text
No cocktails match
Try removing a filter or changing your search.
```

### Phase 1 mobile behavior

- Desktop shows a sticky filter sidebar.
- Mobile shows a Filters button.
- Selecting Filters opens a bottom sheet.
- Closing the sheet preserves selected filters.
- The filter count reflects the number of active filter values.

> **TODO:** Add responsive CSS that changes the current desktop-only filter trigger into a visible mobile control.

## 9. Cocktail card design

File: [`src/components/CocktailCard.jsx`](../src/components/CocktailCard.jsx)

### Current props

```text
cocktail: Cocktail
featured?: boolean
onClick?: () => void
```

### Current behavior

- Displays an image.
- Displays name, rating, spirit, bar, and up to two tags.
- Supports hover background and image scaling.
- Shows a Featured badge when requested.
- Opens the cocktail view page when an `onClick` callback is provided.
- Supports keyboard activation with Enter and Space.

The current prototype may display rating data from its static fixtures, but ratings and reviews are not part of the Phase 1 contract and must not be added to the production API or database model.

### Phase 1 props

```ts
type CocktailCardProps = {
  cocktail: Cocktail
  featured?: boolean
  onClick?: () => void
}
```

### Accessibility requirements

- The card should be a button or contain an accessible link.
- Keyboard activation should open the cocktail detail page.
- The image should have a meaningful alt value.
- Rating should be exposed as text, not only a decorative icon.

## 10. Cocktail view page design

File: [`src/pages/CocktailDetailPage.jsx`](../src/pages/CocktailDetailPage.jsx)

### Inputs

```text
cocktail: Cocktail
onBack(): void
onNavigate(page): void
```

For Phase 1, the page should receive a composed `CocktailDetail` record from the API rather than assembling educational content from separate frontend fixture files.

### Page layout

The page is organized into four main areas:

1. Back-navigation row.
2. Main detail hero:
   - Interactive 3D-style cocktail viewer on the left.
   - Taste profile below the viewer.
   - Cocktail name and origin card on the right.
   - Drinker profile, multiple spirits, five-level alcoholic intensity, and multiple occasions below the identity card.
3. Serving-bar slideshow.
4. Full-width history card with read-aloud action.

### Phase 1 product priority

`CocktailDetailPage` is the primary learning experience in Phase 1. The page must provide enough history, taste, origin, and cocktail facts for a user to understand the drink without taking the taste quiz or logging in. The serving-bar slideshow is a protected supporting feature: the user must log in before its cards are loaded or opened.

### Saved-cocktail behavior

- Show a save or favorite action on the cocktail card and/or detail page.
- Authenticated customers can save a cocktail through the protected API.
- Unauthenticated users see a login prompt when they try to save a cocktail.
- Saved cocktails are linked to the customer account through the `saved_cocktails` table.
- Customers can later view their saved cocktails from the customer experience.

### Current local state

```js
const [barIndex, setBarIndex] = useState(0)
const [isReading, setIsReading] = useState(false)
const [speechNotice, setSpeechNotice] = useState('')
```

### Detail metadata lookup

```js
const details = getCocktailDetails(cocktail.id)
```

The base cocktail record comes from [`src/data/cocktails.js`](../src/data/cocktails.js). Supporting view content comes from [`src/data/cocktailDetails.js`](../src/data/cocktailDetails.js).

### Displayed cocktail metadata

```ts
type CocktailDetailMetadata = {
  origin: string
  tasteTitle: string
  tasteDescription: string
  tastingNotes: string[]
  tasteTags: string[]
  whoDrinks: string
  spirits: string[]
  strength: 1 | 2 | 3 | 4 | 5
  occasions: string[]
  history: string
  readAloud: string
  servingBarIds: string[]
}
```

The prototype’s `servingBarIds` field is a fixture-level relationship reference. In Phase 1, the relationship is stored in `bar_cocktails` and loaded through the authenticated serving-bar endpoint; the public educational response does not expose the bar cards.

### Serving-bar slideshow behavior

- Requests serving-bar cards from the protected API after the customer is authenticated.
- Shows a login prompt instead of loading serving-bar cards for an unauthenticated user.
- Resolves each returned bar ID to a small `BarSummary` card.
- Displays one active bar slide at a time.
- Supports previous and next controls.
- Supports direct selection using slide indicator buttons.
- Displays the bar image, name, neighborhood, vibe, and partner status.
- Receives active bars in Mixology’s curated order, with featured or partner bars allowed to appear first.
- Keeps promotion details out of `BarSummary`; the bar detail page or a separate promotion response can display them.
- Clicking a bar card navigates to `/bars/:barId`.
- Shows an explicit empty state when the cocktail has no active serving bars.

### History read-aloud behavior

- Uses `window.speechSynthesis` and `SpeechSynthesisUtterance`.
- Reads `details.readAloud`, falling back to `details.history`.
- The button toggles between “Read it out” and “Stop reading.”
- Speech is cancelled when the page unmounts.
- An accessible live status communicates reading state or browser support errors.
- If speech synthesis is unsupported, the page displays a fallback notice.

## 11. Cocktail 3D viewer design

File: [`src/components/Cocktail3DViewer.jsx`](../src/components/Cocktail3DViewer.jsx)

### Purpose

Provide an interactive visual presentation of the cocktail without adding a 3D rendering dependency or requiring a model asset.

### Current implementation

- Uses CSS `perspective` and `transform-style: preserve-3d`.
- Builds the visual from glass, liquid, image, garnish, stem, base, and shadow layers.
- Uses the cocktail image as a visual texture inside the liquid.
- Chooses a liquid color based on the cocktail spirit.
- Supports pointer dragging to change X/Y rotation.
- Provides rotate-left, rotate-right, and reset controls.
- Includes a short instruction: “Drag to explore the serve from every angle.”

### Important boundary

This is a CSS-based 3D-style viewer, not a physically accurate 3D model viewer. It does not currently use Three.js, WebGL, GLB files, lighting models, or model loading.

### Proposed future model viewer

If a true 3D asset is required, the component boundary should remain similar:

```text
Cocktail3DViewer
  receives cocktail and viewer configuration
  loads a model or scene
  exposes pointer and keyboard rotation
  exposes reset and loading/error states
```

Phase 1 will keep the CSS-based interactive viewer. A true Three.js/WebGL viewer and artist-created model assets are later-phase work.

## 12. Bars page design

File: [`src/pages/BarsPage.jsx`](../src/pages/BarsPage.jsx)

### Current state

```js
const partnerBars = bars.filter(b => b.partner)
const [carouselIdx, setCarouselIdx] = useState(0)
const [hoveredPin, setHoveredPin] = useState(null)
const [selectedBar, setSelectedBar] = useState(null)
```

### Partner carousel

Current behavior:

- Uses partner bars only.
- Displays three visible cards when enough partner data exists.
- Uses previous and next buttons.
- Marks the first visible card with champagne styling.

Phase 1 target behavior:

- Support touch/swipe input.
- Handle fewer than three partner bars.
- Show an explicit placeholder when there are no partner bars.
- Make the View Bar button navigate to a bar detail page.

### Partner promotions and featured placements

Phase 1 will display partner bars without giving bar owners accounts or editing control. Mixology will manage the displayed bar profiles, featured placements, and promotions through data workflows or internal administration.

In a future phase, Mixology may build an internal drag-and-drop administration page for the Mixology team to update the order and presentation of bar details. This is not a bar-owner portal.

Partner bars may receive:

- A visible Partner or Featured badge.
- Featured placement on the homepage.
- Priority placement in the partner-bar carousel.
- Promotion badges on bar cards.
- Promotion details on the bar detail page.
- Promotion details on a cocktail page when the bar serves that cocktail.

Promotions may initially be stored in static data or managed through an internal Mixology administration workflow. Partner bars do not directly edit the Phase 1 application data.

```ts
type Promotion = {
  id: string
  barId: string
  title: string
  description: string
  startsAt: string
  endsAt: string
  activeDays?: string[]
  startTime?: string
  endTime?: string
  callToAction: string
  terms?: string
}
```

The UI should show a promotion only when its current date and time are within the active period. Partner or sponsored placement should be labeled clearly so users can distinguish it from ordinary editorial discovery.

### Map

Current behavior:

- Uses a CSS-styled mock map.
- Uses manually assigned percentage positions.
- Displays all static bars.
- Opens a preview on hover or click.

Phase 1 target behavior:

- Use real latitude and longitude fields.
- Integrate OneMap for Singapore bar locations and map display.
- Cluster dense markers.
- Make pins keyboard accessible.
- Open bar details from the preview.
- Avoid relying on hover as the only interaction.

### Phase 1 bar model additions

```ts
type BarVibe = string

type Bar = {
  id: string
  name: string
  vibe: BarVibe
  neighborhood: string
  latitude: number
  longitude: number
  partner: boolean
  promo?: Promotion | null
  imageUrl?: string
}
```

### Bar detail page target

Phase 1 will add a dedicated bar page at `/bars/:barId`.

The page should display:

- Bar name, image, neighborhood, and vibe.
- Real map location and directions action.
- Partner status and active promotions.
- Cocktails served by the bar.
- A clear link back to the previous discovery context.

The page should use the same bar record and promotion model as the Bars page and the cocktail serving-bar slideshow.

## 13. Data models

### Current cocktail model

```ts
type Cocktail = {
  id: number
  name: string
  spirit: string
  flavor: string
  rating: number
  bar: string
  img: string
  tags: string[]
}
```

### Current prototype cocktail detail metadata model

```ts
type PrototypeCocktailDetailMetadata = {
  origin: string
  tasteTitle: string
  tasteDescription: string
  tastingNotes: string[]
  tasteTags: string[]
  whoDrinks: string
  spirits: string[]
  strength: 1 | 2 | 3 | 4 | 5
  occasions: string[]
  history: string
  readAloud: string
  servingBarIds: string[]
}
```

The detail metadata is keyed by the base cocktail ID and is resolved through `getCocktailDetails(id)` in the prototype. The prototype may use fallback data while fixtures are incomplete, but the Phase 1 seed process and API must reject incomplete cocktail records instead of returning fallback metadata.

### Phase 1 cocktail model

```ts
type Cocktail = {
  id: string
  name: string
  description: string
  spirits: Spirit[]
  tasteTags: string[]
  strength: 1 | 2 | 3 | 4 | 5
  experienceLevel: ExperienceLevel
  occasions: Occasion[]
  popularityScore: number
  createdAt: string
  imageUrl: string
}
```

### Phase 1 cocktail-learning detail model

The detail content is a first-class part of the product. The database may keep base cocktail fields and educational metadata in separate tables, but the API should return them as one detail response so the page can render the complete learning experience without treating history or taste information as optional.

```ts
type CocktailDetail = Cocktail & {
  detail: CocktailDetailMetadata
}
```

```ts
type CocktailDetailMetadata = {
  origin: string
  tasteTitle: string
  tasteDescription: string
  tastingNotes: string[]
  whoDrinks: string
  history: string
  readAloud: string
}

type ServingBarResponse = {
  bars: BarSummary[]
}
```

Every property in the Phase 1 cocktail and cocktail-detail models is required. The API must not omit a field or return `null` for required cocktail education content. Array fields must always be present; a relationship with no matching records is represented by an empty array in its relationship response. Each seeded cocktail must contain its origin, taste information, tasting notes, drinker profile, spirits, strength, occasions, history, read-aloud text, and image before it is published.

The combined `Cocktail` and `CocktailDetailMetadata` response contains the cocktail’s origin, taste title and description, taste tags, tasting notes, drinker profile, multiple spirits, five-level alcoholic intensity, multiple occasions, history, read-aloud text, image, and required base metadata. The `bar_cocktails` relationship is stored in Supabase and is exposed through the protected serving-bar endpoint rather than the public educational response. User reviews and ratings are not part of this model. ZR will write the cocktail history, provide the cocktail images, and create the initial cocktail seed data. Phase 1 will not introduce a separate cocktail-content review status or review workflow.

### Supporting enums

```ts
type AlcoholicIntensity = 1 | 2 | 3 | 4 | 5
type TasteTag = string
type Spirit = string
type Vibe = string
type ExperienceLevel = string
type Occasion = string
```

The final controlled vocabulary for taste tags, spirits, vibes, occasions, and experience levels is intentionally deferred until the content taxonomy is reviewed. During early development, seed data may use non-empty string values. Agents must reuse values already present in the seed data and must not invent competing spellings. The final vocabulary must be approved before Phase 1 filters and recommendation matching are considered complete.

## 14. Recommendation design

Recommendations are a supporting feature. Their purpose is to help an authenticated user choose which cocktail to learn about next; they should not replace the public cocktail detail experience.

### Current behavior

The post-quiz homepage uses fixed cocktail array slices. Quiz answers do not currently change the actual cocktail set.

### Phase 1 scoring behavior

```ts
type RecommendationInput = {
  quizAnswers: QuizAnswers
  cocktails: Cocktail[]
  userActivity?: UserActivity[]
}

type RecommendationResult = {
  cocktailId: string
  score: number
  reasons: string[]
}
```

Initial Phase 1 score components:

```text
Spirit match       25%
Taste-tag match    35%
Strength match     15%
Occasion match     15%
Popularity          5%
View/activity data  5%
```

These weights are the initial Phase 1 proposal. The service should return both a score and human-readable reasons so the UI can explain recommendations. Ratings and reviews are intentionally excluded from the Phase 1 score.

Example reason:

```text
Recommended because you chose Gin and the Citrus & Bright taste tag.
```

Phase 1 rules should also define tie-breaking and cold-start behavior. A user’s quiz match should remain more important than a small amount of browsing activity.

### Phase 1 preference persistence

The application should remember the user’s quiz answers and basic discovery activity across refreshes.

The implementation should use a storage adapter so the UI does not depend directly on a specific storage system:

```ts
type PreferenceStore = {
  saveQuizAnswers(answers: QuizAnswers): void
  getQuizAnswers(): QuizAnswers | null
  recordCocktailView(cocktailId: string): void
  getViewedCocktailIds(): string[]
  saveCocktail(cocktailId: string): void
  removeSavedCocktail(cocktailId: string): void
  getSavedCocktailIds(): string[]
}
```

For Phase 1, the primary adapter will use the backend API and Supabase database for authenticated customers. Browser `localStorage` may be used only as a temporary cache or offline fallback; it is not the production source of truth. Anonymous visitors cannot save quiz answers, save cocktails, receive account-based personalized recommendations, or view the serving-bar slideshow.

## 15. Navigation and detail pages

### Phase 1 route model

Phase 1 should preserve the prototype’s working navigation and use URL-based destinations for shareable cocktail and bar pages:

```text
/
/login
/quiz
/cocktails
/cocktails/:cocktailId
/bars
/bars/:barId
/search
```

### Navigation requirements

- Unauthenticated users who select the quiz are sent to `/login`.
- Successful Supabase Auth login returns the user to the quiz or the original protected destination.
- Cocktail card opens `/cocktails/:cocktailId`.
- Bar card opens `/bars/:barId`.
- Map preview opens the corresponding bar detail page.
- Search result opens the matching entity.
- Back navigation preserves the previous search/filter context where practical.

The prototype already provides the basic screen-to-screen navigation. ZR, as integration owner, coordinates any change needed to support stable URL identifiers without breaking that existing flow.

## 16. Phase 1 API boundary

The current prototype has no API. Phase 1 will introduce an application API so the frontend can use backend and database-backed data. ZR owns the Express API and the shared integration of the frontend branches into that API.

```text
GET    /api/v1/cocktails
GET    /api/v1/cocktails/:id
GET    /api/v1/cocktails/:id/serving-bars
GET    /api/v1/bars
GET    /api/v1/bars/:id
GET    /api/v1/search?q={query}
POST   /api/v1/quiz-responses
GET    /api/v1/recommendations
GET    /api/v1/promotions
GET    /api/v1/me/preferences
PUT    /api/v1/me/preferences
POST   /api/v1/me/activity
GET    /api/v1/me/saved-cocktails
POST   /api/v1/me/saved-cocktails/:cocktailId
DELETE /api/v1/me/saved-cocktails/:cocktailId
POST   /api/v1/analytics/events

Internal administration endpoints:
GET    /api/v1/admin/bars
POST   /api/v1/admin/bars
PUT    /api/v1/admin/bars/:id
POST   /api/v1/admin/bars/:id/promotions
PUT    /api/v1/admin/promotions/:id
GET    /api/v1/admin/analytics/summary
GET    /api/v1/admin/analytics/events
```

Example Explorer request:

```text
GET /api/v1/cocktails?tasteTag=citrus&spirit=gin&sort=popularity&page=1&pageSize=24
```

Phase 1 API requirements:

- Validate all incoming query and body values.
- Require a valid Supabase Auth bearer token for quiz, preference, saved-cocktail, serving-bar, activity, recommendation, and administration endpoints.
- Apply authorization to internal administration endpoints.
- Return stable IDs for cocktails, bars, promotions, and authenticated users.
- Support pagination for cocktail, bar, and search results.
- Return a consistent JSON error format with a user-facing message of `Something went wrong.` for unexpected failures.
- Log technical error details on the server without exposing them to the user.
- Keep recommendation and search logic behind server-side service boundaries.
- Version the API so future changes do not silently break the frontend.

In simple English, these API requirements are the rules for how the frontend asks the Express backend for data. Each endpoint must say what it does, whether login is required, what input it accepts, what it returns, and what the user sees if something fails. This lets CX, LY, and ZR build their pages against the same backend behavior.

### API contract change policy

The examples in this document are the initial Phase 1 contract, not a permanent restriction. The API may change while Phase 1 is being developed, but changes must be coordinated by ZR as the API and integration owner.

- Backward-compatible changes, such as adding a new optional response field, should be documented and communicated to the frontend owners.
- Breaking changes, such as renaming a field, removing a field, changing a field type, or changing an authentication requirement, require the API documentation, frontend code, and tests to be updated together.
- Do not silently change an endpoint or response shape in one branch.
- If a breaking change is required after an API has been released, add a new version such as `/api/v2` rather than unexpectedly changing `/api/v1`.
- The low-level design and the shared agent handoff document are the written source of truth for the current contract.

### Cocktail detail response

`GET /api/v1/cocktails/:id` is a primary Phase 1 endpoint. It should return the complete educational content needed by `CocktailDetailPage` in one response:

```ts
type CocktailDetailResponse = {
  cocktail: Cocktail
  detail: CocktailDetailMetadata
}

type BarSummary = {
  id: string
  name: string
  neighborhood: string
  vibe: string
  partner: boolean
  imageUrl?: string
}
```

Example public response:

```json
{
  "cocktail": {
    "id": "straits-sling",
    "name": "Straits Sling",
    "description": "A Singapore cocktail with a fruity, refreshing profile.",
    "spirits": ["gin", "cherry brandy"],
    "tasteTags": ["fruity", "sweet", "citrus"],
    "strength": 3,
    "experienceLevel": "intermediate",
    "occasions": ["evening", "celebration"],
    "popularityScore": 85,
    "createdAt": "2026-08-17T00:00:00.000Z",
    "imageUrl": "https://example.com/cocktails/straits-sling.png"
  },
  "detail": {
    "origin": "Singapore",
    "tasteTitle": "Fruity and refreshing",
    "tasteDescription": "A bright, fruity cocktail with a noticeable but balanced spirit finish.",
    "tastingNotes": ["cherry", "citrus", "herbal"],
    "whoDrinks": "People who enjoy fruity and approachable cocktails.",
    "history": "The cocktail history is stored here.",
    "readAloud": "The spoken version of the cocktail history is stored here."
  }
}
```

Example protected serving-bar response:

```json
{
  "bars": [
    {
      "id": "atlas-bar",
      "name": "Atlas Bar",
      "neighborhood": "Bugis",
      "vibe": "Elegant and historic",
      "partner": true,
      "imageUrl": "https://example.com/bars/atlas-bar.png"
    }
  ]
}
```

If no active bar serves the cocktail, the protected response still includes the required `bars` field as an empty array:

```json
{
  "bars": []
}
```

The public response should include the cocktail’s history, read-aloud text, taste description, taste tags, tasting notes, origin, multiple spirits, five-level alcoholic intensity, multiple occasions, drinker profile, and visual media. The protected serving-bar endpoint returns `BarSummary[]` after the customer is authenticated. The frontend should not need to reconstruct the educational content from several unrelated static files in production.

Node.js and Express.js are the selected Phase 1 backend technologies. Supabase PostgreSQL, Supabase Auth, and Supabase Storage are the selected Phase 1 Supabase services. The production hosting provider remains undecided. The API error response should remain generic to users while server logs retain actionable technical details.

### Database names and API names

Database column names and API field names serve different purposes. Supabase database columns will use `snake_case`, while JavaScript objects and JSON responses will use `camelCase`. The Express repository or mapper layer converts between them so frontend components do not need to know the database naming convention.

Example mapping:

```text
Supabase column: cocktails.created_at
API field:       cocktail.createdAt

Supabase column: cocktail_detail_metadata.taste_tags
API field:       detail.tasteTags

Supabase column: cocktail_detail_metadata.read_aloud
API field:       detail.readAloud
```

This means that a database migration can use `taste_tags`, while the frontend continues to use `tasteTags`. ZR owns and documents these mappings as part of the API contract.

### Phase 1 database model

Supabase will provide the Phase 1 PostgreSQL database, authentication, and managed media storage. Supabase Auth manages user identities and sessions; the application must not write directly to Supabase Auth system tables.

Phase 1 should support these logical records:

```text
cocktails
cocktail_detail_metadata
bars
bar_cocktails
promotions
authenticated_users (Supabase Auth identities)
user_profiles (customer or admin role)
user_preferences
saved_cocktails
user_activity
analytics_events
```

Important relationships:

```text
bar_cocktails links bars to cocktails
promotions belong to bars
cocktail_detail_metadata belongs to cocktails
user_profiles extends authenticated user information with the application role
user_preferences belong to authenticated Supabase Auth users
saved_cocktails links authenticated customers to cocktails
user_activity belongs to authenticated Supabase Auth users
analytics_events may reference an authenticated user and an entity
```

Database requirements:

- Use stable IDs for all primary entities.
- Make every Phase 1 cocktail-detail field `NOT NULL`; use an empty array rather than a missing or `NULL` relationship list when a cocktail has no related records.
- Add created and updated timestamps to managed records.
- Store promotion start/end times and active status inputs.
- Add indexes for cocktail search fields, bar names, neighborhoods, and promotion status.
- Add a unique constraint so one customer cannot save the same cocktail more than once.
- Store application roles in `user_profiles.role` with only `customer` and `admin` values in Phase 1.
- Link `user_profiles.auth_user_id` to the Supabase Auth user identity and make it unique.
- Apply row-level security and backend authorization so customers cannot access administrator records or operations.
- Use migrations for schema changes.
- Back up production data and document restore procedures.
- Keep administrative changes auditable before the future internal bar-management page is introduced.

ZR owns the Supabase schema, migrations, and initial cocktail seed data. LY supplies the bar data requirements and bar-to-cocktail relationships that must be represented in that shared schema. CX supplies customer-authentication and quiz-data requirements. No branch should create a competing schema or migration set.

### Phase 1 analytics and measurement

CX will build the Mixology-owned lightweight analytics dashboard for administrators. Approved events will be stored in the `analytics_events` table in Supabase and read through protected administration endpoints. ZR owns the analytics table and migration work as part of the database. The event list, data fields, and privacy expectations must still be discussed and approved before analytics is enabled for real users.

Candidate Phase 1 events:

```text
quiz_completed
cocktail_viewed
bar_viewed
recommendation_selected
serving_bar_selected
promotion_clicked
search_used
history_read_aloud
```

Example event payload:

```ts
type AnalyticsEvent = {
  event: string
  entityId?: string
  source?: string
  timestamp: string
}
```

Phase 1 tracking rules:

- Track product actions, not every mouse movement or hover.
- Avoid collecting names, message contents, or unnecessary personal information.
- Do not use session recording or advertising profiles.
- Approve the final event list and privacy expectations before implementation.
- Restrict analytics summary and event-detail views to Mixology administrators.
- Build the initial dashboard around counts and trends for discovery, search, views, recommendations, and promotion interactions.
- Add advanced reporting, segmentation, and exports only after enough usage data exists.

The purpose is to understand whether the quiz-to-cocktail-to-bar journey is working, not to build a detailed personal profile of each user. Events may reference an authenticated user only where that is necessary and approved; otherwise, store aggregate or minimally identifiable data.

## 17. Error, loading, and empty states

### Global states

- Loading: show a quiet skeleton or reserved layout area.
- Error: show `Something went wrong.` and provide a retry action without exposing technical server details.
- Empty: explain that no data or matching results are available.
- Missing image: use a neutral cocktail/bar placeholder.

### Explorer states

- No matches after filtering.
- Search service unavailable.
- Cocktail data unavailable.

### Cocktail view states

- Cocktail metadata is missing: use the fallback metadata object.
- Cocktail image unavailable: keep the viewer frame and show the neutral background.
- No related serving bars: show the configured fallback bar or an explicit empty state.
- Speech synthesis unavailable: keep the history text visible and show a support notice.
- Speech synthesis interrupted: reset the read-aloud button to its idle state.

### Bars states

- No partner bars.
- Fewer than three partner bars.
- Map provider unavailable.
- Bar has no active promotion.

## 18. Accessibility and responsive requirements

### Accessibility

- Use semantic headings in page order.
- Use real buttons or links for interactive cards.
- Keep focus indicators visible.
- Ensure quiz options expose selected state to assistive technology.
- Use labels for all select controls.
- Make map pins keyboard reachable.
- Provide non-hover alternatives for map previews.
- Make cocktail cards keyboard activatable.
- Provide rotate-left, rotate-right, and reset controls for the 3D-style viewer.
- Keep the history readable as text even when speech synthesis is unavailable.
- Announce read-aloud state changes through an accessible live region.
- Check text and control contrast against the dark theme.

### Responsive behavior

```text
Desktop:
  Two-column homepage hero.
  Sticky Explorer sidebar.
  Three-card partner-bar carousel.

Tablet:
  Reduced gaps and card widths.
  Flexible card grids.

Mobile:
  Single-column homepage hero.
  Mobile filter button and bottom sheet.
  Horizontally scrollable or stacked partner cards.
  Stacked cocktail detail hero with full-width viewer.
  Full-width serving-bar slide and history card.
  Full-width primary actions.
```

## 19. Testing plan

### Unit tests

- Filter matching.
- Search matching.
- Sort behavior.
- Recommendation scoring.
- Quiz progress calculation.
- Carousel wraparound.
- Cocktail detail metadata lookup.
- Recommendation reason generation.

### Component tests

- Quiz cannot advance without an answer.
- Quiz submits all four answers.
- Filter chip removes only its own value.
- Clear-all resets every filter.
- Empty Explorer state appears when appropriate.
- Cocktail card invokes its selection behavior.
- Cocktail card supports Enter and Space activation.
- Cocktail view renders the selected cocktail metadata.
- Cocktail view changes serving-bar slides.
- Read-aloud action starts and stops speech when supported.
- Bar pin opens the correct preview.

### End-to-end tests

- Public visitor opens a cocktail detail page, reads its history, and uses read-aloud without logging in.
- New user creates an account, completes the quiz, and sees a returning homepage with personalized recommendations.
- User searches for a cocktail.
- User applies multiple filters.
- User opens a cocktail detail page.
- User rotates the cocktail viewer and resets its position.
- Authenticated customer loads the protected serving-bar slideshow and opens a bar detail page.
- User reads the cocktail history aloud.
- User opens a bar from the map.
- User uses the filter controls on a mobile viewport.

## 20. Implementation sequence

### Completed in the current prototype

- Added cocktail-card navigation into the cocktail view page.
- Added selected-cocktail and return-page state to `App.jsx`.
- Added cocktail detail metadata and serving-bar relationships.
- Added the CSS-based interactive 3D-style viewer.
- Added taste, origin, drinker profile, spirit, strength, and occasion sections.
- Added the serving-bar slideshow.
- Added the cocktail history card and browser read-aloud action.
- Added responsive styling and keyboard interactions for the new page.

### Phase 1 implementation sequence

1. Set up the Node.js/Express.js API project and Supabase PostgreSQL, Auth, and Storage services, then confirm the API hosting approach.
2. CX defines customer, quiz, authentication, and analytics API requirements; LY defines bar, bar-detail, OneMap, and promotion API requirements; ZR owns the versioned Phase 1 API contract, Express implementation, logical database schema, migration strategy, and data ownership rules.
3. ZR implements the Supabase data-access layer, migrations, backups, and seed/import scripts based on the current static fixtures.
4. Select one authoritative domain model and define shared types for cocktail details, history, taste tags, multiple spirits, multiple occasions, five-level alcoholic intensity, saved cocktails, and bar summaries.
5. Seed the first-class cocktail-detail data and implement `GET /api/v1/cocktails/:id` as a composed educational detail response.
6. ZR coordinates the shared API integration while CX and LY connect their pages to the agreed endpoints. Keep static JavaScript data only as local development fixtures, test data, or migration seed data.
7. Connect the existing cocktail-card navigation to stable URL-based destinations, including `/login` and `/cocktails/:cocktailId`, without changing the working screen flow.
8. Make `CocktailDetailPage` API-backed and complete the core learning flow: visual viewer, taste profile, facts, serving bars, history, and read-aloud.
9. Complete Explorer filtering, sorting, and direct search for cocktails and bars.
10. Add explicit popularity and creation-date fields for discovery ranking.
11. Implement recommendation scoring using quiz answers and approved user activity behind the API boundary.
12. Require Supabase Auth for the quiz, saved cocktails, and serving-bar access, then persist quiz answers, saved cocktails, and discovery history through the backend storage adapter.
13. Add bar detail navigation and the Phase 1 bar detail page.
14. Replace the mock map with OneMap and coordinate-based markers.
15. Add Phase 1 partner-promotion rules, active-date validation, and clear partner labels.
16. Add responsive CSS for the mobile Explorer filter control.
17. Agree on the analytics event list and privacy expectations with stakeholders.
18. Implement the approved lightweight analytics events in Supabase and expose the Mixology-admin analytics dashboard through protected API endpoints, then add tests for authentication gates, API validation, database migrations and seed data, Supabase Storage access, cocktail detail rendering, filtering, recommendations, navigation, OneMap interactions, viewer controls, partner promotions, analytics events, read-aloud, and responsive behavior.

### Later-phase implementation

- Evaluate whether the CSS viewer should be replaced with a true 3D model viewer.
- Add advanced analytics reporting, segmentation, and exports.
- Build a future internal Mixology admin page for bar-detail management.
- Add a drag-and-drop interface for reordering or arranging bar-detail content.
- Add Mixology publishing and audit controls for internal bar changes.
- Add advanced partner promotion scheduling and management.
- Evaluate cocktail ordering, delivery, and reservations.
- Evaluate payments, subscriptions, and other commercial workflows.
- Evaluate user-generated recipes and social features.
- Evaluate full customer relationship management for bars.
- Evaluate alcohol sales and age-verification workflows subject to product, security, and legal review.

## 21. Open implementation decisions

| Topic | Current behavior | Proposed decision | Owner | Status |
|---|---|---|---|---|
| Product priority | Feature flow is not yet ranked | Cocktail detail and education first; quiz, recommendations, and bars support it | ZR/team | Confirmed |
| Routing | Local page string | Preserve the prototype navigation and connect it to Phase 1 URL-based detail destinations | ZR | Planned |
| Backend/API | No backend in prototype | Node.js/Express.js Phase 1 application API | ZR | Confirmed |
| Database | No database in prototype | Supabase PostgreSQL Phase 1 production database | ZR | Confirmed |
| Data source | Static JavaScript | API/database source of truth; static fixtures for development | ZR | Planned |
| Backend framework | Not applicable in prototype | Node.js and Express.js | ZR | Confirmed |
| Database engine | Not applicable in prototype | Supabase PostgreSQL | ZR | Confirmed |
| Identity/authentication | No user identity | Supabase Auth for customers and Mixology admins; no bar-owner role | CX/ZR | Confirmed |
| Type system | JavaScript/JSX application files | Use JavaScript/JSX for Phase 1; `cocktails.js` is the prototype fixture | ZR | Confirmed |
| Search | Explorer filtering | Phase 1 direct cocktail/bar results using the documented PostgreSQL ranking rules | ZR | Planned |
| Recommendations | Fixed array slices | Phase 1 scoring from quiz answers, popularity, and approved activity; no ratings | CX/ZR | Planned |
| Saved cocktails | Not implemented | Authenticated customers can save and revisit cocktails | CX/ZR | Planned |
| Serving-bar access | Static bar relationships | Authenticated customers load serving-bar summaries through a protected endpoint | ZR/LY | Planned |
| Map | CSS mock map | OneMap with real coordinates | LY | Confirmed |
| Media storage | External image URLs | Supabase Storage for Mixology-managed media | ZR | Confirmed |
| Cocktail detail metadata | Static `cocktailDetails.js` | ZR-owned database seed data and Phase 1 API source | ZR | Planned |
| 3D viewer | CSS-based presentation | Keep CSS viewer in Phase 1; true model later | ZR | Confirmed |
| History narration | Browser Web Speech API | Keep as optional Phase 1 enhancement | ZR | Planned |
| Bar detail page | Not implemented | Phase 1 bar detail route and page | LY | Planned |
| Partner promotions | Static partner flag and promo | Phase 1 static/admin-managed active promotions | LY/ZR | Planned |
| Partner profile ownership | Mixology-managed in Phase 1 | Future internal Mixology admin page; no bar-owner access | LY/ZR | Long term |
| Mobile filters | Bottom-sheet code present but trigger hidden | Complete Phase 1 responsive behavior | CX | Planned |
| Content taxonomy | Vocabulary is not final | Use initial non-empty seed strings; approve the controlled vocabulary before final filters and recommendations | ZR/CX/LY | Deferred |
| Analytics events | Not implemented | Approve event list, store events in Supabase, and provide a CX-owned Mixology-admin dashboard | CX/ZR | Pending approval |
| Advanced analytics | Not implemented | Later-phase reporting, segmentation, and exports | CX/ZR | Later |

## 22. Definition of done for the design

- [ ] Current behavior is accurately documented.
- [ ] Phase 1 target behavior is clearly distinguished from current behavior.
- [ ] All `TODO` decisions have an owner.
- [ ] Data models are approved.
- [ ] Filter and recommendation semantics are approved.
- [ ] Navigation and URL behavior are approved.
- [ ] Persistence approach is approved.
- [ ] Supabase Auth login requirements and Supabase Storage access rules are approved.
- [ ] Customer login is required for quiz submission, saved cocktails, and serving-bar access.
- [ ] No bar-owner sign-up, sign-in, or role is included in Phase 1.
- [ ] ZR owns the Supabase schema, migrations, initial cocktail seed data, Node.js/Express.js API, and shared integration.
- [ ] OneMap provider and coordinate model are approved.
- [ ] Partner-promotion rules are approved.
- [ ] Analytics events and privacy expectations are approved before tracking is enabled.
- [ ] CX owns the admin analytics interface and ZR owns its database tables and migrations.
- [ ] Responsive and accessibility requirements are testable.
- [ ] Phase 1 API boundaries, hosting provider, and database operations are approved.
- [ ] True model-based 3D and advanced analytics are recorded as later-phase decisions.
- [ ] Engineering reviewers agree that the document is implementable.
