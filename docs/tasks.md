# Yuki Portfolio — Tasks

Open and `[?]` tasks only. `[ ]` = open, `[?]` = proposed but not confirmed in the code — check the code, then mark `[x]` (and move it) or `[ ]`. Finished tasks move word for word to `docs/completed-tasks.md` under the same section number, so a "see section N" reference to done work may point there. Moved into the repo 2026-11-12 from the claude.ai project's `task-list.md`; older text may mention `project-context.md`, `claude/completed-tasks.md` or `context/week-of-*.md` (the archived claude.ai docs; decisions and gotchas are now in `docs/decisions.md` and `docs/gotchas.md`).

**Next up:** merge `fix-account-password-throttle` (section 8), then update the admin account settings page to match the owner's (section 6; settle the scope against both `account/page.tsx` files). (The next *decision* is still palette editing model, decision 1.)

---

## 1. Design and planning
- [ ] Night-city contrast fix: rain-slick `#46535B` (`accentSoft`) is 2.3:1 on asphalt, too low for the captions/role line that use it; harsh red is 3.1:1, too low for small text. Suggested: lift `accentSoft` to `#7E8C94` (5.3:1). Needs client OK. (Home role line switched to `text-text-primary` in the 2026-10-15 Photography draft. Login errors switched to `text-text-primary` with a red left rule in the 2026-10-21 rate-limiting PR. The owner overview's `Roll 01A` label switched to `text-text-primary` in `owner-overview`, merged 2026-11-02.)
- [ ] Decide palette editing model (open decision 1) ← next decision
- [ ] Decide analytics / system health tooling (open decision 2)
- [ ] Decide Hollywood credits placement (open decision 3)
- [ ] Decide stop motion presentation (open decision 4). **Layout settled provisionally 2026-10-25 by user** (reel strip + detail page, like Video); clip playback (loop, hover-to-scrub, GIF) still open for Yuki.
- [ ] Get final site/brand name and bio copy from Yuki (open decision 5)
- [ ] Get real asset timeline from Yuki (open decision 6)
- [ ] Ask Yuki whether per-discipline numbering is fine (photo `No. 001` and video `No. 001` can both exist and both appear on Home) or whether she wants one sequence across disciplines
- [ ] Get Yuki's real contact email, availability line and profile URLs (Instagram, Vimeo, IMDb), and ask whether she wants LinkedIn or a representation line (added 2026-10-18). `SITE.email`, `SITE.availability` and `SOCIAL_LINKS` in `lib/site.ts` are placeholders; `contact.spec.ts` reads them from `lib/site.ts`, so it keeps passing when they change.

## 2. Database and data model
- [ ] `onDelete: "cascade"` on `sessions.userId` — not applied (schema seen 2026-10-15 has no `onDelete`). Optional; the cleanup helper deletes sessions first.
- [ ] `seed-frames.ts`: refuse to run against production once a production database exists (placeholder data only; added 2026-10-15). `script-env` has a test-branch guard but no production guard yet.
- [ ] When a production database exists, run the `login_throttle` migration there before deploying the rate-limiting code (added 2026-10-21); without the table every login attempt throws. (2026-11-11: the account actions use the same table since `fix-account-password-throttle`, so every account change throws without it too.)
- [ ] When a production database exists, run the same email check there, then the `users_email_normalized` migration (added 2026-10-30); the migration fails if any existing email has capitals or surrounding spaces.

## 3. Auth
- [ ] `script-env.ts`: wrap `new URL(databaseUrl)` in try/catch and throw a generic message — Node's `Invalid URL` error includes the full connection string (password) and `runScript` would print it
- [ ] Confirm `.env.local` / `.env.test` are git-ignored (`git check-ignore .env.local .env.test`); if either was ever committed, rotate the Neon password
- [?] Add `/change-password` to the robots disallow list

## 4. Testing and CI
- [ ] Optional: cache `.next/cache` in the CI e2e job if the production build makes it slow (more likely now that CI really builds; added 2026-10-09)
- [ ] Integration tests for `getFramesByDiscipline` / `getHomeFrames` ordering and hero exclusion (added 2026-10-15; `home.spec.ts` already caught a missing `orderBy`). `'use cache'` functions need the Next runtime, so either test the query builders separately or mock `next/cache`. Low priority while the e2e spec covers the page.
- [ ] Optional: run `npm run typecheck` before every commit via a pre-commit hook (e.g. `simple-git-hooks` or Husky), so type errors are caught before CI (added 2026-10-21). Low priority once CI checks types.

## 5. Verify or apply (designed, status unconfirmed)
- [ ] `db-helpers.ts`: no `tests/integration/helpers/` directory exists in the 2026-10-05 tree — confirm the file is already gone (or find where it moved) and that nothing still imports it
- [ ] `tests/e2e/global-teardown.ts`: `await cleanupTestAccounts();` (since 2026-10-19 `cleanupTestAccounts` also clears `login_throttle`)

## 6. New work
- [ ] Flesh out the dashboards (added 2026-10-09). The admin overview is still a placeholder (`Roll 00A` heading + one paragraph). The owner overview is built (v1 merged 2026-11-02; its scope and as-built notes are in `docs/completed-tasks.md` section 6), and the owner nav no longer links to the unbuilt `/frames`, `/palettes` and `/projects`. Admin route content is blocked by decision 2, the palette manager by decision 1.
- [ ] Update the admin account settings page to match the owner's (added by user 2026-11-09). Both pages render the same `AccountSettingsForm` (seen 2026-11-02), so the difference is in the page around it (for example, the admin page's `No. 000` label in `text-accent-soft`); settle the scope against both `account/page.tsx` files when picking it up.
- [ ] Optional: explain an account lockout on `/login` (added 2026-11-11, from `fix-account-password-throttle`). The wrong current password that locks the account check ends the session, and the account page's gate sends the browser to `/login` before the action's message can show, so the owner lands there with no explanation; the lockout message only appears if they log back in and try again during the lock. A note would need the action to redirect to something like `/login?locked=1` and the login page to read it, which makes `/login` dynamic (it's fully static now).
- [ ] Owner dashboard on phones (added 2026-11-02): the layout's fixed `w-56` sidebar leaves a narrow main column at phone width. Give the dashboard layouts a phone treatment (e.g. sidebar on top).
- [ ] Test the owner overview's fallback palette path ("Built-in default" when `getActivePaletteName()` returns `null`; added 2026-11-02). The e2e spec covers only the seeded palette.
- [ ] Audit remaining `lib/actions/` files (bio, credits, photos, stop motion) for owner-only gating
- [ ] Integration tests for `requireOwner` / `requireOwnerOrAdmin` / `requireAdminOnly` (assert `NEXT_REDIRECT` target). Use `createValidSession` / `insertSession` from `tests/helpers/sessions.ts` for the logged-in state.
- [ ] `/dashboard/admin/**` route content (blocked by decision 2)
- [ ] Integration test for `activatePalette` (switches the active row; unknown id changes nothing) — it was never exercised, which hid the transaction bug. Note: after the migration it calls `updateTag`, which only works inside a Server Action request, so the test may need to mock `next/cache`.
- [ ] Frame management Server Actions (owner dashboard `/frames`; added 2026-10-15): create/edit/reorder/feature frames and `setHeroFrame` (one `db.batch`: clear the current hero, set the new one, like `activatePalette`). Every action gates with `requireOwnerOrAdmin` and calls `updateTag(FRAMES_CACHE_TAG)`. Until these exist, frame changes need a cache clear or redeploy. (2026-11-01: the Frames page adds its link back to the owner nav, and the overview's Work links point at it.)
- [ ] Home placeholder tones (added 2026-10-15): `placeholderTone(id)` keys the tint on the row id, which keeps a frame's color the same on every page but makes Home's mix depend on database ids. With the seed data the selected row repeats `accent-soft` and never shows `accent-tertiary`, unlike the old hardcoded row that used each tone once. Decide whether Home should cycle by position instead (or whether this goes away once real images replace placeholders).
- [ ] Home row order (added 2026-10-15): the selected row sorts by `displayOrder`, which is the per-discipline position. If Yuki wants to order the Home row on its own, add a `homeOrder` column.
- [ ] When real assets land: delete the placeholder rows (`delete from frames where title = 'Placeholder' and image_url is null`) and add the R2 host to `images.remotePatterns` in `next.config.ts` so `next/image` accepts `imageUrl`.

## 7. Minor cleanup
- [ ] `lib/login-throttle.ts`, `lib/login-throttle-policy.ts` and `tests/helpers/login-throttle.ts` now serve non-login keys too (`account:<userId>` since `fix-account-password-throttle`, 2026-11-11; the contact form's per-IP limit would be next). Rename to something general (e.g. `lib/throttle.ts`, `lib/throttle-policy.ts`, `clearAllThrottle`, `rewindThrottle`) in its own PR, or leave until the contact form needs it (added 2026-11-11).
- [ ] `insertUser` / `findUser` now exist in two integration files with the same shape (`auth.integration.test.ts`, `account-actions.integration.test.ts`; added 2026-11-03). The 2026-11-01 decision was to share once a second use appeared; move them to `tests/helpers/users.ts`. Small follow-up PR.
- [ ] `lib/auth.ts` (seen 2026-11-08, still there 2026-11-11): imports `MIN_PASSWORD_LENGTH` from `"./password-policy"` while every other import uses `@/lib/...`; `if(!email)` missing a space. Cosmetic.
- [ ] Point the `dashboardPathFor` call sites at `@/lib/dashboard-path`. `/unauthorized` switches in the Cache Components draft (2026-10-09); `app/change-password/page.tsx` (still, seen 2026-11-02) and `lib/actions/auth.ts` (seen 2026-10-19) still import it from `@/lib/auth`; others not seen.
- [ ] `tests/e2e/auth/login-lockout.spec.ts` (added 2026-10-21): imports the throttle helper and policy via `@/`, while the documented test convention is relative paths (both work). `lib/actions/auth.ts` imports the throttle modules relatively (`../login-throttle`), unlike its `@/lib/auth` import. Pick one style per file. Also check the spec title reads "then recovers", not "the recovers".
- [ ] Primary buttons hover to `bg-accent-soft` (asphalt text on rain-slick, 2.3:1) (added 2026-11-02): `app/login/login-form.tsx`'s "Log in" button. The account and change-password forms switch to an amber hover (`hover:bg-accent-secondary`, 5.6:1) in `fix-account-settings-form`; do the same for the login button (or reuse `SubmitButton`).
- [ ] `app/dashboard/owner/layout.tsx`: nav links hover red (`hover:text-accent-primary`, 3.1:1 at `text-sm`); switch to amber (`hover:text-accent-secondary`) like the public nav. Check the admin layout too (added 2026-11-02).
- [ ] Integration cleanup pattern `%@example.test` also matches the e2e accounts. Safe in CI (jobs run in sequence and e2e reseeds), but running integration and e2e at the same time locally would delete e2e users mid-run. If that bites: give integration its own domain (e.g. `@integration.example.test`) and narrow the pattern. The same applies to `login_throttle` (since 2026-10-19 both suites clear the whole table).
- [ ] `scripts/seed-frames.ts` (seen 2026-10-21): statically imports `discipline` from `@/db/schema` without using it (remove; the schema is otherwise imported dynamically after `loadScriptEnv`), and the "already sest" log message has a typo.
- [ ] `lib/frames.ts`: `cacheLife("max")` / `return rows` in `getFramesByDiscipline` are indented one level too deep (cosmetic, seen 2026-10-15). Marked fixed 2026-10-24 in the Video detail route PR, but **the file seen 2026-11-01 still has the extra indent**. Also imports `FrameInSequence` without `type` (works; `type` would match the other type imports).
- [ ] `package.json`: `seed:palettes` runs `tsx scripts/seed-palettes` (no `.ts`), unlike the other seed scripts. Add the extension for consistency (seen 2026-10-15; still there 2026-10-21).
- [ ] `lib/auth.ts` (seen 2026-10-19): the bodies of `authenticateUser`, `updateUserEmail` and `updateUserPassword` are indented one level too deep after their first statement (cosmetic). (`authenticateUser` fixed 2026-10-26 in `fix-login-timing-leak`; `updateUserEmail` fixed 2026-10-30 in `fix-login-email-case`; `updateUserPassword` remains, still over-indented in the files seen 2026-11-08 and 2026-11-11. A `.returning({ id })` version that drops the separate select and fixes the indent was suggested 2026-11-08; not confirmed applied.)

## 8. Build queue

### In order (build order agreed 2026-10-07)
All five steps done as of 2026-10-18; moved to `docs/completed-tasks.md` section 8.

### Not sequenced
- [ ] Merge `fix-account-password-throttle` into `main` (added 2026-11-11; PR "Throttle the current-password check in the account actions", body drafted 2026-11-11 from the template; CI green 2026-11-11, confirmed by user). Plan, as-built notes and commits in `docs/completed-tasks.md` section 6.
- [ ] Palette manager UI at `/dashboard/owner/palettes` (blocked by decision 1). Adds the Palettes link back to the owner nav (removed in `owner-overview`, decided 2026-11-01).
- [ ] Public About page (credits layout depends on decision 3)
- [ ] Photography detail extras, once real photos exist (deferred 2026-10-18): an overlay over the contact sheet via intercepting routes (`@modal` + `(.)[frameNumber]`, keeping the current page as the direct-load fallback), and whether the slide-projector motion moment lives in photo-to-photo navigation.
- [ ] Contact form that emails Yuki (added 2026-10-18; follows the mailto Contact page). A form on `/contact` (name, email, message) whose submission is delivered to Yuki as an email, sent through a separate email service rather than her inbox being exposed to scraping. Open before scoping: what "microservices" means here, either (a) a Server Action that validates the form and calls a transactional email API (e.g. Resend or Postmark; one provider account, no extra deployment), or (b) a separately deployed service (e.g. a Cloudflare Worker or queue consumer) that the site posts to; and whether submissions are also stored (`messages` table) so nothing is lost if the email send fails. Needs: server-side validation, honeypot field, rate limiting per IP, reply-to set to the sender's address (never the From), API key in env (not the repo), visible labels on every input, success/error states without a page reload. The page itself can stay prerendered: a Server Action posts to a static page without making it dynamic, and the form reads no session. Tests: unit for validation, integration or mocked provider for the send, e2e for submit → success message. Keep the visible `mailto:` link as a fallback. Per-IP rate limiting can reuse `login_throttle` and `recordFailure` (2026-10-21) with a new key prefix such as `contact-ip:` and its own limit, counting every submission rather than failures; the module would then want a more general name (section 7). (2026-10-30: the sender's email can go through `normalizeEmail` from `lib/email.ts`, merged 2026-11-01.) (2026-11-02: the shared `Field` / `FormResult` / `SubmitButton` from `fix-account-settings-form` fit this form too.)
- [ ] R2 image upload/serving
- [ ] Cloudflare Stream video (signed playback + watermark). Since 2026-10-25 Video's detail route uses the shared `FrameDetailRoute` (placeholder `Frame`); with Stream it goes back to `FrameDetailShell` + its own async body around the player (`FrameDetail` stays shared). The Video detail page's media slot takes the player; the signed-token read goes in its own nested `<Suspense>` around it (decided 2026-10-22). Recheck the Left/Right/Escape key handler against the player's own keys once it's wired.
- [ ] Traffic analytics + system health tooling (blocked by decision 2)
- [ ] Wire `themeSettings` (non-color settings) if still needed; colors now come from `themePalettes` only
- [ ] Optional check: `curl -sI -b "session=bogus" /dashboard/admin` under `next start` should return 200 + `x-nextjs-prerender: 1` (proxy passes a present-but-invalid cookie; the in-render gate redirects client-side)
- [ ] Revisit `instant = false` on the dashboards and `/change-password` if a later Next version makes the Suspense auth pattern clearly better (logged exception, decision 2026-10-09)

## Tabled
- Playwright `storageState` for pre-authenticated sessions (`insertSession` from `tests/helpers/sessions.ts` + `context.addCookies` is a lighter alternative when needed)
- Production palette seeding (tabled 2026-10-07; no deployment work yet). Options: run `seed-palettes.ts` once against the production `DATABASE_URL`, or (preferred long-term) move the two default palettes into a custom Drizzle data migration (`drizzle-kit generate --custom`, `INSERT … ON CONFLICT (name) DO NOTHING` + activate Night City if none active) so every database gets them automatically. Depends on how migrations reach production (manual `drizzle-kit migrate` vs CI/Vercel build), which isn't set up yet. `seed-users.ts` stays manual either way (prints one-time temp passwords). An unseeded DB still renders night-city via the code fallback. (Placeholder frames should not go to production at all.)
- Real email addresses committed in `scripts/seed-users.ts` (tabled 2026-10-07). Not credentials, but exposed if the repo ever goes public (spam, phishing, identifying the dashboard login). Fix when needed: read them from the env file (`SEED_ADMIN_EMAIL`, `SEED_OWNER_EMAIL`) and have `seed-users.ts` error if unset. Low priority while the repo stays private; do it before making it public. (2026-10-30: if that move happens, normalize the env values with `normalizeEmail` too.)
