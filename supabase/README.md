# Bar–cocktail integration

## Account access and saved taste profiles

The application uses Supabase email/password authentication. Configure the real
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the ignored `.env.local`
file. Never use a secret or service-role key in the browser. Restart Vite after
changing environment settings if the preview has not refreshed automatically.

In Supabase Authentication URL Configuration, allow the local callback
`http://localhost:8443/?auth=quiz`, plus the equivalent callback on the production
site when deploying. Email confirmation follows the project's authentication
settings; the app does not disable it. After confirmation the user can also return
to the app and log in manually. A resend option is available after signup.

Sessions persist in browser storage and refresh automatically. The Profile page
edits `user_metadata.display_name`, displays `user_metadata.quiz_answers`, allows
retaking the quiz, and offers logout from the current browser. Finishing the quiz
saves validated answers on the authenticated user with `auth.updateUser`; the page
only shows completion after a successful save. These fields are self-editable
profile/preferences, never authorization or role data.

### Account database tables

Apply `migrations/003_create_account_tables.sql` inside the existing Mixology
project database. It adds `public.user_profiles` and `public.user_preferences`,
both linked to `auth.users.id` with cascade deletion. Credentials remain managed
by Supabase Auth; no app table stores passwords.

An owner-controlled trigger creates a profile when a user signs up and syncs
validated name/quiz changes made by the existing `auth.updateUser` flow. Existing
accounts and valid saved quizzes are backfilled. No frontend schema switch is
required, so the existing login/signup flow also works before this migration.
Invalid legacy quiz metadata is skipped rather than breaking account creation.

Authenticated users can read only their own rows. Browser roles cannot write
directly to either table or invoke the privileged sync functions. The profile
role defaults to `customer`; metadata can never assign `admin` or overwrite a
trusted backend role assignment. Sync functions are isolated in the non-exposed
`mixology_private` schema with no browser-role access. No organization, billing, API key, or Auth
provider settings are changed by this migration.

The local PostgreSQL test harness verifies signup synchronization, backfill,
repeatable migration, quiz updates, per-user isolation, anonymous denial,
role escalation protection, validation, and cascade deletion. Its test fixtures
are rolled back. To run it without adding app dependencies:

```sh
npm install --prefix .tmp-account-db-check --no-save --package-lock=false --ignore-scripts --no-audit --no-fund @electric-sql/pglite
node supabase/tests/run_accounts_local.mjs
```

Account regression checks use the real Supabase JavaScript SDK with an isolated
fake auth transport. They cover confirmation-required signup, invalid login,
session persistence and refresh, profile and quiz updates, validation failures,
and logout. They do not create users or send real email:

```sh
node --test --test-isolation=none src/services/account.test.mjs src/services/bars.test.mjs
```

Live verification still requires a user to sign in privately. Finish the quiz,
refresh the page, and open Profile to confirm the saved answers. Log out and log
in again to confirm they belong to the account rather than the current page.

The live `public.bars` schema was inspected in Supabase on 2026-10-05. It uses
UUID IDs, `short_description`, `area`, `address_line`, `is_featured`,
`is_published`, and `is_permanently_closed`. The frontend service maps these
columns to the existing bar components. No migration creates or alters bars.

## Applying the change

The cocktail schema in `migrations/001_create_cocktail_tables.sql` already exists.
The bar–cocktail migration and seed were run by the project owner in the live
Supabase SQL Editor on 2026-10-05. The owner reported the Singapore Sling seed
relationship in the result. To apply the same change to another environment:

1. Apply `migrations/002_create_bar_cocktail.sql`.
2. Run `seed_bar_cocktail.sql` to import prototype pairs whose parent records
   already exist. Existing pairs are left unchanged. New pairs are unpublished.

The composite primary key prevents duplicate pairs. Foreign keys reference
`bars.id` and `cocktails.id`; deleting either parent removes its relationships.
The primary key and reverse lookup index support queries in both directions.

RLS allows anonymous/authenticated reads only if the relationship and both parents
are published and the bar is not permanently closed. Backend service-role writes
are allowed. There are no public-client write policies. Existing bar and cocktail
publication flags and access policies are left unchanged.

The live database currently has five bar profiles and two cocktails. Of the
prototype seed pairs, only Atlas Bar / Singapore Sling has both parent records.
That is a prototype relationship, not a verified menu claim, so it remains
unpublished. Confirm actual menu availability before publishing any relationship.

## Frontend

`src/services/bars.js` reads published/open bars and queries `bar_cocktail` in
both directions. The homepage and bars page load live bar profiles. Bar detail
loads the live menu relationships; cocktail detail loads serving bars and supports
navigation to their profiles. Requests show loading, retry, and empty states.
These bar flows no longer use numeric fixture IDs. Cocktail discovery fixtures
remain in place; replacing the entire Explorer/homepage cocktail catalogue is a
separate task.

Before the migration is applied, relationship queries report an error and offer
retry. Afterward, only eligible published records appear. An empty response does
not establish whether there are no records or RLS hides them.

## Validation

Run service tests with:

```sh
node --test --test-isolation=none src/services/bars.test.mjs
npm run build
```

`tests/verify_bar_cocktail.sql` checks duplicate/foreign-key rejection, public
read/write rules, unpublished/closed-record visibility, and delete cascades. It
uses temporary fixtures inside a transaction that ends with rollback. It requires
the Margarita and Singapore Sling cocktail seeds and the confirmed live bar
schema. The SQL checks have not been executed against the live database.
