# Aurelia Commerce — Full-Stack Next.js E-Commerce Platform

A production-oriented JavaScript/Next.js commerce application built around the supplied master specification. The codebase is intentionally modular and optimized for Vercel-style serverless deployment.

## Core stack

- Next.js App Router + React (JavaScript, not TypeScript)
- Material UI + MUI Icons + Lucide-ready icon layer
- MongoDB/Mongoose
- Auth.js/NextAuth credentials authentication + JWT sessions
- GSAP/ScrollTrigger
- Three.js / React Three Fiber
- Zustand
- Cloudinary signed uploads
- Stripe, PayPal, Alipay provider modules; Payoneer capability-gated
- Resend/Brevo HTTPS email providers with optional Nodemailer SMTP fallback
- Upstash Redis REST rate-limit support with memory fallback for local development

## Main application areas

### Storefront
- Premium responsive landing page with GSAP reveals, horizontal scroll showcase, scroll-controlled video, and optional 3D scene
- Responsive mega menu with nested categories, brands, featured products, trending products, promotions, account, wishlist, cart, notifications, and global search
- Search/autocomplete, name/category/brand/tag/SKU/attribute filters, rating/price/availability filters, sorting and pagination
- Category and product pages with variants, SKU, stock, images/video, zoom, specifications, shipping/returns, coupons, comparison, related/recommended/recent products, Q&A, reviews and ratings
- Guest and authenticated cart, save-for-later, coupon/tax/shipping calculations, cart persistence and guest-cart merge after login
- Multi-step checkout and server-side total validation

### Payments and wallet
- Provider modules for Stripe, PayPal and Alipay
- Payoneer is deliberately capability-gated instead of presenting a fake checkout flow
- Server-side payment records, transaction records, payment statuses and idempotency keys
- Stripe/PayPal/Alipay webhook handlers with signature verification and duplicate webhook protection
- Refund architecture and partial-refund support where provider capabilities permit it
- Wallet ledger with available/promotional balances, credit/debit entries, checkout payment, refunds and Stripe top-ups

### Orders
- Full requested order lifecycle
- Customer history, order detail, timeline, tracking, cancellation, refund request, return request and downloadable invoice
- Admin order search/filtering, status updates, shipping/tracking fields, cancellations, refunds and returns
- Important order mutations are audited

### Reviews, wishlist and customer account
- 1–5 star reviews, written review, signed media uploads, verified-purchase flag, moderation, reports, helpful/unhelpful votes, rating distribution and aggregate product rating
- Wishlist and comparison
- Profile, personal information, password/security, addresses, orders/tracking, wishlist, reviews, product history, wallet/transactions, coupons, notifications, support, payment methods and preferences

### Admin
- Analytics: sales/revenue/orders/customers/products, AOV, conversion proxy, refunds, payment stats, wallet stats, sales trends, customer growth, top products, category sales and country/region sales
- Product, category, brand and variant management
- Customer administration and account status management
- Configurable RBAC roles and permissions
- Marketing: coupons, newsletter/notification campaigns, flash-sale/banner campaign records, homepage/recommendation settings
- Review/Q&A moderation
- Support/ticket administration
- Searchable audit logs
- Site settings

### Notifications and email
The app does **not** depend on SMTP for Vercel deployment. `sendEmail()` tries HTTPS API providers first:

1. Resend (`RESEND_API_KEY`)
2. Brevo (`BREVO_API_KEY`)
3. Nodemailer SMTP only when `ENABLE_SMTP=true`

Transactional templates cover registration verification, password reset, order/payment updates, refunds, returns, wallet events and security alerts.

### Support/live messaging
The support system includes conversations, ticket assignment, history, customer/admin dashboards, online/offline presence, typing indicators, read state and signed file/image attachments. The default transport uses short HTTP polling because it is reliable on serverless/free hosting; the persistence model is transport-independent so an external WebSocket/realtime provider can be substituted without changing conversation storage.

## Security

- bcrypt password hashing
- Secure Auth.js JWT sessions
- Account lockout after repeated login failures
- Email verification and password-reset opaque tokens stored as hashes
- RBAC on admin routes and APIs
- Server-side Zod validation
- Signed Cloudinary uploads
- Rate limiting (Upstash REST when configured)
- Webhook signature verification
- Payment/order/wallet idempotency protection
- Audit logs
- Security response headers
- No payment success is trusted from the browser
- Secrets remain server-side

## Seed and first run

1. Copy `.env.example` to `.env.local`.
2. Configure MongoDB and `AUTH_SECRET`.
3. Run `npm install`.
4. Run `npm run seed:rbac`.
5. Optional: set `SEED_ADMIN_PASSWORD`, then run `npm run seed` to create a super-admin plus a QA catalog product.
6. Run `npm run dev`.

## Vercel deployment

Use Vercel environment variables rather than committing `.env.local`. For the free/Hobby deployment profile, prefer MongoDB Atlas, Resend/Brevo HTTPS email, Cloudinary and Upstash REST. Do not enable SMTP unless your selected SMTP service is known to work reliably from the deployed serverless environment.

Payment webhooks must point to the deployed HTTPS routes:

- `/api/payments/webhooks/stripe`
- `/api/payments/webhooks/paypal`
- `/api/payments/webhooks/alipay`

## Validation performed in this workspace

- Parsed all JavaScript and JSX source files with the TypeScript parser: **236 files, 0 syntax errors**.
- Verified all local `@/` imports resolve to files in the project.
- Verified every referenced `PERMISSIONS.*` constant exists.
- Verified non-JSX library/model/script files with Node `--check`.

A complete `npm install && npm run check` could not be executed in this workspace because outbound npm registry DNS requests return `EAI_AGAIN`. Run `npm run check` after installing dependencies in your local environment or CI/Vercel build environment.
