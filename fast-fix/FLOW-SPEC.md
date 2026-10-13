# Fast Fix: Request flow design spec

Member-facing redesign of "Create Service Request" for HomeHub, adding **Fast Fix**: book 1 to 3 hours of a handyman in one session instead of waiting 3 to 5 days.

Prototypes: `request-flow-desktop.html` (1280 frame) and `request-flow-mobile.html` (390 frame). Both are standalone and open with no server. Built from `src/` with `python3 build.py`.

## Source of truth

The pasted Slack thread and the two images (Mark's sketch and the flow diagram) are the requirements. Confluence and Jira were used only to confirm assumptions and fill gaps, never to add scope. Where they disagree with Slack, Slack wins and the difference is listed under "Open questions".

## Flow map

```
Request type (How can we help?)  [911 notice above the cards: gas smell, gas leak, burning smell]
 |- Fast Fix ............. 1 The job -> 2 Quick check -> 3 Pick a time -> Booked
 |                              |              |                |
 |                              |              |                '- no open times --.
 |                              |              '- step ladder: No / Not sure ------+
 |                              |              '- gas, wiring, water lines: Yes / Not sure --+--> Sent to our team
 |                              |              '- part or fixture: Need one -------+
 |                              '- jobs add up to more than 3 hours ----------------'     (auto-submitted
 |- Service request ...... existing flow                                                   service request)
 '- Account ............. existing flow
```

Step 4 in the diagram (Home Manager completion, taxonomy, follow-on) is Home Manager side and is not a member screen.

## Screens

| Screen | What the member does | Notes |
|---|---|---|
| **Request type** | Chooses Fast Fix, Service request or Account. | The only emergency path is the 911 notice above the cards (gas smell, gas leak or burning smell); there is no Emergency card. Fast Fix is the tinted card and says it is for small jobs of 1 to 3 hours. Service request says to choose it for anything more involved or if unsure. Members with 2 homes get the home switcher from the dashboard. |
| **1 The job** | Picks every job that applies from a list of 10, with a "Show all 25 jobs" button for the rest. Each picked job gets its own labelled text box below (label = the job name, with an example in the box); every box is required. | No times, estimates or "how long" question here. A job picked from the full list stays visible when the list is collapsed. "Something else" is the last of the 25. If the picked jobs add up to more than a Fast Fix covers, an inline note appears and the button becomes "Send to our team". |
| **2 Quick check** | Answers Mark's three questions: (1) Can you reach it with a standard step ladder? Yes / No, it's higher / Not sure. (2) Does it involve gas, new wiring, or moving water lines? No / Yes / Not sure. (3) Do you already have the part or fixture, if one's needed? Have it / No part needed / Need one. | Wording, option order and routing are Mark's (the "good" answer sits in a different position on each question, so members have to read). The outcome is shown inline as soon as a routing answer is chosen, and the button changes from "Continue to times" to "Send to our team". Once an answer routes the request, the other questions show "Optional." so nothing blocks the hand-off. |
| **3 Pick a time** | Sees a **recommended time** based on what they picked (only reached after passing the vetting questions), can change it, then picks a date and a time and confirms. | Recommendation = the picked jobs' internal estimates added up and rounded up to a whole hour, 1 to 3. Estimates are never shown. "Change" reveals 1 / 2 / 3 hours with the recommended one tagged; going lower shows a warning that the visit may not be enough; changing the length refreshes the open times. Real open slots, confirmed on the spot, Central Time. |
| **Booked** | Reads the confirmation. | Date, time, Home Manager, address, jobs, hours booked. Home Manager card with message button. |
| **Sent to our team** | Reads what happens next. | The "no-go" path: nothing to re-enter. The "What you sent" card shows the jobs, description and the answers that triggered the hand-off (parts, what makes it involved, time asked for), so Ops gets the "why". Gentle one-line reason, no blame. |

States covered: empty-form validation (inline errors with text and icon, focus moves to the first problem), lower-than-recommended warning, too many jobs, each routing answer on step 2, no open times, "that time was just taken", 1 vs 2 homes.

## Outcome rules (member-facing)

| Condition | Result |
|---|---|
| Picked jobs add up to more than a Fast Fix covers (over 3 hours) | Sent to our team, shown on step 1 before continuing |
| Step ladder = "No, it's higher" or "Not sure" ("Yes" is the good answer) | Sent to our team |
| Gas, new wiring or moving water lines = "Yes" or "Not sure" ("No" is the good answer) | Sent to our team |
| Part or fixture = "Need one" ("Have it" and "No part needed" pass) | Sent to our team |
| No open times for the visit length | Sent to our team |
| Chosen time was just taken | Stay on step 3, list refreshes, pick another |
| Everything fine | Booked |

## Gap-fills (each is a design assumption to confirm)

- **Name "Fast Fix".** Jira epic PFX-537 is titled "Fast Fix (formerly Quick Book)". Mark's Slack also says Quick Fix and the diagram says Book a Handyman.
- **$55 per hour, billed per hour** is shown on step 1 and in the summary. Source: PreFix Service Pricing Guide (Jan 2026) co-pay rate. Slack does not mention price. Confirm it applies to Fast Fix, or remove the price rows.
- **Slot picker pattern** (date, then time, start and end shown, times in the address timezone, refresh on "just taken") follows the shipped Member Calendar documentation, so engineering can reuse it.
- **Member-facing hints under the questions.** Mark's notes on what each question catches were internal. The prototype turns two into short hints: "Think roofs, second-story outsides and vaulted ceilings." and "Swapping a fixture is fine. Adding or relocating one is not." Third hint ("For example a new faucet, lock set or TV mount.") is mine. Edit or drop freely.
- **Recommended time.** The 25 jobs and their internal time estimates are placeholders (default about 1 hour, a few 30 minutes). Ops needs to tune them; the recommendation is only as good as they are.
- **Active leak or no power.** With no Emergency card, those members use the Service request card unless the 911 notice is widened. Say if you want text added.
- **Job list and wording are illustrative.** Mark: the top 10 to 20 list and the vetting questions will be worked out with Justin and James H. Estimates mostly default to 1 hour in the existing proof of concept.
- **Home Manager name on the confirmation** comes from the member's assigned Home Manager.
- **Placeholders to confirm with Ops:** the "Add to calendar" and "Reschedule or cancel" links on the confirmation, and the two-step "What happens next" on the sent screen. None of these are in Slack.
- **The \"Call 911\" button.** The sketch shows a plain info box with a 911 link. The design maps that to the red alert tint (same as the dashboard payment banner) with a tap-to-dial button. Easy to revert to the sketch's quieter treatment if Legal or Ops prefers.

## Open questions for the team

1. **Gas in question 2 vs the 911 notice.** Question 2 is about gas *work* (adding or relocating), while the 911 notice on the first page covers a gas smell or leak. They are separate, but the word "gas" appears in both; confirm the wording does not confuse a member with a real leak.
2. **Reaching "higher" jobs.** "Standard step ladder" replaces the earlier 10 / 15 / 20 foot numbers, so the height rule no longer needs a number in the UI. Ops may still want one in their internal guidance.
3. **Price and billing rules** for a booked block: rate, partial hours, cancellation or reschedule.
4. **3-hour visits.** Slack says 1 to 3 hours; the existing proof of concept only supports 1 and 2 hours until a 3-hour service type exists.
5. **Eligibility.** Earlier docs limit self-booking to members with 6+ months tenure. Not in Slack, so no blocked state was designed.
6. **Mixed requests.** One non-qualifying job sends the whole request to our team (Mark's v1.0 position). Splitting is undecided.
7. **Priority and routing of the auto-submitted request** for Ops.

## Not designed on purpose

Home Manager completion and incomplete-reason taxonomy, follow-on booking, contractor routing, photos, credits, AI or chat intake, Category > Item > Action taxonomy, per-job parts loop. The Emergency, Service request and Account cards show a toast instead of a destination because those flows are not part of this work.

## Prototype guide

- **Prototype states** button (bottom right): 2 homes, no open times, next time just taken, and a jump list to every screen.
- Deep links: `#/job`, `#/check`, `#/time`, `#/booked`, `#/sent`.
- Both frames share one source; only the body class differs.

## Design language

Tokens, type, radii, spacing, top bar and shared components are copied verbatim from the HomeHub desktop sample (`src/base.css`, `chrome.css`, `shared.css`). `src/flow.css` adds only what the sample lacks (form field, selectable option tiles, radio, stepper, calendar, time pills, summary), using the same tokens. No drop shadows, one yellow button per screen, same icon family (Remix 4.6).

## Accessibility and QA

Targets WCAG 2.1 AA. Verified on both frames:

- **axe-core**: no A or AA violations on every screen and state (including validation errors, over 3 hours, time error).
- **Scripted checks** pass: happy path, a routing matrix over every answer of every step-2 question, every no-go route, "time just taken", no open times, home switch, back navigation, keyboard focus after navigation, and regression tests for the bugs found in review.
- **Reflow** at 320px with no horizontal scroll; every mobile tap target is at least 44px (apart from the sample's own logo link).
- **Design-language audit**: no new text colors, backgrounds, type sizes or fonts versus the sample; no drop shadows. New-only values are existing tokens used in new places (slate for form-control borders, the kit's 6px checkbox radius, the 2px selected ring).

Semantics: skip link, one `h1` per screen that receives focus on navigation, labelled fieldsets and radio groups, errors announced and tied to fields (not colour alone), selection shown by more than colour, the sticky dock never covers focused controls.

Review notes: an independent review (requirements coverage, design fidelity) found one real bug (a stale time could survive a change of visit length) and several flow and fidelity issues. All were fixed. Two further reviewers (UX and logic) were stopped before reporting.
