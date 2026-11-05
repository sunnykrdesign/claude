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

## Review panel

A **Review** button in the bottom-right corner opens the review controls. They're for design review only, not part of the product:

- **Design version:** V1, V2 or V3. You can also add `?v=1`, `?v=2` or `?v=3` to the URL.
- **Look up a person · layout** (all versions): pick where the **person card** sits (Left panel or Top header) and where the **section tabs** sit (Top, Left or Right). That makes six combinations, and a small diagram shows the current one.

- **Locked sections:** shows the demo team password.
- **Sidebar menu:** an on/off switch for each sidebar item: Overview, People, Look up a person, Identity & audits, Data dictionary and Later phases.
  - Hidden items leave the sidebar, and links to them open the next visible page.
  - At least one page always stays on.

Your choices are remembered on that browser.

## Design versions

- **V1:** the original layout, with generous spacing.
- **V2:** a framed, light workspace. It is denser, with a bento-style Overview, a sticky profile rail, outlined cards and pastel avatars.
- **V3:** a soft grey canvas with white cards, monospace table headers and status chips, and upGrad red as the accent colour. Its Overview is built for live monitoring:
  - **Top numbers:** a row of six key figures. The numbers roll in digit by digit when the page opens, and the live counters keep ticking.
  - **Trends:** a chart with a crosshair that follows the cursor (or the arrow keys). It shows a tooltip with every series for that day and a red date pill on the axis. Each series can be switched on or off from the legend.
  - **Paid leads, checked against the profile:** a table of recent paid leads, filtered by business tabs with a sliding indicator. Clicking a row lifts it into a card with a red top edge, AI fields (next-best programme, intent) and actions.
  - **Business cards:** one per business, with a live profile count and an animated consent ring, plus a bar chart of lookups this week.
  - **Motion everywhere in V3:** tabs and segments use the same sliding indicator. Cards rise in with a stagger. People directory rows open into the same detail card.
  - **Reduced motion:** all of this switches off when the system asks for reduced motion.

## People directory

**People** (`#/people`, central data team only) lists everyone upGrad knows: one row per person.

- Each row shows life stage, the businesses that know them, lifecycle state, revenue, how many channels can reach them, and when they were last active.
- Above the list: key numbers, segments (leads, learning, alumni, minors) and a filter.
- **Open** takes you to the full 360 profile. The Overview also lists people recently looked up across teams.

## Sample lookups

The **Look up a person** screen searches sample data by exact phone or email (names are never used). The screen has no sample buttons, so type one of these:

| Search | What it shows |
| --- | --- |
| `arjun.kumar88@gmail.com` | Arjun: learning with WP, alumnus of Internshala, re-acquired through a paid ad. Full profile with photo |
| `+91 98234 41127` | Ananya: known to 3 businesses, no consent for cross-business offers, a "worth acting on" moment |
| `rohan.mehta07@gmail.com` | Rohan: a Study Abroad lead with Sales Insights scores and an "intake passed" moment |
| `+91 99001 22334` | A shared family phone: two linked people to choose from, one of them a minor (restricted) |
| Any other valid number or email | New to upGrad |

Phone numbers work with or without `+91`, spaces or a leading `0`. Only verified phones and emails are used to match.

## Profile and data model

The profile and data model follow the four data sheets (Learner Profile, Academic & Skill Profile, Activity Data, Insights).

- **Header card:** photo, life stage, age band (the date of birth isn't stored), city, owning business, profile completeness and the global person ID. Which channels are allowed is in **Personal › Consent & preferences**.
- **Worth acting on:** moments such as an intake that has passed, a new enquiry in another business or a certificate issued.
- **Five sections, one row of tabs:**
  - **Personal:** contact, personal details, consent.
  - **Education:** education before upGrad, courses with upGrad, skills.
  - **Professional:** career, aspiration, outlook (intent, next-best programme, call-analysis scores).
  - **Financial:** financial profile, plus revenue and programmes bought with upGrad.
  - **Activity:** where they are with each business (Prospect → … → Alumni), an engagement summary, then the timeline. One filter narrows the timeline by type or business.

  One section shows at a time, and the arrow keys move between them.
- **Always in view:** the person and the section tabs stay on screen while you scroll, in every layout.
  - In the left-panel layouts, the person card stays pinned.
  - In the top-header layouts, a slim bar with the photo, name and key facts takes over once the card scrolls away.
  - The tabs stay pinned at the top, or beside the details when they're listed on the left or right.
- **Locked financial details:** the Financial section starts locked, and its tab shows a small lock. You can see which fields exist, but every value is masked.
  - Selecting the **eye** at the top of the section asks for the team password (demo: `upgrad2026`). The right password shows the values for that profile.
  - Selecting the eye again hides them, and so does opening another person.
  - After three wrong tries, unlocking pauses for 30 seconds.
  - Counsellors from another business never see financial details, password or not.
  - In this prototype the password is checked in the browser. The real product should check it on the server, against the viewer's role, and log each unlock.
- **Less up front:** above the tabs there's only the person card and any "Worth acting on" moments.
- **Card layout:** the detail cards stack in one column on every screen size. On wider cards each row reads label | value | source. In V2 and V3 the left profile column uses lighter type and lists its facts as label and value pairs.
- Every value shows its source system (Prism, LSQ, HubSpot, OMS, SA/WP Sales Insights, CMS or a rule). Where sources conflicted, the merge rule that picked the value is shown.
- **Sensitivity:** T1 contact details are hidden until the viewer gives a reason. T2 values are bands only: the financial profile needs a reason before it's shown. Other businesses never see T2 values, payments or revenue. Every reveal is logged.
- **Data dictionary** (central data team only, `#/data`) lists all 117 items from the four sheets:
  - **For each item:** sample coverage (share of profiles that have it), main source and its share of values, last sync, and whether its mapping is verified (from each sheet's "Check" column), plus its source fields, merge rule, storage, sensitivity tier and P0/P1/P2 priority.
  - **Across the page:** headline numbers (P0 coverage, weak P0 items, sources syncing, mappings verified), source health, who can see what and how a value is stored.
  - **Tables:** the tables behind the profile sit in a collapsed "For engineers" section.

Sample photo: `assets/profile-arjun.jpg`.


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
