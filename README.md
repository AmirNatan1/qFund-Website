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

This is a server-rendered vinext application and must be deployed as a Cloudflare
Worker, not as a static Pages output. The repository includes `wrangler.jsonc`
so Git-connected Workers Builds can deploy the compiled server and client assets
without framework auto-detection.

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Production branch: `main`
