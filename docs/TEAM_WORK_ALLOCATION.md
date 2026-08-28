# Mixology Team Work Allocation

> **Status:** DRAFT
>
> **Version:** 1.2
>
> **Date:** 2026-08-17
>
> **Related documents:** [High-Level Design](./HIGH_LEVEL_DESIGN.md), [Low-Level Design](./LOW_LEVEL_DESIGN.md), [Agent Handoff](./AGENT_HANDOFF.md)

## 1. Purpose

This document records the proposed work split for the three Mixology contributors. It defines the main responsibility of each branch, the expected feature boundaries, the shared contracts that must remain consistent during integration, and the remaining decisions that may affect more than one branch.

The branch assignments are:

- `cx`: normal customer homepage, quiz, customer authentication, and the admin analytics interface.
- `ly`: bars, bar detail pages, OneMap, and bar-related interfaces.
- `zr`: cocktail education, the complete cocktail detail experience, the Node.js/Express.js backend API, shared integration, the database structure, and the initial cocktail data.

The main product priority is the cocktail-learning experience. The homepage, quiz, bar display, future internal administration tools, and analytics support that experience. Phase 1 will not include bar-owner accounts or a bar-owner self-service interface.

## 2. Responsibility overview

| Branch | Owner | Primary responsibility |
|---|---|---|
| `cx` | CX | Normal customer homepage, taste quiz, customer sign-in, customer sign-up, and the Mixology admin analytics interface |
| `ly` | LY | Bars, bar details, OneMap, bar-related data requirements, and future internal bar-management interface requirements |
| `zr` | ZR | Cocktail detail page, cocktail history, taste information, cocktail facts, visual viewer, read-aloud, Node.js/Express.js backend API, shared integration, database schema, migrations, and cocktail seed data |

## 3. CX branch: customer experience

### Main ownership

The `cx` branch owns the normal customer experience:

- Homepage.
- Taste quiz.
- Customer sign-in.
- Customer sign-up.
- Customer session handling.
- Customer-facing authentication messages and validation.
- Redirecting customers after authentication.
- The customer login page.

### Customer login page

CX owns the only public login page in Phase 1. It is for normal Mixology customers and supports customer sign-in and sign-up through Supabase Auth.

There will be no bar-owner sign-up, bar-owner sign-in, or bar-owner account selection in Phase 1.

### Customer quiz behavior

- A customer must be authenticated before submitting the personalized quiz.
- A customer must be authenticated before saving a cocktail they like.
- A customer must be authenticated before viewing the bars that serve a cocktail.
- Unauthenticated visitors may browse public cocktail education content.
- The quiz stores the customer’s answers through the backend API.
- Quiz results are used to generate personalized cocktail recommendations.
- Quiz history, preferences, saved cocktails, and protected serving-bar access are associated with the authenticated customer.

### Suggested CX files

```text
src/pages/HomePage.jsx
src/pages/QuizPage.jsx
src/pages/LoginPage.jsx
src/pages/AdminAnalyticsPage.jsx
src/components/customer/
src/components/admin-analytics/
```

The exact file names can change, but customer-facing pages, the admin analytics page, and the cocktail-detail pages should remain clearly separated from the bar pages.

## 4. LY branch: bar experience

### Main ownership

The `ly` branch owns the bar-related experience:

- Bars page.
- Bar cards.
- Bar detail pages.
- OneMap integration.
- Real bar coordinates.
- Bar neighborhood and vibe information.
- Cocktails served by each bar.
- Partner-bar information.
- Featured bar placement.
- Partner promotions.

### Bar discovery behavior

LY should provide:

- A list of bars.
- Featured and partner-bar sections.
- A bar detail page at `/bars/:barId`.
- OneMap markers using real latitude and longitude values.
- Links from bar cards and map previews to bar detail pages.
- Information about cocktails served by each bar.
- Promotion status and active-date behavior.

### Suggested LY files

```text
src/pages/BarsPage.jsx
src/pages/BarDetailPage.jsx
src/components/bars/
```

### Phase 1 bar-management scope

Phase 1 will display bar information to users, but bar owners will not have accounts or control over the displayed information. LY owns the bar display interface and defines the bar information needed by the product.

ZR owns the database structure, migrations, and initial cocktail seed data. LY should provide the required bar content and bar-to-cocktail relationships for that shared database work.

In a future phase, Mixology may build an internal admin page for the Mixology team to manage bar details. This may use a drag-and-drop interface for changing the order or placement of bar information. It is an internal Mixology tool, not a bar-owner self-service page.

## 5. ZR branch: cocktail education experience

### Main ownership

The `zr` branch owns everything inside the cocktail experience:

- Cocktail cards opening the detail page.
- Cocktail detail routing.
- Cocktail detail layout.
- Interactive CSS-based 3D-style cocktail viewer.
- Taste description.
- Tasting notes.
- Origin.
- Who drinks the cocktail.
- Multiple spirits.
- Five-level alcoholic intensity.
- Multiple occasions.
- Taste tags.
- Serving-bar slideshow.
- Cocktail history.
- Browser read-aloud feature.
- Cocktail detail metadata.
- Cocktail detail API contract.
- Node.js/Express.js backend API implementation and maintenance.
- Shared frontend/API integration and resolution of cross-branch integration conflicts.
- Supabase database schema, migrations, and initial cocktail seed data.
- Cocktail history content and cocktail images.
- No separate cocktail-content review workflow is planned for Phase 1.

### Main cocktail-learning flow

```text
User selects or searches for a cocktail
        |
        v
Cocktail detail page
        |
        +--> Explore the cocktail visually
        |
        +--> Learn how it tastes
        |
        +--> Read the cocktail facts
        |
        +--> Read or listen to the history
        |
        +--> View bars that serve the cocktail
```

The cocktail detail page should provide enough information for a user to understand the cocktail without logging in or taking the quiz.

### Suggested ZR files

```text
src/pages/CocktailDetailPage.jsx
src/components/Cocktail3DViewer.jsx
src/components/cocktail/
src/data/cocktailDetails.js
server/
supabase/migrations/
```

The cocktail detail page displays a slideshow of bars that serve the cocktail. When the user selects a bar card, the app navigates to LY’s bar detail route at `/bars/:barId`. Viewing the serving-bar slideshow requires customer authentication in Phase 1.

### Cocktail detail API contract

ZR owns the production API contract and implementation. CX and LY provide the requirements for the parts of the API used by their features; ZR turns those requirements into the shared Express routes, services, repositories, validation, authentication checks, and Supabase queries.

The primary Phase 1 endpoint for the ZR experience is:

```text
GET /api/v1/cocktails/:cocktailId
```

The public detail response should contain the educational content required by the page. Serving-bar cards should be loaded through a protected request after the customer is authenticated:

```ts
type CocktailDetailResponse = {
  cocktail: Cocktail
  detail: CocktailDetailMetadata
}
```

```text
GET /api/v1/cocktails/:cocktailId/serving-bars
```

The serving-bar endpoint returns the small amount of information needed for the slideshow cards.

The detail metadata should include:

- History.
- Read-aloud text.
- Origin.
- Taste title and description.
- Tasting notes.
- Drinker profile.
- Multiple spirits.
- Five-level alcoholic intensity.
- Multiple occasions.
- Taste tags.
- Related serving bars.
- Visual media.

## 6. Shared user roles

All branches should use the same role names:

```text
customer
admin
```

`customer` is the public user role. `admin` is reserved for Mixology team members who manage internal content, promotions, and analytics. There is no `bar_owner` role in Phase 1.

Supabase Auth should authenticate customers and approved Mixology administrators. The backend should verify the user’s role before allowing access to protected customer or administrator operations. The frontend should not be trusted to grant access based only on a local role value.

## 7. Shared route contract

The prototype already has working page navigation. The route table below records the shared destinations that the team should preserve while integrating the branches; it is not a request to build basic navigation from scratch. ZR coordinates any shared route or application-shell changes during integration.

| Route | Purpose | Main owner |
|---|---|---|
| `/` | Customer homepage | `cx` |
| `/login` | Customer sign-in and sign-up | `cx` |
| `/quiz` | Customer taste quiz | `cx` |
| `/cocktails` | Cocktail Explorer | Shared; cocktail content led by `zr` |
| `/cocktails/:cocktailId` | Cocktail detail and education page | `zr` |
| `/bars` | Bars page | `ly` |
| `/bars/:barId` | Bar detail page | `ly` |
| `/admin/analytics` | Mixology analytics dashboard | `cx` |

The project’s existing navigation approach is the baseline. If Phase 1 adds stable browser URLs to the detail pages, that work should preserve the same destinations and user flow when the branches are integrated.

## 8. Shared authentication contract

CX and the backend integration must agree on the following Supabase Auth behavior:

- How users sign up.
- How users sign in.
- How the session is stored and restored.
- How logout works.
- How expired sessions are handled.
- How customer and admin roles are stored.
- How users are redirected after sign-in.
- Which customer API requests require an authenticated session.
- Which administrator API requests require an administrator role.

Expected flow:

```text
Customer login page
        |
        v
Supabase Auth
        |
        +--> Homepage
        +--> Quiz
        +--> Saved cocktails
        +--> Serving-bar slideshow
```

## 9. Shared data contracts

### Cocktail detail

The cocktail detail data should be owned by the ZR experience but stored through the shared backend and Supabase database:

```ts
type CocktailDetail = {
  id: string
  name: string
  description: string
  origin: string
  tasteDescription: string
  tasteTags: string[]
  tastingNotes: string[]
  spirits: string[]
  strength: 1 | 2 | 3 | 4 | 5
  occasions: string[]
  whoDrinks: string
  history: string
  readAloud: string
  imageUrl: string
}
```

### Bar summary

`BarSummary` means the small set of bar information needed to draw one card in the cocktail page’s serving-bar slideshow. It is not a second bar database and it is not the complete bar detail page. The card can show the bar name, neighborhood, atmosphere, image, and partner label. When the user clicks the card, the app uses the bar ID to navigate to LY’s full bar page.

```ts
type BarSummary = {
  id: string
  name: string
  neighborhood: string
  vibe: string
  imageUrl?: string
  partner: boolean
}
```

The Phase 1 slideshow contract is:

- The card displays the bar name, neighborhood, vibe, image, and partner label.
- The API returns only bars that currently serve the selected cocktail and are active for display.
- Featured or partner bars may appear first, followed by the remaining bars in Mixology’s curated order.
- Promotions are not required in `BarSummary`; the full bar page or a separate promotion response can display promotion details.
- If there are no serving bars, the page displays a clear empty state.
- If the customer is not authenticated, the page displays a login prompt and does not request the protected serving-bar data.
- Selecting a card navigates to LY’s full bar page at `/bars/:barId` in the same tab.

### Shared API behavior

- The Express API is the application boundary for production data.
- Supabase PostgreSQL is the source of truth.
- Supabase Auth identifies the user.
- Supabase Storage stores Mixology-managed media.
- Quiz, saved-cocktail, personalized-recommendation, and serving-bar requests include a valid Supabase Auth bearer token.
- Administrator analytics requests require an administrator role.
- Supabase database columns use `snake_case`; API responses use `camelCase`, and ZR owns the mapping between them.
- Unexpected user-facing API failures return `Something went wrong.`.
- Detailed technical errors remain in server logs.

### What an API requirement means

An API requirement describes how one part of the application asks another part to do something. In Mixology, the browser should ask the Express backend for production data instead of directly managing database rules in the page.

For example:

```text
Cocktail page -> GET /api/v1/cocktails/:cocktailId
Backend      -> Reads cocktail detail data from Supabase
Backend      -> Returns history, taste, origin, and facts
Cocktail page -> Displays the result
```

The API contract must define the endpoint name, required login, request values, response fields, and error behavior. It is a shared agreement between the frontend branch and the backend/database owner.

The API contract may be changed during Phase 1 development. ZR must document the change and update the backend, affected frontend branch, and tests together. Adding a backward-compatible field is normally safe; renaming or removing a field, changing its type, or changing its login requirement is a breaking change and must not be made silently. If a breaking change is needed after release, use a new API version.

## 10. Shared files and integration boundaries

In simple English, a shared file is a file that more than one branch needs to edit. Examples include the main app shell, route definitions, authentication utilities, and global styles. If every branch edits these files independently, the branches may overwrite each other’s work or create merge conflicts. The team should agree on who coordinates those files, even when different contributors own the features displayed by them.

The following files or areas may be edited by more than one branch and should be coordinated carefully:

- `src/App.jsx`.
- Routing configuration.
- `src/index.css`.
- Navbar and global navigation components.
- Supabase client configuration.
- Shared API request utilities.
- Shared domain types.
- Authentication and session utilities.

ZR owns the Supabase database schema, migrations, initial cocktail seed data, the Node.js/Express.js backend API, and shared integration. The other branches should request schema or API changes through ZR rather than creating separate competing migrations or backend implementations.

As integration owner, ZR is responsible for resolving merge conflicts in shared files, keeping the existing prototype navigation consistent, maintaining the agreed route and API contracts, and coordinating the final integration into `main`.

Branches should prefer adding new page and component files rather than making unrelated edits to another branch’s files.

## 11. Branch and integration workflow

Each contributor should work on their assigned branch:

```text
cx  -> customer homepage, quiz, and customer authentication
ly  -> bars and bar display experience
zr  -> cocktail education experience
```

Recommended workflow:

1. Pull the latest `main` before starting a feature.
2. Preserve the working prototype navigation and confirm only the database fields, user roles, API response shapes, and any URL identifiers needed to connect the branches.
3. Keep changes within the branch responsibility where possible.
4. Avoid changing shared routes or API contracts without informing the other contributors.
5. Run the frontend build and relevant tests before opening a pull request.
6. Open a pull request into `main`.
7. Ask at least one other contributor to review shared-contract changes.
8. ZR resolves merge conflicts in shared files and coordinates the final integration into `main`.

### Why agree on these items first?

- The prototype navigation already gives the team a working screen flow; preserving it reduces unnecessary rework during integration.
- The database schema defines how cocktail, bar, user, and saved-cocktail data is stored.
- User roles define who is allowed to use protected features.
- Routes define where each branch sends the user.
- API contracts define how the frontend and backend communicate.
- Authentication must be ready before the team can test the quiz, saved cocktails, or serving-bar slideshow.

The team does not need to finish every feature before coding. It needs to agree on these interfaces first so each person can build their feature against the same structure.

## 12. Integration checklist

Before the branches are merged, confirm:

- [ ] Customer login and sign-up work through Supabase Auth.
- [ ] Customer and admin roles are represented consistently.
- [ ] There is no bar-owner sign-up, sign-in, or role in Phase 1.
- [ ] Unauthenticated users can browse public cocktail education content.
- [ ] Authenticated users can complete and save the quiz.
- [ ] Authenticated users can save cocktails they like.
- [ ] Unauthenticated users receive a login prompt before viewing serving-bar cards.
- [ ] Cocktail cards open the correct cocktail detail URL.
- [ ] Cocktail detail pages load educational data through the API.
- [ ] Cocktail history and read-aloud work without requiring login.
- [ ] Authenticated cocktail pages load related bar summaries through the protected endpoint.
- [ ] Serving-bar cards link to LY’s bar detail routes.
- [ ] OneMap uses the agreed bar coordinate model.
- [ ] Protected API endpoints verify Supabase Auth tokens.
- [ ] CX owns the admin analytics interface.
- [ ] Unexpected errors display `Something went wrong.`.
- [ ] Shared routing and `App.jsx` changes have been reviewed by ZR as integration owner.
- [ ] The frontend build passes after integration.

## 13. Open decisions

- Decide how customer and admin roles are represented in Supabase.
- Confirm the API response contract for cocktail details, saved cocktails, and serving-bar summaries.
- Confirm which internal admin screens will be built in the future for drag-and-drop bar-detail management.
