# Bar–cocktail integration

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
