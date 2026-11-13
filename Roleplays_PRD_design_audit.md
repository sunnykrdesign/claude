# Quanta Roleplays prototype vs PRD — design audit

Inputs: `Quanta_Roleplays_v2.html` (three admin prototypes: Quiz module, CMS, Super Admin) checked against `uPACE on Quanta – PRD`. Every scenario was run in a headless browser at 1440×900 as Content Author, Programme Admin and Super Admin. PRD references are to line numbers in a markdown conversion of the docx (prd.md), so look the sections up by heading in Word.

## Totals

| Area | High | Med | Low | Total |
|---|---|---|---|---|
| Quiz module: bank, New roleplay, Create with AI, stepper | 4 | 9 | 21 | 34 |
| Quiz module: review, Edit details, Overview, Duplicate | 2 | 5 | 19 | 26 |
| CMS: course builder, memory, client checks | 1 | 10 | 18 | 29 |
| Super Admin: tenant settings, usage, catalogs, standalone | 2 | 8 | 27 | 37 |
| **Total** | **9** | **32** | **85** | **126** |

## Coverage gaps (whole PRD sections with no design)
- **Learner experience, web and mobile (PRD §Learner experience, L846–1024):** none of it is in the file: roleplay page and mic setup, the call, scoring, results, and mobile behaviour.
- **Tenant Admin:** standalone window, card image and enrolment (target type Roleplay).
- **Reports, Dashboard and Usage reporting:** the PRD marks these as a later release.
- **Pathways:** the links do nothing, so "roleplays can't be added to pathways directly" can't be checked.
- **Smaller gaps:**
  - Asset Library with asset type "Roleplay"
  - mandatory/optional control on assets
  - discarding a draft version
  - two people editing the same draft
  - what changed in a v2+ review
  - Duplicate course

## The 9 High issues
1. **QB A1:** a failed Create with AI draft loses everything drafted, and no Draft appears in the bank. PRD: the roleplay is created when building starts and whatever is drafted is kept (L180, L227).
2. **QB A2:** Create with AI adds two example Knowledge documents nobody attached, with "Use documents only" on. PRD: only attached documents, off by default (L216, L397).
3. **QB S1:** empty level definitions aren't flagged in "Ready to publish?", and "Levels checked" clears the flag while levels are still blank (L417, L267).
4. **QB R1:** Content Authors see voice rates in the voice picker ("Sarvam · about ₹1.86/min"). PRD: cost is for Programme Admins and Super Admins only (L342, L413).
5. **LC-01:** a new version of a live roleplay that has been submitted for review never shows in Overview "Needs your attention", and the bank row doesn't show it's in review. Reviewers can't find it (L160, L609).
6. **LC-14:** Edit details on a live roleplay lets you move it to a client with roleplays off or without its voice. It only warns and then saves, and nothing catches it later (L265, L305).
7. **CMS-01:** "Pick roleplays" with nothing picked shows the row error, but the course still publishes with an all-green checklist (L524–526).
8. **SA-20:** there's no unlimited state for minutes. Clearing "Minutes available" shows 0 and 100% used and blocks Save. PRD: no minutes set means unlimited (L700, L717).
9. **SA-01:** "Learner sees transcript after the session" is disabled unless Store transcripts is on. PRD: the transcript shows even when it isn't stored (L678).

## Decisions needed (design and PRD disagree, and either could be right)
- **Client checks:** the PRD says each one is a blocking modal with OK (L539). The design shows inline disabled rows with the reason instead, which is arguably the better UX. Pick one and update the other.
- **Programme Admin submit button:** the PRD says "Submit for review" (L148–150, L123) and "Submit and publish" (L262–265). The design uses "Submit and publish".
- **Preview and test tooltip:** the PRD has two strings, "Add a voice and at least one goal to test" (L133) and "To preview and test, fix: …" (L308). Gating testing on the whole publish checklist, client and name clash included, also blocks early testing even though tests ignore tenant settings.
- **Band label:** results show "the tenant's band label" (L991), but tenant settings have no band label setting. The Client Admin "sets skill levels" (L125), though roleplays don't write skills in Phase 1.
- **"Edit (forks v2)":** "forks" is developer jargon for an admin-facing button.
- **Leftover voice-choice code:** CMS and Super Admin both still contain mapping code with a voice chooser. It can't be reached, but it contradicts L108 and should be removed before handoff.

## Cross-cutting issues
- **The voice fallback warning never fires anywhere** (CMS-22, SA-28), even though the sample data has voice mismatches.
- **Sample data contradicts the rules:** the Coach roleplay has a voice its client doesn't have, and a never-published roleplay is marked as used by courses. That puts locks on screens that shouldn't have them.
- **Layout:**
  - the bank table is wider than the page at 1440px, which hides the row menu (the bank's only Duplicate entry point)
  - CMS module header buttons wrap
  - modals sit near the top of the screen instead of centred

---

## qm-build: Quiz module creation and building (pages/qm.html)

Method: Playwright drive of every listed scenario plus click-throughs (new modal, full Create with AI run in Succeeds and Fails modes, each purpose's steps, goal drawer, weights, tooltips, Ready links) as Content Author, Programme Admin and Super Admin. Source checked in `un/qm/template.html`. Screenshots are in `shots/qm-build/`. Scripts are in `scripts/qb*.js`.
PRD line refs are to `prd.md`.

### 1. Roleplay bank list

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| B1 | Med | UX | Roleplay bank, 1440 px (01_bank) | The table is wider than the page (document scrollWidth 1545 > 1440). The AUTHOR column is clipped ("Rohan Da…") and the row-actions kebab sits at x=1513, off screen. That kebab is the only bank entry point to Duplicate, so you have to scroll sideways to reach it. | Duplicate is available from the Roleplay bank row menu (prd.md:L639) | Drop or merge columns (see B3), or pin the actions column. Fit the table at 1280–1440 wide. |
| B2 | Low | UX | Bank rows with the "Created with AI" chip | The name gets cut to "Postpaid up…" and "Plan basics …" because the chip takes the space. | — | Put the chip on a second line under the name, or give the name column more width. |
| B3 | Low | Extra | Bank columns SCORED / GRADED | Separate Yes/No columns, which come straight from purpose. | "there are no Scored or Graded switches"; scoring is fixed by purpose (prd.md:L26-29) | These repeat PURPOSE. Remove them to free width for B1. |
| B4 | Low | Mismatch | Bank row with no client (Store walk-in greeting) | Shows "—". The Client filter has no "No client" option, so client-less drafts can't be filtered. | Client is "Shown as a chip in the bank list (with a Client filter)"; drafts without a client show a "No client yet" chip (prd.md:L383, L302) | Show a "No client yet" chip and add a "No client" filter option. |
| B5 | Low | UX | Bank footer | "Rows per page 10" is static text with no control and no pagination. | — | Use the standard table pagination component. |

### 2. New roleplay modal

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| N1 | Low | Extra | Build it myself → Create | Shows the toast "Roleplay created". | Not listed in the confirmations (prd.md:L335-340) | Add it to the PRD's confirmations list, or drop it. |

Matches well: two options; Purpose (required) / Name (required, live clash check, 100-character counter) / Client (optional, searchable, "Set it later"); the client note text is word for word; Create shows "Creating…" and is disabled while saving; Create with AI shows no fields and the button reads "Continue"; Cancel creates nothing; no Delete in the row menu.

### 3. Create with AI

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| A1 | High | Mismatch | AI draft = Fails → "We couldn't finish this draft" (20_ai_fail) | The whole draft panel is replaced by the error. Sections already drafted (Basics, AI persona) vanish. Nothing exists in the bank (still "Showing 5 of 5" after leaving). "Build it myself" opens an empty New roleplay modal. The copy says only "Your description and documents are kept." | "The roleplay is created when the AI starts building, so whatever is drafted is kept if generation fails" (prd.md:L180-181). "whatever was drafted is kept" (L227-228) | Create the Draft row when building starts. On failure, keep the drafted sections visible with the error above them, and offer "Open what's drafted" plus Try again. Change the copy to "What's drafted so far is kept." |
| A2 | High | Mismatch | Open in builder with no documents attached → Conversation › Knowledge (19_ai_builder_conv) | The draft has 2 documents nobody attached ("Postpaid plans - Oct 2026.pdf", "Objection handling guide.pptx"), and "Use documents only" is on. | "Documents attached on the start screen become the roleplay's Knowledge documents" (prd.md:L216-217). Use documents only is off by default (L397) | With no attachments, Knowledge must be empty and Use documents only off. |
| A3 | Med | Missing | Building phase (15_ai_building) | Shows a typing line ("Drafting Scenario…", "Updating Basics…"). There is no "Building your roleplay…" title and no time elapsed. "N of 4 sections done" is shown. | "'Building your roleplay…' with time elapsed" (prd.md:L193) | Add a "Building your roleplay… 0:12" status above the draft. |
| A4 | Med | Missing | Stepper header / In review view of an AI-made roleplay (r1 in review, new AI draft) | "Created with AI" appears only on the bank row. The stepper header has no such label, including the in-review header the reviewer uses. | "labelled 'Created with AI' for the reviewer" (prd.md:L223-224) | Add a "Created with AI" chip to the header next to the purpose and client chips. (This overlaps with the review agent's area.) |
| A5 | Med | Mismatch | AI draft with client Reliance → Conversation › Voice (19_ai_builder_conv) | The AI picks Aarav (Azure), which Reliance doesn't have. The draft opens with the flag "This voice isn't available for Reliance. Pick another." | "The AI picks a voice from the configured voices"; on submit the voice must be available to the client (prd.md:L216, L394) | When a client is set, the AI should pick from that client's voices. |
| A6 | Low | Mismatch | Purpose question "Should attempts count toward the learner's results?" | Offers only Assess / Practice / Learn. Coach can't be reached when the purpose is left to the AI. | The AI fills in "purpose (if not chosen)", which can be any of the 4 (prd.md:L207) | Add a coaching option, or ask "What should the AI be?" with 4 answers. |
| A7 | Low | Mismatch | Draft panel sections | Labelled "Basics, Scenario, AI persona, Rubric". Pass mark is listed under both Basics and Rubric. Voice, time limit, description, AI instructions and opening line never appear, although the AI fills them. Source only: for Coach the Scenario row is labelled "Objections", and Demeanour is shown for Learn/Coach. | Sections "Basics, Scenario, Persona, Rubric"; AI fills voice and time limit (prd.md:L194, L207-211). Demeanour only for Practice/Assess (L365) | Name the section "Persona". Show pass mark once. Add Voice and Time limit rows. Use the purpose's own points label and hide Demeanour for Learn/Coach. |
| A8 | Low | UX | Ask phase after "Just build it" (16) | The "Just build it" button and the answer box stay on screen while drafting. The pass-mark question is left unanswered with no feedback. | — | Hide "Just build it" once pressed and show "Building your roleplay…" (see A3). |
| A9 | Low | Extra | Start screen prompt | 2,000-character limit with a counter. | No limit given (prd.md:L178-180) | Add the limit to the PRD. |
| A10 | Low | UX (prototype) | Understand line | Always says "a store rep pitches a postpaid upgrade to a prepaid customer", whatever the prompt (tested with a broadband/cafe prompt). | "says in one or two lines what it understood from the prompt" (prd.md:L183-184) | Prototype limitation. Note it for testing so reviewers don't read it as the intended copy. |

Matches well: start screen fields (prompt, Attach up to 10 with counter, optional purpose with "Let the AI decide", optional client "Set it later"); one question at a time with chips plus free text; "N of 4 sections done"; Refine placeholder "Describe the changes you'd like…"; changed section highlighted with "Updated"; Undo reverts the last change; the name clash adds " (2)" with an explanation in the chat; "Created with AI" chip in the bank; Setup left at standalone.

### 4. Stepper fields (all purposes)

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| S1 | High | Missing | Scoring › goal drawer → clear level definitions/names → Save goal | Ready to publish? stays "All clear" with empty level definitions (verified: levels 1–2 of "Grasp of the pitch" cleared). "Levels checked" also clears the "Check these levels" flag even when levels 6–10 are blank. | "Every rated level needs a written definition" (prd.md:L417). Ready to publish? lists invalid "rating levels" (L267-269) | Add an issue "Add a definition for every level: [goal]" for any empty level text or name on a rated goal. "Levels checked" should only clear the flag once all levels are filled. |
| S2 | Med | Mismatch | Goal drawer, rating type 1 to 10 | Level names learners see are empty for all 10 levels (only 1 to 5 gets Beginning…Expert). | "level definitions (prefilled for the rating type, editable), each with a short name learners see" (prd.md:L405) | Prefill 1–10 names. |
| S3 | Low | Mismatch | Goal drawer, Achieved / Not achieved | The level column reads "Pass" / "Fail". The names read Achieved / Not achieved. Type labels are "1 to 5", "1 to 10". | "Achieved / Not achieved", "Rated 1 to 5", "Rated 1 to 10" (prd.md:L420-423) | Use "Achieved" / "Not achieved" in the level column (Pass/Fail is Assess grading language). Use "Rated 1 to 5/10". |
| S4 | Med | UX | Conversation › AI instructions starter (30_coach_conversation) | Starters contain literal placeholders ({topic}, {persona}, {role}, {situation}), and nothing flags them. A roleplay can be submitted with "You are {persona}, {role}". | Starter text per purpose; written as "You…" (prd.md:L385) | Flag unreplaced {placeholders} in Ready to publish?, or write starters without placeholders. |
| S5 | Low | UX | Setup › Silence handling, Assess (30_assess_setup) | The "Hint 3 s – The hint text is shown" timing is still shown and editable, although hints are locked off. | Assess: "No hint"; hint "Locked off for Assess" (prd.md:L368, L401) | Grey out the Hint timing for Assess, or remove it there. |
| S6 | Low | Mismatch | Silence timings error | The inline text reads "Each step must be longer than the one before it." Ready to publish? reads "Silence timings must each be later than the one before". | "each later than the one before" (prd.md:L401) | Use one string, worded as "later". |
| S7 | Low | Extra | New Assess roleplay → Scoring › Pass mark | Prefilled 80, so the required check never fires. Duplicate to Assess leaves it empty. | "Assess only; required; 0 to 100%", no default (prd.md:L408) | Pick one: add an 80 default to the PRD, or start empty in both paths. |
| S8 | Low | Mismatch | Setup › Description | Shows a rich-text toolbar (B, I, lists, link) that does nothing. | Rich text (prd.md:L382) | Prototype only. Fine, but note it. |
| S9 | Low | UX | Voice picker | Every voice picture is a generic silhouette on a tint. | "each with its own picture" (prd.md:L394-395) | Use real portraits in the prototype so the ring and picture can be judged. |

Matches well: steps (Learn/Coach 3, Practice/Assess 4); Continue saves and never blocks on incomplete steps; field order by step; time limit default 5 (1–30); camera Off/Required; end instruction; silence defaults 3/8/12/18; hint text 150; attempts default 3 (Assess 1, Unlimited disabled, with note); Score that counts Highest by default (Practice/Assess only); memory default on for Learn/Coach, off for Practice, locked for Assess with "Graded attempts don't use memory"; points label by purpose, 15 × 200 with optional good answer; persona name 50 / role 80 / company 80; demeanour (Friendly…Angry + Other with description) only on Practice/Assess; learner line 150; voice grouped by provider with sample play and voices filtered to the client; documents 10 × 20 MB; Use documents only check; goals 1–10, name 80 / description 300 / guide 1,000 required; 4 rating types; weights split evenly (34/33/33) until edited, then kept as entered (50/33/33/0 = 116, flagged); qualitative goals have no weight; pass mark plus Full/Score-only feedback; review summary shows only this purpose's fields; language note fixed; End on abuse hidden.

### 5. Right panel and header

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| R1 | High | Mismatch | Content Author → Conversation › Voice (40_ca_voice_prices) | The cost card is hidden correctly, but the voice group headings show prices to the CA: "Sarvam · about ₹1.86/min", "ElevenLabs · about ₹2.50/min", "Azure · about ₹1.30/min". | "Content Authors don't see the cost estimate"; cost is "Super Admin and Programme Admin only" (prd.md:L342, L413) | Hide the per-minute rate for CA. Show "Sarvam · 2 voices" instead. |
| R2 | Low | Mismatch (PRD conflict) | Submit button, PA/SA | "Submit and publish" | L262-265 says "Submit for review (Content Author) or Submit and publish (Programme Admin, Super Admin)", but L148-150 says "Programme Admins and Super Admins also press Submit for review; their own drafts then publish automatically" | The design follows L262. Fix PRD L148-150. |

Matches well: header chips (ID, status, purpose, client or "No client yet", "v1 in progress", save status); Ready to publish? groups, with each item linking and scrolling to its field and Name/client items opening Edit details; Preview and test disabled until clear, with tooltip "To preview and test, fix: … · and 2 more" and the gated one "Saves, then opens the learner's page in a new tab"; Submit tooltip "Fix the items in "Ready to publish?" first."; cost card has Typical (70%) / Maximum, rollout estimator, INR/USD, up to 3 "Ways to lower cost", "Sample rates, servers excluded.", empty state "Add a voice and time limit to see the cost.", hidden for CA in the stepper.

### 6. Scenarios

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| C1 | Med | UX | "Couldn't save. Try again." → click Continue (51) | Continue does nothing. The step stays at 1 of 4, and the only signal is the small header status. No inline message or toast. | Continue "never blocks"; a failed save shows "Couldn't save. Try again." and keeps what was typed (prd.md:L257-260) | Either move on and keep retrying the save in the background, or show a visible error (toast/banner with Retry) when Continue fails. |
| C2 | Low | Mismatch | "Voice flagged after client change" | The toast reads "Saved. No new version needed." on a draft. | That copy is "for Edit details on a live roleplay" (prd.md:L337-338). Drafts get "Details saved" in the code | Use "Details saved" for this draft scenario. |
| C3 | Low | UX (demo data) | Stepper: Coach / Learn (fork of a published roleplay) | The published Coach roleplay for Reliance has voice Aarav, which Reliance doesn't have, plus the telecom opening line "Hi, I need a 2GB data top-up…" and the learner line "A prepaid customer in a hurry". | A published roleplay must have had a voice available to its client (prd.md:L394) | Fix the seed data so the Learn and Coach examples are valid and fit their purpose. |

Matches well: Rating type changed keeps the old text with "Check these levels" in the list, drawer and Ready to publish?; Weights not 100 is flagged as a warning; Learner speaks first hides the opening line with the note "Opening line kept: … It isn't used or checked while the learner speaks first."; Voice flagged shows "This voice isn't available for Reliance. Pick another." in the field and in Ready, with an unavailable tag on the card; Standalone client with roleplays off shows "Roleplays are off for Acme Demo." (skipped for course roleplays); Leaving with unsaved changes uses the placeholder modal copy word for word, and a failed save also triggers it.

### Not covered by prototype
- Two people editing the same draft (prd.md:L299).
- Attach/upload error states: more than 10 files, a file over 20 MB, wrong file type, document processing failure (prd.md:L179, L396). The counter just stops at 10.
- A time limit cut short by a tenant maximum (only help text, L398).
- Real voice sample playback and real voice pictures (L394-395).
- The AI asking only what the documents and prompt don't answer: only one canned rule (long prompt plus docs skips questions); the question set is fixed (L187-191).
- Generation cost tracked as platform usage (backend, L230-231).
- Name clash re-checked on submit (the logic exists in Ready to publish?, but no scenario shows a clash appearing at submit time) (L381).

## Findings: qm-lifecycle (Quiz module: header, review, lifecycle, Edit details, Published Overview, Duplicate)

Prototype: pages/qm.html (logic in un/qm/template.html, script from line 5197). Scripts: scripts/lc1.js to lc5.js (plus lc4b.js). Screenshots: shots/qm-lifecycle/.
Unless marked "source only", each finding was reproduced in the rendered prototype with Playwright.

**What matches well:** The header labels ("v1 in progress" / "v1 in review", "No client yet") match. All four save states work, and clicking "Couldn't save. Try again." retries (Saving…, then Saved). The pencil, Preview and test (first four issues + "and 2 more") and blocked-Submit tooltips match. The In review banners match the PRD for each role. Return to draft requires a "Note to author", and the author then sees "Returned by Kavya Menon: [note]". The toasts "Submitted for review. Programme Admins see it in Overview.", "[Name] v1 published", "Copy created as a draft for Reliance." and "Saved. No new version needed." match. The Edit details copy matches in the draft, published, moves-client and locked states, and Client can't be cleared on a published roleplay. The pencil is hidden for Content Author on a published roleplay. Cost is hidden for Content Author in the stepper and on the Overview. Programme Admin sees "Submit and publish", which publishes right away. The Overview has "The roleplay is live", the client, "Where this roleplay is used", the right-column summary and "Edit (forks vN)" / "Continue editing draft". The draft-of-live banner matches. The Duplicate modal has "Copy of [name]" with the name check, client prefilled and optional, and a purpose change lists the fields that won't be copied. There is no delete or archive control anywhere.

### 1. Review flow, Overview queue, roles

| ID | Severity | Type | Where (scenario + element) | Design does | PRD says (prd.md:Lnn) | Fix |
|---|---|---|---|---|---|---|
| LC-01 | High | Mismatch | "Published Overview: Content Author", then Edit (forks v4), Create draft & edit, Review & publish, Submit for review, then Overview as Programme Admin | A new version (draft of a live roleplay) submitted for review **never appears in Overview "Needs your attention"**. The queue only lists rows whose status is "In review", and a draft-of-live stays "Published" in the row (writeStore only updates `draftV`). The bank row shows "Published · v3 · v4 draft" with no In review status. The reviewer can only find it by opening the live Overview and clicking "Continue editing draft". | Step 4: Submit for review gives "Status In review; editing blocked; listed on Quiz Overview under 'Needs your attention'" (L260). Step 11: edits to published roleplays go through "steps 2 to 6 again" (L267). The draft "goes through review again" (L609). | List draft versions in review in the queue as "[Name] v4". Show "v4 in review" in the bank row's version or status. Make "Continue editing draft" read "Review draft v4" for reviewers. |
| LC-02 | Med | UX | Same flow, live Overview of r2 while v4 is In review | The live Overview still says "Draft v4 in progress" and "Continue editing draft" ("Draft v4 is in progress. Learners keep using v3 until you publish it.") even though v4 is In review and can't be edited. | Header label "v2 in review" (L320); editing is blocked while in review (L260). | Show "Draft v4 in review" and label the button "Open draft v4 (in review)". |
| LC-03 | Low | Mismatch | "In review", Programme Admin / Super Admin banner | Banner reads "**Awaiting review.** Submitted by Priya Nair · Today, 10:42. Test it, then publish or return it to draft." The "Awaiting review." title is the Content Author's wording and is prefixed for reviewers too. | Programme Admin / Super Admin see "Submitted by [name] · [time]. Test it, then publish or return it to draft." (L329-331) | Drop "Awaiting review." for reviewers, or use a reviewer title such as "Ready for review." |
| LC-04 | Low | Mismatch (PRD internal) | Stepper header, Programme Admin / Super Admin | The button reads "Submit and publish", and the confirm says "You're a Programme Admin, so your draft publishes as soon as you submit." | L290 says "Submit and publish (Programme Admin, Super Admin)", but L248 says "Programme Admins and Super Admins also press Submit for review", and the Roles table says "Submit for review publishes them automatically" (L122). | The design follows L290. Update L122 and L248 so the PRD is consistent. |
| LC-05 | Low | UX | Overview as Content Author | The roleplay row shows "View", but the placeholder Assessment row shows a faded "Review" button to a Content Author, who can't review. | Content Author cannot publish or review (L122). | Show "View" on every row for Content Author. |
| LC-06 | Low | Missing | Bank after Return to draft | A returned roleplay shows only "Draft" in the bank. Nothing tells the author it was returned or that a note is waiting. Overview has no "Returned to you" item either. | The note is shown to the author as "Returned by [name]: [note]" (L264). | Add a "Returned" marker or tooltip to the bank row, or a "Returned to you" list on the Overview for authors. |
| LC-07 | Low | UX | Return to draft by Super Admin (role "Super Admin") | The Super Admin persona has no name, so the author would see "Returned by Super Admin: …" (source only: `person()` returns "Super Admin"). The toast also says "Returned to Priya Nair with your note". | "Returned by [name]: [note]" (L264). | Give the Super Admin persona a name in the prototype. |
| LC-08 | Low | UX | In review, reviewer Publish button | Publish opens the confirm without re-checking "Ready to publish?". If a client's settings change while the roleplay waits in review (for example, roleplays turned off), Publish isn't blocked (source only: `act.publish` has no gate). | Blocked on publish if roleplays are off for the client (L265). | Gate reviewer Publish on the same issues list. |
| LC-09 | Low | UX | "In review" stepper (screenshot inreview_pa_full.png) | Read-only fields keep their editable styling: inputs on near-white rgb(248,248,250), selected radios and segmented controls in full accent red, and active "Continue to conversation". At a glance the page doesn't look locked. | Editing blocked (L260). | Use the design system's read-only or disabled field style while In review. |
| LC-10 | Low | Mismatch | Publish confirm on a first version (v1), "In review", Publish | The confirm says "…Learners already on an earlier version finish on that version." on v1, where no earlier version exists. On later versions the copy leaves out that learners at 0% progress are moved to the new version. | Silent version upgrade for learners with 0% progress; started learners stay on their version (L612-615). | Show the version sentence only for v2 and later: "Learners who haven't started move to v2. Anyone who has started stays on v1." |

### 2. Header, save status, tooltips

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| LC-11 | Low | Missing | Published Overview header (live-pa / live-ca) | The live header chips are ID · Published · purpose · client. There's **no version chip ("v3")**; the version only appears in the Overview table row. | Header labels: the version shows as "v2" when live (L319-320). | Add the "v3" chip to the live header, consistent with the stepper. |
| LC-12 | Low | UX | Pencil and Duplicate icons in the header | Icon-only buttons. Their meaning is only available as a hover tooltip ("Edit details", "Duplicate"); there's no visible label next to the labelled "Preview and test" and "Submit" buttons. | Header lists pencil (Edit details) and Duplicate (L289-290). | Acceptable per PRD. Make sure the aria-labels stay and the tooltip also shows on keyboard focus. |
| LC-13 | Low | Mismatch | Blocked Submit tooltip | 'Fix the items in "Ready to publish?" first.' (adds quotes) | "Fix the items in Ready to publish? first." (L326) | Copy nit. Align one or the other. |

### 3. Edit details modal

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| LC-14 | High | Mismatch | "Edit details: published, client editable", Client set to Acme Demo, Save | Shows the warning "Roleplays are off for Acme Demo." but **Save still works**: the toast is "Saved. No new version needed." and the live standalone roleplay now belongs to Acme Demo, a client with roleplays off. Likewise, "Edit details: standalone moves client" (Reliance) saves with "This voice isn't available for Reliance. Pick another.", so the live version uses a voice its client can't use. A live roleplay has no "Ready to publish?" panel, so nothing catches either problem. | Blocked on publish if roleplays are off for the client (L265). A client change that leaves an unavailable voice must be flagged in "Ready to publish?" (L305-308). Name and client changes apply to the live version with no new version (L298-301). | On a published roleplay, block Save when the new client has roleplays off or lacks the live voice, with an inline error such as "Pick a client that has roleplays on and this voice, or edit a new draft first". Alternatively, the PRD needs to decide this case. |
| LC-15 | Med | UX | Draft of a live roleplay as Content Author (fork, then the v4 stepper) | The pencil is hidden because the parent row is Published. But "Ready to publish?" items in the "Name and client" group still open Edit details for a Content Author (source only: `goIssue` calls `openForm('edit')` without checking `pencilShow`). The gating is inconsistent. | On a published roleplay only Programme Admin and Super Admin see the pencil (L301-302). The PRD doesn't say whether this covers a draft of a live roleplay. | Decide in the PRD whether a Content Author can edit name and client on a draft of a live roleplay. If not, make name and client issues read-only for them with a note like "Ask a Programme Admin". |
| LC-16 | Low | UX | "Edit details: draft" | The Client label has no "(Optional)", unlike New roleplay and Duplicate. The note "You can leave this empty while drafting. A client is required to submit for review." is worded differently from the New roleplay note "…a client is needed before you submit". | Client field notes (L334-338). | Add "(Optional)" while Draft and reuse the New roleplay wording. |
| LC-17 | Low | Extra | Edit details Save on a draft that has never been published | Toast "Details saved". | Only "Saved. No new version needed." is specified (L345-346). | Fine. Add it to the PRD's confirmations list. |

### 4. Published Overview, Edit, versions

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| LC-18 | Med | Missing | Stepper of a roleplay in use (draft v4 of r2, and r1) | The "Where this roleplay is used" panel exists only on the live Overview. In the builder, Setup type and client show "Used by Airtel…" locks, but nothing lists what uses the roleplay. | "The builder has a 'Where this roleplay is used' panel listing every course, cohort, catalog, pathway delivery and standalone enrolment that uses it. It shows why the client and setup are locked." (L652-654) | Add the panel to the stepper (right column, under Ready to publish?, or linked from the lock note). |
| LC-19 | Med | UX | Setup type lock in the stepper (r1, r2 draft) | Setup type lock note reuses the client copy: "Used by Airtel. Duplicate this roleplay to use it for another client." It doesn't explain why the standalone/course setting is locked. | Client and setup can be changed only while not in use; Duplicate is how a roleplay is used both standalone and in courses (L621-624, L647-649). | For the setup lock, use: "In use, so the setup can't change. Duplicate this roleplay to use it [standalone / in courses] too." |
| LC-20 | Med | UX (prototype data) | "In review", "Ready to publish? clear", "Returned draft with banner" (r1) | r1 is v1, has never been published (In review), yet the sample data puts it in a course, catalog, cohort and pathway. So an unpublished draft shows "Used by Airtel" locks, which is impossible and makes the lock states hard to judge. | Only published roleplays can be placed (L262-263). In-use locks apply after publish (L334-338). | Remove USE data for r1, or make it a published roleplay with a draft. |
| LC-21 | Low | Extra | Live Overview banner | Under "The roleplay is live" it adds "Any edit forks a new draft (v4). The current published version (v3) stays available to learners until you publish the new draft." The same text appears again in the fork modal, and the toast says "Draft v4 created. Learners keep using v3 until you publish." | The PRD gives only "The roleplay is live" and "Edit creates a new draft" (L303-304, L341-342). | Trim the repeated text and keep the fuller copy in the modal only. Add the toast to the PRD. |
| LC-22 | Low | UX | Live Overview after Submit and publish (r1) | "Published:" still shows 26 Oct 2026 (old last-edited date), not today's publish date. | — | Set the published date on publish. |
| LC-23 | Low | Extra | Fork modal CTA | "Create draft & edit" plus body copy. | Title "Edit creates a new draft" only (L342). | Fine. Document the CTA in the PRD. |

### 5. Duplicate

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| LC-24 | Low | Mismatch | Duplicate, Practice to Assess (bank row menu) | The list reads "Attempts become 1 to 20; hint text and own-attempt memory are locked off for Assess". The copy actually gets attempts = 1 (code). The list doesn't mention that pass mark starts empty. | Settings the new purpose locks take its defaults ("Practice to Assess: attempts 1, no hint, no memory"). Fields the new purpose needs start empty and show in "Ready to publish?" (L634-637). | "Attempts set to 1. Hint text and memory are off. Pass mark starts empty." |
| LC-25 | Low | UX | Duplicate from bank row on a roleplay with a draft | It always copies the live version. The code `r.draftV ? r.id : r.id` has identical branches, which looks undecided. Nothing in the modal says which version is copied. | "It copies the version being viewed." (L637-638) | Say "Copies v3 (live)" in the modal, or let the user pick live or draft. |
| LC-26 | Low | UX | Duplicate modal field order | Name, Client, Purpose (Purpose last). New roleplay has Purpose first, and Edit details has Name, Purpose, Client. | Duplicate's fields are listed as Name, Client, Purpose (L630-632). | Use one field order across the three modals. Purpose first reads best, since it drives the "won't be copied" list. |

### 6. Delete / archive

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| LC-27 | — | Matches | Bank row menu (Open, Duplicate), live Overview, stepper | No Delete, Archive or Discard anywhere (checked all 5 rows and 3 screens). | Roleplays can't be deleted or archived; drafts can't be deleted (L237-238, L625-628). | — |

### Not covered by prototype
- Discarding a draft version of a live roleplay ("follows the assessment behaviour", L610-611). There's no control and no stated decision.
- Two people editing the same draft (L316).
- Super Admin's read-only view of auto-mapped standalone roleplays and the "Awaiting tenant setup" / "Active" status (L265). This belongs to sa.html, not qm.
- The bank or row status for a draft of a live roleplay that is In review (see LC-01).
- What happens on publish when roleplays have been turned off for the client since submission. The "Roleplays are off for [client]" block is only shown as a Ready-to-publish issue on drafts (L265).
- Reviewer-specific views: the PRD's step 5 "read the steps" opens on step 1. There's no review summary or diff of what changed since the live version for v2+ reviews.
- Silent version upgrade and in-session behaviour (L612-618). These are backend rules, only hinted at in the confirm copy.

## CMS audit: pages/cms.html vs PRD

Scope: courses list, course builder (Structure / Review), Roleplay memory card, pre/post block, course overview, Add assets picker, Create cohort, Cohort structure, publish. Every scenario in the picker was driven in Playwright, plus interactions (Pick with no picks then publish, live removal of a source, adding a Coach, 5-pick limit, pre/post pickers, cohort memory-off modal, cohort picker).
Scripts: `$S/scripts/cms1.js` to `cms4.js`. Screenshots: `$S/shots/cms/` (scenario shots `<scenario>.png`, interaction shots `i_*.png`).

**What matches well:** Memory card copy and states match the PRD word for word: helper text, "New" tag, None / "All other roleplays in this course" / Pick, "Module 2 · Practice" labels, never lists itself, up to 5 with a counter, "Never uses memory", single-roleplay disabled copy, coach-first hint, "1 source removed", "Its source was removed" (also checked live by deleting the source), and "Pick at least one roleplay.". A newly added Coach defaults to the roleplay before it, and other rows don't change. The post is locked with the exact note. Only Assess roleplays appear in the pre picker. The one-client, two-tenant and pathway block copy is exact. "Contains roleplays for: [client]" shows on the course list, course page and builder. The Overview has a "Roleplay memory" count. The publish checklist has the line "N roleplays use memory. Check before publishing." The Publish-version block and the cohort memory-off block are modals with only an OK button.

### 1. Publish and checklist

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| CMS-01 | High | Mismatch | c-rp → set "Plan explainer check" to Pick roleplays…, pick none → Continue to review → Publish V3 | The row shows "Pick at least one roleplay." but the Review checklist shows all green plus "2 roleplays use memory. Check before publishing.". Publish V3 succeeds with the toast "Retail Sales Onboarding published". Verified in render (shot `i_rp_review.png`). | "Choosing Pick roleplays without picking any shows 'Pick at least one roleplay.' and counts as an issue on publish." (prd.md:L524-526) | Add a checklist issue (e.g. "1 roleplay has no memory source picked") linking to the row, and treat it like the other publish issues (block, or require it to be fixed). |
| CMS-02 | Med | UX | c-publish → Review step | The checklist shows only a soft orange line "1 roleplay uses memory. Check before publishing." Clicking Publish V2 then hard-blocks with "Can't publish this version / 1 roleplay in this course uses memory. Memory is turned off for Reliance." The admin learns about the block only after clicking. | Publishing is blocked when a tenant using the course has memory off (prd.md:L559-562). The checklist line is non-blocking (prd.md:L528-530). | Keep the modal, but also show the failing tenant in the checklist (red line: "Used by Reliance, where memory is off") so the admin isn't surprised. |
| CMS-03 | Low | Mismatch | Review checklist, course with roleplays where none use memory (e.g. c-single) | The memory line is hidden when 0 roleplays use memory. | "the publish checklist adds a non-blocking line for courses with roleplays" (prd.md:L528-530) | Show "No roleplays use memory" (or similar) whenever the course has roleplays, or change the PRD to "for courses that use memory". |
| CMS-04 | Low | UX | Builder header vs publish button (c-publish) | The header says "Draft · v1" and the button says "Publish V2". c1 shows "Draft · v2" while its published version is V2. Lowercase "v" and uppercase "V" are mixed. | n/a | Use one casing, and label the draft "Draft of V2" or similar. |

### 2. Roleplay memory card (course and cohort)

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| CMS-05 | Med | Mismatch | c-rp → remove the pre-assessment → Add pre-assessment → pick "Postpaid upgrade pitch" (already in Module 2) | An Assess roleplay already placed in Module 2 can also be picked as pre (and so post). It stays in Module 2, and the memory card shows only "Pre- and post-assessment · Assess", which hides the Module 2 placement. The existing quiz post-assessment (9DOT9…) is silently replaced. Verified (shot `i_pre_dup.png`). | Pre/post are single-attempt (prd.md:L56). Attempts are counted per learner, roleplay and tenant (prd.md:L73-74), so the same roleplay in a module and in pre/post would share one attempt count. | In the pre picker, block roleplays already in the course ("Already in this course"), as the topic picker does. Ask before replacing an existing post. |
| CMS-06 | Low | Mismatch | Memory select options | The option is labelled "Pick roleplays…" (with an ellipsis). | "Pick roleplays" (prd.md:L509) | Nit: align the PRD or the design. |
| CMS-07 | Low | UX | Pick list when 5 are already picked (source only, since no course in the data has 7 roleplays) | Unpicked options turn grey with `not-allowed` and no message. Only "Up to 5 · 5 picked" explains it. | "up to 5" (prd.md:L510) | Add a short hint when the limit is reached ("You can pick up to 5"). Unverified in render. |
| CMS-08 | Low | UX | Memory row in Pick mode (c-rp) | Two stacked controls: a select set to "Pick roleplays…" and a second "Choose roleplays" dropdown. The open popover covers the next row (shot `i_rp_pickopen.png`). | n/a | Think about a single combined control, or open the list inline under the row. |
| CMS-09 | Low | Extra | Cohort memory card (h-structure) | Helper reads "Roleplays only remember what the learner did in this cohort." There is an extra banner "Memory is turned off for Reliance. Roleplays in this cohort can't use other roleplays." The selects stay enabled, and choosing a source opens the modal. | Helper text is fixed to "…in this course." (prd.md:L511-512). Cohort Structure check (prd.md:L548-550) | Fine as UX, but add the cohort wording and the banner copy to the PRD. Consider disabling the selects when the banner shows, instead of letting the admin open a modal. |
| CMS-10 | Low | Extra | Coach-first hint when memory is off (cohort) | The hint "Pick the roleplay this coach should use." is hidden when the tenant's memory is off. | Not specified | Reasonable. Add it to the PRD. |

### 3. Pre / post block

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| CMS-11 | Low | Mismatch | c-pre, post block | The post appears as a locked card (lock icon) with the exact note, not as a picker with the roleplay pre-selected. | "the post picker shows that same roleplay already selected and locked, with the note…" (prd.md:L56) | Fine visually. Change the PRD wording to "post shows the same roleplay, locked". |
| CMS-12 | Low | UX | c-pre → delete the pre-assessment | The locked post roleplay is removed at the same time, with no confirm and no toast. | Not specified | Confirm, or show a toast: "Post-assessment removed too (it must match the pre)". |
| CMS-13 | Low | Extra | Post picker subtitle | "Assessments only. A roleplay can be the post-assessment only when the pre-assessment is that roleplay." | Consistent with prd.md:L56 and L114-115, but this copy isn't in the PRD | Add it to the PRD. |

### 4. Add assets picker (course and cohort)

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| CMS-14 | Med | Mismatch | c-pick-one, c-pick-mixed, c-pick-path, c-pick-two, pre picker, cohort picker | Every client check shows inline. The row is greyed and disabled, with red reason text under the name. No modal is ever shown. | "Checks: each one blocks and only states the problem, with an OK button." (prd.md:L539-540) and the One-client rule (prd.md:L572-586) | Decide: either show the modal with OK when a blocked row is clicked, or (better UX) keep inline and change the PRD to "blocked rows show the reason". As built, it contradicts the PRD. |
| CMS-15 | Low | Extra | c-pick-one / pre picker for c3 | "This course is used by Airtel. Only Airtel roleplays can be added." | The rule exists (prd.md:L574-576) but the PRD gives no copy | Add this copy to the PRD. |
| CMS-16 | Med | Missing | All pickers | All 9 roleplays in the data are treated as published and set up for courses. No standalone or unpublished roleplay exists to show that they're filtered out. Only a footnote says so: "Roleplays listed are published and set up for courses. Standalone roleplays don't appear here." | "Only roleplays set up for courses are listed; only Assess roleplays for pre or post" (prd.md:L163). A standalone roleplay "cannot also be placed in a course" (prd.md:L57) | Add a standalone or draft roleplay to the data and show that it's absent (the pre picker correctly shows only Assess). |
| CMS-17 | Low | UX | Picker rows with a block reason | The reason column is narrow, so long reasons wrap to 3 lines, with the icon centred across the wrapped text (shot `crop_picks.png`). The list is cut off mid-row with no visible scroll cue. | n/a | Let the reason span the full row width under the name, and pin the icon to the first line. |
| CMS-18 | Low | Extra | Picker rows and builder asset rows | Each roleplay row shows the voice name and a provider chip (Azure / ElevenLabs / Sarvam). | Not in the PRD | Check with PM. The provider is probably noise for a Programme Admin. |
| CMS-19 | Low | UX | Module header "Add asset" button (course builder) | No handler: nothing happens. Only the topic-level "Add asset" opens the picker. | n/a | Wire it up or remove it. |

### 5. Mandatory / optional, dates, Asset Library, voice

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| CMS-20 | Med | Missing | Course builder asset rows | No mandatory/optional control or label on any asset, roleplay or not. Dates show only at module level ("Day 0 - Day 3"). | Step 8: "Set mandatory or optional, and dates. Same as any asset" (prd.md:L164). Course module: "Mandatory or optional" (prd.md:L55) | Show the existing mandatory/optional toggle on roleplay rows (at least one example). |
| CMS-21 | Med | Missing | Sidebar "Assets" (Asset Library) | Not clickable, so there is no Asset Library screen. "Roleplay" appears only as a filter chip in the Add assets picker. | Published roleplay "appears in the CMS Asset Library as asset type 'Roleplay'" (prd.md:L162) | Add an Asset Library state with a Roleplay row and the type filter. |
| CMS-22 | Med | Missing | Create cohort and Cohort structure | No voice warning anywhere. `warnsFor()` exists in the source but is never called. In the data, "Feedback after a missed target" uses Kabir, who is not a Reliance voice, and "Store objection drill" (Airtel) uses Meera, who is not an Airtel voice. Both should trigger the warning. | Delivery shows a warning only: "Their default voice will be used. The picture and voice will change to [default voice]." (prd.md:L103-108, L539-540) | Show the warning (non-blocking) when creating or editing a cohort. The dead `warnsFor` code also includes a voice chooser, which contradicts "There is no voice choice at mapping" (prd.md:L108). Drop the chooser if this code is revived. |
| CMS-23 | Low | UX | Data: "Store objection drill" (Airtel) with voice Meera | A published Airtel roleplay uses a voice Airtel doesn't have. | The voice is checked on submit and publish (prd.md:L103-104) | Fix the data (or treat it as the voice-removed-later case and show the warning). |

### 6. Cohorts

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| CMS-24 | Med | Mismatch | h-client, h-memory (Create cohort) | Errors show inline under Source course, with a red border, and "Create cohort" is disabled. There is no modal. The copy is exact: "This course contains a roleplay built for Airtel. It can't be used for Acme Demo." / "This course uses roleplay memory. Memory is turned off for Reliance." | Each check "blocks and only states the problem, with an OK button" (prd.md:L539-546) | Same decision as CMS-14: modal on Create, or change the PRD to inline. The copy is fine. |
| CMS-25 | Med | Mismatch | h-structure → Add asset (cohort picker) | Other-client roleplays are disabled inline: "This roleplay was built for Airtel. It can't be used for Reliance." (copy not in the PRD). No modal. | "Cohort Structure: adding a roleplay from another client is blocked" (prd.md:L548-549), with a modal and OK (L539) | Same as CMS-14, and add the copy to the PRD. |
| CMS-26 | Low | UX | Create cohort → "Pathway" tab | Not functional. | Pathway delivery checks (prd.md:L592-598) | See "Not covered". |

### 7. Labels and other observations

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| CMS-27 | Low | Extra | Builder header | Adds a "Mapped to: Airtel (Cohort: Store Staff Oct 2026)" chip next to "Contains roleplays for:". | Only the "Contains roleplays for" label is specified (prd.md:L600-604) | Useful context for the used-by checks. Add it to the PRD. |
| CMS-28 | Low | UX | Module headers at 1440 px (c-rp M2/M3, c-coach-first, c-single) | Module action buttons wrap: "Configure" and the delete icon drop to a second line. "Edit details" and "Configure" are filled red buttons, which compete with "Add module" and Continue. | n/a | Use secondary or ghost buttons, or an overflow menu, so headers stay on one line. |
| CMS-29 | Low | UX | Modal (OK) | The dialog sits near the top of the viewport, not centred, with a purple focus outline around the whole dialog (shot `i_hstruct_modal.png`). A backdrop click also dismisses it. | "All pop-ups use the design system's standard modal." (prd.md:L150-151) | Use the standard modal (centred, standard focus ring). |

### Authoring-flow UX for a Programme Admin (summary)
- The flow builds content first and sets memory afterwards, yet the memory card sits above Pre-assessment and Modules. On a long course, the admin edits modules at the bottom and then has to scroll back to the top to check memory. Consider putting the card after Modules and post, or showing a compact memory badge on each roleplay row that links to the card.
- The order of the memory rows depends on the order roleplays were added inside a topic. Defaults ("roleplay directly before it") follow that order, but there's no reordering hint. Dragging assets presumably changes the defaults only for new rows, which is fine but invisible.
- Client blocks are discovered row by row in the picker. Showing the course's client up front in the picker subtitle (e.g. "This course has roleplays for Airtel") would explain the greyed rows before the admin reads each reason.
- Validation lives in three places that don't agree: inline row notes, the checklist, and the publish modal. The "Pick at least one roleplay." error is visible only on the Structure step and doesn't stop publish (CMS-01).

### Not covered by the prototype
- Asset Library listing with asset type "Roleplay" (prd.md:L162). See CMS-21.
- Mandatory/optional per roleplay asset (prd.md:L55, L164). See CMS-20.
- Voice fallback warning on cohort, catalog and pathway delivery (prd.md:L103-108). See CMS-22.
- Pathways: no pathway builder, so "roleplays can't be added to pathways directly (not as items, nor as pre- or post-assessments)", "This pathway has roleplays for Airtel." and pathway delivery checks (prd.md:L587-598) aren't shown. The sidebar "Pathways" and the Create cohort "Pathway" tab are dead.
- Catalog checks: adding a course to a catalog, changing the catalog tenant, and the "Contains roleplays for" label on the catalog Library row (prd.md:L552-558, L600-604). These may be in sa.html, but they're not in CMS.
- Cohort edits to memory when the tenant has memory on (only the memory-off cohort state exists). "Changes apply from the next call" (prd.md:L531-532) has no UI cue.
- Course-level behaviour notes for roleplays: always lock after the due date, regardless of "Late-submission policy" (prd.md:L70-71). The Overview shows only "Lock assessment after due date".
- "Duplicating a course copies its roleplay references" (prd.md:L585-586): no Duplicate action.
- Catalog/pathway "used by" in the Publish-version block: only cohort/catalog `usedBy` is checked. That's correct per PRD (pathway excluded), but no catalog example of the block exists apart from c3.

## Super Admin (sa.html) vs PRD — findings

Method: every scenario in the picker driven with Playwright (scripts in `$S/scripts/sa1.js`–`sa4.js`), plus clicks on toggles, voices, inputs, modals, catalog add/tenant change, Map asset and the privacy notice. Screenshots are in `$S/shots/sa/`. Logic was cross-checked in `$S/un/sa/template.html` (script block, lines 4765–4958). Findings are verified in the rendered page unless marked "source only".

**What matches:** Roleplays is the last tab (General · Features · Single sign-on · Roleplays). Maximum session length is validated 1–30. Voices are grouped Sarvam / ElevenLabs / Azure. Replay is gated on stored audio or video. The memory switch is blocked with a list of live cohorts and catalog courses, and pathway deliveries are correctly left out. Catalog item checks and the change-tenant block use the exact PRD copy for checks 22 and 24–25. "Contains roleplays for: [client]" shows on Library and In-this-catalog rows. Roleplays are excluded from the Map asset picker. "Mapped to [client] automatically" is shown with an enrolment count. The privacy notice is platform-wide, with a learner preview that ends in "I understand".

### 1. Tenant settings · Roleplays tab

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| SA-01 | High | Mismatch | Tenant settings · Airtel > Access > "Learner sees transcript after the session" | Turning Store transcripts off disables the toggle and greys it to Off, with sub-copy "Needs Store transcripts." Sub-copy when on: "Shown on the learner's results page." | Default On. "Shown right after the session even if transcripts are not stored; kept only if they are stored" (prd.md:L678) | Keep the toggle independent of Store transcripts. Change the helper to e.g. "Shown right after the session. Kept only if transcripts are stored." |
| SA-02 | Med | Mismatch | Roleplays enabled switch blocked (Airtel) / Reliance > block modal | "Learners have open roleplays for Airtel. Close these first:" | The block lists them ("Remove these first") (prd.md:L671) | Use "Remove these first". Consider the title "Can't turn off roleplays" plus that text. |
| SA-03 | Low | Mismatch | Roleplays enabled Off > info banner | "Roleplays are off for this tenant. Roleplays can't be mapped to it or added to its courses." | While off, "standalone roleplays can't be published for it and courses or pathways with roleplays can't be delivered to it". There is no mapping step for roleplays (prd.md:L671, L59, L599) | Change to "Standalone roleplays can't be published for this client, and courses or pathways with roleplays can't be delivered to it." |
| SA-04 | Low | Missing | Roleplays enabled > Off | Nothing explains what happens to published standalone roleplays that have no open enrolment | "Published standalone roleplays with no open enrolment are hidden from the Tenant Admin while it is off" (prd.md:L671) | Add one line to the off banner |
| SA-05 | Low | Mismatch | Sessions and voices > Maximum session length helper | "1 to 30 minutes. Roleplay time limits can't exceed this." (implies authors are blocked) | "A roleplay's time limit is cut to this in the tenant". Longer limits apply the shorter one automatically, with no warning (prd.md:L672, L104-106) | Change to "1 to 30 minutes. Longer roleplay time limits are cut to this for this client." |
| SA-06 | Med | Missing | All tenants | All seeded tenants are enabled and fully configured (max length 15/10/15, voices and default set). There is no new or unconfigured tenant state | Defaults: Enabled Off, Max length 5, Voices None, Default voice None, Store * Off, Learner sees transcript On, Replay Off, Memory Off (prd.md:L671-679) | Add a scenario for a fresh tenant that shows every default |
| SA-07 | Med | Missing | Default voice select | There is no empty or required state. The select always holds a value, and the default can't be unticked (toast "Choose another default voice before removing Aarav") | Default None. "Required once any voice is available" (prd.md:L674) | Show the "Choose a default voice" placeholder and a required error on Save when voices are ticked but no default is set |
| SA-08 | Low | UX | Voices available > unticking the default voice | The default voice can never be unticked, so a tenant can't go back to zero voices. You must change the default first, and the only feedback is a toast | Voices default None (prd.md:L673) | Allow unticking the last voice, which clears the default, or explain the rule inline |
| SA-09 | Low | Missing | Voice cards | Every voice uses a tinted placeholder silhouette, not a picture | "Voices, each with its picture and provider" (prd.md:L659) | Use real persona pictures. The learner side and the voice fallback both rely on the picture. |
| SA-10 | Low | Extra | Voice group headers | "Sarvam · about ₹1.86/min", "ElevenLabs · about ₹2.50/min", "Azure · about ₹1.30/min". There is also a "Play sample" button on each voice | Not in the PRD. Voices come from backend config with picture and provider only (prd.md:L659, L673) | Confirm with PM or update the PRD |
| SA-11 | Low | Missing | Roleplay memory switch (Airtel) | The block correctly ignores the pathway delivery, but nothing tells the SA that pathway roleplays will run without memory | "Pathway deliveries don't block it; their roleplays run without memory from then on" (prd.md:L573-576) | When turning memory off with live pathway deliveries, add a non-blocking note listing them |
| SA-12 | Low | Extra | Roleplay memory | Shows a "New" tag | Not specified for this setting. The PRD gives the "New" tag only to the course Roleplay memory card (prd.md:L506) | Confirm or drop |
| SA-13 | Low | Mismatch | Recordings > Store audio / Store transcripts sub-copy | "Keep call recordings for review in reports." / "Keep transcripts for attempt detail in reports." | Reports are a later release (prd.md:L746-749) | Avoid promising reports, or confirm |
| SA-14 | Low | UX | Roleplays enabled Off | The whole tab body, including Usage and Add minutes, is dimmed and set to pointer-events:none | Not specified | Let the SA configure voices and minutes before switching roleplays on |
| SA-15 | Low | UX | Tenant settings > leave without saving | With "Unsaved changes" showing, going to Tenants and back gives no prompt. The edits persist, and the Tenants list shows the unsaved minutes (Airtel "500 min" left after an unsaved Add minutes) | — | Add an unsaved-changes guard, or apply changes only on Save |

### 2. Remove-voice confirmation modal

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| SA-16 | Med | Mismatch | Airtel > untick Anushka | The modal lists only "Plan explainer check · Published · v1". It leaves out the standalone "Plan basics walkthrough", which is mapped to Airtel with voice Anushka (it is in the Standalone assessments list) | "A confirmation modal lists every roleplay placed or mapped in the tenant that uses it" (prd.md:L682-684) | Include standalone mappings, catalog, cohort and pathway placements |
| SA-17 | Low | Mismatch | Remove voice modal rows | The second line shows the version ("Published · v3"), not where the roleplay is placed or mapped | Lists roleplays "placed or mapped in the tenant" (prd.md:L682) | Show the placement, e.g. "Standalone · 214 enrolled" or "Cohort: Store Staff Oct 2026" |
| SA-18 | Low | UX | Remove voice modal copy | "1 roleplay use this voice." | — | Change to "1 roleplay uses this voice." |
| SA-19 | Low | UX | Seed data | Airtel's live course roleplay "Store objection drill" uses Meera, and the standalone "Handling a billing complaint" uses Meera in the STANDALONE data. Meera is not an Airtel voice. USES also maps "Handling a billing complaint" to Kabir (source only) | "A roleplay's voice must be one of its client's voices" (prd.md:L95-96) | Fix the prototype data so the modal and lists are consistent |

### 3. Usage allowance and Usage view

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| SA-20 | High | Mismatch | Usage > Minutes available cleared | An empty field becomes 0: Total 0, Used 100%, Remaining 0. A red error reads "Minutes available can't be less than minutes used (1,131)" and Save is blocked. There is no Unlimited state | Default None. "A tenant with no minutes set (e.g. a demo tenant) is unlimited" and skips the start check (prd.md:L700, L717-718) | Treat empty as Unlimited. Show "Unlimited" in the KPIs, hide the % bar, and allow Save. Seed Acme Demo as unlimited. |
| SA-21 | Med | Missing | Usage at 87% and 100% (Minutes available 1,300 / 1,131) | No banner anywhere in the admin area. Only the Remaining KPI turns red (at ≥90%) and the bar changes colour (≥75% amber, ≥90% red) | "Alerts at 80% and 100% go to the Super Admin by email and as a banner in the admin area" (prd.md:L705-706) | Add 80% and 100% banners. At 100%, include the learner impact: "Roleplays are paused" (prd.md:L708-709) |
| SA-22 | Low | Mismatch | Usage colour thresholds | Amber at 75%, red at 90% | Thresholds are 80% and 100% (prd.md:L705) | Align to 80 / 100 |
| SA-23 | Low | Mismatch | Usage placement | Usage is a section at the bottom of the Roleplays tab (data-screen-label "Tenant settings · Usage") | "Tenants > [client] > Roleplays > Usage" (prd.md:L735, L839) | Make it a Usage sub-view or anchor, or update the PRD path |
| SA-24 | Low | Mismatch | Usage table / KPIs | Minutes are whole numbers (541, 1,131) | "In seconds, shown as minutes to one decimal" (prd.md:L841-843) | Show one decimal (e.g. 541.4) |
| SA-25 | Low | Extra | Usage header / Cost | INR/USD toggle, "Exchange rate ₹84.50 = $1.00, from platform configuration.", "Sample rates, servers excluded" | The PRD asks only for Cost so far, with rates saved per session (prd.md:L735-740) | Confirm with PM, or add these to the PRD |
| SA-26 | Low | UX | "Minutes used per week" chart | Each bar of one series has a different colour (purple/blue shades). Airtel's weekly bars total 1,284 min but Used = 1,131 | — | Use one colour for a single series and fix the seed data |
| SA-27 | Low | Extra | Tenants list | Columns ROLEPLAYS / ROLEPLAY MEMORY / MINUTES LEFT | Not specified | Fine. Note it in the PRD. |
| — | — | OK | Add minutes modal | "Minutes to add", "New total: 3,500 minutes", toast "500 minutes added", validation "Enter at least 1 minute" | Tops up immediately (prd.md:L701, L719) | — |

### 4. Catalogs

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| SA-28 | Med | Missing | Catalog "Store Leads" (Reliance) > Items | Coaching Essentials contains "Feedback after a missed target" with voice Kabir. Kabir is not a Reliance voice (Reliance: Diya, Aarav, Anushka), but no warning is shown. The warning code exists but is wired to an empty array (`const warns = [].map(...)`, source) | Catalog, cohort and pathway delivery show a warning only: "Their default voice will be used. The picture and voice will change to [default voice]." (prd.md:L95-98, L541-542) | Show the non-blocking voice warning on the catalog row. Don't use the dead picker in the source: "no voice choice at mapping". |
| SA-29 | Med | Missing | Catalog Items add / tenant change | The checks are only "roleplay from another client" and "memory off". There is no check that the tenant has roleplays enabled (unverified, source only: `checkCourse` has no `enabled` test) | While Roleplays enabled is off, "courses or pathways with roleplays can't be delivered to it" (prd.md:L671; check 30 L590-591) | Add the third check with a row reason, e.g. "Roleplays are off for [tenant]." |
| SA-30 | Low | Missing | Catalog Library > Pathways filter | The Library has only courses, and the Pathways chip does nothing. Pathway-in-catalog checks can't be shown | Pathway added to a catalog or catalog tenant changed: blocked on another client or roleplays off; voice warning applies (prd.md:L586-592) | Add a pathway row to show these checks |
| SA-31 | Low | UX | Catalog Items > failing row | The failing course keeps an active "+" button, and clicking again repeats the same error | Check 24: "a failing course isn't added and its row shows the reason" (prd.md:L563-564) | Disable "+" while the row fails |
| SA-32 | Low | UX | Catalog Items with unsaved changes | The floating "You have unsaved changes / Discard / Save changes" bar covers the Library rows and error text at 1440×900 (`shots/sa/k_add_checks.png`) | — | Add bottom padding or dock the bar |
| — | — | OK | Catalog items: client and memory checks | Row reasons: "This course contains a roleplay built for Reliance. It can't be used for Airtel." / "This course uses roleplay memory. Memory is turned off for Reliance." | Check 24 copy (prd.md:L547-550, L563) | — |
| — | — | OK | Catalog: change tenant blocked | Modal "Can't change the tenant", "These courses in the catalog can't be used for Airtel:" with each course and its reason(s), then OK | Check 25 (prd.md:L566-567) | — |
| — | — | OK | New catalog | Name, Description, Tenant, "Create catalog". Toast "Catalog created and linked to Reliance". Blank name keeps the modal open | — | — |

### 5. Standalone assessments and Map asset

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| SA-33 | Med | Missing | Standalone assessments > roleplay rows | Roleplay rows show only "214 learners enrolled" / "0 learners enrolled" under STATUS / ENROLMENTS. No status chip appears. "Awaiting tenant setup" is never rendered: the status column is shown only for manual rows, and every seeded roleplay is "Active" in data | Shows "Mapped to [client] automatically", the enrolment count, and status "Awaiting tenant setup" until the Tenant Admin sets the window, then "Active" (prd.md:L165) | Show the status chip on roleplay rows too, and seed one row as "Awaiting tenant setup" (e.g. Plan basics walkthrough, 0 enrolled) |
| SA-34 | Low | UX | Source: Map asset modal | The source has a client lock note, a voice fallback warning and a voice picker for mapping roleplays. **Not reachable:** `mapPick` filters out `type === 'Roleplay'`, `needVoice` is hard-coded `false`, and the "Awaiting tenant setup" branch in `saveMap` only fires for roleplays. Rendered modal: Asset = SQL Screening, Store Manager Readiness only; Client = Airtel / Reliance / Acme Demo | "Roleplays don't appear in Map asset" and "There is no voice choice at mapping" (prd.md:L165, L98) | The rendered design matches the PRD. Remove the dead roleplay and voice code so it isn't picked up in handoff. |
| SA-35 | Low | UX | Seed data (source only) | "Store walk-in greeting" exists as a standalone roleplay (STANDALONE s4) and as a course roleplay (r9 in Store Greeting Basics) | "A standalone roleplay cannot also be placed in a course; duplicate it instead" (prd.md:L57) | Rename one of them in the data |
| — | — | OK | Page description | "…Published standalone roleplays are mapped to their client automatically." and a lock icon with "Mapped to Airtel automatically" | prd.md:L165 | — |

### 6. Roleplay privacy notice (platform-wide)

| ID | Severity | Type | Where | Design does | PRD says | Fix |
|---|---|---|---|---|---|---|
| SA-36 | Low | Extra | Privacy notice editor | Rich-text toolbar (bold, italic, lists, link) with no visible effect, a 2000-character limit ("379 / 2000", hard maxlength), and the required error "Privacy notice is required" | The text comes from legal. No editor, format or limit is specified (prd.md:L663-665) | Confirm the limit and formatting with legal and engineering, or drop the inert toolbar |
| SA-37 | Low | UX | Privacy notice > reopen preview | The "Preview · opened from the Privacy link" modal (title "Privacy") exists in source, but no control opens it (`openNoticeView` is never bound) | The learner reopens it from the "Privacy and your call" link (prd.md:L665, L905) | Add a second preview button, or remove it. If kept, use the PRD link label. |
| — | — | OK | Preview | "Preview · what learners see / Before you start / [text] / I understand". Copy: "Applies to every client…", "Learners accept this once… Privacy link on a roleplay page." | prd.md:L663-665, L910-911 | — |

### Not covered by prototype (PRD items in this area with no design)

- **Tenant Admin (Client Admin) screens:** none in sa, qm or cms. Grepping all three templates finds "Tenant Admin" only in SA helper copy. Missing: setting the standalone window and card image, Enrolments with target type "Roleplay", the Tenant Admin's read-only roleplay view, hiding published standalone roleplays while roleplays are off (prd.md:L57, L62, L125, L166, L671).
- New-tenant defaults (all settings at PRD defaults) and the Default voice required error (SA-06, SA-07).
- Unlimited tenant (no minutes set) (SA-20).
- 80% and 100% allowance banner and email (SA-21). The learner-side "Roleplays are paused. Contact your admin." is outside SA.
- Voice fallback warning on catalog delivery (SA-28), and on cohort and pathway delivery (pathways and cohorts are not in SA).
- "Roleplays enabled" check on catalog delivery, and pathway delivery checks via catalog (SA-29, SA-30).
- Note on pathway deliveries running without memory when memory is turned off (SA-11).
- Publish blocked with "Roleplays are off for [client]" (prd.md:L165, L599). This is a Quiz module publish state, not SA.
- Per-session saved rates and test sessions tracked separately as platform usage (backend, prd.md:L739-740, L842-843).
- Who can listen to audio and read transcripts (SA, Client, Org and Team Admins) (prd.md:L686-688): the reports and attempt detail are not designed.
- Results and Reports (Roleplay tab in Course assessment and Standalone Assessment Performance reports, Learner view, attempt detail, export) and Dashboard widgets (prd.md:L745-831). The PRD marks these as a later release.
- Global simultaneous-session limit: the PRD marks it out of this version (prd.md:L742-743).
