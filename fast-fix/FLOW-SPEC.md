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
 |                              |              '- any question answered No / Not sure -------+
 |                              |              '- any task knockout question answered No -----+--> Task removed and the rest keeps going (or Sent to our team if it is the only task)
 |                              '- more than 4 tasks, or over 3 hours ------------------------'     (auto-submitted
 |- Service request ...... existing flow                                                   service request)
 '- Account ............. existing flow
```

Step 4 in the diagram (Home Manager completion, taxonomy, follow-on) is Home Manager side and is not a member screen.

## Screens

| Screen | What the member does | Notes |
|---|---|---|
| **Request type** | Chooses Fast Fix, Service request or Account. | The only emergency path is the 911 notice above the cards (gas smell, gas leak or burning smell); there is no Emergency card. Fast Fix is the tinted card and says it is for small jobs of 1 to 3 hours. Service request says to choose it for anything more involved or if unsure. Members with 2 homes get the home switcher from the dashboard. |
| **1 The job** | Finds a task with a search box, or opens one of 10 groups (100 tasks in total, worded as symptoms like "Running toilet"), and picks up to 4. Each picked task collects under "Selected jobs" below the groups with Remove and a **required** comment box labelled with the task. | Members can only choose from the list: there is no free-form task and no "Something else". If they can not find a job, a pointer under the list (and under empty search results) sends them to a Service Request. If they already picked jobs, a modal says to book those first, and after booking they get a button to submit a service request for the other job. Search matches task name, group name and related words. More than 4 tasks, or over 3 hours of internal minutes, goes to the team. On a phone only one group is open at a time. |
| **2 Quick check** | Answers three questions, worded so **Yes is the right answer on all three** and Yes is always the first option: (1) Can you reach it with a standard step ladder? Yes / No, it's higher / Not sure. (2) Is the work only a swap or repair of what is already there, with no gas, new wiring or moved water lines? Yes / No / Not sure. (3) Do you have the part or fixture, if the job needs one? Yes / No (answer Yes when no part is needed). Then, for any picked task that has them, task-specific **knockout questions** (0 to 3, Yes is right). | Any No or Not sure sends the request to the team. Question copy is a placeholder for Mark and Justin to finalize, and the task-specific questions are placeholders for design. The outcome is shown inline as soon as a routing answer is chosen, and the button changes from "Continue to times" to "Send to our team". Once an answer routes the request, the other questions stop blocking. |
| **3 Pick a time** | Sees the **visit length** (only reached after passing the quick check), then picks a date and a start time and confirms. Members can not change the visit length, so it is labelled "Visit length: Based on the tasks you chose" rather than a recommendation. | Recommendation = the picked tasks' internal durations (mostly 30 or 60 minutes) added up and rounded up to a whole hour, minimum 1. Durations are never shown per task. The calendar shows the visit length once and **start times only** (no ranges), matching the current member calendar. Real open slots, confirmed on the spot, Central Time. A line explains the Home Manager does what fits in the time booked and anything left over can be scheduled for another visit. |
| **Booked** | Reads the confirmation. | Date, start time, Home Manager, address, jobs, hours booked. Home Manager card with message button. If the member asked for a service request for another job, a button to start it appears here. |
| **Sent to our team** | Reads what happens next. | The "no-go" path: nothing to re-enter. The "What you sent" card shows the jobs, description and the answers that triggered the hand-off (parts, what makes it involved, time asked for), so Ops gets the "why". Gentle one-line reason, no blame. |

States covered: nothing picked on Continue, a task without its required comment, more than 4 tasks, over 3 hours, a job that is not on the list (pointer, modal, button after booking), each routing answer and each knockout answer on step 2, no open times, "that time was just taken", 1 vs 2 homes.

## Outcome rules (member-facing)

| Condition | Result |
|---|---|
| More than 4 tasks picked, or the picked tasks add up to over 3 hours | Sent to our team, shown on step 1 before continuing (the count rule says "more than 4 jobs") |
| Step ladder = "No, it's higher" or "Not sure" | Sent to our team |
| Swap or repair only, no gas, new wiring or moved water lines = "No" or "Not sure" | Sent to our team |
| Part or fixture = "No" (Yes also covers "no part needed") | Sent to our team |
| Any task-specific knockout question = "No" (placeholder questions) | The note names the task and, if other tasks are picked, offers **Remove this job and keep booking the others**. Removing drops only that task (its answers and comment go with it), recalculates the visit length and turns on the "service request for your other job" button after booking. Not removing, or the only task failing, sends the whole request to the team and the sent screen names the task. The three quick-check questions still send the whole request. |
| A job is not on the list | Member is pointed to a Service Request; if jobs are already picked they book those first and get a button to the service request afterwards |
| No open times for the visit length | Sent to our team |
| Chosen time was just taken | Stay on step 3, list refreshes, pick another |
| Everything fine | Booked |

## Gap-fills (each is a design assumption to confirm)

- **Name "Fast Fix".** Jira epic PFX-537 is titled "Fast Fix (formerly Quick Book)". Mark's Slack also says Quick Fix and the diagram says Book a Handyman.
- **$55 per hour, billed per hour** is shown on step 3 and in the summary. Source: PreFix Service Pricing Guide (Jan 2026) co-pay rate. Slack does not mention price. Confirm it applies to Fast Fix, or remove the price rows.
- **Slot picker pattern** (date, then time, start and end shown, times in the address timezone, refresh on "just taken") follows the shipped Member Calendar documentation, so engineering can reuse it.
- **Member-facing hints under the questions.** Mark's notes on what each question catches were internal. The prototype turns two into short hints: "Think roofs, second-story outsides and vaulted ceilings." and "Swapping a fixture is fine. Adding or relocating one is not." Third hint ("For example a new faucet, lock set or TV mount.") is mine. Edit or drop freely.
- **Quantity.** Tasks people repeat (two TV mounts, outlets, blinds, smoke alarms, door knobs, grab bars, tip-over anchors, a desk) show **How many?** with a 1 to 6 stepper on the selected card. Minutes multiply by the quantity. The 4-task cap counts tasks, not units; the 3-hour cap counts everything, so 4 TVs at 60 minutes each is over a Fast Fix and goes to the team. The list of repeat tasks is `REPEAT` in `app.js`; the stepper never shows in the describe-first version.
- **Visit length.** The 100 jobs and their internal time estimates are placeholders (default about 1 hour, a few 30 minutes). Ops needs to tune them; the visit length is only as good as they are.
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
- **Pick-it-yourself version** (`request-flow-desktop.html`, `request-flow-mobile.html`): no description step. This is the version documented above.
- **Describe-first version** (`request-flow-describe-desktop.html`, `request-flow-describe-mobile.html`): adds a first step with one text box that pre-selects the jobs, then the same search and groups. See `FLOW-SPEC-DESCRIBE.md`.

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
