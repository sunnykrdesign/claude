# upGrad Customer Intelligence: Phase 1 dashboard design

Design prototype for the Phase 1 of the Customer Intelligence Platform: identity resolution and the unified user database across Unacademy, Internshala and Working Professionals.

**Working dashboard (GitHub Pages):** https://sunnykrdesign.github.io/Customer-Intelligence-Platform-Strategy-Proposal/

**Design canvas:** https://claude.ai/artifact/5uSQYgSmss3X2D4Zu1XahK

The working dashboard is a single self-contained file, `docs/index.html` (plain HTML, CSS and JavaScript, no build step or dependencies apart from the Inter web font). Open it in any browser, host it on any static site, or embed it in an `<iframe>`. Screens are linked by URL: `#/overview`, `#/lookup`, `#/identity`.

All numbers, names and people in the screens are sample data for design review.

## Sign-in flow

The working dashboard starts at sign-in and walks through the full journey:

1. **Sign in** with Google or a work email. Only `@upgrad.com`, `@unacademy.com` and `@internshala.com` addresses are accepted.
2. **Check your email** for a 6-digit code (in the prototype, any 6 digits work).
3. **Choose your team.** The central data team sees Overview, person lookup and identity audits. Counseling teams (Internshala, Working Professionals, Unacademy) only see person lookup.
4. **Before you start.** A one-time agreement to the data-use rules: contact details are hidden until a purpose is given, consent is checked before contact, and data on minors is restricted.
5. **Dashboard.** You land on your team's home screen. Counselors from a business the learner hasn't consented to are told not to contact them, and the link to the owning business's CRM is hidden.

Authentication is simulated in the browser for the prototype; there is no real login or backend. The session lasts until the tab is closed or you sign out.

## Preview and share

- **Preview without signing in** (link under the sign-in panel) opens the dashboard as a guest, seen as the central data team. A dark bar at the top says it's a preview, with **Share** and **Sign in**.
- **Share** (in the sidebar, the preview bar and under the sign-in panel) opens a sheet that builds a link:
  - **Skip sign-in:** the link opens straight into preview mode.
  - **See it as:** central data team, or an Internshala, Working Professionals or Unacademy counselor.
  - **Open on this screen:** the link lands on the screen you're on (or that team's home screen, if they can't see it).
  - **Copy link**, **Open preview**, the device's own share menu where available, and **Embed on a website** (copyable `<iframe>` code).

Preview links look like this:

- Central team overview: `…/?preview=1#/overview`
- Working Professionals counselor on the lookup screen: `…/?preview=1&team=wp#/lookup`

`team` can be `central`, `internshala`, `wp` or `unacademy`.

## Screens

| File | Screen | What it answers |
| --- | --- | --- |
| `design/Main.dc.html` | Overview | How far Phase 1 has got, organised by the proposal's three objectives: know our customers, stop buying back our own learners (CAC), right moment and right need. Plus a foundation block for event-schema and consent health. |
| `design/Profile360.dc.html` | Look up a person | A counselor on a call looks someone up by phone or email and sees straight away whether upGrad already knows them, their journey across businesses, purpose-bound consent, masked contact details and a read-only activity timeline. |
| `design/Identity.dc.html` | Identity & audits | The matching rules (merge only on verified phone or email, link but never merge on a shared phone, ignore similar names or devices), an audit of sampled automatic merges that sets the false-merge rate, and the reversible merge log. |

`design/canvas.json` holds the layout of the three artboards on the canvas.

## Design principles

- **Apple-like restraint.** Black, greys and white, with upGrad red only for the single thing that needs attention on a screen. Large titles, grouped lists with hairline dividers, one number or one chart per section.
- **Built from the proposal's logic.** One profile per person; businesses keep their own CRMs, so the 360 view is read-only; wrongly merging two people is worse than missing a match; consent is recorded per purpose and checked before outreach; personal data is masked and access is logged.
- **Phase 1 only.** Decisioning and cross-sell are shown as later phases. Targets in the proposal that are still `[X]%` stay as placeholders.

## About the file format

The `.dc.html` files are Design Component pages for the Claude design canvas. Each one is plain HTML with inline styles plus a small logic block, but it relies on the canvas runtime (`support.js`) for templating and interactivity, so opening a file straight from disk will not render it correctly. Use the live canvas link above to view and click through the screens.
