# Mixology Team Work Allocation

> **Status:** DRAFT  
> **Version:** 1.0  
> **Date:** 2026-08-15  
> **Related documents:** [High-Level Design](./HIGH_LEVEL_DESIGN.md), [Low-Level Design](./LOW_LEVEL_DESIGN.md)

## 1. Purpose

This document records the proposed work split for the three Mixology contributors. It defines the main responsibility of each branch, the expected feature boundaries, the shared contracts that must be agreed before integration, and the remaining decisions that may affect more than one branch.

The branch assignments are:

- `cx`: normal customer homepage, quiz, and customer authentication.
- `ly`: bars, bar-owner authentication, and bar-related interfaces.
- `zr`: cocktail education and the complete cocktail detail experience.

The main product priority is the cocktail-learning experience. The homepage, quiz, bar discovery, partner features, and analytics support that experience.

## 2. Responsibility overview

| Branch | Owner | Primary responsibility |
|---|---|---|
| `cx` | CX | Normal customer homepage, taste quiz, customer sign-in, customer sign-up, and the shared account-type entry page |
| `ly` | LY | Bars, bar details, bar-owner sign-in/sign-up, bar-owner interfaces, OneMap, and bar-related data |
| `zr` | ZR | Cocktail detail page, cocktail history, taste information, cocktail facts, visual viewer, read-aloud, and cocktail-detail data |

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
- The initial account-type selection page.

### Account-type entry page

CX will create the first login page where the user selects the type of account they want to use:

```text
Login or sign-up entry page
        |
        +--> Customer
        |       |
        |       +--> Customer sign-in/sign-up
        |       +--> Homepage or quiz
        |
        +--> Bar owner
                |
                +--> LY bar-owner sign-in/sign-up flow
```

CX owns the entry point. After the user selects `Bar owner`, the user should be sent to the bar-owner interface owned by LY.

### Customer quiz behavior

- A customer must be authenticated before submitting the personalized quiz.
- Unauthenticated visitors may browse public cocktail and bar content.
- The quiz stores the customer’s answers through the backend API.
- Quiz results are used to generate personalized cocktail recommendations.
- Quiz history and preferences are associated with the authenticated customer.

### Suggested CX files

```text
src/pages/HomePage.jsx
src/pages/QuizPage.jsx
src/pages/LoginPage.jsx
src/components/customer/
```

The exact file names can change, but customer-facing pages should remain clearly separated from bar-owner and cocktail-detail pages.

## 4. LY branch: bar and bar-owner experience

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
- Bar-owner sign-in.
- Bar-owner sign-up.
- Bar-owner account screens and related interfaces.

### Bar-owner authentication flow

When a user selects `Bar owner` on the CX account-type entry page, LY owns the next screens:

```text
CX account-type page
        |
        v
LY bar-owner sign-in/sign-up page
        |
        v
Supabase Auth
        |
        v
Bar-owner interface
```

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
src/pages/BarOwnerLoginPage.jsx
src/pages/BarOwnerSignupPage.jsx
src/components/bars/
src/components/bar-owner/
```

### Important Phase 1 scope decision

Creating a bar-owner account does not automatically mean the owner can edit all business information in Phase 1.

The team must decide whether bar-owner accounts will initially:

- Only allow registration and sign-in.
- Allow owners to submit business information for Mixology review.
- Allow owners to edit their profile, cocktails, images, and promotions directly.

The current product design states that Mixology administrators manage partner-bar information during Phase 1. A self-service partner portal is a long-term goal unless the team explicitly changes the Phase 1 scope.

## 5. ZR branch: cocktail education experience

### Main ownership

The `zr` branch owns everything inside the cocktail experience:

- Cocktail cards opening the detail page.
- Cocktail detail routing.
- Cocktail detail layout.
- Interactive CSS-based 3D-style cocktail viewer.
- Taste description.
- Tasting notes.
- Place of birth or origin.
- Who drinks the cocktail.
- Spirit.
- Strength.
- Occasion.
- Serving-bar slideshow.
- Cocktail history.
- Browser read-aloud feature.
- Cocktail detail metadata.
- Cocktail detail API requirements.

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
```

The cocktail detail page may display a short bar summary, but the complete bar page and bar-owner experience remain owned by LY.

### Cocktail detail API contract

The primary Phase 1 endpoint for the ZR experience is:

```text
GET /api/v1/cocktails/:cocktailId
```

The response should contain the complete educational content required by the page:

```ts
type CocktailDetailResponse = {
  cocktail: Cocktail
  detail: CocktailDetailMetadata
  servingBars: BarSummary[]
}
```

The detail metadata should include:

- History.
- Read-aloud text.
- Place of birth or origin.
- Taste title and description.
- Tasting notes.
- Drinker profile.
- Spirit.
- Strength.
- Occasion.
- Related serving bars.
- Visual media.

## 6. Shared user roles

All branches should use the same role names:

```text
customer
bar_owner
admin
```

`admin` is reserved for Mixology administrators who manage partner content, promotions, and analytics. It may not be implemented fully at the beginning, but the role should be considered in the authentication design.

Supabase Auth should authenticate the user. The backend should verify the user’s role before allowing access to protected bar-owner or administrator operations. The frontend should not be trusted to grant access based only on a local role value.

## 7. Shared route contract

The team should agree on route names before connecting navigation across branches.

| Route | Purpose | Main owner |
|---|---|---|
| `/` | Customer homepage | `cx` |
| `/login` | Account-type selection and authentication entry | `cx` |
| `/quiz` | Customer taste quiz | `cx` |
| `/cocktails` | Cocktail Explorer | Shared; cocktail content led by `zr` |
| `/cocktails/:cocktailId` | Cocktail detail and education page | `zr` |
| `/bars` | Bars page | `ly` |
| `/bars/:barId` | Bar detail page | `ly` |
| `/bar-owner/login` | Bar-owner sign-in | `ly` |
| `/bar-owner/signup` | Bar-owner sign-up | `ly` |
| `/admin/analytics` | Mixology analytics dashboard | Admin/integration owner |

The routing implementation may use a different library or route naming convention, but the final paths should remain stable once the branches begin integrating.

## 8. Shared authentication contract

CX and LY must agree on the following Supabase Auth behavior:

- How users sign up.
- How users sign in.
- How the session is stored and restored.
- How logout works.
- How expired sessions are handled.
- How customer and bar-owner roles are stored.
- How users are redirected after sign-in.
- What happens when a user selects the wrong account type.
- Which API requests require an authenticated session.

Expected flow:

```text
Login page
    |
    +--> Customer selected
    |       |
    |       +--> Customer authentication
    |       +--> Homepage or quiz
    |
    +--> Bar owner selected
            |
            +--> LY bar-owner authentication
            +--> Bar-owner interface
```

## 9. Shared data contracts

### Cocktail detail

The cocktail detail data should be owned by the ZR experience but stored through the shared backend and Supabase database:

```ts
type CocktailDetail = {
  id: string
  name: string
  description: string
  placeOfBirth: string
  tasteDescription: string
  tastingNotes: string[]
  spirit: string
  strength: string
  occasion: string
  whoDrinks: string
  history: string
  readAloud: string
  imageUrl: string
  servingBars: BarSummary[]
}
```

### Bar summary

The cocktail page should use a small bar summary rather than depending on the complete bar-page implementation:

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

### Shared API behavior

- The Express API is the application boundary for production data.
- Supabase PostgreSQL is the source of truth.
- Supabase Auth identifies the user.
- Supabase Storage stores Mixology-managed media.
- Protected requests include a valid Supabase Auth bearer token.
- Unexpected user-facing API failures return `Something went wrong.`.
- Detailed technical errors remain in server logs.

## 10. Shared files and integration boundaries

The following files or areas may be edited by more than one branch and should be coordinated carefully:

- `src/App.jsx`.
- Routing configuration.
- `src/index.css`.
- Navbar and global navigation components.
- Supabase client configuration.
- Shared API request utilities.
- Shared domain types.
- Authentication and session utilities.

The team should nominate one integration owner for shared routing and application-shell changes. The integration owner is responsible for resolving merge conflicts and keeping the final route contract consistent.

Branches should prefer adding new page and component files rather than making unrelated edits to another branch’s files.

## 11. Branch and integration workflow

Each contributor should work on their assigned branch:

```text
cx  -> customer homepage, quiz, and customer authentication
ly  -> bars and bar-owner experience
zr  -> cocktail education experience
```

Recommended workflow:

1. Pull the latest `main` before starting a feature.
2. Keep changes within the branch responsibility where possible.
3. Avoid changing shared routes or API contracts without informing the other contributors.
4. Run the frontend build and relevant tests before opening a pull request.
5. Open a pull request into `main`.
6. Ask at least one other contributor to review shared-contract changes.
7. Resolve merge conflicts in the shared integration branch or through the nominated integration owner.

## 12. Integration checklist

Before the branches are merged, confirm:

- [ ] Customer login and sign-up work through Supabase Auth.
- [ ] Bar-owner login and sign-up route correctly from the account-type entry page.
- [ ] Customer and bar-owner roles are represented consistently.
- [ ] Unauthenticated users can browse public cocktail content.
- [ ] Authenticated users can complete and save the quiz.
- [ ] Cocktail cards open the correct cocktail detail URL.
- [ ] Cocktail detail pages load educational data through the API.
- [ ] Cocktail history and read-aloud work without requiring login.
- [ ] Cocktail pages can display related bar summaries.
- [ ] Bar summaries link to LY’s bar detail routes.
- [ ] OneMap uses the agreed bar coordinate model.
- [ ] Protected API endpoints verify Supabase Auth tokens.
- [ ] Unexpected errors display `Something went wrong.`.
- [ ] Shared routing and `App.jsx` changes have been reviewed.
- [ ] The frontend build passes after integration.

## 13. Open decisions

- Decide whether bar owners can edit their profiles during Phase 1 or only submit information for Mixology review.
- Decide how customer and bar-owner roles are represented in Supabase.
- Decide who owns the shared routing and application-shell integration.
- Confirm the final route names before implementation is connected.
- Confirm the API response contract for cocktail details and bar summaries.
- Confirm which Mixology administrator screens are required for partner content and analytics.

