# shred.art

A text-only introduction to shred.art: letters become art auctions, with a physical or digital ending. This frontend describes the concept; it does not implement auctions, wallets, NFTs, address collection, or fulfillment.

## Development

Use Node 24 or newer and npm.

```sh
nvm use
npm ci
npm run dev
```

The stack is React 19, TypeScript 6, Vite 8, and plain CSS. Barlow Condensed is self-hosted through the bundled Latin WOFF2 files. Light and dark mode follow the device setting, including changes while the page is open.

| Command                | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start the local Vite server                         |
| `npm run preview`      | Serve the production build locally                  |
| `npm run typecheck`    | Check application and Vite configuration types      |
| `npm run lint`         | Check TypeScript, React, accessibility, and scripts |
| `npm run format`       | Format project sources                              |
| `npm run format:check` | Check formatting without writing                    |
| `npm run assets`       | Regenerate logo, icons, and social image            |
| `npm run build`        | Build the site into `dist/`                         |
| `npm run check`        | Run formatting, lint, typecheck, and build          |
| `npm run dry-run`      | Run checks and validate the Worker upload           |
| `npm run deploy`       | Run checks and deploy to Cloudflare                 |

## Content and assets

The four steps in `src/App.tsx` are intentional verbatim copy, including lowercase wording and “smth.” The page has no additional marketing sections or actions.

Keep `assets/source/logo.png` unchanged: it is the original 2048px transparent PNG. `scripts/generate-assets.mjs` derives the small transparent WebP header images, PNG/ICO favicons, opaque touch/app icons, a safely padded maskable icon, and the social image. These generated files are committed under `public/` so a normal build needs no image processing. Run `npm run assets` after intentionally updating the source or generation settings, and commit the derived files together.

The original is outside `public/` and never bundled. Font license text is retained at `assets/fonts/OFL.txt`. Only the 500 and 700 Latin WOFF2 font files are used by the page.

## Deployment

The tracked `wrangler.jsonc` defines the `shred-art` static-assets Worker in the same Cloudflare account as `mons.shop` and `mons.link`. It serves `dist/` with SPA fallback at the custom domain `shred.art`. There is no server entrypoint, API, database, `www` hostname, or GitHub deployment workflow. Production Vite builds do not load local environment files or expose environment-variable prefixes.

Authenticate Wrangler using your existing Cloudflare login or a `CLOUDFLARE_API_TOKEN` in your local environment. Never put credentials in source, commands, or committed files.

For a release, run `npm run dry-run`, inspect the local production preview, commit and push the validated sources, then run `npm run deploy`. When the same build has already passed all checks, `npx wrangler deploy --strict` deploys it without repeating validation. Verify HTTPS, the exact title and four steps, fonts, and icon responses at <https://shred.art/> after deployment. Cloudflare provisions the apex DNS binding and certificate through the configured custom domain.

Before publishing UI changes, inspect 360px, 390px, 768px, and 1440px widths in both device themes. Check wrapping and horizontal overflow, header blur while scrolling, keyboard focus, browser zoom, reduced motion, and network loading. Preserve the small responsive logo and avoid shipping the original PNG to visitors.
