# Material UI Redesign

This build preserves the existing commerce/auth/API/database behavior while introducing a unified Material UI visual system.

## Major upgrades
- Light/dark color mode with local persistence.
- Premium Material UI storefront navbar with drawers, badges, menus and admin-aware controls.
- Reference-inspired landing page using cool gray surfaces, blue primary accents, green/orange status accents and elevated dashboard-style cards.
- Material UI admin shell with icon navigation and a dashboard-style analytics experience.
- Material UI account shell, auth forms, product cards, footer, search overlay, status chips, loading states and empty states.
- Legacy feature-heavy screens inherit the same palette, surfaces, form styling, tables and dark-mode tokens without changing their business logic.

## Dark mode
Use the sun/moon icon in the main navbar or admin sidebar. The preference is stored under `aurelia-color-mode` in localStorage.

## Functional scope
No API routes, database schemas, checkout/payment flows or business rules were intentionally changed as part of this redesign.
