# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Green House Real Estate Platform** - A Next.js 15 real estate website for the Polish market that syncs property listings from the Asari API, provides advanced search and filtering, integrates with Google Maps, and manages content via Sanity CMS.

**Tech Stack:** Next.js 15 (App Router, Turbopack), TypeScript, React 19, Prisma + PostgreSQL, Tailwind CSS, Radix UI (shadcn/ui), Sanity CMS, Google Maps API

## Development Commands

### Core Development
```bash
npm run dev              # Start dev server with Turbopack (localhost:3000)
npm run build            # Production build
npm start                # Start production server
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting without writing
```

### Testing
```bash
npm test                 # Run all Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:ci          # Run tests in CI (starts dev server first)
```

### Database (Prisma)
```bash
npx prisma migrate dev   # Create and apply migration
npx prisma generate      # Generate Prisma Client types
npx prisma studio        # Open Prisma Studio GUI
npx prisma db push       # Push schema changes without migration
```

### Admin Operations
Sync data from Asari API by calling these endpoints:
- `POST /api/admin/sync-asari` - Sync all listings
- `POST /api/admin/sync-agents` - Sync agent information
- `POST /api/admin/reset-and-sync` - Full reset and sync

## Architecture & Key Patterns

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
  - Route groups: `(homepage)/` for root page
  - Pages: `nieruchomosci/` (listings), `blog/`, `agenci/` (agents), etc.
  - `api/` - RESTful API endpoints
- `src/components/` - React components
  - `ui/` - Radix UI primitives (28+ components)
  - `layout/`, `search/`, `listings/` - Domain-specific components
- `src/lib/` - Utilities, hooks, filters, helpers
- `src/services/` - External API clients (Asari, Prisma singleton)
- `src/types/` - Shared TypeScript type definitions
- `src/sanity/` - Sanity CMS client configuration
- `prisma/` - Database schema

### Server Components & Data Fetching
- **Default pattern:** Use Server Components for data fetching (no `"use client"` needed)
- **Client components:** Only mark with `"use client"` when using hooks, state, or event handlers
- Data fetching happens directly in page components using async/await with Prisma
- Example: `src/app/nieruchomosci/page.tsx` fetches listings with complex filters server-side

### Database (Prisma + PostgreSQL)
**Critical Models:**
- `Listing` - Property listings with normalized location fields, price, area, rooms, etc.
  - Relations: `agentId → Agent`, `images → ListingImage[]`
  - Key fields: `asariId` (unique), `slug` (unique), `isVisible`, `asariStatus`
  - Indexes on: `city`, `propertyTypeId`, `price`, `area`, `slug`
- `Agent` - Real estate agents with contact info and bio
  - Relations: `listings → Listing[]`
  - Key fields: `asariId` (unique), `slug` (unique), `isActive`
- `ListingImage` - Property photos with multiple resolution URLs
  - Cascade deletes when listing is removed
  - Fields: `urlThumbnail`, `urlNormal`, `urlOriginal`, `order`, `isScheme`
- `DictionaryValue` - Translated enum values for filters
- `I18nMessage` - UI text translations

**Prisma Singleton:** Use `import { prisma } from '@/services/prisma'` to avoid connection leaks in serverless environment.

### Asari API Integration
All communication with Asari API goes through `src/services/asariApi.ts`:
- `fetchExportedListingIds()` - Get all available listing IDs
- `fetchListingDetails(listingId)` - Fetch full details for a listing
- `fetchUserList()` - Get all agents

**Data Flow:**
1. Admin endpoint triggers sync (`/api/admin/sync-asari`)
2. Fetches listing IDs from Asari
3. For each ID, fetches full details and transforms to Prisma models
4. Normalizes location data (city/district formatting)
5. Generates SEO-friendly slugs: `[type]/[kind]/[rooms]/[city]/[district]/[id]`
6. Upserts to PostgreSQL with cascade relations

**Type Safety:** Comprehensive types in `asariApi.types.ts` (300+ lines) map Asari response structure to internal models.

### Search & Filtering Architecture
**URL-Driven State:**
- All search criteria stored in URL query parameters
- Enables bookmarkable searches and browser back/forward
- Example: `/nieruchomosci?kind=sale&city=Częstochowa&priceMin=100000&priceMax=500000&sort=price-asc`

**Query Building:**
- `buildQueryParams()` in `src/lib/search/` constructs URLSearchParams from search state
- Server components parse params and build Prisma `where` clauses
- Range filters support min/max (price, area, rooms, floor, buildYear)
- Location filters: city, district, street
- Sort options: newest, price-asc, price-desc, area-asc, area-desc

**Custom Hooks:**
- `useRange()` - Manages min/max range inputs with local state and formatting
  - Parses human input: "500k" → 500000, "2 mln" → 2000000
  - Formats with Polish number spacing
  - Debounces updates to parent
  - Arrow key navigation with Shift multiplier

### Google Maps Integration
- API endpoint: `/api/places/autocomplete` proxies Google Places API
- Used in `LocationCombobox` component for address autocomplete
- Extracts address components (city, district, street, postal code)
- Builds location filters for listing search

### Sanity CMS
- Configuration in `src/sanity/client.ts`
- Content types: Blog articles, Agent profiles
- Used for blog posts (`/blog/[slug]`) and agent biographies
- projectId: `w86o34sf`, dataset: `production`

### Type Definitions
- `src/types/api.types.ts` - API response types for listings
- `src/types/listing.types.ts` - Property details interface
- `src/services/asariApi.types.ts` - Complete Asari API type definitions
- Always use strongly typed responses, avoid `any`

### Utility Functions (`src/lib/utils.ts`)
- `cn()` - Merge Tailwind classes (clsx + tailwind-merge)
- `formatPrice(price)` - Format as Polish currency (PLN)
- `formatFloor(floor)` - Polish floor labels (Parter = Ground floor)
- `formatAddedByAgentAgo(date, agentName)` - Human-readable time with gendered Polish verbs
- `generateListingSlug(listing)` - Creates SEO-friendly slugs
- `parseKind(value)` - Type-safe 'sale' | 'rent' parsing

### Location Utilities (`src/lib/filters/addressFilters.ts`)
- `normalize()` - Unicode normalization for Polish characters
- `addressKeyForDedup()` - Generate deduplication keys
- `buildLabelFromComponents()` - Reconstruct address from Google Places
- District normalization utilities in `src/lib/utils/district-normalization.ts`

### Component Architecture
**Radix UI Foundation:** 28+ accessible, unstyled primitives (Dialog, Dropdown, Tabs, Select, Slider, etc.)

**Domain Components:**
- **Search:** `SearchTabs`, `LocationCombobox`, `PriceRangeField`, `AreaRangeField`, `DualRange`
- **Listings:** `ListingRow`, `ListingGallery`, `ListingDetails`, `ListingTopInfo`
- **Agents:** `AgentCard`, `AgentAvatar`, `AgentListingsKindSwitch`, `AgentSidebar`
- **Layout:** `Header`, `Footer`, `HeroSection`, `Breadcrumbs`, `Pagination`
- **Specialized:** `PhotoCarousel` (Embla), `Lightbox` (yet-another-react-lightbox), `HtmlContent` (DOMPurify)

### Styling
- **Tailwind CSS** with v4.1.11 (uses `@tailwindcss/postcss`)
- **shadcn/ui** for component patterns
- Use `cn()` utility from `src/lib/utils.ts` to compose classes
- Components use `class-variance-authority` for variant props

### Polish Localization
- All user-facing text in Polish
- Number formatting with spaces: `1 000 000 PLN`
- Gendered verb conjugations in time formatting
- District name normalization for consistent display
- Currency symbol: `zł` (Polish złoty)

### Testing
- **Jest** with `ts-jest` for TypeScript support
- **Supertest** for API endpoint testing
- Test organization mirrors source structure
- Run `npm run test:ci` to start dev server before tests
- Tests cover: API endpoints, filter logic, query parsing, utilities

### Image Optimization
- Use Next.js `<Image>` component for all images
- Whitelisted remote patterns in `next.config.ts`:
  - `img.asariweb.pl` - Asari property images
  - `cdn.sanity.io` - Sanity CMS assets
- Component: `AgentImage` handles Asari CDN URLs with fallbacks

## Code Style Guidelines (from .cursorrules)

### Guiding Principles
- Components must be modular and reusable
- Code should be simple, readable, and follow project conventions
- Avoid over-engineering — prefer clarity over cleverness
- If unclear, choose the simplest solution and state assumptions

### File Editing
- Match existing style of surrounding code
- Do not change styling or code outside relevant lines
- Never add license/copyright headers unless requested
- Add comments only for non-obvious logic

### Server vs Client Components
- Use Server Components by default
- Only add `"use client"` when using state, effects, or event handlers
- Keep routing and API in `src/app/**`
- Shared UI components go in `src/components/**`

### Database Access
- Access database only via Prisma (no raw SQL)
- All schema changes use `prisma migrate`
- Rely on generated types from `@prisma/client`

### Types
- Store shared types in `src/types/**`
- Avoid `any` - use precise, exported types
- Leverage discriminated unions for offer types

### Environment Variables
- Store configuration in `.env.local` only
- Never commit secrets
- Validate `process.env` on startup

### Accessibility
- Include `alt` text for images
- Ensure focus states on interactive elements
- Use semantic HTML elements

### Pull Requests
- Keep PRs small and atomic
- Describe impact and scope clearly
- Ensure linter passes before submitting

## Common Development Tasks

### Adding a New Listing Filter
1. Add query param to `SearchParams` type
2. Update `buildQueryParams()` in `src/lib/search/`
3. Add filter UI component in `src/components/search/`
4. Update Prisma query in `src/app/nieruchomosci/page.tsx`
5. Add tests for filter logic

### Creating a New Page
1. Create directory in `src/app/[page-name]/`
2. Add `page.tsx` with default export Server Component
3. Create route-specific components in `src/components/[page-name]/`
4. Update navigation in `Header` component if needed
5. Add breadcrumb logic if applicable

### Adding an API Endpoint
1. Create route handler in `src/app/api/[endpoint]/route.ts`
2. Export named functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use Prisma for database queries via singleton
4. Return `NextResponse.json()` with typed response
5. Add error handling with proper status codes
6. Write integration tests in `src/tests/api/`

### Syncing Data from Asari
1. Ensure environment variables are set (Asari credentials)
2. Call sync endpoint: `POST /api/admin/sync-asari`
3. Monitor response for errors or skipped items
4. Check Prisma Studio to verify data

### Updating Prisma Schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name [description]`
3. Commit both schema and migration files
4. Update affected type definitions in `src/types/`
5. Regenerate client: `npx prisma generate`

### Adding a New UI Component
1. Check if shadcn/ui has the primitive needed
2. If yes: `npx shadcn@latest add [component]` to add to `src/components/ui/`
3. If custom: create in appropriate domain folder (`search/`, `listings/`, etc.)
4. Use TypeScript with explicit props interface
5. Compose styles with `cn()` utility
6. Add `"use client"` only if using hooks or event handlers

## API Endpoints Reference

### Public Endpoints
- `GET /api/listing` - Paginated listings with filters
- `GET /api/listing/[id]` - Single listing details
- `GET /api/listings/bounds` - Min/max price and area for filters
- `GET /api/listings/count` - Total listing count with filters
- `GET /api/listings/cities-count` - Listing counts by city
- `GET /api/listings/districts-count` - Listing counts by district
- `GET /api/agents` - All active agents
- `GET /api/agents/[slug]` - Agent details with listings and articles
- `GET /api/places/autocomplete` - Google Places autocomplete (address search)
- `POST /api/valuation` - Property valuation estimation

### Admin Endpoints
- `POST /api/admin/sync-asari` - Sync listings from Asari API
- `POST /api/admin/sync-agents` - Sync agents from Asari API
- `POST /api/admin/reset-and-sync` - Full database reset and sync

## Key Files Reference

### Configuration
- `next.config.ts` - Next.js configuration (image domains, etc.)
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript compiler options (path aliases: `@/*` → `src/*`)
- `jest.config.ts` - Jest testing configuration
- `eslint.config.mjs` - ESLint + Prettier rules
- `components.json` - shadcn/ui configuration
- `prisma/schema.prisma` - Database schema

### Core Application
- `src/app/layout.tsx` - Root layout with Header/Footer
- `src/app/nieruchomosci/page.tsx` - Main listings page with complex filtering
- `src/services/asariApi.ts` - Asari API client
- `src/services/prisma.ts` - Prisma singleton instance
- `src/lib/utils.ts` - Core utility functions

### Types
- `src/types/api.types.ts` - API response types
- `src/types/listing.types.ts` - Property details interface
- `src/services/asariApi.types.ts` - Asari API types (comprehensive)

## Important Notes

### Performance
- Server Components reduce bundle size and improve initial load
- Use Suspense boundaries for progressive rendering
- Images optimized via Next.js `<Image>` with CDN whitelisting
- Prisma queries use indexes for efficient filtering

### Security
- API keys and secrets stored in `.env.local` only
- Server Components keep sensitive operations secure
- DOMPurify sanitizes user-generated HTML content
- Prisma prevents SQL injection via parameterized queries

### Data Consistency
- `asariId` is the source of truth for listings and agents
- Slug generation is deterministic (same input = same slug)
- Cascade deletes ensure referential integrity
- `isVisible` flag for soft deletes (don't hard delete listings)

### Deployment
- Optimized for Vercel deployment
- Uses Prisma Accelerate for connection pooling
- Environment variables must be configured in hosting platform
- Speed Insights integrated for performance monitoring
