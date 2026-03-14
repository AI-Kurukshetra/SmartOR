# DECISIONS

## 2026-03-14

### Decision
Start implementation with a multi-hospital Next.js application scaffold and typed mock data.

### Rationale
The repository currently has no runtime code, no Supabase project setup, and no migrations. Mock-backed product surfaces allow the core feature model and UX to be implemented immediately while preserving a clean path to real persistence later.

## 2026-03-14

### Decision
Model the product as a network overview page plus hospital-specific command-center routes.

### Rationale
The PRD explicitly includes multi-hospital management. A network landing page with separate hospital dashboards expresses centralized administration while preserving local operational context and cleaner route boundaries.

## 2026-03-14

### Decision
Use a Supabase-backed server data layer with demo fallback rather than hard-failing the app when credentials are absent.

### Rationale
The repository still lacks live Supabase credentials. A fallback keeps the product UI operable in this workspace while the authenticated path is implemented and ready for activation in a configured environment.

## 2026-03-14

### Decision
Model most hospital-scoped operational records with JSON and array columns in the first migration.

### Rationale
The current UI already consumes nested checklist, availability, participant, and assignment arrays. Preserving those shapes in the initial schema reduces translation overhead and speeds the move from demo records to persisted data; deeper normalization can follow once the product flows stabilize.

## 2026-03-14

### Decision
Seed demo data through an idempotent service-role script instead of a SQL-only seed migration.

### Rationale
The SmartOR demo environment needs auth users, profiles, memberships, and hospital-scoped operational rows. Creating the auth users safely is much easier through the Supabase Auth Admin API than by inserting directly into `auth.*` tables, while idempotent upserts keep reseeding predictable.

## 2026-03-14

### Decision
Centralize role access in a shared permission matrix and drive dashboard navigation/section visibility from that source.

### Rationale
SmartOR roles (`hospital_admin`, `or_director`, `scheduler`, `surgeon`, `staff`) need consistent UI gating across network and hospital views. A single permission map avoids duplicated conditional logic, keeps role behavior predictable, and makes future feature-surface changes safer.

## 2026-03-14

### Decision
Adopt a split visual system for dashboards: dark command sidebar + light content canvas.

### Rationale
Role-heavy operational software needs stronger information hierarchy than flat, same-tone panels. The split theme creates an explicit control rail for navigation/identity while preserving high legibility in the main analytical workspace.

## 2026-03-14

### Decision
Incorporate external product-site inspiration as design direction only, while keeping SmartOR domain naming and architecture distinct.

### Rationale
Borrowing interaction patterns (capability pillars, workflow lane framing, integration posture sections) improves clarity and product storytelling, but preserving project-specific terminology and schemas avoids brand/content duplication and keeps implementation aligned with the existing PRD.

## 2026-03-14

### Decision
Treat the sidebar as a control rail (identity, permissions, navigation, quick launch) rather than a plain link list.

### Rationale
For multi-role operational software, users need instant understanding of who they are, what they can access, and where to act next. Consolidating this into a structured rail reduces navigation ambiguity and improves first-scan usability.

## 2026-03-14

### Decision
Prioritize a mission-control structure in the hospital dashboard: hero context + urgent signal strip + pulse lane before deep module grids.

### Rationale
Real-time OR workflows are interruption-heavy and decision speed matters more than dense initial detail. Surfacing alert pressure, conflict severity, and readiness at the top improves first 10-second comprehension before users enter operations, scheduling, and coordination modules.

## 2026-03-14

### Decision
Use a sticky collapsible sidebar rail (expanded detail mode + compact icon mode) as the default dashboard navigation pattern.

### Rationale
Schedulers and operators need persistent navigation while scrolling long command surfaces, but also need additional horizontal space for dense boards. A collapsible rail preserves quick access while allowing the main canvas to expand on demand.

## 2026-03-14

### Decision
Handle sidebar section tabs on hospital dashboards with native hash anchors instead of Next router links.

### Rationale
In-page section jumps (`#operations`, `#scheduling`, `#coordination`) do not require route transitions. Native anchors avoid full page remount behavior and keep the sidebar and surrounding shell stable while the content position updates.

## 2026-03-14

### Decision
Move hospital module navigation from in-page hash sections to dedicated route pages for operations, scheduling, and coordination.

### Rationale
Module pages are now full operational workspaces with independent focus, URL shareability, and clearer context boundaries. Route-based navigation avoids long scroll surfaces and aligns sidebar behavior with user expectation that each module is a separate page.

## 2026-03-14

### Decision
Use a shared hospital route layout so sidebar and module-tab navigation replace only module content while keeping shell UI persistent.

### Rationale
Users need fast module switching without perceived full-page refresh. A persistent App Router layout at `app/hospitals/[hospitalSlug]/layout.tsx` keeps sidebar, hero context, and role-aware tabs mounted while child route content updates per module.

## 2026-03-14

### Decision
Set post-login default landing to each user’s default hospital overview route instead of the network overview page.

### Rationale
Most users execute workflows in a hospital workspace first, and role-gated module tabs live there. Redirecting to `/hospitals/[slug]` improves first-load relevance while keeping network overview available when needed.

## 2026-03-14

### Decision
Model sidebar navigation as context-aware menus: network nav on `/` and hospital nav on `/hospitals/[slug]` with an explicit `Overview` item.

### Rationale
Users need a visible selected sidebar state on initial hospital landing, not only after clicking module tabs. A dedicated hospital overview nav item makes default landing state clear and consistent with Operations/Scheduling/Coordination behavior.

## 2026-03-14

### Decision
For hospital module tab navigation, disable prefetch and add a route-level loading skeleton with a brief intentional server delay.

### Rationale
The persistent hospital layout makes route switches feel instant, which can hide async loading and cause abrupt content swaps. A short, consistent delay plus App Router `loading.tsx` gives operators immediate visual feedback that the selected module is loading.

## 2026-03-14

### Decision
Use a layout-level Suspense boundary around hospital child routes to guarantee visible loading fallbacks during tab/module transitions.

### Rationale
Because the hospital shell is persistent, segment loading can complete without surfacing the route-level fallback consistently. A local Suspense boundary inside the content canvas makes loading feedback deterministic whenever child route data is pending.

## 2026-03-14

### Decision
Add per-module route loading skeletons for all hospital sidebar tabs instead of relying on a single shared loading surface.

### Rationale
Each tab has different information density and layout shape. Tab-specific skeletons reduce perceived jank during transitions and make data fetching states feel intentional across overview, operations, scheduling, and coordination modules.

## 2026-03-14

### Decision
Use modal workflows for scheduling CRUD interactions rather than rendering full create/edit forms inline on the scheduling page.

### Rationale
Inline CRUD forms made the scheduling workspace visually dense and harder to scan. Modal forms keep the board-first context visible while still supporting full create/update/delete operations in focused interactions.

## 2026-03-14

### Decision
Create a dedicated hospital admin-controls route instead of routing Admin Controls sidebar clicks to the coordination route.

### Rationale
Admin Controls and Coordination represent different operational contexts. A separate route prevents duplicate content behavior, supports permission-specific messaging, and preserves clear navigation semantics for hospital administrators.

## 2026-03-14

### Decision
Remove the Quick Launch section from the dashboard sidebar and keep primary navigation focused on module links plus workspace switching.

### Rationale
The quick-action shortcuts duplicated existing sidebar routes and added visual noise. Keeping one clear navigation list reduces clutter and improves scan speed in the control rail.

## 2026-03-14

### Decision
Install the external `agent-browser` skill globally for Codex using the skills CLI non-interactive mode.

### Rationale
The project workflow expects E2E validation gates after frontend changes; adding the dedicated browser-testing skill keeps that path available without manual per-session setup.

## 2026-03-14

### Decision
Drive hospital Overview content from a role-based data-pack builder so each app role sees distinct metrics and operational highlights.

### Rationale
A single shared overview hides role priorities in OR operations. Role-specific command briefs improve first-screen relevance and align displayed KPIs with each role’s required actions (admin governance, director flow, scheduling pressure, surgeon readiness, frontline assignments).

## 2026-03-14

### Decision
Render all hospital Overview metric cards in one consolidated top section (shared metrics + role-specific metrics) instead of splitting them with content between rows.

### Rationale
The split layout reduced scan efficiency by separating KPI groups with non-metric content. Consolidating metrics at the top improves first-glance readability and keeps the command summary coherent.

## 2026-03-14

### Decision
Introduce a dedicated persisted `overview_metrics` dataset and power the Overview tab from that table, while exposing table-format CRUD controls directly in the Overview page.

### Rationale
User workflow needs a basic editable metrics foundation before deeper module-level optimization. Persisted metric rows provide explicit control over KPI definitions/targets and make it possible to manage overview data in a structured table with create/update/delete operations.

## 2026-03-14

### Decision
Hide the Overview metrics CRUD table from the Overview tab UI while retaining the persisted `overview_metrics` data model and card rendering.

### Rationale
The immediate UX priority is a cleaner overview experience focused on KPI cards and role briefing, without an on-page operational data grid.

## 2026-03-14

### Decision
Expose CRUD-heavy manager entities as dedicated manager-only sidebar tabs (`Rooms`, `Surgeons`, `Staff users`, `Hospital overview`) while keeping role gating centralized in permissions.

### Rationale
Managers requested direct tab access to operational CRUD domains without exposing those controls to surgeon/staff roles. A dedicated `manager_tabs` permission keeps access logic explicit and reusable, while deep-linking/route targeting reduces navigation friction to the relevant CRUD surfaces.

## 2026-03-14

### Decision
Implement a dedicated API key management route under hospital admin controls with a settings-style split layout and switch global accent tokens from blue to emerald/teal.

### Rationale
The request required a Supabase-like settings experience for API key presentation while the existing app shell remained role-aware and hospital-scoped. A dedicated route avoids overloading the existing admin-controls integration page, and shifting shared accent tokens ensures the blue-heavy look is replaced consistently across the UI without one-off overrides.

## 2026-03-14

### Decision
Standardize tokenized alpha usage in global CSS to `rgb(var(--token) / alpha)` and avoid unsupported Tailwind opacity utility suffixes.

### Rationale
Using `rgba(var(--token), alpha)` with space-separated token values produced invalid runtime CSS and caused key visual regressions (notably button backgrounds disappearing). Enforcing valid token-alpha syntax and supported Tailwind opacity scales prevents low-contrast/invisible controls and keeps sidebar/button theming stable.

## 2026-03-14

### Decision
Implement hospital integration boundaries as a persisted admin-controls dataset (`hospital_integrations`) with member-read and manager-write RLS, exposed through a dedicated CRUD panel.

### Rationale
The blueprint and open task list both require practical EHR/integration management. Keeping integrations as hospital-scoped records enables isolated credentials/endpoints per site, while admin-controls CRUD makes this core capability operational instead of static copy.

## 2026-03-14

### Decision
Represent missing core blueprint coverage by adding an explicit scheduling conflict-resolution engine panel and installable mobile web-app support (PWA manifest + icon + mobile metadata).

### Rationale
The product already had conflict indicators and responsive layouts, but the blueprint calls for a visible conflict-resolution engine and mobile access. Auto-generated recommendation cards from live schedule state make conflict handling actionable, while manifest-driven installability provides practical mobile access without changing the current Next.js deployment model.

## 2026-03-14

### Decision
Restructure the hospital Overview route into a blueprint-first mission-control layout with execution-track framing and direct module routing cards.

### Rationale
The blueprint emphasizes fast orientation around operations, scheduling, and coordination. Elevating these as explicit top-level lanes reduces navigation ambiguity and improves first-scan comprehension versus a metrics-only overview.

## 2026-03-14

### Decision
Treat the hospital sidebar as a fixed full-height left rail at desktop breakpoints and persist the collapse preference in `localStorage`.

### Rationale
Users requested a stronger “proper full left side” behavior and reliable collapse UX. Full-height rail anchoring improves spatial consistency, and persisted collapse state prevents repetitive toggling during cross-module navigation.

## 2026-03-14

### Decision
Add a sticky top hospital header that reuses the sidebar visual language and expose an explicit MVP-scope checklist on the overview page.

### Rationale
The requested UI direction needs faster contextual orientation than sidebar-only navigation. A sticky header keeps critical context/actions always visible, and the MVP checklist makes blueprint scope coverage transparent inside the product UI.

## 2026-03-14

### Decision
Replace the previous teal-beige command-center palette with a cooler blue-slate color system across global tokens and shell gradients.

### Rationale
The user explicitly rejected the existing color combination. Updating root tokens and shared shell utilities provides a cohesive theme shift without reworking every individual component class.

## 2026-03-14

### Decision
Keep header content minimal by removing navigation duplicates already present in the sidebar and standardize on a single sign-out action in the header.

### Rationale
Duplicate navigation and duplicate sign-out controls increased visual noise and scanning cost. Consolidating navigation to the sidebar and sign-out to one header action improves clarity and reduces redundant controls.

## 2026-03-14

### Decision
Implement coordination readiness updates as role-based CRUD restricted to operational manager roles (`hospital_admin`, `or_director`, `scheduler`) with server-side authorization.

### Rationale
Case readiness status (clinical status, insurance, documentation, delay reason) is operationally sensitive and directly impacts scheduling/throughput. Server-enforced role gating plus hospital membership checks ensures least-privilege updates while keeping frontline read visibility for all assigned users.

## 2026-03-14

### Decision
Use modular navigation grouping in the hospital sidebar (`Clinical modules` and `Management`) and shorten “Operations board” to “Operations”.

### Rationale
The previous single-list sidebar made the operational module area feel crowded. Grouped IA and shorter labels reduce cognitive load, improve scan speed, and preserve role-based access cues without changing route structure.

## 2026-03-14

### Decision
Split operations-domain content into two role-gated routes: a focused `/operations` command board and a dedicated `/operations-resources` workspace linked from a new `Ops resources` sidebar tab.

### Rationale
The original operations page mixed live room orchestration with dense supporting data (staffing, surgeons, equipment), increasing cognitive load. Separating tactical command activity from resource reference content improves first-pass usability while keeping both areas in the same role-based navigation model.

## 2026-03-14

### Decision
Render non-metric operations and operations-resource data in table layouts instead of card stacks.

### Rationale
The user requested higher-density scanning and less visual clutter. Tables provide faster row-by-row comparison for room status, conflicts, case progression, staffing, surgeon windows, and equipment readiness while preserving compact KPI cards for top-level metrics.

## 2026-03-14

### Decision
Implement CRUD in Operations and Ops resources as table-native modal workflows, gated to operational manager roles on the server (`hospital_admin`, `or_director`, `scheduler`).

### Rationale
The user requested actionable table surfaces, not read-only grids. Pairing row-level Add/Edit/Delete controls with server-enforced role checks preserves least-privilege behavior while enabling direct workflow edits where operators already review the data.

## 2026-03-14

### Decision
Represent blueprint MVP coverage as an explicit status matrix (Implemented / Partial / Pending) and apply permission filtering not only to sidebar links but also to overview module cards and command-routing guidance text.

### Rationale
Static “all done” checklist chips and unfiltered overview routing text can misrepresent true delivery status and role entitlements. A status matrix makes partial items transparent (for example native mobile apps vs PWA), while role-filtered overview affordances keep discoverability consistent with actual module access controls.

## 2026-03-14

### Decision
Remove Casetabs blueprint-coverage framing from the hospital Overview tab and keep only core KPI cards plus role command highlights.

### Rationale
The requested UX direction is a cleaner overview with less strategy/checklist noise. Removing blueprint-specific panels and extra role-derived metric rows lowers visual clutter while preserving actionable orientation through core metrics and role brief highlights.

## 2026-03-14

### Decision
Adopt a consistent “clinical editorial” UI system across the full app by centralizing visual primitives (tokens, surfaces, form fields, buttons, table shells) and reusing them in shell, auth, overview, and operations pages.

### Rationale
Repeated one-off class stacks created visual drift and inconsistent hierarchy between modules. A shared primitive layer improves readability, rhythm, and polish across the project while keeping role-based workflows and existing feature behavior unchanged.

## 2026-03-14

### Decision
Use healthcare-site visual cues (clean sans typography, restrained contrast, simpler geometry) as reference direction and replace the previous high-ornament style with a calmer clinical UI system.

### Rationale
The user rejected the previous colors/fonts/visual density. Reference review from Mayo Clinic, Cleveland Clinic, Athenahealth, and Zocdoc showed a common pattern: readable sans-first typography, lighter surfaces, and reduced decorative texture. Aligning with that pattern improves professional healthcare-product fit and long-session readability.

## 2026-03-14

### Decision
Use a neutral slate sidebar palette and simplify sidebar copy density while adding explicit hospital context and clearer active states.

### Rationale
The user explicitly rejected the sidebar blue tone. A lower-saturation slate rail improves visual comfort and reduces color fatigue, while concise sidebar content plus stronger active-state contrast improves scan speed during module switching.

## 2026-03-14

### Decision
Expose `/` as a public product landing page based on the Casetabs blueprint, and reserve root auto-redirect only for authenticated users with active Supabase membership context.

### Rationale
The request requires a domain-style landing experience that is visible before authentication. Keeping the redirect for `mode: "supabase"` preserves existing post-login flow into hospital dashboards, while rendering landing content for anonymous sessions supports marketing/discovery without breaking role-gated app navigation.

## 2026-03-14

### Decision
Expose authentication entry points in the landing-page header (`Login`, `Register`) in addition to hero CTAs.

### Rationale
The user asked for immediate auth options in the header. Placing these actions in persistent top navigation improves discoverability and aligns with expected SaaS landing-page behavior without changing existing auth routes.

## 2026-03-14

### Decision
Style the landing header `Register` control as a distinct primary CTA while keeping `Login` as secondary.

### Rationale
The user requested a design fix for the register action. Stronger visual hierarchy in the header improves sign-up discoverability and reduces ambiguity between authentication entry points.

## 2026-03-14

### Decision
Compute live room procedure visibility from `surgery_cases` status + room assignment and present explicit split views for `Current procedures` and `Upcoming cases` in the Operations module.

### Rationale
The requirement is a true live operational view of all OR statuses, current procedures, and upcoming cases with CRUD in one workspace. Deriving room-level current/upcoming context from case records avoids stale display coupling to manual room pointers and gives a clearer operational readout while preserving existing manager-role create/edit/delete flows.
