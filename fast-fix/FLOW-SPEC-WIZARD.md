# Fast Fix: one job at a time (wizard)

Prototype: `request-flow-wizard-desktop.html` (1280) and `request-flow-wizard-mobile.html` (390). This is the main version. The other three (`request-flow-*.html`, `request-flow-describe-*.html`) still build from the same source (`python3 build.py`) but are no longer being updated, so they do not have the changes below.

## The idea

Finish one job completely, then decide whether to add another. Every choice that can move you on with one tap does; a button only appears where there is something to type or confirm. There is **no separate quick-check step**: each job gets its own questions, **every question is specific to that task and answered on its own**. There are no separate "job-specific" and "general" sets. A job that fails any question is **not eligible**: the list, the review page, the summary and the confirmation page all split **Eligible for Fast Fix** from **Requires Service Request**. Eligible jobs are **always booked as Fast Fix**; jobs that are not eligible are **never** pulled into a "send everything to a service request": the service request for them is submitted automatically when the member taps the yellow button on the plan page, and the confirmation page confirms it. Eligible work past 3 hours becomes **as many separate Fast Fix visits as it takes**, booked one after another.

```
Request type -> Service request (one card; Account stays separate)
 1 Your jobs   Pick a job        tap a category, tap a job; or search and tap  -> moves on
               Describe it       How many? + required comment + optional photos      [Continue]
               Questions         each question on its own, Yes / No (some with Not sure)
               Add another job?  list of jobs so far, no limit (two titled sections if any is not eligible)
               Review page       only when needed: some jobs not eligible, or the visit is split in two
 2 Pick a time -> Booked (one card per visit), with the Service Request module if any job was not eligible
               Reschedule or cancel  Your visits (cards with Reschedule / Cancel visit) -> pick a new time, or a Cancel visit confirmation
```

## Single entry point (the option in Mark's deck)

The deck proposes one entry instead of Fast Fix, a separate Service request and the old service request tree. It is built as the default, with a switch in "Prototype states" (**Single entry point**) that turns the classic two-card entry back on. Execs have not chosen yet.

- **Entry screen:** one **Service request** card ("Tell us what needs fixing. Small jobs can be booked right away, and anything bigger goes to our team.") plus Account. The gas/911 banner stays. "Fast Fix" is no longer an entry card; it remains the name of the bookable group on the list, plan and confirmation pages.
- **Picker:** the 10 categories, then **Specialty services** (HVAC, Carpentry, Painting) and **Other**. Each category list ends with **Other**. Specialty rows and Other are always service requests.
- **Task types:** a task is either *Fast Fix* (has questions, can be booked) or *service request* (always goes to our team: no questions, never booked). Service request tasks are added to categories from the old tree (Locked out of the home, Garage door won't open or close, Major water leak or burst pipe, No water or no hot water, Power out or sparking outlet, Major appliance repair (the old tree’s “Appliance stopped working”; renamed so it does not clash with the Fast Fix diagnostic task of that name), Roof or structural damage). These are **high priority**: they sit at the top of their category and the request goes in as high priority. The member never sees a "priority" label; the plan page, confirmation and sent page add "We'll reach out today." (copy to confirm with Ops).
- **Service request tasks in the flow:** pick it, describe it (required comment, photos), no questions, straight to **Requires Service Request** with the reason "Our team handles this kind of job." The plan page and the sent page word it accordingly ("This needs a service request", "This job needs our team, so we sent it as a service request").
- **The bottom "Submit a service request" link on the picker is removed** (Other replaces it).
- **Confirmation:** the Service request submitted card links to **View your service request** (the Service requests page; the dashboard only lists bookings).
- **Second switch:** **Vetting questions are blank** shows numbered placeholders ("[Question 1 to be provided by Ops]") so stakeholders have to supply the real questions.
- **Not decided or not built:** contractor list (old flow offered "See contractor list"), after-hours behavior, standby queue, mapping each symptom to the Home Manager task, the new workbook columns (type, priority, contractor category, mapped task). The to-dos copy change and the Home Manager portal are separate.

## Screens

| Screen | What the member does | Rules |
|---|---|---|
| **Pick a job** ("What needs fixing?", "Job 2") | Search box, then **10 category rows**. Tap a category (`#/job/plumbing`) for its jobs; tap a job to go **straight to its screen**. | No checkbox, no Continue. **All categories** button above and below a category's list; the page **Back** link always means the previous big step. A hint says the same job can be added again. A job already in the request shows **Added** but can be tapped again. |
| **Describe** (title is the job) | **How many?** (minus/plus and a box you can type in, default 1, **no upper limit**), the **required** comment, **optional photos** (up to 3). | Quantity multiplies the job's minutes. Every job has a quantity. |
| **Questions** ("A few questions", "About: job × 2") | One plain list of questions, **every one written for the task** the member picked (no section labels). The task's own questions come first (1 to 3), then the task's versions of the three eligibility checks: reaching the work with a standard step ladder (Yes / No, it's higher / Not sure), whether it is only a swap or repair with no new gas, wiring or water lines (Yes / No / Not sure), and having the part, fixture or material (Yes / No). For example for a TV: "Can you reach where the top of the TV will hang using a standard step ladder?". Each can carry a short hint. A progress line reads "2 of 6 answered" (and "These answers apply to all 2" for a quantity). | **No button to press while answering**: when the last question is answered and every answer is Yes, the screen moves on. **No** or **Not sure** on any question means the job is **not eligible**: a note appears ("<job> isn't eligible for Fast Fix. You can keep adding jobs…") and a **Continue** button, without needing to answer the rest. Flipping the answer back to Yes clears it. Every job gets these questions. |
| **Add another job?** | Each job so far (name × quantity, group, comment, photos) with **Edit** and **Remove**; **Add another job** (secondary) or **Continue** (primary). | **No limit on the number of jobs.** When any job is not eligible the list becomes **two titled sections: Eligible for Fast Fix (n)** and **Requires Service Request (m)**; the summary on the right has the same two groups, and only eligible jobs count toward the visit length. Picking the same job again makes a second entry titled "(2)". |
| **Review page** | Shown when a job is not eligible, or when the eligible work needs more than one visit. | See below. |
| **Pick a time** | Real open times, start times only, for the visit (or each visit). | Visit length is the eligible jobs' minutes × quantity, whole hours, 1 to 3, not changeable. |
| **Booked** | **One card per visit** (no shared list, no repeated jobs row): a date tile (month and day), "Visit 1 of 2" (or "Your visit"), the weekday and date, the time range and length ("8:00 – 9:00 AM · 1 hour"), the tasks in that visit and the address. Page title "You're booked", with "Your 2 visits are confirmed" for several. | If any job was not eligible there is **one confirmation card**, **Service request submitted**: "Our team will contact you to schedule these jobs. Your descriptions and photos came with the request." with the jobs listed. It has **no button**: the request was already submitted on the plan page. Back to dashboard is the one yellow button, next to **Add to calendar** and **Reschedule or cancel**. |
| **Your visits** (reschedule or cancel) | Opened from **Reschedule or cancel**. Lists **only the visits created from this service request**, one card each (same card as the confirmation page) with two buttons: **Reschedule** and **Cancel visit**. A line says how many visits are still scheduled. **Done** is the one yellow button. No stepper, no side rail. | **Reschedule** opens the normal time picker for that visit ("Reschedule: visit 2", "Now: Wed, Oct 14 · 9:30 AM", the new time cannot overlap the other visits, **Confirm new time**), then returns here with a note ("Visit 2 is now on Thu, Oct 15 at 9:30 AM") and a **Rescheduled** chip. **Cancel visit** opens a confirmation page ("Cancel visit 1?", the card, **Keep visit 1** (yellow) and **Cancel visit 1**), then returns here with a note and a **Cancelled** chip; a cancelled card keeps its details greyed out and has one button, **Book a new time**, which runs the same time picker ("Book a new time: visit 1"). |

### Review page ("Here’s the plan"): two plain panels, and this is where the service request is submitted

No right-hand summary on this page, no per-job cards, no repeated comments, photos or categories. Two panels, each with a heading, a status chip, one line, and one row per job:

- **Fast Fix** (blue panel), chip **Next: pick a time** (or **Next: pick times**): "One visit of about N hours." With two visits it lists **Visit 1 · 1 hour** and **Visit 2 · 3 hours**, each with its jobs.
- **Service request** (white panel), chip **Submitted when you continue**: "We send this to our team for you. Your notes and photos go along." Each job that did not pass is listed with the one reason ("No: <question>" or "Not sure: <question>").

**The big yellow button submits the service request and moves on to booking.** Its label says so: **Submit request and pick a time** (or **Submit request and pick times** for two visits), with the line beside it: "Submits your service request, then you pick a time". When nothing is eligible the button is **Submit for Service Request** ("Submits your service request") and ends on the request-sent page. The time screen then opens with "Your service request is submitted." and the right-hand summary reads "Submitted when you continue" under the job. Subtitle: "Continue to submit your service request and pick a time for Fast Fix."

Only when every job is eligible and splits into two visits is there a secondary **Send everything to our team instead**; a mix never offers it. Titles: "Here’s the plan" (mix), "We’ll book this as 2 Fast Fix visits" (all eligible, split), "This needs a service request" (none eligible). The time screen runs once per visit; visit 2 cannot overlap visit 1.

How visits are worked out: the total hours of the **eligible** jobs (quantity × minutes each; jobs that are not eligible never count) are packed into the fewest visits of 3 hours or less, as even as possible, keeping a whole job in one visit when that fits and otherwise sharing its units out. Jobs are 30 to 120 minutes each, so two 2-hour jobs cannot share a visit (three jobs of 5 each at 2 hours is 15 visits of 2 hours; 30 hours of 90-minute jobs is 10 visits of 3 hours). The plan page groups identical visits in one row ("Visits 1–10 · 3 hours each"). The time screen runs once per visit ("Pick a time: visit 3 of 10", "Confirm visit 3, then pick visit 4", the last one "Confirm all 10 visits"), and a visit cannot overlap any earlier visit. The confirmation page lists every visit with its date and time. The quantity box takes up to 3 digits so a typo cannot freeze the page; that is a typing guard, not a rule.

Back goes one step at a time: questions to describe to picker to type; the list goes back to the last job's questions; Pick a time goes back to the review page when shown, otherwise to the list; visit 2 goes back to visit 1.

## Rules decided on the calls

- **No limit on jobs**, **How many?** on every job (no cap), and picking the same job again are all in.
- **Every question is specific to its task and asked on its own.** There is no separate set of general questions. Nothing is grouped into one "does all of this apply".
- **Not eligible = any No or Not sure.** The member sees it immediately and again on every list, the review page and the confirmation page, always as two titled groups.
- **Eligible jobs are scheduled; the others are submitted automatically** when the member taps the yellow button on the plan page (before they pick a time). The confirmation page only confirms it. The service request carries the description, photos and quantity.
- **No caps.** **How many?** has no upper limit and there is no cap on Fast Fix bookings: eligible work past 3 hours becomes that many visits (each up to 3 hours, as even as possible), whether or not other jobs are not eligible. 30 hours of work is 10 bookings made right there. Nothing is sent to our team for being too long.
- **A mix never goes entirely to a service request.** The eligible jobs are booked; the ineligible ones are submitted when the member continues from the plan page.
- Still open for the stakeholders (Mark, Justin): whether members should instead get a single visit (the all-eligible split page offers "Send everything to our team instead").

## Notes for engineering

- Answers are not stored; they only decide routing. The compiled `job_requested` has one line per task: `- Task1: Mount a TV (Mounting & Hanging) x2: <comment>`.
- One service request holds all tasks; eligible tasks go into one booking (or two when split); the service request is created when the member continues from the plan page.
- Each job's own questions live in the catalog as `kq` (placeholder copy, in the workbook's last column). The three eligibility checks (ladder, swap-or-repair, part) are written per task as `kg` in the catalog (`{ ladder: {q, h}, trade: {q, h}, part: {q, h} }`); `COMMON_Q` in `app.js` only holds the answer options and the fallback wording. The single question the other versions use is `ko`.
- Minutes are an internal estimate; quantity multiplies them.

## Try these

- Tap Mounting & Hanging → Mount a TV (drywall) → More three times (4) → comment → Continue → answer Yes down the list → Continue → the 2-visit page → Pick times for both visits.
- Same TV, then Add another → search "toilet rocks" → answer **No** to the first question → Continue → the list now has Eligible for Fast Fix and Requires Service Request → Continue → the plan page → **Submit request and pick a time** → pick a time → the confirmation page shows "Service request submitted".
- A TV ×4 plus a job that is not eligible: the TV splits into 2 Fast Fix visits, the plan page shows the Fast Fix panel (2 visits) and the Service request panel, and the confirmation page shows both visits plus the "Service request submitted" module.
- A 2-hour job ×4 plus a job that is not eligible: 4 Fast Fix visits (grouped as "Visits 1–4 · 2 hours each") plus the Service request panel; nothing is blocked.
- Two 90-minute jobs with 10 each: 30 hours, "We’ll book this as 10 Fast Fix visits", then ten times pick a time.
- On the confirmation page tap **Reschedule or cancel** → Your visits → **Reschedule** on visit 2 → pick a time → **Confirm new time**; then **Cancel visit** on visit 1 → **Cancel visit 1** → **Book a new time**.
- "Prototype states" → Jump to screen: Describe + photos, Questions, Add another job, What fits, Pick a time, Your visits and Cancel a visit all work from a cold start.
