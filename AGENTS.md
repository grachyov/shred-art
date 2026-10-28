Avoid code comments except for TODOs or essential context.

This is a React + TypeScript + Vite static frontend, deployed through Cloudflare Workers static assets. Use npm and plain CSS. Keep the implementation small; do not add application infrastructure for the auction concept unless requested.

Preserve the four steps in `src/App.tsx` verbatim unless a copy change is requested. Keep the browser title exactly `shred.art`. Themes follow the system setting through CSS; preserve readable contrast, visible focus, and zoom. Keep the page static: no entrance animations or animated hover effects.

Keep `assets/source/logo.png` byte-for-byte intact. Generate derivatives with `npm run assets`; never substitute generated artwork for the original. Header images must use the small WebP variants, and the original must remain outside the deployed asset directory. Retain the Barlow Condensed font license and load only the needed local fonts.

Run `npm run check` for changes. Before deployment, run the Wrangler dry run and visually inspect the production preview at mobile and desktop sizes in both themes. The README documents release commands. Deploy only when requested or already authorized, then verify the actual custom domain. Keep secrets in the environment and out of source and logs.
