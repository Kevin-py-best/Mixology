# Mixology Agent Handoff

> **Status:** DRAFT
>
> **Version:** 1.1
>
> **Date:** 2026-09-26
>
> **Purpose:** Give CX, LY, and ZR’s coding agents one practical set of rules to follow during Phase 1 implementation.

This document is a task and integration guide. It should be read together with:

1. [`HIGH_LEVEL_DESIGN.md`](./HIGH_LEVEL_DESIGN.md) for product goals and scope.
2. [`LOW_LEVEL_DESIGN.md`](./LOW_LEVEL_DESIGN.md) for implementation details and API/database contracts.
3. [`TEAM_WORK_ALLOCATION.md`](./TEAM_WORK_ALLOCATION.md) for branch ownership.
4. The repository’s root `AGENTS.md` for repository-specific coding rules.

The low-level design and this handoff document are the written source of truth for the current Phase 1 implementation contract. If an agent finds a conflict, it must stop and report the conflict to ZR instead of silently choosing a new design.

## 1. Product direction

Mixology is primarily a cocktail-learning application. The most important user experience is the cocktail detail page, where a visitor learns about:

- Cocktail history.
- Origin.
- Taste description.
- Taste tags.
- Tasting notes.
- Spirits.
- Five-level alcoholic intensity.
- Occasions.
- Who drinks the cocktail.
- Cocktail image and visual presentation.
- Optional browser read-aloud history.

Bars, the quiz, recommendations, promotions, and analytics support the cocktail-learning experience.

## 2. Fixed Phase 1 decisions

Agents must follow these decisions:

- Backend: Node.js with Express.js.
- Database: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- Media storage: Supabase Storage.
- Map: OneMap.
- Application roles: `customer` and `admin` only.
- There is no `bar_owner` role, bar-owner account, bar-owner sign-in, or bar-owner route in Phase 1.
- Bars are managed and displayed by Mixology.
- All bars use the same frontend carousel-slide, map-marker, and detail treatment. A database `featured` flag may prioritize carousel ordering, but it is not shown as a frontend section, badge, label, color, border, or alternate slide style.
- Public cocktail education and bar-discovery content do not require login. This includes the serving-bar slideshow on a cocktail detail page.
- Login is required before submitting the quiz, saving cocktails, or receiving account-based recommendations.
- Personalized cocktail recommendations, presented in the customer experience as cocktails "Featured for you," require both an authenticated customer and a completed taste quiz.
- `origin` is used. Do not add `placeOfBirth`.
- `spirits` and `occasions` are arrays.
- `tasteTags` is an array.
- `strength` is an integer from 1 to 5.
- All Phase 1 cocktail-detail fields are required. Do not silently omit required fields or return `null` for them.
- User reviews and user ratings are not part of Phase 1.
- Explorer sorting supports `popularity`, `a-z`, and `newest` only.
- The Phase 1 visual viewer remains CSS-based. A true Three.js/WebGL viewer is later work.
- The final controlled vocabulary for taste tags, spirits, vibes, occasions, and experience levels is deferred. Reuse existing seed values and do not invent competing spellings.

## 3. Repository baseline

The current prototype uses JavaScript and JSX:

```text
src/main.jsx
src/App.jsx
src/data/cocktails.js
src/data/cocktailDetails.js
src/pages/CocktailDetailPage.jsx
src/components/Cocktail3DViewer.jsx
```

The current prototype’s screen navigation already works. Preserve that user flow when adding stable URL destinations such as:

```text
/
/login
/quiz
/cocktails
/cocktails/:cocktailId
/bars
/bars/:barId
/admin/analytics
```

`src/data/cocktails.js` and `src/data/cocktailDetails.js` are prototype fixtures and seed inputs only. Supabase, accessed through the Express API, is the production source of truth.

There is no competing TypeScript cocktail-data file. Build configuration and declaration files may still use `.ts`, but agents should create React application components and data modules as `.jsx` and `.js`.

## 4. Branch ownership

### CX branch

CX owns:

- Customer homepage.
- Customer login and sign-up page.
- Supabase Auth frontend flow.
- Session restoration and logout.
- Taste quiz.
- Customer login gates.
- Customer-facing authentication states.
- Admin analytics dashboard interface.

CX should not create bar-owner authentication or modify the cocktail database schema independently.

Suggested CX files:

```text
src/pages/HomePage.jsx
src/pages/QuizPage.jsx
src/pages/LoginPage.jsx
src/pages/AdminAnalyticsPage.jsx
src/components/customer/
src/components/admin-analytics/
```

### LY branch

LY owns:

- Bars page.
- Bar cards.
- Bar detail page.
- OneMap integration.
- Real bar coordinates.
- Bar neighborhood and vibe information.
- Bar-to-cocktail relationship requirements.
- Bar ordering requirements, including database-only featured priority.
- Promotion display requirements.

LY should not create a bar-owner account, bar-owner route, or bar-owner dashboard.

Suggested LY files:

```text
src/pages/BarsPage.jsx
src/pages/BarDetailPage.jsx
src/components/bars/
```

### ZR branch

ZR owns:

- Cocktail cards opening the cocktail detail page.
- Cocktail detail experience.
- Cocktail history and read-aloud content.
- Cocktail images.
- Taste information and cocktail facts.
- CSS-based visual viewer.
- Serving-bar slideshow integration.
- Node.js/Express.js backend API.
- Supabase schema and migrations.
- Initial cocktail seed data.
- API/database field mapping.
- Shared integration and merge-conflict resolution.

Suggested ZR files:

```text
src/pages/CocktailDetailPage.jsx
src/components/Cocktail3DViewer.jsx
src/components/cocktail/
src/data/cocktailDetails.js
server/
supabase/migrations/
supabase/seed/
```

## 5. Shared route contract

The existing prototype navigation is the baseline. Agents should preserve the current screen flow and use the following destinations when connecting pages:

| Route | Purpose | Owner |
|---|---|---|
| `/` | Customer homepage | CX |
| `/login` | Customer sign-in and sign-up | CX |
| `/quiz` | Customer taste quiz | CX |
| `/cocktails` | Cocktail Explorer | Shared; ZR owns cocktail data |
| `/cocktails/:cocktailId` | Cocktail education page | ZR |
| `/bars` | Bars page | LY |
| `/bars/:barId` | Bar detail page | LY |
| `/admin/analytics` | Mixology admin analytics | CX |

ZR coordinates shared changes to `App.jsx`, route handling, global navigation, and shared API utilities.

## 6. Authentication gates

| Feature | Public visitor | Authenticated customer | Admin |
|---|---|---|---|
| Read cocktail education | Allowed | Allowed | Allowed |
| Use visual viewer | Allowed | Allowed | Allowed |
| Read cocktail history | Allowed | Allowed | Allowed |
| Use browser read-aloud | Allowed | Allowed | Allowed |
| Submit taste quiz | Login required | Allowed | Allowed if using customer flow |
| Save cocktail | Login required | Allowed | Allowed if using customer flow |
| View serving-bar slideshow | Allowed | Allowed | Allowed |
| View personalized cocktails "Featured for you" | Login and completed quiz required | Allowed after completing quiz | Allowed after completing quiz if using customer flow |
| View admin analytics | Not allowed | Not allowed by customer role | Allowed |

The frontend may use Supabase Auth for sign-in, sign-up, session restoration, and logout. Production data requests must go through the Express API. The API verifies the Supabase bearer token and role for protected requests.

The personalization flow must follow these rules:

1. A visitor may browse cocktail details, cocktail history, the serving-bar slideshow, general bar content, and bar detail pages without logging in.
2. If an unauthenticated visitor selects the personalized "Featured for you" experience, send the visitor to `/login` and preserve the intended destination.
3. After login, a customer without a completed taste quiz must complete `/quiz` before personalized featured cocktails are displayed.
4. After quiz completion, load the customer's recommendations through the authenticated recommendations endpoint.
5. "Featured for you" means a personalized cocktail recommendation. The separate database `featured` field for bars only affects ordering and is not shown to users.

## 7. Shared data contract

The Phase 1 cocktail detail response must contain all required educational fields:

```ts
type Cocktail = {
  id: string
  name: string
  description: string
  spirits: string[]
  tasteTags: string[]
  strength: 1 | 2 | 3 | 4 | 5
  experienceLevel: string
  occasions: string[]
  popularityScore: number
  createdAt: string
  imageUrl: string
}

type CocktailDetailMetadata = {
  origin: string
  tasteTitle: string
  tasteDescription: string
  tastingNotes: string[]
  whoDrinks: string
  history: string
  readAloud: string
}

type CocktailDetailResponse = {
  cocktail: Cocktail
  detail: CocktailDetailMetadata
}

type BarSummary = {
  id: string
  name: string
  neighborhood: string
  vibe: string
  imageUrl?: string
}
```

The serving-bar relationship is stored in the `bar_cocktails` database table and loaded through the public serving-bar endpoint. The public cocktail detail and serving-bar responses together let visitors learn about a cocktail and discover where it is served without logging in.

The API may return database-featured bars first. The frontend must render every returned bar with the same large carousel-slide, map-marker, and detail treatment and must not expose the internal featured status.

## 8. Shared API contract

Initial Phase 1 endpoints:

```text
GET    /api/v1/cocktails
GET    /api/v1/cocktails/:cocktailId
GET    /api/v1/cocktails/:cocktailId/serving-bars       public
GET    /api/v1/bars
GET    /api/v1/bars/:barId
GET    /api/v1/search?q={query}
POST   /api/v1/quiz-responses                            customer login required
GET    /api/v1/recommendations                          customer login required
GET    /api/v1/me/preferences                            customer login required
PUT    /api/v1/me/preferences                            customer login required
GET    /api/v1/me/saved-cocktails                        customer login required
POST   /api/v1/me/saved-cocktails/:cocktailId             customer login required
DELETE /api/v1/me/saved-cocktails/:cocktailId             customer login required
POST   /api/v1/analytics/events                          approved event list only
GET    /api/v1/admin/analytics/summary                   admin role required
GET    /api/v1/admin/analytics/events                    admin role required
```

API rules:

- Use stable entity IDs.
- Validate all query, path, and body values.
- Use `snake_case` for Supabase columns.
- Use `camelCase` for API JSON fields.
- ZR owns the mapping between database names and API names.
- Return `Something went wrong.` for unexpected user-facing failures.
- Keep technical error details in server logs.
- Do not let a frontend branch silently change an endpoint or response shape.
- `GET /api/v1/recommendations` requires an authenticated customer with a completed quiz. If the quiz is incomplete, return a documented state that sends the customer to `/quiz` rather than returning generic recommendations as if they were personalized.

The API contract may change during Phase 1 development. Compatible additions should be documented and communicated. Breaking changes require the backend, affected frontend, tests, and this handoff document to be updated together. Do not silently rename, remove, or change the type of a field. If a breaking change is needed after release, use a new API version.

## 9. Database ownership and naming

ZR owns:

- Supabase schema.
- Supabase migrations.
- Seed/import scripts.
- Cocktail seed data.
- Database/API field mapping.
- Role and authorization database rules.

Supabase database names use `snake_case`, while API and JavaScript names use `camelCase`:

```text
cocktails.created_at                         -> cocktail.createdAt
cocktail_detail_metadata.taste_tags         -> detail.tasteTags
cocktail_detail_metadata.read_aloud         -> detail.readAloud
user_profiles.auth_user_id                  -> userProfile.authUserId
```

The `user_profiles.role` field contains only:

```text
customer
admin
```

There is no `bar_owner` value.

## 10. Agent rules

Every agent must:

1. Read the repository `AGENTS.md`, this file, the high-level design, the low-level design, and the team allocation file before coding.
2. Work only on the assigned branch and assigned feature.
3. Avoid unrelated formatting or refactoring.
4. Avoid modifying another branch’s page unless the change is coordinated.
5. Use the existing JSX project structure until the team deliberately changes it.
6. Use the existing API and data names instead of inventing alternatives.
7. Avoid adding ratings, reviews, bar-owner accounts, or later-phase features.
8. Reuse existing taxonomy values while the final vocabulary is deferred.
9. Ask ZR about API, database, route, or shared-file conflicts.
10. Run the relevant build and tests before handing work back.

## 11. Agent task template

Every task given to an agent should provide this information:

```md
## Task name

### Owner

CX, LY, or ZR

### Goal

One clear sentence describing the result.

### Allowed files

Files the agent may create or edit.

### Do not edit

Files or areas owned by another branch.

### Dependencies

What must already exist.

### Contract

Routes, API endpoints, data fields, and authentication rules.

### Acceptance criteria

Observable conditions that prove the task is complete.

### Verification

Build, test, or manual verification commands.

### Handoff notes

Files changed, decisions made, known limitations, and follow-up work.
```

Agents should not receive a broad instruction such as “build Phase 1.” Each agent should receive one focused task using this structure.

## 12. Integration workflow

1. Pull the latest `main` before starting.
2. Read the current API and database contract.
3. Confirm that the task does not overlap another branch’s ownership.
4. Implement the focused task.
5. Run the frontend build and relevant tests.
6. Report changed files and any contract changes.
7. Ask ZR to review shared route, API, database, or application-shell changes.
8. Merge into `main` only after the affected branches have tested the integration.

## 13. Phase 1 completion checklist

Phase 1 is complete only when:

- The Express API is running and connected to Supabase.
- Supabase migrations and seed data run successfully.
- Required cocktail-detail fields are populated for every published cocktail.
- Public cocktail detail pages load from the API.
- History and read-aloud work.
- The CSS viewer works with mouse, keyboard, reset, and error states.
- Customer sign-in, sign-up, logout, and session restoration work.
- Login gates protect quiz submission, saved cocktails, and account-based recommendations.
- Public visitors can view the serving-bar slideshow and follow its cards to public bar detail pages.
- Personalized cocktails "Featured for you" appear only after customer login and quiz completion.
- Saved cocktails persist in Supabase.
- Quiz answers persist and recommendations use the approved Phase 1 scoring rules.
- Bars and bar detail pages work.
- OneMap displays the agreed bar coordinates.
- Serving-bar cards navigate to the correct bar detail page.
- Explorer filters and sorting work without ratings or reviews.
- Search returns the correct cocktail or bar result.
- Loading, empty, and error states work.
- Admin analytics is implemented only after the event list and privacy expectations are approved.
- No bar-owner route, role, account, or dashboard exists.
- Responsive and keyboard-accessible behavior is tested.
- Frontend, backend, migration, API, and integration tests pass.
- Production environment variables, migration release, backup, restore, and deployment procedures are documented before release.

## 14. Out of scope for Phase 1

- User reviews and ratings.
- Bar-owner accounts or self-service editing.
- Drag-and-drop internal bar management.
- True Three.js/WebGL cocktail models.
- Reservations.
- Payments.
- Ordering or delivery.
- Social feeds or direct messaging.
- Advanced analytics and segmentation.
- Full CRM for bars.
