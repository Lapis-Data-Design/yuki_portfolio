# Yuki Portfolio — how Claude works in this repo

Portfolio site for Yuki, a photographer / videographer / stop-motion artist who has also worked Hollywood film, TV and music crew roles. Next.js 16 (App Router, Cache Components), Neon Postgres + Drizzle, Tailwind v4, custom cookie auth, Vercel. Non-code facts (palette, roles, environments, test data) are in `docs/project-notes.md`.

## 1. You propose, I apply

I am the filter every code change goes through. **You never change application code yourself.**

- **Don't edit, create, move or delete files outside `docs/` and this `CLAUDE.md`.** `.claude/settings.json` blocks the file tools there; don't work around it (no shell redirects, `sed -i`, `tee`, scripts or one-off `node -e` that write files, no `git checkout` / `restore` / `stash` / `reset`).
- **Give every change in the chat, ready to paste**, in the order I should apply it:
  - the file path as a heading, marked **new file** when it doesn't exist yet;
  - the whole file for new or short files; otherwise **Find** / **Replace with** blocks, each Find copied exactly from the current file with enough lines to be unique;
  - renames and deletions as commands for me to run.
- **Read the code yourself before proposing.** The code is the source of truth, not the docs. If a doc and the code disagree, trust the code and tell me the doc is stale.
- **After I say "applied"**, re-read the changed files (or `git diff`) to check they match what you proposed before moving on.
- **Commands:** read-only commands (`git status` / `diff` / `log`, `ls`, `grep`) and `npm run typecheck` / `npm test` are fine. Ask before anything else. Never run git commands that change history or the working tree (commit, push, checkout, switch, merge, rebase, reset, stash), migrations, seeds or `npm install`. Give me the command instead.
- **Commits:** suggest a short imperative message for each step (like `Add failing tests for …`); I commit.
- **Docs are the exception:** you may edit files in `docs/` and this `CLAUDE.md` yourself. Each edit asks me first, so show what you're changing.

## 2. How work is done

- **One task at a time**, from the top of `docs/tasks.md` unless I say otherwise. One branch per task, from `main`, named for the task (`fix-…` for fixes). Each branch is its own PR, using `.github/pull_request_template.md`.
- **Test-first:** commit each test before its code and see it fail for the expected reason, then make it pass.
- **Verify before calling it done:** `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run test:e2e`, `npm run test:e2e:prod`, plus a visual check at phone and desktop widths for UI work. CI runs typecheck, unit, integration and e2e (production build); all are required checks on `main`.
- **Test database safety:** integration and e2e use the Neon `test` branch (`.env.test`, `NEON_BRANCH=test`). Never run integration and e2e at the same time, or a local suite while CI runs: both clean `%@example.test` users and the whole `login_throttle` table.
- **Before proposing work in an area, search `docs/gotchas.md` and `docs/decisions.md`** for it (file names, error text). Many traps there have already been paid for.
- **Ask, don't guess,** when a decision is the client's (open decisions in `docs/decisions.md`) or when a change can't easily be undone.

## 3. Keeping the docs current

| Doc | Holds |
|---|---|
| `docs/tasks.md` | Open and `[?]` tasks only, grouped in numbered sections, with **Next up** at the top |
| `docs/completed-tasks.md` | Every finished task, moved word for word, same section numbers |
| `docs/decisions.md` | Open decisions at the top, then every decision made, by date, with its reasoning |
| `docs/gotchas.md` | Traps already hit, by date: what happened and how to avoid it |
| `docs/project-notes.md` | Facts the code can't tell you: palette and contrast, roles, environments, CI and test-data conventions |

- **Task finished:** mark it `[x]` with the date, add a short **As built** note (branch, commits, what changed from the plan), then move it word for word, with its sub-bullets, to `docs/completed-tasks.md` under the same section number. Never delete history. A finished sub-item under a task that's still open moves on its own, and the open task gets a one-line pointer to it. `[?]` items stay until they're checked against the code. New tasks go into `docs/tasks.md`.
- **Decision made:** add it to the end of "Made" in `docs/decisions.md`: date, the decision in bold, and the reasoning in one or two lines (and whose call it was). Update the open list if it settles one.
- **Gotcha hit:** add it to the end of `docs/gotchas.md` with the date: the symptom, the cause and how to avoid it.
- **Non-code facts change** (a new environment, a palette decision, a new test account convention): update `docs/project-notes.md`.
- Doc changes go in the same branch and PR as the work they describe.

## 4. Commands

**Task complete (automatic).** When a task from `docs/tasks.md` is finished, before anything else: update the docs (section 3), then end the reply with:

> **Task complete: [task name].** Good point to start a fresh session (`/clear`). Paste this to start it:
> "Read `docs/tasks.md`, then search `docs/gotchas.md` and `docs/decisions.md` for [2–3 keywords]. Next task: [the next open task]."

Don't start the next task in the same session unless I say to keep going.

**`/handoff` (when I ask, even mid-task).** Update the docs with everything from this session, including where the in-progress task stopped (branch, last commit, next step), then give me the paste-ready opener for the next session.

**`/tasks`.** Show the open items from `docs/tasks.md`, grouped as in the doc, with the next recommended task called out.

## 5. Design direction (full spec in `design-concept.html`, night-city variant)

**Subject:** photographer / videographer / stop-motion artist who has also worked Hollywood film, TV and music crew roles. **Audience:** producers, creatives and brand contacts sizing up range and credibility. **Job of the site:** prove range across photo, video and stop motion, and make the crew experience read as real craft.

**Palette: night city** (client's pick, 2026-10-05). Nocturnal street light on a dark base: sodium lamps, neon and rain on asphalt. No pure black, pure white or bright orange.
Asphalt `#17140F` base · Vapor cream `#E9DFC8` text · Harsh red `#C1272D` primary accent · Sodium amber `#C97C2E` secondary · Sickly neon `#9AAA3C` tertiary · Rain-slick `#46535B` soft accent/hover/captions. The warm darkroom palette is kept as an alternate row in the database, not the default.

**Colors in code:** palettes live in the `theme_palettes` table and reach the page as CSS variables. Color names are the table's column names, in kebab-case for CSS: `background`, `text-primary`, `accent-primary`, `accent-secondary`, `accent-tertiary`, `accent-soft` (e.g. `bg-background`, `text-text-primary`, `border-text-primary/30`, `bg-accent-primary`). Never write a hex value in a component, and don't invent theme-flavored names for code.
**Contrast:** on asphalt, harsh red (3.1:1) is for borders, focus rings, buttons and large text only, and rain-slick (2.3:1) is not for text, until the soft-color contrast decision is settled. Body text and small text use `text-primary`. Hovers on small text use amber (`accent-secondary`).

**Type:** Jost (display, bold/semibold, sentence or title case, never all-caps) · Zilla Slab (body, under ~80 chars per line) · Space Mono (frame numbers and roll/timestamp metadata only, never nav, labels or the logo mark). In Tailwind: `font-sans` = Jost, `font-serif` = Zilla Slab, `font-mono` = Space Mono.

**Layout:** left-anchored and asymmetric like a contact-sheet edge; imagery large on the wide side, text in a fixed left column; flat color blocks only (no rounded cards, shadows or decorative gradients; tinted placeholder frames that stand in for photos are the one exception, until real assets land).
**Signature:** every piece of work is a numbered frame (`No. 001`, `Roll 27A`) in Space Mono, bottom corner, using the shared `Frame` component (always give it an aspect class). Reuse it everywhere.
**Ornament:** one iris/arc divider motif only (`IrisDivider`). **Motion:** one orchestrated moment (slide-projector section advance); no scroll fade-ups, no hover effect on every card.

**Avoid:** cream + high-contrast serif + bright terracotta (`#D97757`); tracked all-caps eyebrows; middle-dot meta strings; spaced em-dash labels; arrows on every link; identical rounded shadowed cards; decorative 01/02/03 markers.

**Pages:** Home (title-card hero, hero frame, selected frames row) · Photography (contact-sheet grid, frame count) · Video (horizontal reel strip) · Stop motion (reel strip + detail page, provisional) · About/credits (credits at equal weight to the work) · Contact (mailto now, form later; socials).

## 6. Hard boundaries (intentionally not built)

No signup, no forgot-password flow, no client accounts or private galleries, no video DRM (token-gated streaming + watermark is the ceiling).

## 7. History

Before 2026-11-12 this project was run from a claude.ai project ("YukiPhotograph"). Its docs stay there as a read-only archive, including the detailed as-built write-ups of each feature. Decisions, gotchas and tasks were carried over into `docs/`. Git history and closed PRs are the record from here on.
