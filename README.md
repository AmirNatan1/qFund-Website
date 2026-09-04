# qFund Website

The redesigned website for qFund, a deep-technology venture capital firm based in Herzliya.

## Experience

- A unified long-scroll homepage with About, Industries, Approach, Portfolio, Team, and a three-story News section
- A light eggshell, sage, and green institutional visual system
- A right-edge section rail with active-section tracking and smooth scrolling
- Interactive evaluation, portfolio, and industry modules
- Responsive layouts and accessible reduced-motion behavior
- Original motion design and coherent technical artwork
- Production metadata and a dedicated social sharing card

Contact is the only standalone content page. The three most recent news stories live at the bottom of the homepage and link to their original coverage.

## Contact form

The form posts to `/api/contact`, a Cloudflare Pages Function in `functions/api/`
that validates the submission and hands it to [Resend](https://resend.com). The
API key stays a Cloudflare secret and never reaches the page source. Submissions
arrive at `info@qfund.io` with the sender set as reply-to, so replying goes
straight back to them.

To take it live:

1. Create a Resend account and verify `qfund.io` as a sending domain, adding the
   DNS records Resend provides.
2. Create an API key.
3. In the Cloudflare Pages project, under **Settings → Environment variables**,
   add `RESEND_API_KEY` to the production environment as an **encrypted** value.
4. Redeploy the project so the binding is picked up.

Optional bindings: `CONTACT_TO` changes the recipient (default `info@qfund.io`)
and `CONTACT_FROM` changes the sender (default `qFund Website
<website@qfund.io>`, which must be on a domain verified in Resend).

Until `RESEND_API_KEY` is bound the endpoint answers `503 unconfigured`, and the
form falls back to opening a prepared email rather than losing the enquiry. The
same fallback covers a provider outage or a dropped connection, so a submission
is never silently discarded.

`_routes.json` keeps every path except `/api/*` on the static asset path, so the
Function only runs for the endpoint.

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

The claim-by-claim content provenance, portfolio URLs, and source reconciliations are documented in `CONTENT_SOURCES.md`.

## Cloudflare deployment

The default build is a static export designed for the connected Cloudflare
Pages project. It writes `index.html`, the 404 page, application bundles, and
media to `out`, then mirrors the same complete artifact to `dist` and
`dist/client` for compatibility with existing Pages output-directory settings.

The current Cloudflare projects are configured to publish the repository root
without running a build. To keep those existing projects operational, a
generated copy of the same static export is committed at the repository root.
Refresh that compatibility copy before publishing source changes with:

```bash
npm run release:pages-root
```

- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npm run build`
- Build output directory: `out`
- Root directory: `/` (repository root)
- Production branch: `main`

The repository also retains an optional server-rendered Worker build. Use
`npm run build:worker` to create it or `npm run deploy` to build and deploy it
with the included `wrangler.jsonc` configuration.
