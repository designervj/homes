# Homes — Enterprise Real Estate Advisory Platform

> A full-stack, production-grade real estate platform built to serve as both a high-conversion public property portal and a powerful internal CRM for agents. Designed as a scalable, white-label system adaptable for any real estate business.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Business Context & Analysis](#business-context--analysis)
- [Architecture Decisions](#architecture-decisions)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Database Schema Design](#database-schema-design)
- [Feature Modules](#feature-modules)
- [Development Phases](#development-phases)
- [Environment Setup](#environment-setup)
- [Design System](#design-system)
- [Current Project Status](#current-project-status)

---

## Project Overview

**Homes** is a white-label real estate SaaS platform — not a single-brand site. The architecture is built so that any real estate consultancy, broker, or property management firm can run their entire business on this system.

The platform serves two distinct audiences from one codebase and one database:

| Interface | Audience | Purpose |
|---|---|---|
| Public Portal | Property buyers, investors | Browse RERA-verified listings, enquire, book site visits |
| Admin Dashboard | Internal agents, admins | Manage properties, track leads, manage enquiries |

The immediate client is **Lucknow Homes** — a real estate consultancy in Lucknow, Uttar Pradesh — currently operating on a static WordPress site. This platform replaces that entirely with a dynamic, database-driven system.

---

## Business Context & Analysis

### What the Current Site Is

The existing WordPress site at `lucknowhomes.in` is a collection of static brochure pages with the following critical gaps identified during audit:

| Issue | Current State | Target State |
|---|---|---|
| Property pages | Manually built static WordPress pages | Dynamic SSR pages generated from MongoDB |
| New project onboarding | A developer manually builds a page | Admin fills a form → live in minutes |
| Enquiry forms | Email forwarding only — no database | Direct DB injection → CRM pipeline |
| RERA compliance | Missing entirely from all listings | Mandatory field, shown as a verified badge |
| Pricing | Hidden or absent | Structured, per-sqft, with GST flag |
| Site visit booking | Triggers a phone call | Scheduled slot with automated confirmation |
| Lead tracking | Zero — no system exists | Full pipeline: New → Contacted → Converted |
| Admin control | None | Full CRM dashboard for agents |
| SEO | Minimal | Structured data, OpenGraph, JSON-LD per property |
| Media management | Static WordPress uploads | Managed gallery per project |

### Current Property Portfolio

These are the 7 projects seeded as initial data:

| Project | Slug | Location | Type | Price |
|---|---|---|---|---|
| Okas Enclave | `okas-enclave` | Sushant Golf City | Plot | ₹56.25 Lac onwards |
| Attalika Palms | `attalika-palms` | Pursaini, opp. DLF Garden City | Villa | ₹65 Lac onwards |
| Stellar Okas Golf View | `stellar-okas-golf-view` | Sector-H, Sushant Golf City | Plot (Resale) | Up to ₹3.80 Cr |
| Kailasha Enclave | `kailasha-enclave` | Sultanpur Road, near IT City | Plot | ₹40 Lac onwards |
| Greenberry Signature | `greenberry-signature` | Vrindavan Yojana, Awas Vikas | Apartment | ₹5,200/sqft |
| Lavanya Enclave | `lavanya-enclave` | Amar Shaheed Path, Aurangabad | Apartment & Plot | ₹6,500/sqft |
| Vikas Vihar | `vikas-vihar` | Lucknow Metropolitan | Mixed | ₹30 Lac onwards |

### The One Principle That Makes This Scalable

Every schema, route, and component is built so that adding a new real estate business requires only:
1. A new admin account
2. Their properties entered via the admin form

No code changes required. That is what makes this **Homes** and not just a Lucknow site.

---

## Architecture Decisions

### Why Next.js App Router

- **Server Components by default** — heavy rendering stays on the server, not the user's browser
- **SSR for property pages** — buyers always see live availability and current pricing
- **SSG for static pages** — About, Services, Blog use static generation for maximum speed
- **Server Actions** — form submissions and data mutations happen without a separate REST API layer, reducing attack surface
- **SEO-critical** — property pages need to be indexable by Google for long-tail search queries like "resale plots Sushant Golf City Lucknow"

### Why MongoDB + Mongoose

Real estate data has no uniform structure. A commercial warehouse lease listing and a residential resale plot require entirely different fields. MongoDB's document model handles this naturally.

Key design patterns used:
- **Embedding** for static, always-queried data (amenities array, nearby places object, financials object)
- **Referencing** for unbounded relationships (leads reference propertyId, agents are referenced not embedded)
- **Discriminator pattern** on `propertyType` to handle plot vs apartment vs villa variations
- **Connection singleton** to prevent connection storming in serverless (Vercel/Lambda) environments

### Why ShadCN UI

Unlike monolithic component libraries (Material UI, Ant Design), ShadCN copies component source code directly into the project. This means:
- Full control over styling without fighting a library's internal logic
- Components are owned code, not a black-box dependency
- Tailwind utility classes work natively without overrides

### Clean Architecture Layers

```
UI Layer          →  React Server + Client Components
Application Layer →  Server Actions (business logic, validation)
Interface Layer   →  Data transformers, formatters
Infrastructure    →  Mongoose models, DB queries
```

Business logic never lives in a React component. This makes the codebase testable and the UI swappable.

---

## Technology Stack

| Category | Technology | Version | Reason |
|---|---|---|---|
| Framework | Next.js App Router | 15+ | SSR, Server Actions, SEO |
| Language | TypeScript | 5+ | Type safety across DB ↔ UI |
| Database | MongoDB (Atlas) | 7+ | Flexible schema for real estate data |
| ODM | Mongoose | 8+ | Schema modeling + validation |
| Styling | Tailwind CSS | 3+ | Utility-first, purged CSS |
| Components | ShadCN UI (Nova) | Latest | Accessible, ownable components |
| Authentication | NextAuth v5 (beta) | 5+ | App Router native, MongoDB adapter |
| Forms | React Hook Form + Zod | — | Validation at form + server layer |
| Tables | TanStack Table | v8 | Headless, sortable, filterable |
| Charts | Recharts | — | Lead analytics, conversion charts |
| Icons | Lucide React | — | Consistent icon system |
| Notifications | Sonner | — | Toast notifications |
| Slugs | Slugify | — | Clean URL generation for property pages |

---

## Folder Structure

```
homes/
├── src/
│   ├── app/
│   │   ├── (public)/                    # Public portal route group
│   │   │   ├── page.tsx                 # Homepage
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx             # All projects listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx         # Individual project page (SSR)
│   │   │   ├── services/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── blogs/page.tsx
│   │   │   └── contact/page.tsx
│   │   │
│   │   ├── (dashboard)/                 # Protected admin route group
│   │   │   ├── layout.tsx               # Dashboard shell (sidebar + header)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx             # Overview / analytics
│   │   │   │   ├── properties/          # Property CRUD
│   │   │   │   ├── leads/               # Kanban + detail
│   │   │   │   ├── enquiries/           # Raw form inbox
│   │   │   │   └── site-visits/         # Scheduled visits
│   │   │   └── auth/login/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── properties/route.ts
│   │   │   ├── leads/route.ts
│   │   │   └── enquiries/route.ts
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                          # ShadCN auto-generated components
│   │   ├── public/
│   │   │   ├── navigation/              # Navbar, ProjectsDropdown
│   │   │   ├── hero/                    # HeroSection, SearchBar
│   │   │   ├── properties/              # PropertyCard, SpecsTable, ReraBadge...
│   │   │   └── forms/                   # EnquiryForm, ContactForm
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── leads/                   # Kanban, Table, Card, StageSelector
│   │   │   ├── properties/              # PropertyTable, PropertyForm
│   │   │   └── analytics/               # StatsCards, ConversionChart
│   │   └── shared/
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── connection.ts            ✅ MongoDB singleton (anti-storming)
│   │   │   ├── models/
│   │   │   │   ├── Property.ts          ✅ Full attribute-sheet schema
│   │   │   │   ├── Lead.ts              ✅ 7-stage CRM pipeline
│   │   │   │   ├── Enquiry.ts           ✅ Raw form submissions
│   │   │   │   ├── User.ts              ✅ Admin + agent roles
│   │   │   │   └── SiteVisit.ts         ✅ Scheduling + outcomes
│   │   │   └── actions/                 # Server Actions (Phase 3)
│   │   ├── auth/config.ts               # NextAuth config (Phase 2)
│   │   └── utils/
│   │       ├── constants.ts             ✅ All enums, labels, formatters
│   │       ├── validators.ts            # Zod schemas (Phase 3)
│   │       └── formatters.ts            # Price, date formatters (Phase 3)
│   │
│   └── types/
│       └── index.ts                     ✅ All TypeScript interfaces
│
├── scripts/
│   └── seed.ts                          ✅ Seeds all 7 properties + admin user
│
├── .env.local                           # Environment variables (gitignored)
├── .env.example
├── tailwind.config.ts                   ✅ Custom navy + gold tokens
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema Design

Five MongoDB collections power the entire platform.

### 1. `properties` Collection ✅

Built directly from the Property Attribute Sheet. Covers all 6 data groups.

**Indexes:**
```
{ "location": "2dsphere" }                                         — Geo-queries
{ status, "specifications.propertyType", "financials.listedPrice"} — Search filter
{ "specifications.category", "specifications.transactionType", status } — Category
{ title, description, developerName, locality, city } TEXT         — Full-text search
{ isFeatured, status, createdAt }                                  — Featured listings
```

**Key design decisions:**
- `reraId` required when `reraRegistered: true`
- GeoJSON `Point` on `location.coordinates` for `$near` and `$geoWithin` queries
- `mediaAssets[]` with type discriminator: `image | floorplan | brochure | video | virtual_tour`
- `coverImage` and `formattedPrice` as computed virtual fields — not stored
- `slug` unique indexed for clean URL lookups (`/projects/okas-enclave`)

### 2. `leads` Collection ✅

**Pipeline stages:**
```
new → contacted → qualified → site_visit_scheduled → negotiation → converted → lost
```

**Indexes:**
```
{ stage, assignedTo, createdAt }   — Kanban board queries
{ propertyId, stage }              — Per-property lead reporting
{ source, stage }                  — Source analytics
{ phone }                          — Agent phone lookup
```

**Key design decisions:**
- `activityLog[]` records every agent action with timestamp + stage snapshot
- `closedAt` auto-set via pre-save middleware when stage → `converted` or `lost`
- `isActive` and `daysSinceCreated` computed as virtual fields

### 3. `enquiries` Collection ✅

Raw public form submissions. Deliberately separate from leads.

**Flow:** `Enquiry (new)` → agent reviews → `Enquiry (converted)` + `Lead (new)` created

### 4. `users` Collection ✅

Roles: `super_admin | admin | agent`

- Password stored as **bcrypt hash** (cost factor 12)
- `password` field has `select: false` — excluded from all queries by default
- `toJSON` transform strips password from all serialised output
- `initials` virtual computed from name

### 5. `siteVisits` Collection ✅

**Statuses:** `scheduled → completed | no_show | rescheduled | cancelled`

**Indexes:**
```
{ assignedAgentId, scheduledAt, status }  — Agent calendar view
{ propertyId, scheduledAt }               — Property visit history
{ scheduledAt, status }                   — Dashboard upcoming widget
```

---

## Feature Modules

### Public Portal

| Page | Route | Rendering | Description |
|---|---|---|---|
| Homepage | `/` | SSG | Hero, search, featured projects, services, CTA |
| All Projects | `/projects` | SSR | Filterable grid — type, location, budget |
| Project Detail | `/projects/[slug]` | SSR | Full specs, gallery, map, enquiry form |
| Services | `/services` | SSG | Buy, Site Visit, Loan Advisory |
| About | `/about` | SSG | Team, credentials |
| Contact | `/contact` | SSG | General enquiry form |

### Admin Dashboard

| Module | Route | Description |
|---|---|---|
| Overview | `/admin` | Stats cards, recent activity |
| Properties | `/admin/properties` | Sortable/filterable table + status toggle |
| Add Property | `/admin/properties/new` | Multi-step form — all 6 attribute groups |
| Edit Property | `/admin/properties/[id]` | Pre-populated form |
| Enquiry Inbox | `/admin/enquiries` | Review submissions, promote to lead |
| Leads Board | `/admin/leads` | Kanban pipeline |
| Lead Detail | `/admin/leads/[id]` | Activity log, contact, property |
| Site Visits | `/admin/site-visits` | Calendar + no-show tracking |
| Login | `/auth/login` | Admin authentication |

### Lead Capture Flow

```
Public form submitted
       ↓
Server Action validates (Zod)
       ↓
Writes to `enquiries` collection
       ↓
Agent reviews Enquiry Inbox
       ↓
"Convert to Lead" (one click)
       ↓
Lead created: stage = "new"
       ↓
Agent assigned → Pipeline begins
```

---

## Development Phases

| Phase | Focus | Status |
|---|---|---|
| **Phase 0** | Bootstrap — scaffold, folder structure, dependencies, ShadCN | ✅ Complete |
| **Phase 1** | Database — 5 Mongoose schemas, connection singleton, seed script | ✅ Complete |
| **Phase 2** | Auth + RBAC — NextAuth v5, protected routes, role middleware | 🔄 Next |
| **Phase 3** | Server Actions — all business logic (properties, leads, enquiries) | ⏳ Pending |
| **Phase 4** | CRM Dashboard — Kanban, tables, property management UI | ⏳ Pending |
| **Phase 5** | Public Portal — homepage, project pages, lead forms | ⏳ Pending |
| **Phase 6** | Analytics & Polish — charts, SEO, performance, mobile | ⏳ Pending |
| **Phase 7** | Data Migration — verify seed data, QA, deploy | ⏳ Pending |

---

## Environment Setup

### Prerequisites

- Node.js 20+
- Git
- MongoDB Compass (recommended)

### Installation

```bash
git clone <repo-url>
cd homes
npm install
cp .env.example .env.local
# fill in MONGODB_URI and NEXTAUTH_SECRET
npm run dev
```

### Seeding the Database

Add to `package.json`:
```json
"scripts": {
  "seed": "npx tsx scripts/seed.ts"
}
```

Then run:
```bash
npm run seed
```

Creates:
- Admin user: `admin@homes.in` / `Admin@Homes2025!`
- All 7 Lucknow properties with full schema data

> ⚠️ Change the default password immediately after first login.

### Environment Variables

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/homes
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Homes
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Design System

### Brand Palette

| Token | Hex | Usage |
|---|---|---|
| `--navy` | `#0B1521` | Primary background |
| `--navy-mid` | `#12202E` | Card surfaces |
| `--navy-light` | `#1A2E42` | Elevated surfaces |
| `--gold` | `#C9A96E` | Primary accent, CTAs |
| `--gold-light` | `#E2C99A` | Hover states, pricing |
| `--ivory` | `#F8F4EE` | Light section backgrounds |

### Typography

| Role | Font | Weights |
|---|---|---|
| Headlines | Playfair Display | 400, 500, 600, 700 |
| Body / UI | DM Sans | 300, 400, 500, 600 |

---

## Current Project Status

### ✅ Phase 0 — Complete
Next.js 15 + TypeScript + Tailwind + ShadCN (Nova/Zinc) scaffolded. Folder structure locked. Dependencies installed. Git baseline committed.

### ✅ Phase 1 — Complete

**Files to copy into your project:**

| Source | Destination |
|---|---|
| `connection.ts` | `src/lib/db/connection.ts` |
| `Property.ts` | `src/lib/db/models/Property.ts` |
| `Lead.ts` | `src/lib/db/models/Lead.ts` |
| `Enquiry.ts` | `src/lib/db/models/Enquiry.ts` |
| `User.ts` | `src/lib/db/models/User.ts` |
| `SiteVisit.ts` | `src/lib/db/models/SiteVisit.ts` |
| `constants.ts` | `src/lib/utils/constants.ts` |
| `index.ts` (types) | `src/types/index.ts` |
| `seed.ts` | `scripts/seed.ts` |

**After copying files, run:**
```bash
npm run seed
# Then verify in MongoDB Compass:
# Database: homes
# Collections: properties (7 docs), users (1 doc)
```

### 🔄 Up Next — Phase 2: Auth + RBAC

- NextAuth v5 with MongoDB adapter + credentials provider
- `middleware.ts` protecting `/admin/*`
- Session extended with `userId` and `role`
- `withRole()` guard for Server Actions
- Login page UI (ShadCN form)

---

## Contributing

1. All business logic → `src/lib/db/actions/` as Server Actions
2. New DB fields → add TypeScript interface in `src/types/index.ts`
3. New constants → `src/lib/utils/constants.ts`
4. New property attributes → must trace back to the Property Attribute Sheet
5. Passwords → bcrypt only, never plaintext, never in logs

---

*Built with Next.js 15, MongoDB Atlas, Tailwind CSS, and ShadCN UI.*
*Designed for scale — one codebase, any real estate business.*