# EventEase Mobile Migration Plan

## Existing Project Summary

EventEase is a single Next.js 16 + Prisma + NextAuth project that currently serves:

- Public event discovery pages
- Web auth and onboarding
- Student dashboard flows
- Organizer event management flows
- Admin oversight pages
- API routes for events, attendance, certificates, notifications, announcements, uploads, and auth

### Core Domain Models

- `User`
  - roles: `STUDENT`, `ORGANIZER`, `ADMIN`
  - organizer verification gate via `isVerified`
  - onboarding gate via `profileCompleted`
  - optional organization membership via `orgId`
- `Organization`
  - scopes users, events, certificate templates, announcements
- `Event`
  - categories, status, capacity, waitlist, poster, documents, tags
- `Registration`
  - `CONFIRMED`, `WAITLISTED`, `CANCELLED`
  - QR-based registration token
- `Attendance`
  - one attendance record per registration
- `Certificate`
  - verification code + HTML certificate download page
- `Notification`
  - per-user read/unread activity stream
- `Announcement`, `Comment`, reactions
- `OrganizerRequest`
  - organizer approval workflow

### Existing User Flows

#### Auth / Onboarding

- `/login`
  - credential login or Google login
  - organizers cannot log in until verified
- `/register`
  - student registration auto-logs in
  - organizer registration creates `OrganizerRequest` and redirects to verification pending
- `/complete-profile`
  - enforced for OAuth users with `profileCompleted = false`
- `/verification-pending`
  - organizer waiting state

#### Student Flows

- `/dashboard`
  - overview stats, recent registrations
- `/events`
  - published events list, optional org scoping, search/filter/sort on page
- `/events/[id]`
  - event detail, registration, waitlist, organizer block, documents
- `/my-registrations`
  - confirmed registrations, waitlist positions, QR display, cancel registration
- `/check-in`
  - self check-in using QR code string
- `/certificates`
  - earned certificates with download/view
- `/notifications`
  - read / unread activity stream
- `/announcements`
  - org-scoped announcement feed
- `/profile`
  - profile completion and editing

#### Organizer Flows

- `/dashboard`
  - organizer analytics + recent events
- `/organized-events`
  - organization-scoped event list with active/archived/all filters
- `/events/create`
  - create event with media/documents/waitlist
- `/organized-events/[id]/edit`
  - edit event
- `/organized-events/[id]/students`
  - confirmed students, waitlist, attendance status, export CSV, delete registrations
- `/organized-events/[id]/certificates`
  - issue certificates to present students
- `/check-in`
  - currently student self check-in page, but organizer QR scan exists as component flow

#### Admin Flows

- `/admin`
  - platform overview
- `/admin/organizer-requests`
  - verify or reject organizers
- additional admin event/announcement/college pages remain web-only

## Mobile Screens To Build

### Auth Stack

- `SplashScreen`
- `LoginScreen`
- `RegisterScreen`
- `CompleteProfileScreen`
- `VerificationPending` state inside auth flow for organizer registrations

### Student App

- `StudentHomeScreen`
- `EventsScreen`
- `EventDetailScreen`
- `MyRegistrationsScreen`
- `CheckInScreen`
- `CertificatesScreen`
- `NotificationsScreen`
- `AnnouncementsScreen`
- `ProfileScreen`

### Organizer App

- `OrganizerHomeScreen`
- `OrganizedEventsScreen`
- `OrganizerEventDetailScreen`
- `ScannerScreen`
- `EventStudentsScreen`
- `NotificationsScreen`
- `AnnouncementsScreen`
- `ProfileScreen`

### Admin Mobile Handling

- no native admin panel
- show a native message: `Please use web admin panel`

## Existing APIs Reusable With Mobile

These can be reused if they support bearer-token auth in addition to web session auth:

- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events/:id/register`
- `POST /api/attendance`
- `GET /api/attendance`
- `POST /api/attendance/self-checkin`
- `GET /api/certificates`
- `GET /api/certificates/:id`
- `GET /api/certificates/:id/download`
- `GET /api/notifications`
- `PATCH /api/notifications/:id`
- `POST /api/notifications/mark-all-read`
- `GET /api/announcements`
- `GET /api/announcements/:id`
- `POST /api/upload`
- `GET /api/events/:id/certificates`
- `POST /api/events/:id/certificates`

## New Or Updated APIs Required For Mobile

### Required Auth APIs

- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/register`
- `POST /api/mobile/auth/refresh`
- `GET /api/mobile/me`
- `PATCH /api/mobile/me`

### Required Mobile Data APIs

- `GET /api/mobile/registrations`
  - confirmed + waitlisted registrations with waitlist position, attendance, event summary
- `POST /api/mobile/registrations/:id/cancel`
  - mobile equivalent for current server action cancellation
- `GET /api/mobile/organized-events`
  - organizer event list with analytics and filter support
- `GET /api/mobile/organized-events/:id/students`
  - confirmed attendees + waitlist for organizer event detail

### Existing API Enhancements Needed

- `GET /api/events`
  - support `q` and `sort` like the web events page
  - support bearer-token user/org scoping
- `GET /api/events/:id`
  - support bearer-token current user detection
- `POST /api/events/:id/register`
  - support bearer-token current user detection
- `POST /api/attendance`
  - support bearer-token organizer auth
- `POST /api/attendance/self-checkin`
  - support bearer-token student auth
- `GET /api/certificates*`, `GET /api/notifications*`, `GET /api/announcements*`, `POST /api/upload`
  - support bearer-token auth

## Theme Mapping: Web to React Native

Primary visual baseline should come from `src/app/globals.css` shadcn-style tokens, not from direct web component reuse.

### Token Mapping

| Web token | Native token use |
| --- | --- |
| `background` | app background |
| `foreground` | primary text |
| `card` | card background |
| `card-foreground` | card text |
| `primary` | primary actions, selected tab, emphasis |
| `primary-foreground` | primary button text |
| `secondary` | neutral surfaces |
| `secondary-foreground` | secondary text on neutral surfaces |
| `muted` | empty states, pills, subtle containers |
| `muted-foreground` | helper text |
| `accent` | hover-like neutral highlight equivalent |
| `accent-foreground` | accent text |
| `destructive` | destructive actions/errors |
| `border` | card/input separators |
| `input` | text input border/background |
| `ring` | focus outline equivalent |
| `radius` | rounded scales for cards/buttons/inputs |

### Theme Notes

- Primary app shell should follow the clean shadcn white/black system.
- Public event cards on web use darker slate/blue styling. Mobile should preserve the event-card personality through accents, imagery, badges, and hierarchy without switching the whole app to the dark marketing background.
- Typography feel should stay close to Geist-inspired clean sans with strong hierarchy and compact helper text.
- Cards, inputs, badges, and form layout should visually mirror current shadcn usage.

## Navigation Structure

### Root Switch

- `Splash`
- unauthenticated -> `AuthNavigator`
- authenticated `STUDENT` -> `StudentTabs`
- authenticated `ORGANIZER` -> `OrganizerTabs`
- authenticated `ADMIN` -> `AdminWebOnlyScreen`
- authenticated but `profileCompleted = false` -> `CompleteProfileScreen`
- authenticated organizer but `isVerified = false` -> `VerificationPendingScreen`

### AuthNavigator

- `SplashScreen`
- `LoginScreen`
- `RegisterScreen`
- `CompleteProfileScreen`

### StudentTabs

- `Home`
- `Events`
- `My Registrations`
- `Check In`
- `Certificates`
- `Profile`

### OrganizerTabs

- `Home`
- `My Events`
- `Scanner`
- `Notifications`
- `Profile`

### Nested Native Stack Screens

- `EventDetailScreen`
- `NotificationsScreen`
- `AnnouncementsScreen`
- `OrganizerEventDetailScreen`
- `EventStudentsScreen`

## Step-by-Step Implementation Plan

1. Add `MOBILE_MIGRATION_PLAN.md`.
2. Add token-based mobile auth utilities.
3. Add shared current-user resolver that supports:
   - NextAuth web session
   - mobile bearer token
4. Update reusable API routes to use shared user resolution.
5. Add mobile-only auth and profile endpoints.
6. Add mobile-only registrations and organizer data endpoints.
7. Scaffold `mobile/` React Native CLI TypeScript project.
8. Configure:
   - React Navigation
   - TanStack Query
   - Axios
   - Keychain-backed token storage
   - NativeWind
   - app theme constants
9. Build shared mobile UI primitives.
10. Build auth flow and auth store.
11. Build student event discovery, detail, registration, registrations, check-in, certificates, notifications, profile.
12. Build organizer event list, event detail analytics, QR scanner, student list.
13. Add README and scripts.
14. Run TypeScript/lint/build validation as far as local environment allows.

## Risks / Missing APIs / Caveats

- Current web app relies heavily on server components querying Prisma directly. Mobile needs API equivalents for several of those data views.
- Current web auth is NextAuth session-based. Mobile must use a separate token flow without changing browser behavior.
- No existing API lists the current user’s registrations with waitlist position; new route is required.
- No existing API exposes organizer event/student analytics in a mobile-ready format; new routes are required.
- `GET /api/events/:id` currently returns all registrations, which is more data than mobile needs. A mobile-safe response shape may be preferable long term.
- `GET /api/certificates/:id/download` returns HTML, not a binary PDF. Mobile can open it in a browser/webview substitute such as external browser, but native download UX may need a later enhancement.
- Organizer permissions currently check direct event ownership in some places and org scope in others. Mobile should preserve current behavior, but this mismatch should be kept in mind.
- `react-native-vision-camera` requires native permission setup and platform build configuration.
- Full React Native CLI scaffolding may require downloading templates/dependencies if not already available locally.
