# Runtime SSR Fix Notes

## Fixed
- Added a dedicated `src/components/navigation/ClientLink.js` client bridge for MUI `component={Link}` usage under Next.js 16.
- Removed the server-component `next/link` function handoff from `src/components/ui/EmptyState.js`; it now nests the MUI Button inside Next Link instead.
- Standardized MUI navigation components to use the client Link bridge in Header, Footer, SearchOverlay, AccountShell, AuthForms, and AdminShell.
- Wired `ToastProvider` into `AppProviders` so `useToast()` consumers use the actual provider.
- Normalized the global error boundary and made its retry button explicitly `type="button"`.

## Why
Next.js 16 does not allow a server component to pass a function such as the `next/link` component directly to a client component prop. Material UI documents a client Link wrapper for this integration pattern.

## Verification
- Confirmed there are no remaining server components using `component={Link}`.
- Confirmed the client Link bridge exists and all migrated imports resolve locally.
- Dependency installation could not complete inside this environment, so run `npm ci && npm run build` locally for the final environment-specific verification.
