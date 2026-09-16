I will ask you in English, But, always answer in Myanmar Language.
Only when i type 'Build Now', add, update or remove the necessary file.

# AGENTS.md — Readora Project Guide for Codex

## 1. Purpose

Readora is a personalized digital reading and audiobook platform. Users can read PDF books, listen to audiobooks, save and resume reading/listening progress, manage favorites, leave reviews, receive personalized recommendations, and optionally activate a mock premium subscription for access to premium books.

---

## 2. Project Overview

### Product

Readora is a personalized digital library application with:

- React Native mobile reader app
- Spring Boot REST API backend
- PostgreSQL database
- Cloudinary storage for book covers, PDFs, and audio
- Email service for verification and password reset
- Next.js admin dashboard
- Next.js landing page

### Current Development State

Backend development is largely complete through testing.

Important roadmap context:

- Current focus: React Native Mobile App.
- The mobile app is intentionally mid-level, polished, and maintainable rather than deeply native or highly advanced.
- Advanced background audio, offline content, push notifications, real payments, and advanced mobile animations are intentionally out of scope for this version.

---

## 3. Core Product Rules

### Authentication

Users may authenticate using:

- Email/password
- Google authentication

Traditional accounts:

- start as unverified
- must verify email before entering the main app
- may resend verification email
- may use forgot/reset password flows

Google users:

- are treated as email-verified when backend authentication succeeds
- must complete interest selection when required

### Roles

System roles:

- `USER`
- `ADMIN`

Premium is NOT a role.

Subscription state is separate from roles.

Possible subscription statuses include:

- `NONE`
- `ACTIVE`
- `EXPIRED`
- `CANCELLED`

### Interests

Users select multiple reading interests.

Interests are used by the backend recommendation system.

Users may update interests later.

### Books

A book may:

- have a PDF only
- have audio only
- have both PDF and audio

Book status:

- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

Book access type:

- `FREE`
- `PREMIUM`

Only published books are visible in the user-facing app.

### Access Rules

Verified normal users:

- may access published FREE books

Users with active premium subscription:

- may access published FREE and PREMIUM books

Expired or cancelled subscriptions:

- do not grant premium access according to backend rules

The backend is always the final authority for access control.

The mobile app may hide or disable UI controls for better UX, but must never assume frontend checks are sufficient for authorization.

### Favorites

Verified users may:

- add visible books to favorites
- remove books from favorites

The same book must not appear more than once in a user's favorites.

### Reading Progress

PDF reading progress stores:

- current page
- total pages
- completion state
- last accessed time

Users can resume reading from the last saved page.

Reading progress must be saved without sending excessive requests.

Use debounce/throttle or meaningful progress update timing.

### Listening Progress

Listening progress stores:

- current seconds
- duration seconds
- completion state
- last accessed time

Users can resume from the last saved listening position.

Reading and listening progress are independent.

### Reviews

Verified users may review visible books.

Rules:

- rating must be 1–5
- review comment is optional
- one review per user per book
- users may edit/delete only their own review
- reading/listening the book first is NOT required
- reviews do NOT affect recommendations

### Recommendations

Recommendation backend is already implemented.

Recommendation signals include:

- selected interests
- previously read book categories
- favorite book categories
- popularity
- freshness / recently added books

Do not replace the current recommendation system with AI/ML unless explicitly requested.

### Premium

Premium is mock/demo only.

Plans:

- `MONTHLY`
- `YEARLY`

The mobile flow may include:

- plan selection
- mock checkout
- confirmation
- activation
- cancellation
- subscription history

Do not integrate Stripe, Apple IAP, Google Play Billing, or another real payment system unless explicitly requested.

---

# PART A — REACT NATIVE MOBILE APP

## 5. Mobile Technology Stack

Preferred stack:

- React Native
- Expo
- TypeScript
- Expo Router
- NativeWind
- Axios
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Expo SecureStore
- Expo Image

Use stable packages unless there is a strong project-specific reason not to.

Avoid adding libraries when an existing dependency already solves the problem.

---

## 6. Mobile Scope

The mobile app should include:

- authentication
- email verification
- forgot/reset password
- Google authentication
- interest onboarding
- Home
- personalized recommendations
- search and discovery
- filters and sorting
- book detail
- favorites
- personal library
- PDF reader
- reading progress + resume
- audio player
- listening progress + resume
- reviews and ratings
- mock premium
- profile/account management

Explicitly out of scope unless requested:

- real payment gateways
- offline PDF downloads
- offline audio downloads
- offline-first synchronization
- advanced background audio service
- lock-screen media controls
- Android Auto / CarPlay
- push notifications
- social feed
- messaging/chat
- DRM
- advanced animation-heavy UI
- AI/ML recommendation replacement
- microservices
- Kubernetes

### Cards

Book cards should remain visually clean.

Common book card content:

- cover
- title
- author
- rating when relevant
- FREE / PREMIUM badge when relevant

Avoid excessive shadows, gradients, or oversized rounded corners.

### Logo

Do not rely on one baked PNG containing both logo and wordmark for every UI use.

Preferred approach:

- reusable logo mark asset
- render `Readora` wordmark as text where appropriate
- keep branding responsive and theme-friendly

If SVG assets are available, prefer them for scalable in-app logo marks.

---

## 8. Mobile Navigation

Primary bottom navigation:

- Home
- Search
- Library
- Profile

Do not add extra bottom tabs unless there is a clear product reason.

## 10. Mobile State Management Rules

Use TanStack Query for server state.

Examples:

- books
- categories
- recommendations
- favorites
- profile
- reviews
- subscriptions
- reading/listening progress
- library

Use Zustand only for small client-owned global state.

Examples:

- authentication/session
- small player state if needed
- lightweight UI state if truly global

Do NOT mirror all API data into Zustand.

Use React Hook Form for forms.

Use Zod for form validation where appropriate.

---

## 11. Mobile API Rules

Use one centralized Axios instance.

It should handle:

- base URL
- timeout
- authorization header
- standardized errors
- token refresh
- retrying the original request when appropriate

Preferred generic response type:

```ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

Respect the backend's actual response contract.

Do not silently invent fields.

### Token Handling

Use Expo SecureStore for sensitive persistent tokens.

Do not store refresh tokens in plain AsyncStorage.

Typical flow:

```text
App Start
→ read refresh token
→ refresh access token if needed
→ fetch /api/users/me
→ route based on session / verification / onboarding state
```

Avoid multiple simultaneous refresh calls.

If multiple requests receive 401 at the same time, implement a safe refresh strategy rather than refreshing independently for every request.

---

## 12. Mobile Authentication Flow

Traditional user:

```text
Register
→ account unverified
→ verification required
→ verified
→ interest onboarding if needed
→ Home
```

Login:

```text
Login
→ check backend/session state
→ if unverified: verification screen
→ if interests missing: onboarding
→ else Home
```

Google user:

```text
Google sign in
→ obtain ID token
→ POST to backend Google auth endpoint
→ if onboarding required: interests
→ else Home
```

Do not bypass backend verification rules in the client.

---

## 26. Backend Authorization

Enforce on the backend:

- authentication
- email verification
- admin-only access
- premium book access
- user-owned resource modification

Never weaken backend access because the mobile app hides a button.

The backend remains authoritative.

---

## 27. Backend Database Rules

Main domain tables include concepts equivalent to:

- users
- email verification tokens
- password reset OTPs
- categories
- user interests
- books
- book categories
- favorites
- reading progress
- listening progress
- reviews
- subscriptions
- refresh tokens

Respect existing migrations/schema.

Do not casually rename columns or tables.

If schema changes are needed:

- explain why
- make changes minimal
- update migrations/schema consistently
- consider existing data

---

## 28. Backend Book Storage

Cloudinary stores:

- cover images
- PDF files
- audio files

PostgreSQL stores:

- resource URLs
- Cloudinary public IDs

When replacing/deleting Cloudinary resources, ensure cleanup behavior is correct.

Do not leave orphaned Cloudinary resources where avoidable.

---

## 29. Backend Search

Book discovery should remain backend-controlled.

Filters may include:

- search
- category
- access type
- sort
- page
- size

Do not move search/filter business logic into the mobile client.

---

## 30. Backend Recommendation System

The backend recommendation system already exists.

Do not rebuild it in React Native.

Do not compute recommendation scoring in the client.

Mobile must consume the recommendation API.

Current conceptual scoring uses signals such as:

- interest category match
- reading-history category match
- favorite category match
- popularity
- newness

Keep the backend as the source of truth.

---

## 36. NativeWind Rules

Use NativeWind for common styling.

Prefer:

```tsx
<View className="flex-1 bg-background px-5">
```

over large inline style objects.

Use inline styles only for:

- dynamic runtime values difficult to express in NativeWind
- native-library requirements
- measured dimensions
- animation values

Do not scatter arbitrary hex colors across screens.

Use theme/constants.

---

## 37. Naming

Use consistent names.

Examples:

Components:

```text
BookCard.tsx
SectionHeader.tsx
EmptyState.tsx
```

Hooks:

```text
useAuth.ts
useBooks.ts
useDebouncedValue.ts
```

API:

```text
auth.api.ts
books.api.ts
reviews.api.ts
```

Stores:

```text
auth-store.ts
player-store.ts
```

Schemas:

```text
login.schema.ts
register.schema.ts
review.schema.ts
```

Types:

```text
book.types.ts
auth.types.ts
subscription.types.ts
```

Follow existing repository naming if already established.

---

## 38. Error Handling

Never silently swallow errors.

Normalize API errors.

User-facing errors should be understandable.

Developer-facing errors may include context, but never log secrets.

Never log:

- passwords
- access tokens
- refresh tokens
- OTPs
- sensitive personal data

---

## 39. Security

Never commit:

- secrets
- API keys
- private credentials
- production tokens

Use environment variables.

Do not hardcode production URLs in feature code.

Do not weaken backend security for convenience.

Do not expose Cloudinary/admin secrets to the mobile client.

---

### Local Registration Flow

```text
Register
→ Verify Email
→ Choose Interests
→ Home
→ Search
→ Open Free Book
→ Read
→ Save Progress
→ Favorite
→ Review
```

### Existing User Flow

```text
Login
→ Restore Session
→ Continue Reading
→ Continue Listening
```

### Premium Flow

```text
Normal User
→ Premium Book
→ Upgrade
→ Activate Subscription
→ Access Premium Book
→ Cancel
```

### Password Recovery

```text
Forgot Password
→ OTP
→ Reset Password
→ Login
```

### Google Flow

```text
Google Login
→ New User
→ Interests
→ Home
```

---

# PART E — AGENT WORKFLOW

## 41. Before Writing Code

Codex should:

1. inspect relevant files
2. inspect existing types/API helpers/components
3. understand current architecture
4. avoid duplicating existing utilities
5. identify backend endpoint contract when integrating API
6. identify whether the task belongs to current scope

Do not start by generating large amounts of new code without inspecting existing project code.

---

## 42. During Implementation

Prefer incremental implementation.

For a feature:

```text
types
→ API function
→ query/mutation hook
→ UI component
→ screen integration
→ states/errors
→ test
```

Do not build the entire project in one giant change.

---

## 43. After Implementation

Codex should summarize:

- files changed
- what was implemented
- important design decisions
- tests/checks run
- anything still incomplete
- any backend/API assumption made

If blocked by missing backend behavior, say exactly what is missing.

Do not silently mock missing production functionality unless explicitly requested.

---

## 44. Ask Before High-Impact Changes

Ask before:

- deleting major modules
- renaming large public APIs
- changing database schema broadly
- replacing core libraries
- replacing Expo Router
- replacing NativeWind
- changing authentication architecture
- changing recommendation rules
- integrating real payments
- introducing native modules that require ejecting/prebuild complexity
- adding out-of-scope advanced features

Small safe implementation decisions do not need repeated approval.

---

## 45. Do Not Overengineer

This project is intended to be:

- professional
- portfolio-ready
- maintainable
- realistic
- mid-level

It is NOT intended to become:

- microservices architecture
- event-driven distributed architecture
- offline-first sync engine
- enterprise design-pattern showcase
- overly abstract generic framework

Prefer a clean, understandable architecture that one developer can maintain.

---

# PART F — REACT NATIVE IMPLEMENTATION ROADMAP

## 46. Current Mobile Development Order

Follow this sequence unless the user explicitly changes priorities.

### Phase 22.1 — Project Initialization

- Expo
- TypeScript
- Expo Router
- NativeWind
- env
- assets/fonts

### Phase 22.2 — Design System

- colors
- typography
- spacing
- buttons
- inputs
- reusable cards
- book components

### Phase 22.3 — Navigation

- auth stack
- onboarding
- main tabs
- detail routes

### Phase 22.4 — API Foundation

- Axios
- API response types
- error normalization
- API modules

### Phase 22.5 — Authentication State / Session

- SecureStore
- Zustand auth store
- token refresh
- restore session

### Phase 22.6 — Login & Register

### Phase 22.7 — Email Verification / Password Recovery

### Phase 22.8 — Google Authentication

### Phase 22.9 — Interest Onboarding

### Phase 22.10 — Home

- continue reading
- continue listening
- recommendations
- popular
- new
- free

### Phase 22.11 — Search & Discovery

- search
- filters
- sorting
- infinite scrolling

### Phase 22.12 — Book Detail

### Phase 22.13 — Favorites !!!!!!!!!!!!!!!!!!!!!!!!

### Phase 22.14 — Personal Library

### Phase 22.15 — PDF Reader

### Phase 22.16 — Audio Player

### Phase 22.17 — Reviews & Ratings

### Phase 22.18 — Mock Premium Subscription

### Phase 22.19 — Profile & Account


///////////////////////////////////

### Phase 22.20 — Loading / Empty / Error UX

### Phase 22.21 — Cache / Performance

### Phase 22.22 — Security / Edge Cases

### Phase 22.23 — Responsive / Device Testing

### Phase 22.24 — Integration Testing

### Phase 22.25 — Final UI Polish

### Phase 22.26 — Android Demo Build

---

## 47. Definition of Done for Mobile Features

A mobile feature is not complete until:

- real backend API is connected when available
- loading state exists
- error state exists
- empty state exists where applicable
- success path works
- navigation works
- TypeScript passes
- relevant query cache invalidation is correct
- visual style matches Readora theme
- no obvious duplicate logic is introduced
- backend authorization rules are respected
- feature works on common phone sizes

---

## 48. Source of Truth Priority

When instructions conflict, use this priority:

1. explicit current user request
2. current repository code and contracts
3. this `AGENTS.md`
4. Readora project documentation
5. general framework best practices

Do not change a confirmed project requirement merely because a different pattern is more common elsewhere.

---

## 49. Final Agent Principle

Build Readora as a coherent product, not as isolated demo screens.

Every implementation should preserve:

- consistent architecture
- reusable UI
- backend authority
- secure auth
- predictable state
- polished UX
- manageable complexity

When uncertain, prefer the simplest solution that fits the established Readora architecture and current scope.
