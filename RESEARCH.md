# qFund website research and design rationale

Research date: 22–23 July 2026

## Executive conclusion

The strongest venture-capital websites do four jobs in a strict order: state an ownable investment belief, show proof through companies, explain the kind of founder or technology the firm seeks, and make the people behind the capital feel credible and reachable. Deep-tech firms add a fifth job: they must communicate technical fluency without looking like a generic science-fiction product.

For qFund, the opportunity is to move from a competent one-page brochure to a distinctive institutional position: an early-stage Israeli fund that understands the physical, computational, and scientific foundations below the application layer. The design therefore pairs editorial restraint with a precise technical interface. Motion is used as evidence of sophistication and as a navigation aid, not as spectacle detached from the investment story.

## VC website benchmark notes

### qFund — current site

- Displays a short hero statement, four portfolio companies, three team members, eight focus areas, and a contact prompt.
- What works: the investment scope is unusually concrete; quantum, robotics, data centers, satellite communications, particle accelerators, cyber, sensing, geothermal, and nuclear immediately signal real deep-tech breadth.
- What is missing: the current page gives no strong hierarchy between thesis and taxonomy, provides little proof of how qFund works with founders, and does not turn the portfolio into a narrative. The team is listed but not framed as a reason to choose qFund.
- Redesign implication: preserve the concrete sector language and real portfolio data, then add a strong thesis, investment posture, founder-partnership method, and richer portfolio context.

### DCVC

- Leads with the unambiguous line “We are deep tech venture capital,” followed by a long-term track record, flagship research, rotating company spotlights, and the memorable credibility claim that the team includes more published scientists than MBAs.
- Why it works: the website treats intellectual leadership as proof. Reports and technical writing are not a secondary blog; they are part of the firm's product.
- qFund implication: include a “signals we follow” section that can later become a real field-notes or research platform. This demonstrates how qFund thinks before asking visitors to trust the brand.

### Lux Capital

- Uses a sharply ownable headline—turning science fiction into science fact—then lets portfolio companies embody the claim. It also promotes a proprietary thought-leadership platform, Riskgaming, rather than a generic news feed.
- Why it works: the language is concise, high-conviction, and culturally distinct. The portfolio is presented as an argument for the thesis.
- qFund implication: use a high-conviction hero and position every company card as evidence of a broader technical worldview.

### Eclipse

- Opens with “Operators with Capital” and explains its focus on the physical economy, critical systems, resilience, and industrial transformation.
- Why it works: the site gives founders a reason to choose the fund beyond money. It makes the team's operating identity the central differentiator.
- qFund implication: articulate the partnership model in three clear phases—technical diligence, milestone construction, and compounding the advantage.

### Playground Global

- Frames its territory as “somewhere between improbable and impossible,” then organizes the page around next-generation compute, automation, energy transition, and engineered biology. It uses a mission-first story, proof-rich portfolio grids, team, news, events, and an explicit founder CTA.
- Why it works: ambitious language is grounded by exact sectors and real companies, keeping the site imaginative without losing seriousness.
- qFund implication: let the hero be aspirational, then immediately ground it in specific fields and portfolio proof.

### IQ Capital

- States exactly what it is—dedicated deep-tech venture capital—then explains stage, follow-on capacity, history, founder testimonials, team, and current insights.
- Why it works: visitors quickly understand mandate, investment stage, scale, credibility, and founder experience.
- qFund implication: expose the early-stage posture immediately and reserve clear locations in future content for investment parameters and founder references once approved.

### Lowercarbon Capital

- Uses a provocative, highly differentiated voice while still structuring the thesis into three clear technical outcomes. Portfolio examples and long founder testimonials provide social proof.
- Why it works: the tone makes the firm memorable, while the evidence prevents it from feeling frivolous.
- qFund implication: qFund should be bolder than conventional financial-services copy, but its voice should remain precise, measured, and technically literate.

### Radical Ventures

- Builds around one concentrated proposition—AI as a platform shift—supported by portfolio, team, expert video, news, masterclasses, and programs.
- Why it works: singular focus makes the firm easy to categorize and demonstrates ecosystem authority.
- qFund implication: the unifying proposition should not be a single sector; it should be “foundational technologies below the application layer.” This binds qFund's broad areas into one story.

### Grove Ventures

- Leads with founder partnership, then backs it with AUM, stage, domain focus, hands-on support, portfolio, insights, reports, events, tools, talent, and Founder OS.
- Why it works: the website makes founder value-add tangible rather than saying “we help.”
- qFund implication: create explicit architecture for future founder resources and explain current partnership behavior in specific terms.

### Pitango

- Uses scale metrics—companies, capital invested, funds, exits—along with investment arms, domains, team, and notable outcomes.
- Why it works: quantified history is an efficient institutional-trust signal.
- qFund implication: do not invent vanity numbers. Until approved qFund metrics are available, use qualitative posture markers such as EARLY, DEEP, and GLOBAL rather than unsupported claims.

### Aleph

- Makes the founder journey the organizing idea, communicates its early-stage Israeli focus, publishes an extensive media platform, and promotes a proprietary portfolio-support system.
- Why it works: the fund presents itself as a service platform and a voice in the Israeli ecosystem.
- qFund implication: keep founder contact prominent and make team access feel direct, not bureaucratic.

### Team8

- Organizes a complex platform through domains, two investment models, founder networks, experts, events, reports, and a clear “success by design” methodology.
- Why it works: strong information architecture makes a large organization feel understandable and purposeful.
- qFund implication: because qFund is compact, avoid menu sprawl. Use one deeply considered page with clean anchors and make complexity emerge progressively while scrolling.

### Glilot Capital

- Combines a direct founder promise with portfolio logos, lifecycle funds, customer-validation programs, advisor networks, testimonials, reports, and news.
- Why it works: each branded program turns generic “network” language into something concrete.
- qFund implication: future versions should name and productize any repeatable qFund support mechanisms. The current redesign leaves room for that evolution without fabricating programs.

### OurCrowd

- Serves a different audience: accredited investors. Accordingly, the website emphasizes opportunities, funds, alternative assets, how to invest, diversification, exits, and education.
- Why it works: the interface is optimized around investor conversion rather than founder attraction.
- qFund implication: keep the public homepage founder-first and reputation-first. LP or investor content should become a distinct flow if needed later.

### Other Israeli firms reviewed

- TLV Partners, Vertex Ventures Israel, 83North, Entrée Capital, Cyberstarts, and Viola reinforce the same recurring content model: clear thesis, company directory, people, insights, careers, and contact.
- Their visual approaches range from restrained editorial grids to kinetic full-screen brand systems, but the most successful pages avoid hiding basic investment facts behind effects.
- qFund implication: motion may make the brand memorable, but thesis, stage, focus, companies, people, and contact must remain readable without animation.

## Animation catalogue findings

### Annnimate

The catalogue is organized around buttons, scroll effects, UI components, experimental interactions, shaders, menus, and full sections. Particularly relevant patterns included gooey hover reveals, slow mesh gradients, multi-card flips, circular and radial galleries, dual text scrambles, image-dissolve scrolling, character-by-character reveals, mega-menu transitions, testimonial globes, gradient footers, and coordinated preloader/hero reveals.

The strongest production lesson was not a single effect but the system behind them: each interaction should be configurable, lifecycle-safe, responsive, keyboard-aware, and respectful of reduced-motion preferences.

qFund recreations built from scratch:

- A calibrated preloader with progress count and an upward page wipe.
- Staggered masked hero-line reveals.
- A cursor-responsive luminous field over the hero image.
- Magnetic calls to action with restrained pointer attraction.
- A continuously moving sector ticker.
- A radial focus visual with counter-rotating orbits and live data readout.
- Pointer-tilting portfolio and team cards with localized light response.
- A scanned-image portfolio treatment and animated signal line.
- Filtered portfolio transitions.
- Large menu reveal on smaller screens.
- An orbital contact-field animation.

### Awwwards

Recurring patterns across the animation and interaction galleries included full-viewport opening sequences, scroll-synchronized storytelling, image and page wipes, oversized kinetic typography, hover-reveal galleries, custom cursors, infinite marquees, layered parallax, radial transitions, mask reveals, playful but legible navigation, and microinteractions that confirm input.

The best Awwwards work uses a small number of motifs repeatedly. qFund therefore uses one signal language—grids, nodes, scans, orbits, readouts, and a single cyan accent—rather than a collection of unrelated tricks.

### Anime.js catalogue

The official catalogue covers timelines, overlapping animation positions, time and value staggering, layout transitions, scroll observation, SVG line drawing, motion paths, shape morphing, split text, text scrambling, springs, draggables, responsive scopes, and hardware-accelerated transforms.

qFund recreations use the same underlying principles without copying catalogue code:

- IntersectionObserver-driven staggered entrances.
- Transform-and-opacity animation for performance.
- Timeline-like delay sequencing in the opening hero.
- Scroll progress mapped to the hero's scale, shift, and opacity.
- Rotational motion paths represented with CSS orbital systems.
- State-driven focus transitions and portfolio layout filtering.
- Motion disabled or simplified under prefers-reduced-motion.

## 23 July expansion pass

The second benchmark pass focused on what makes a VC website useful after its first visual impression. The clearest pattern is that mature firms create a small number of owned intellectual or operational surfaces rather than adding generic marketing sections.

- **DCVC:** its 2026 Deep Tech Opportunities report is treated as a flagship expression of the firm’s worldview. Company spotlights also expose first-investment context and outcomes. This makes research and portfolio evidence reinforce one another. qFund response: turn the existing “signals” teaser into a real field-notes route and make the underwriting logic legible.
- **Lux:** Riskgaming functions as a distinct intellectual product spanning scenarios, a newsletter, and a podcast. This is more memorable than a conventional insights feed. qFund response: use the more ownable “Field Notes” frame and describe unfinished questions honestly as working theses.
- **Eclipse:** “Operators with Capital” remains the central reason for founders to choose the firm, while its reports quantify a specific physical-economy worldview. qFund response: make the partnership method concrete and tie it directly to technical milestones and system economics.
- **Grove Ventures:** the site combines stage and sector clarity with reports, playbooks, events, careers, perks, and Founder OS tools. The strongest lesson is usefulness: founder resources demonstrate how the firm behaves. qFund response: add clear founder-fit language now, leaving space for genuine tools or programs once qFund approves them.
- **Glilot Capital:** lifecycle programs such as G-Seed, G+, Mach5, and G-Club explain when and how the firm helps. qFund response: explain the proof path without inventing branded programs that do not yet exist.
- **Aleph:** “Founder Journey,” founder voices, podcasts, insights, and a richly filterable company directory create depth well beyond a one-page brochure. qFund response: add dedicated thesis, companies, and field-notes routes, but keep the home page as the primary cinematic narrative.

### Content decisions from the expansion pass

- Add “What we underwrite” to the home page: technical truth, milestone velocity, economic leverage, and founder range.
- Link only at three high-intent moments in the long scroll: thesis to `/thesis/`, portfolio to `/companies/`, and research to `/field-notes/`.
- Expand `/thesis/` around premise, underwriting tests, proof path, and founder fit.
- Expand `/companies/` into a filterable directory plus the shared architecture qFund seeks across fields.
- Expand `/field-notes/` into six clearly labelled working theses with “signals to watch.” They are research prompts, not fabricated published articles.
- Avoid unsupported claims about fund size, check size, returns, team biographies, customer introductions, or proprietary programs until qFund supplies approved facts.

### Motion decisions from the expansion pass

- The underwriting section uses a stateful diagnostic console: selecting a test changes the instrument readout while a radar sweep continues in the background.
- The thesis route uses nested orbital systems and a pulsing horizontal proof path to show risk being retired sequentially.
- The companies route uses a constellation hero and per-company scan fields to depict a portfolio as a connected technical system.
- The field-notes route uses a phase-shifted signal waveform, active-signal indicators, and pointer-responsive illumination.
- All new motion is transform/opacity based, degrades under reduced-motion preferences, and preserves the existing grid/node/scan/orbit visual language.

## 23 July visibility and founder-surface pass

The first expansion proved that adding routes is not enough if they are only linked far down a long homepage. A further navigation audit of current peers showed that substantial pages are almost always exposed directly from the primary menu:

- **DCVC** puts Companies, About, Team, News & Insights, Careers, and its flagship Deep Tech Opportunities report in obvious navigation positions. The research report is also featured high on the homepage.
- **Lux** gives Companies and People primary placement and treats Riskgaming as a named, standalone intellectual product rather than a hidden blog.
- **Eclipse** exposes About, Team, Companies, Blog, and Press directly, while its operator identity explains why a founder should choose the firm.
- **Grove Ventures** surfaces Portfolio, Team, Reports & Playbooks, Events, Careers, Portfolio Perks, and Founder OS. The breadth is useful because each destination demonstrates a specific form of founder support.
- **Aleph** places Companies and Insights alongside a dominant “Founder Journey” narrative, making founder experience a first-class content surface.
- **Glilot Capital** uses lifecycle programs to explain how the firm engages founders at different moments.

### Resulting qFund changes

- Replace section-only primary navigation with direct links to Thesis, Companies, Founders, and Field Notes.
- Add a large, animated “Explore qFund” gateway immediately after the opening ticker so the multi-page structure cannot be missed.
- Add `/founders/` as a fourth standalone route. It explains the first technical conversations, how evidence compounds, where partnership is useful, and what founders can bring—without inventing check sizes, response times, named programs, or unsupported operational claims.
- Give each route a meaningful live-system animation: thesis orbits, company scans, founder evidence paths, and research waveforms.

## Final information architecture

1. Hero: positioning, location, and direct founder promise.
2. Thesis: the unifying belief behind a broad deep-tech mandate.
3. Underwriting: four explicit tests for building early conviction.
4. Focus: six interactive investment fields with clear explanations.
5. Companies: the four current public portfolio companies, framed as proof and linked to a dedicated directory.
6. Partnership method: the practical role qFund plays from technical truth to scale.
7. Team: real public names and roles with restrained placeholder focus descriptions.
8. Signals: three working theses linked to a six-topic field-notes route.
9. Contact: direct, founder-oriented conversation prompt and Herzliya identity.
10. Thesis route: premise, underwriting tests, proof path, founder fit, and conversation CTA.
11. Companies route: filterable directory, portfolio pattern, and founder CTA.
12. Field notes route: six active research questions, signals to watch, and research method.

## Sources consulted

- https://qfund.io/
- https://www.dcvc.com/
- https://www.luxcapital.com/
- https://eclipse.capital/
- https://www.playground.vc/
- https://www.iqcapital.vc/
- https://lowercarbon.com/
- https://radical.vc/
- https://www.grovevc.com/
- https://www.pitango.com/
- https://www.aleph.vc/
- https://team8.vc/
- https://glilotcapital.com/
- https://www.ourcrowd.com/
- https://www.tlv.partners/
- https://www.vertexventures.co.il/
- https://www.83north.com/
- https://entreecap.com/
- https://www.cyberstarts.com/
- https://www.viola-group.com/
- https://annnimate.com/
- https://www.awwwards.com/
- https://animejs.com/
