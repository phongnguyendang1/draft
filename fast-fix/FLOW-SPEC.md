# Fast Fix: Request flow design spec

Member-facing redesign of "Create Service Request" for HomeHub, adding **Fast Fix**: book 1 to 3 hours of a handyman in one session instead of waiting 3 to 5 days.

Prototypes: `request-flow-desktop.html` (1280 frame) and `request-flow-mobile.html` (390 frame). Both are standalone and open with no server. Built from `src/` with `python3 build.py`.

## Source of truth

The pasted Slack thread and the two images (Mark's sketch and the flow diagram) are the requirements. Confluence and Jira were used only to confirm assumptions and fill gaps, never to add scope. Where they disagree with Slack, Slack wins and the difference is listed under "Open questions".

## Flow map

```
Request type (How can we help?)
 |- Emergency ............ existing urgent flow (not redesigned here)
 |- Fast Fix ............. 1 The job -> 2 Quick check -> 3 Pick a time -> Booked
 |                              |              |                |
 |                              |              |                '- no open times --.
 |                              |              '- parts: no / not sure -----------+
 |                              |              '- anything that makes it involved -+--> Sent to our team
 |                              '- jobs add up to more than 3 hours ----------------'     (auto-submitted
 |- Service request ...... existing flow                                                   service request)
 '- Account ............. existing flow
```

Step 4 in the diagram (Home Manager completion, taxonomy, follow-on) is Home Manager side and is not a member screen.

## Screens

| Screen | What the member does | Notes |
|---|---|---|
| **Request type** | Chooses Emergency, Fast Fix, Service request or Account. | 911 notice for gas smell, gas leak or burning smell sits above the cards (from Mark's sketch). Fast Fix card is the tinted, recommended one; Service request copy says to choose it for anything bigger "or if you are not sure". Members with 2 homes get the home switcher from the dashboard. |
| **1 The job** | Picks every job that applies (each shows an estimate), describes the work in free text, picks 1, 2 or 3 hours. | Free-text prompt and example are Mark's wording. Running estimate and an under-booking nudge, because Slack notes the system cannot suggest hours and there is a risk of booking too little. |
| **2 Quick check** | Answers: do you have all parts or materials (Yes / No or not sure); is there anything that could make the job more involved (select any, or None of these). | Wording follows Mark's draft questions. The outcome is shown inline before the member continues, and the button changes from "Continue to times" to "Send to our team". |
| **3 Pick a time** | Picks a date (month calendar), then a time. Confirms. | Real open slots, confirmed on the spot. Start and end time shown, Central Time. Expectation note: the Home Manager does what fits, leftovers can be scheduled for another visit. |
| **Booked** | Reads the confirmation. | Date, time, Home Manager, address, jobs, hours booked. Home Manager card with message button. |
| **Sent to our team** | Reads what happens next. | The "no-go" path: seamless, nothing to re-enter, the summary shows what was sent. Gentle one-line reason, no blame. |

States covered: empty-form validation (inline errors with text and icon, focus moves to the first problem), under-booking nudge, over-3-hours, parts "No or not sure", complications, no open times, "that time was just taken", 1 vs 2 homes.

## Outcome rules (member-facing)

| Condition | Result |
|---|---|
| Jobs add up to more than 3 hours | Sent to our team, shown on step 1 before continuing |
| Parts = "No or not sure" | Sent to our team |
| Any item other than "None of these" is selected | Sent to our team |
| No open times for the visit length | Sent to our team |
| Chosen time was just taken | Stay on step 3, list refreshes, pick another |
| Everything fine | Booked |

## Gap-fills (each is a design assumption to confirm)

- **Name "Fast Fix".** Jira epic PFX-537 is titled "Fast Fix (formerly Quick Book)". Mark's Slack also says Quick Fix and the diagram says Book a Handyman.
- **$55 per hour, billed per hour** is shown on step 1 and in the summary. Source: PreFix Service Pricing Guide (Jan 2026) co-pay rate. Slack does not mention price. Confirm it applies to Fast Fix, or remove the price rows.
- **Slot picker pattern** (date, then time, start and end shown, times in the address timezone, refresh on "just taken") follows the shipped Member Calendar documentation, so engineering can reuse it.
- **Job list, time estimates and wording are illustrative.** Mark: the top 10 to 20 list and the vetting questions will be worked out with Justin and James H. Estimates mostly default to 1 hour in the existing proof of concept.
- **Home Manager name on the confirmation** comes from the member's assigned Home Manager.

## Open questions for the team

1. **Overlap in the questions.** "Electrical or plumbing work" would send a member who picked "Running toilet" or "Garbage disposal issue" (Mark's own examples) to our team. The question needs narrowing, for example new wiring or new plumbing lines.
2. **Height rule.** The question says about 10 feet, Mark's message says a 20 foot ladder, and an older ops document says 15 feet.
3. **What does the Emergency card open?** Sources keep "call 911" (gas, burning) separate from urgent home problems (active leak, no power). Not defined for the new top-level card.
4. **Price and billing rules** for a booked block: rate, partial hours, cancellation or reschedule.
5. **3-hour visits.** Slack says 1 to 3 hours; the existing proof of concept only supports 1 and 2 hours until a 3-hour service type exists.
6. **Eligibility.** Earlier docs limit self-booking to members with 6+ months tenure. Not in Slack, so no blocked state was designed.
7. **Mixed requests.** One non-qualifying job sends the whole request to our team (Mark's v1.0 position). Splitting is undecided.
8. **Priority and routing of the auto-submitted request** for Ops.

## Not designed on purpose

Home Manager completion and incomplete-reason taxonomy, follow-on booking, contractor routing, photos, credits, AI or chat intake, Category > Item > Action taxonomy, per-job parts loop. The Emergency, Service request and Account cards show a toast instead of a destination because those flows are not part of this work.

## Prototype guide

- **Prototype states** button (bottom right): 2 homes, no open times, next time just taken, and a jump list to every screen.
- Deep links: `#/job`, `#/check`, `#/time`, `#/booked`, `#/sent`.
- Both frames share one source; only the body class differs.

## Design language

Tokens, type, radii, spacing, top bar and shared components are copied verbatim from the HomeHub desktop sample (`src/base.css`, `chrome.css`, `shared.css`). `src/flow.css` adds only what the sample lacks (form field, selectable option tiles, radio, stepper, calendar, time pills, summary), using the same tokens. No drop shadows, one yellow button per screen, same icon family (Remix 4.6).

## Accessibility

Targets WCAG 2.1 AA. axe-core reports no A or AA violations on every screen and state at both sizes. Layout reflows at 320px. Skip link, one `h1` per screen that receives focus on navigation, labelled fieldsets and radio groups, errors announced and tied to fields (not colour alone), selection shown by more than colour, dock does not cover focused controls.
