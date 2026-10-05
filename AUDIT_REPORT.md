# Premium Commerce Audit Checkpoint

## Fixed in this checkpoint

1. **Auth.js MissingSchemaError for Permission**
   - Root cause: nested role permission population ran before `Permission` was registered.
   - Fix: explicit auth registration plus centralized Mongoose populate-target registration through `src/models/register.js` imported by `src/lib/db.js`.

2. **Potential populate-order MissingSchemaErrors across routes**
   - Root cause: many routes populate User/Product/Category/etc. without guaranteeing target model registration in the same runtime.
   - Fix: centralized registration of all populate target models.

3. **Registration default role logic**
   - Fix: registration now atomically upserts/reuses the single `customer` role instead of a find-then-create race.

4. **RBAC schema/seed contradiction**
   - Root cause: Role schema only permits `customer` and `admin`, while seed scripts referenced `super-admin`, `manager`, `support-agent`, and other forbidden slugs.
   - Fix: seed scripts now follow the two-role architecture: `customer` and `admin` only. Admin receives the full permission set; customer receives none by default.

5. **SEO gaps**
   - Added consistent default canonicals for products and categories.
   - Added public SEO brand landing pages at `/brand/[slug]`.
   - Added brands to the dynamic sitemap.
   - Added canonical/OpenGraph metadata for `/shop`.
   - Added noindex metadata to internal search, auth pages, cart, checkout, wishlist, compare, account, and admin surfaces.
   - Added optional canonical fields to Category and Brand SEO schemas.

6. **Feature checklist accuracy**
   - Corrected the checklist so polling-based support is not described as true push-based real-time communication.

## Verified

- No unresolved local `@/` or relative JavaScript imports found.
- Source syntax verification script passes for all non-JSX JavaScript modules checked.
- No HTML-entity-corrupted source tokens detected.
- `.env` and `.env.local` are gitignored.

## Still unresolved / requires next implementation phase

1. **True real-time communication**
   - Current customer/admin support chat polls every 3.5–4 seconds.
   - Presence, typing, read state, messages and attachments exist, but transport is not push-based.
   - For Vercel serverless deployment, use a managed real-time transport (for example Ably/Pusher) with authorization and keep polling only as a fallback.

2. **Full production build/lint/e2e verification**
   - `npm ci` could not complete in this workspace because package installation is unavailable/timed out.
   - Therefore `next build`, ESLint, browser QA, MongoDB integration QA, email provider QA, payment provider QA and deployed real-time QA still need execution in an environment with installed dependencies and configured services.

3. **Secrets hygiene**
   - The uploaded project contains `.env.local`. Do not commit it. If any credentials in that file have ever been shared outside your trusted environment, rotate them.
