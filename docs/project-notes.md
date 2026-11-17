# Project notes

Facts the code can't tell you. For how the code works, read the code; for why it's that way, see `docs/decisions.md`; for traps, `docs/gotchas.md`.

## Palette: night city (active), as theme roles

| Role (column / Tailwind name) | Night city | Warm darkroom (alternate) | Used for |
|---|---|---|---|
| `background` | asphalt `#17140F` | darkroom cream `#E8DEC6` | page base |
| `textPrimary` / `text-primary` | vapor cream `#E9DFC8` | ink umber `#2B2119` | text, frame numbers on frames, role line, login errors |
| `accentPrimary` / `accent-primary` | harsh red `#C1272D` | burnt sienna `#A6472B` | buttons, focus, iris arc, error rule |
| `accentSecondary` / `accent-secondary` | sodium amber `#C97C2E` | ochre gold `#C08A2E` | nav hover, placeholder frame tint, ready-button hover |
| `accentTertiary` / `accent-tertiary` | sickly neon `#9AAA3C` | olive drab `#5C6440` | placeholder frame tint, "Saved." rule |
| `accentSoft` / `accent-soft` | rain-slick `#46535B` | faded rosewood `#8C5A4E` | hover fills, placeholder frame tint (not text until decision 7) |

Contrast on asphalt: vapor 13.9, neon 7.2, amber 5.6, red 3.1 (borders / large text only), **rain 2.3 (fails for text)**. Vapor on a filled red button is 4.4 (fails at 14px). Asphalt on amber is 5.6. A lifted rain `#7E8C94` would give 5.3; not yet agreed with the client (open decision 7).

The two palettes are rows in `theme_palettes` ("Night City" active, "Darkroom warm"), seeded by `npm run seed:palettes` / `seed:palettes:test`. With no active row the code falls back to night city.

## Roles

- **Owner (Yuki):** content management only: photos, video, stop motion, bio, credits, palette. Can't see analytics or system health.
- **Admin (developer):** everything the owner can do, plus an admin-only tier (traffic analytics, system health; not built).
- **Public:** visitors only. No client logins or private galleries.

Owner-content changes gate with `requireOwnerOrAdmin`; admin-only features with `requireAdminOnly`. Owners manage their account at `/dashboard/owner/account`, admins at `/dashboard/admin/account`. Layout gates aren't the security boundary: Server Actions and data reads gate themselves.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js App Router, Next 16.3.4, Cache Components on |
| Database | Neon Postgres, with a separate `test` branch for integration and e2e |
| ORM | Drizzle (neon-http driver: no interactive transactions, use `db.batch` or one upsert) |
| Styling | Tailwind v4 (`@theme inline` over the palette's CSS variables) |
| Images | Cloudflare R2 (not wired) |
| Video | Cloudflare Stream, signed playback + watermark (not wired) |
| Auth | Custom cookie sessions (`session` cookie, 7 days), bcrypt cost 12 (`bcryptjs`). `/login` throttled per email (5 in 15 min) and per IP (20); the account actions' current-password check throttled per account (5 in 15 min, then the session ends). Emails stored trimmed and lowercase (CHECK `users_email_normalized`). Passwords at least 8 characters. |
| Hosting | Vercel (not deployed yet) |
| CI | GitHub Actions on PRs and pushes to `main`, Node 24: typecheck and unit in parallel → integration (test branch, files one at a time) → e2e on the production build (chromium, PRs only). Typecheck and every test job are required checks on `main` (repository ruleset), so changes go through PRs. |

## Environments and data

- **Env files:** `.env.local` (dev branch) and `.env.test` (test branch, `NEON_BRANCH=test`). Both have `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct, used by migrations). Nothing is exported in the shell. Claude can't read them (blocked in `.claude/settings.json`).
- **Migrations:** `npx drizzle-kit generate`, then `npm run db:migrate` (dev) and `npm run db:migrate:test` (test). `drizzle.config.ts` picks the env file from `ENV_FILE` and prints the target host. Commit the generated `.sql` files and `db/migrations/meta/` with the schema change.
- **Seeds:** `seed:users` (dev only; prints one-time temporary passwords), `seed:palettes` / `seed:palettes:test`, `seed:frames` / `seed:frames:test` (24 photo, 6 video, 4 stop-motion placeholders; photo 001 is the hero; featured: photo 007, video 003, stop motion 002, video 005). The e2e specs depend on this seed. Seed the test branch before `test:e2e:prod`, since the production build prerenders public pages.
- **Production:** no production database yet. Before the first deploy: run every migration there (`login_throttle` is needed for login and account changes; check emails before `users_email_normalized`), seed palettes (tabled), seed real users. Placeholder frames never go to production; remove them with `delete from frames where title = 'Placeholder' and image_url is null`.
- **Unlocking an account by hand:** `delete from login_throttle where key = 'email:<address>';` (login) or `'account:<userId>'` (account changes), or wait 15 minutes.
- **Placeholders:** site name "Yuki Ward" / "YW", contact email, availability line and social URLs in `lib/site.ts` are placeholders until Yuki supplies the real ones (open decision 5).

## Test conventions

- `.test.ts` = Vitest (unit next to the code in `lib/`, integration in `tests/integration/`); `.spec.ts` = Playwright (`tests/e2e/auth`, `dashboard`, `public`).
- Unit tests touch no database. Integration tests refuse to run unless `NEON_BRANCH=test`, clean `%@example.test` users in `beforeEach` (so the last test's rows stay for inspection), and run one file at a time.
- E2E accounts live in one keyed `TEST_ACCOUNTS` object in `tests/e2e/fixtures/accounts.ts`. Each spec that changes account state gets its own account; a spec that renames an account lists the new address as `changedEmail` so cleanup finds it. Global setup reseeds every run and clears `login_throttle`.
- Every e2e login comes from one IP, so the whole suite shares one `ip:` counter (limit 20 failures per run).
- E2E targets: `npm run test:e2e` (dev server on 3000, may reuse a running one) and `npm run test:e2e:prod` (build + start on 3100, never reuses). Stop any running dev server after seeding; `'use cache'` keeps old data in memory.
- Every public page spec checks its tab title (it's the only thing that catches a misspelled `metadata` export).
- Narrow nullable results in tests with Vitest's `assert(value, message)`; compare objects with `toEqual`.
