# PRAXIS_UI — Product & Design Spec

> Status: **Current product state** (living reference — update when decisions change)  
> Product: Free practice-API marketing site + docs (no site login)  
> Brand: **Praxis.app** · Parent: [AsterIQ.](https://asteriq.in)  
> Visual: Cool ink canvas + signal red accent · hexagonal atmosphere + restrained glass  
> Docs: **MDX guides** + **Scalar** OpenAPI reference — not Redoc / Swagger UI on the marketing site

---

## 1. Product decision

| Decision | Choice |
|---|---|
| Site type | Marketing + documentation + practice surfaces |
| Pricing / access | Free forever; **no auth required** on the site |
| Audience | Learners, indie builders, interview prep, early teams practicing APIs |
| Backend | `PRAXIS_API` (OpenAPI / `swagger.yaml`) |
| Docs UI | **MDX guides** at `/docs/*` + **Scalar** at `/docs/api` |
| Try-it | Custom live playground (`/playground`) + docs try (`/docs/try`) + methods lab (`/methods`) |
| OpenAPI | Free open standard — Praxis owns the YAML |
| Deploy | Next.js → **OpenNext Cloudflare** (`preview` / `deploy` scripts) |

**Not in scope:** User accounts on the marketing site, dashboards, paid plans, Redoc, Swagger UI on `PRAXIS_UI`.

Swagger UI may remain on `PRAXIS_API` for backend/dev only.

---

## 2. Brand & visual system

### 2.1 Source of truth

Keep hex values in sync between `src/app/globals.css` and `src/lib/theme.ts` (Scalar / OG consumers):

| Token | Value | Use |
|---|---|---|
| `--background` | `#09090b` | Page base (cool ink) |
| `--surface` | `#111113` | Elevated panels |
| `--surface-2` | `#18181b` | Nested panels |
| `--foreground` | `#fafafa` | Primary text |
| `--muted` | `#a1a1aa` | Secondary text |
| `--accent` | `#ef4444` | CTAs, highlights, focus |
| `--accent-foreground` | `#0a0a0b` | Text on accent buttons |
| `--accent-soft` | `rgba(239, 68, 68, 0.12)` | Soft fills / badges |
| `--border` | `rgba(255, 255, 255, 0.08)` | Dividers / glass edges |

HTTP verb colors (`--method-get`, `--method-post`, …) are **fixed and independent of brand accent** — changing `--accent` must not recolour GET/POST/etc.

### 2.2 Typography

| Role | Font | Notes |
|---|---|---|
| Display / headlines | **Space Grotesk** | Brand + section titles |
| Body | **Inter** | Readable UI copy |
| Mono (paths, JSON, chips) | **Geist Mono** | Endpoints, curl, playground |

Praxis.app marketing uses **signal red** as accent. AsterIQ’s parent site may use a different accent — do not swap Praxis UI to parent-site green.

### 2.3 Honeycomb pattern

- Semi-transparent hex grid behind hero (and optionally docs chrome).
- Stroke / fill tinted with accent at low opacity.
- Soft depth: overlapping layers, fade-out toward content — never competing with headline.
- Atmosphere only — do not stamp hexagons on every section.

### 2.4 Morphism & motion

Use glassmorphism **selectively** (nav, playground chrome, lab shells) — not wallpaper.

Motion stack: **`motion`** via `MotionProvider`, `Reveal` presets, plus intentional accents (`ScrambleValue`, `DrawLine`, method flow animations).

Budget: intentional hierarchy motions — not noise on every block.

### 2.5 Layout principles

- First viewport: brand **Praxis.app**, one headline, one short line, one CTA group, honeycomb atmosphere + hero visual.
- No card spam in hero.
- Dark base is intentional; accent is signal red.

---

## 3. Information architecture

```
PRAXIS_UI
├── /                 Marketing landing
├── /methods          HTTP methods teaching lab
├── /playground       Live multi-domain API lab
├── /docs             MDX docs shell (guides, search, TOC)
│   ├── /docs/*       MDX pages (quickstart, auth, guides, …)
│   ├── /docs/api     Scalar OpenAPI reference
│   └── /docs/try     Live try-it client
└── /#learn           Learning path (inlined on landing — no /learn route)
```

Nav (as shipped): Start (`/#learn`) · Build (`/#build`) · Methods · Catalog (`/#domains`) · Docs · Playground.

### 3.1 Landing section order

1. Nav — glass, Praxis button grammar  
2. Hero — honeycomb + red accent + call/domain visual  
3. **Start here** (`/#learn`) — learning path strip  
4. **Build** (`/#build`) — production-shaped use cases (auth, ecommerce, social, chat, business)  
5. Domain catalog (`/#domains`) — full index; HTTP utilities last  
6. Request anatomy  
7. Why Praxis (+ telemetry metrics inline)  
8. Docs / playground CTA  
9. Footer (AsterIQ attribution)

---

## 4. Feature set

### 4.1 Core features (shipped)

| ID | Feature | Description |
|---|---|---|
| P1 | Marketing landing | Discover → understand → try → read docs |
| P2 | Domain / endpoint catalog | Categories mapped to Praxis routers (`lib/praxis.ts`) |
| P3 | Request anatomy | Method, path, headers, envelope, errors |
| P4 | Stats / telemetry | Domains, resources, app surfaces (inline in Why) |
| P5 | Docs product | MDX guides + search + sidebar/TOC/pager + Scalar API reference |
| P6 | Sticky / compact nav | Glass chrome over dark bg |

### 4.2 Practice surfaces (shipped)

| ID | Feature | Why it matters |
|---|---|---|
| E1 | **Live multi-domain playground** | Real `fetch` to Praxis; domain switcher; copy as curl / fetch / axios |
| E2 | **Production-shaped app surfaces** | Auth, ecommerce, social, chat, business datasets as first-class marketing |
| E3 | **Learning path** | Beginner → intermediate → advanced; links into docs + playground (`/#learn`) |
| E5 | **HTTP methods lab** (`/methods`) | Nine-verb explorer + animated request/response flow (`MethodsExplorer`, `MethodFlowVisual`, `httpMethodLessons.ts`) |
| E6 | **Docs try-it** (`/docs/try`) | Second live try path beside playground |

### 4.3 Backlog

| ID | Feature | Notes |
|---|---|---|
| E4 | **Business data explorer** | Browse companies / invoices / shipments / appointments from public GETs — catalog/copy only today |

HTTP utilities (status codes, cookies, redirects) remain in playground + catalog — they are **not** the landing lead. Methods teaching lives on `/methods`.

### 4.4 Explicit non-goals

- Site login / accounts  
- Fake playground responses  
- Redoc or Swagger UI on marketing docs  
- Third-party branding, inflated social proof, or borrowed marketing voice in Praxis UI copy  

---

## 5. Docs strategy

| Layer | Choice |
|---|---|
| Spec format | OpenAPI 3 (`PRAXIS_API` `swagger.yaml`) |
| Guide docs | MDX under `content/docs/*` — DocsChrome, sidebar, search (MiniSearch), TOC, pager |
| API reference | **Scalar** (`@scalar/api-reference-react`) at `/docs/api`, Praxis-themed via `theme.ts` |
| Try-it | `/playground`, `/docs/try`, `/methods` — not Scalar-as-only product surface |
| API-host docs | Swagger UI on API (optional; separate from marketing) |

Scalar theme must use Praxis tokens (ink bg, `#ef4444` accents) so `/docs/api` feels like Praxis, not default Scalar.

---

## 6. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + **TypeScript** |
| Styling | Tailwind v4 + CSS variables (`globals.css` / `theme.ts`) |
| Motion | `motion` (Reveal, ScrambleValue, DrawLine, method flows) |
| Icons | lucide-react |
| Docs guides | MDX (`@mdx-js/mdx`, gray-matter, rehype/remark) |
| Docs API | `@scalar/api-reference-react` |
| Search | minisearch |
| State | Local React state; no Redux |
| API base URL | Env `NEXT_PUBLIC_PRAXIS_API_URL` |
| Deploy | OpenNext Cloudflare + wrangler |

Architecture: split `components/`, `lib/`, `app/`, `content/docs/` — **no** monolithic single page.

---

## 7. Domain mapping (catalog content)

Surface Praxis capabilities honestly (`lib/praxis.ts`):

- **Public** — random users/products/jokes, books, quotes, meals, dogs/cats, stocks, geo, companies, customers, employees, inventory, orders, tickets, invoices, shipments, transactions, projects, subscriptions, appointments  
- **Apps** — auth/users, ecommerce, social-media, chat-app, todos  
- **Kitchen-sink / HTTP utilities** — HTTP methods, status codes, request/response inspection, cookies, redirects, image  
- **Ops** — healthcheck, seed helpers (present carefully; avoid production-unsafe demos on public marketing without guards)

---

## 8. Design quality checklist

### Visual
- [x] Accent is `#ef4444` (signal red)  
- [x] Type is Space Grotesk / Inter / Geist Mono  
- [x] Honeycomb is subtle and hero-scoped  
- [x] Nav / CTA grammar matches Praxis red fill on dark ink  

### Product
- [x] Docs are MDX + themed Scalar  
- [x] Playground is a real route + live Praxis API  
- [x] Methods lab is a first-class route  
- [x] App surfaces are first-class mid-page  
- [x] Learning path appears early in the landing beat  
- [x] Kitchen-sink / HTTP utilities available but not the marketing lead  
- [x] Copy/voice is Praxis.app + AsterIQ only  

---

## 9. Implementation status

| Phase | Scope | Status |
|---|---|---|
| Scaffold | Next.js TS + Tailwind + tokens + routes | **Shipped** |
| Marketing | Hero, start here, use cases, domains, anatomy, why, CTA, footer | **Shipped** |
| Practice surfaces | Playground (E1), use cases (E2), learning path (E3), methods lab (E5) | **Shipped** |
| Docs | MDX shell + Scalar + `/docs/try` | **Shipped** |
| Polish | Motion, a11y, mobile honeycomb performance | **Ongoing** |
| Backlog | Business data explorer (E4) | **Open** |

---

## 10. Copy direction

- **Product name:** Praxis.app (domain-style wordmark) — not PraxisAPP / praxis_app in UI  
- **Parent:** Built by AsterIQ.  
- **Promise:** Free practice APIs — auth, commerce, social, chat, business data. No keys to start on public routes.  
- **Primary CTAs:** Open Docs / Try Playground / Explore Methods  

---

## 11. Summary

**Praxis.app** is a cool-ink dark marketing site with hexagonal atmosphere and restrained glass: **MDX docs**, **Scalar API reference**, **live playground**, **HTTP methods lab**, **production-shaped app surfaces**, and a **learning path**.

Free for life. No site auth. No Redoc/Swagger on the marketing docs surface.

---

*Living product reference. Update this file when product decisions change.*
