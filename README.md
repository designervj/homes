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

These are the 7 projects currently listed — seeded as initial data:

| Project | Location | Type | Pricing |
|---|---|---|---|
| Okas Enclave | Sushant Golf City | Residential Plots | ₹5,000/sq.m. onwards |
| Attalika Palms | Pursaini, opp. DLF Garden City | Villas & Resale Plots | Starting ₹65 Lac |
| Stellar Okas Golf View | Sector-H, Sushant Golf City | Premium Plots (Resale) | Up to ₹3.80 Cr |
| Kailasha Enclave | Sultanpur Road, near IT City | Township Plots (Resale) | TBD |
| Greenberry Signature | Vrindavan Yojana, Awas Vikas | High-Rise Apartments | ₹5,200/sqft onwards |
| Lavanya Enclave | Amar Shaheed Path, Aurangabad | Apartments & Plots | ₹6,500/sqft onwards |
| Vikas Vihar | Lucknow Metropolitan | Mixed Residential | TBD |

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
| Components | ShadCN UI | Latest | Accessible, ownable components |
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
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── blogs/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/                 # Protected admin route group
│   │   │   ├── layout.tsx               # Dashboard shell (sidebar + header)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx             # Overview / analytics
│   │   │   │   ├── properties/
│   │   │   │   │   ├── page.tsx         # Property list table
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx     # Add property form
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Edit property
│   │   │   │   ├── leads/
│   │   │   │   │   ├── page.tsx         # Leads Kanban board
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Lead detail + activity log
│   │   │   │   ├── enquiries/
│   │   │   │   │   └── page.tsx         # Raw enquiry inbox
│   │   │   │   └── site-visits/
│   │   │   │       └── page.tsx         # Scheduled visits calendar
│   │   │   │
│   │   │   └── auth/
│   │   │       └── login/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts         # NextAuth handler
│   │   │   ├── properties/
│   │   │   │   └── route.ts
│   │   │   ├── leads/
│   │   │   │   └── route.ts
│   │   │   └── enquiries/
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx                   # Root layout (fonts, providers)
│   │
│   ├── components/
│   │   ├── ui/                          # ShadCN auto-generated components
│   │   │
│   │   ├── public/
│   │   │   ├── navigation/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── ProjectsDropdown.tsx
│   │   │   ├── hero/
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   └── SearchBar.tsx
│   │   │   ├── properties/
│   │   │   │   ├── PropertyCard.tsx
│   │   │   │   ├── PropertyGrid.tsx
│   │   │   │   ├── PropertyDetailHero.tsx
│   │   │   │   ├── SpecsTable.tsx
│   │   │   │   ├── AmenitiesGrid.tsx
│   │   │   │   ├── NearbyPlaces.tsx
│   │   │   │   └── ReraBadge.tsx
│   │   │   └── forms/
│   │   │       ├── EnquiryForm.tsx      # Sidebar form on property page
│   │   │       └── ContactForm.tsx      # Global contact / CTA form
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── leads/
│   │   │   │   ├── LeadsKanban.tsx
│   │   │   │   ├── LeadsTable.tsx
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   └── StageSelector.tsx
│   │   │   ├── properties/
│   │   │   │   ├── PropertyTable.tsx
│   │   │   │   └── PropertyForm.tsx
│   │   │   └── analytics/
│   │   │       ├── StatsCards.tsx
│   │   │       └── ConversionChart.tsx
│   │   │
│   │   └── shared/
│   │       ├── PageHeader.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── connection.ts            # Mongoose singleton (anti-storming)
│   │   │   ├── models/
│   │   │   │   ├── Property.ts          # Core property schema
│   │   │   │   ├── Lead.ts              # CRM lead schema
│   │   │   │   ├── Enquiry.ts           # Raw form submissions
│   │   │   │   ├── User.ts              # Admin + agent users
│   │   │   │   └── SiteVisit.ts         # Scheduled site visits
│   │   │   └── actions/
│   │   │       ├── property.actions.ts  # CRUD + search Server Actions
│   │   │       ├── lead.actions.ts      # Pipeline management Server Actions
│   │   │       ├── enquiry.actions.ts   # Form submission Server Actions
│   │   │       └── sitevisit.actions.ts
│   │   │
│   │   ├── auth/
│   │   │   └── config.ts                # NextAuth v5 configuration
│   │   │
│   │   └── utils/
│   │       ├── formatters.ts            # Price, area, date formatters
│   │       ├── validators.ts            # Zod schemas (shared)
│   │       └── constants.ts             # Enums, stage labels, property types
│   │
│   └── types/
│       ├── property.ts                  # IProperty, IPropertyFilters
│       ├── lead.ts                      # ILead, LeadStage enum
│       ├── user.ts                      # IUser, UserRole enum
│       └── index.ts                     # Re-exports
│
├── .env.local                           # Environment variables (gitignored)
├── .env.example                         # Template for onboarding
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema Design

Five MongoDB collections power the entire platform. Every schema decision is documented with its rationale.

### 1. `properties` Collection

The most complex schema. Built directly from the Property Attribute Sheet covering all 6 data groups.

**Key design decisions:**
- `propertyType` as a discriminator: `plot | apartment | villa | commercial`
- GeoJSON `Point` on `location.coordinates` for geospatial queries
- `reraId` is a required field — not optional
- All financials as a nested object (prevents document sprawl)
- `nearbyPlaces` embedded (always queried with property, never independently)
- `mediaAssets[]` array for images, floor plans, virtual tour URLs
- `status` lifecycle: `active → blocked → sold → archived`
- `slug` field for clean URLs: `/projects/okas-enclave`

**Attribute groups covered:**
- Property Identity (category, type, BHK, furnishing, age, possession, facing, floor)
- Size & Layout (built-up, carpet, super built-up, plot area, dimensions, parking)
- Pricing & Financials (listed price, price/sqft, maintenance, brokerage, stamp duty, GST)
- Features & Amenities (society amenities, water supply, power, Vastu, gated community)
- Legal & Ownership (RERA ID, title clearance, OC, CC, encumbrance, bank approvals)
- Brokerage & Policy (listed by, contact preference, site visit availability, virtual tour)

### 2. `leads` Collection

Created every time an enquiry is manually converted by an agent. References `propertyId`.

**Pipeline stages (enum):**
```
new → contacted → qualified → site_visit_scheduled → negotiation → converted → lost
```

**Key fields:**
- `source`: `website | whatsapp | 99acres | magicbricks | referral | walkin`
- `interestedIn[]`: site visit, home loan (from form checkboxes)
- `assignedTo`: agent user `_id`
- `activityLog[]`: timestamped timeline of every agent action
- `score`: integer (manual or computed lead quality score)

### 3. `enquiries` Collection

Raw form submissions from every public page. Separate from leads deliberately — not all enquiries become tracked leads. An agent reviews the inbox and promotes an enquiry to a lead with one click.

**Key fields:**
- `propertyId` (optional — general contact forms have no property reference)
- `interestedIn[]`: site visit, home loan
- `status`: `new | reviewed | converted | spam`
- `convertedLeadId`: populated when agent promotes to lead

### 4. `users` Collection

Two roles for now: `admin` and `agent`.

- Admins manage everything — all properties, all leads, all enquiries
- Agents are assigned leads and update pipeline stages
- Password stored as bcrypt hash — never plaintext
- `isActive` flag for deactivating accounts without deletion

### 5. `siteVisits` Collection

Created when a lead reaches `site_visit_scheduled`. References the lead, property, and assigned agent.

**Key fields:**
- `scheduledAt`: datetime of the visit
- `status`: `scheduled | completed | no_show | rescheduled`
- `agentNotes`: free text from the visiting agent post-visit
- `outcome`: `positive | neutral | negative | converted`

### Index Strategy

| Collection | Index | Type | Purpose |
|---|---|---|---|
| properties | `location` | 2dsphere | Geo-queries (within radius) |
| properties | `{status, propertyType, 'financials.listedPrice'}` | Compound | Search filtering |
| properties | `slug` | Unique | URL-based lookups |
| leads | `{stage, assignedTo}` | Compound | Kanban board queries |
| leads | `{propertyId, stage}` | Compound | Per-property lead reporting |
| enquiries | `{status, createdAt}` | Compound | Inbox sorting |
| users | `email` | Unique | Auth lookups |

---

## Feature Modules

### Public Portal

| Page | Route | Rendering | Description |
|---|---|---|---|
| Homepage | `/` | SSG | Hero, search, featured projects, services, CTA |
| All Projects | `/projects` | SSR | Filterable grid — type, location, budget, status |
| Project Detail | `/projects/[slug]` | SSR | Full property page — specs, gallery, map, enquiry form |
| Services | `/services` | SSG | Buy, Site Visit, Loan Advisory |
| About | `/about` | SSG | Team, credentials, company story |
| Contact | `/contact` | SSG | General enquiry form |

### Admin Dashboard

| Module | Route | Description |
|---|---|---|
| Overview | `/admin` | Stats cards, recent activity, quick actions |
| Properties | `/admin/properties` | Full property table — sortable, filterable, status toggle |
| Add Property | `/admin/properties/new` | Multi-step form covering all 6 attribute groups |
| Edit Property | `/admin/properties/[id]` | Same form, pre-populated |
| Enquiry Inbox | `/admin/enquiries` | Raw form submissions, mark reviewed, promote to lead |
| Leads Board | `/admin/leads` | Kanban pipeline — drag-to-move stages |
| Lead Detail | `/admin/leads/[id]` | Full activity log, contact details, property reference |
| Site Visits | `/admin/site-visits` | Scheduled visits calendar + no-show tracking |
| Login | `/auth/login` | Admin authentication |

### Lead Capture Flow

```
Public form submitted
       ↓
Server Action validates with Zod
       ↓
Writes to `enquiries` collection (immediate)
       ↓
Agent reviews in Enquiry Inbox
       ↓
Agent clicks "Convert to Lead"
       ↓
Lead document created with stage = "new"
       ↓
Agent assigned → Pipeline begins
```

---

## Development Phases

| Phase | Focus | Status |
|---|---|---|
| **Phase 0** | Bootstrap — scaffold, folder structure, dependencies | ✅ Complete |
| **Phase 1** | Database — all 5 Mongoose schemas + connection singleton | 🔄 Next |
| **Phase 2** | Auth + RBAC — NextAuth v5, protected routes, role middleware | ⏳ Pending |
| **Phase 3** | Server Actions — all business logic before any UI | ⏳ Pending |
| **Phase 4** | CRM Dashboard — Kanban, tables, property management | ⏳ Pending |
| **Phase 5** | Public Portal — homepage, project pages, lead forms | ⏳ Pending |
| **Phase 6** | Analytics & Polish — charts, SEO, performance, mobile | ⏳ Pending |
| **Phase 7** | Data Migration — seed all 7 current projects, import leads | ⏳ Pending |

---

## Environment Setup

### Prerequisites

- Node.js 20+
- Git
- MongoDB Compass (recommended for visual DB inspection)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd homes

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your values (see below)

# 4. Run development server
npm run dev
```

### Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/homes

# Authentication
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# App Config
NEXT_PUBLIC_APP_NAME=Homes
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database

- **Provider:** MongoDB Atlas
- **Database name:** `homes`
- **Connection:** Singleton pattern in `src/lib/db/connection.ts` — prevents connection storming in serverless environments by caching the Mongoose connection in the Node.js global namespace

---

## Design System

### Brand Identity

| Token | Value | Usage |
|---|---|---|
| `--navy` | `#0B1521` | Primary background |
| `--navy-mid` | `#12202E` | Card surfaces |
| `--navy-light` | `#1A2E42` | Elevated surfaces |
| `--gold` | `#C9A96E` | Primary accent, CTAs, badges |
| `--gold-light` | `#E2C99A` | Hover states, pricing |
| `--gold-pale` | `#F5ECD9` | Subtle backgrounds |
| `--ivory` | `#F8F4EE` | Light section backgrounds |

### Typography

| Role | Font | Weight |
|---|---|---|
| Display / Headlines | Playfair Display | 400, 500, 600, 700 |
| Body / UI | DM Sans | 300, 400, 500, 600 |

### Component Conventions

- **RERA badges** always rendered in green (`#6EE7B7` on dark) — compliance as a trust signal
- **Pricing** shown on every property card — transparency is a brand value
- **Lead capture forms** — site visit and home loan interest captured as checkboxes on every property page
- **Server Actions** handle all form submissions — no client-side API calls for mutations

---

## Current Project Status

**Phase 0 — Complete ✅**

- Next.js 15 App Router scaffolded with TypeScript + Tailwind
- ShadCN UI initialised with Nova preset (Lucide / Geist), Zinc base color
- All dependencies installed
- Folder structure created
- `.env.local` configured with MongoDB URI and NextAuth secret
- `tailwind.config.ts` updated with custom navy + gold tokens
- Baseline committed to Git

**Up Next — Phase 1: Database Layer**

Building all 5 Mongoose schemas with full TypeScript interfaces:
- `Property` model — 6 attribute groups, GeoJSON, RERA required field
- `Lead` model — 7-stage pipeline enum, activity log
- `Enquiry` model — raw form submissions
- `User` model — admin + agent roles, bcrypt auth
- `SiteVisit` model — scheduling, outcomes
- MongoDB connection singleton — serverless-safe
- Seed script — all 7 current projects as initial data

---

## Contributing

This is an active development project. Before making changes:

1. Check the current phase in the table above
2. All business logic goes in `src/lib/db/actions/` as Server Actions — never in components
3. All new MongoDB fields must have a corresponding TypeScript type in `src/types/`
4. Component naming: PascalCase, co-located with their styles
5. Every new property attribute must trace back to the Property Attribute Sheet

---

*Built with Next.js, MongoDB, Tailwind CSS, and ShadCN UI.*
*Designed for scale — one codebase, any real estate business.*