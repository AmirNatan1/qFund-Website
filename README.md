# qFund Website

The redesigned website for qFund, a deep-technology venture capital firm based in Herzliya, Israel.

## Experience

- Institutional editorial design with a graphite, mineral-white, and electric-cyan visual system
- Interactive investment-focus and portfolio sections
- Responsive layouts and accessible reduced-motion behavior
- Original motion design and coherent AI-generated scientific artwork
- Production metadata and a dedicated social sharing card

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Validate a production release with:

```bash
npm run build
npm test
```

The research and competitive benchmarking behind the redesign are documented in `RESEARCH.md`.

## Cloudflare deployment

The default build is a static export designed for the connected Cloudflare
Pages project. It writes `index.html`, the 404 page, application bundles, and
media to `out`, then mirrors the same complete artifact to `dist` and
`dist/client` for compatibility with existing Pages output-directory settings.

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

The repository also retains an optional server-rendered Worker build. Use
`npm run build:worker` to create it or `npm run deploy` to build and deploy it
with the included `wrangler.jsonc` configuration.
