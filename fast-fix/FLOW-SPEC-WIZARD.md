# Fast Fix: one job at a time (wizard)

Prototype: `request-flow-wizard-desktop.html` (1280) and `request-flow-wizard-mobile.html` (390). This is the main version. The other three (`request-flow-*.html`, `request-flow-describe-*.html`) still build from the same source (`python3 build.py`) but are no longer being updated, so they do not have the changes below.

## The idea

Finish one job completely, then decide whether to add another. Every choice that can move you on with one tap does; a button only appears where there is something to type or confirm. There is **no separate quick-check step**: each job gets its own questions, **every question answered on its own**, and the three overall questions are asked for every job. A job that fails any question is **not eligible**: the list, the review page, the summary and the confirmation page all split **Eligible for Fast Fix** from **Requires Service Request**. Eligible jobs are **always booked as Fast Fix**; jobs that are not eligible are **never** pulled into a "send everything to a service request": they wait in a module on the confirmation page with their own submit button. A visit past 3 hours becomes two Fast Fix visits.

```
Request type -> Fast Fix
 1 Your jobs   Pick a job        tap a category, tap a job; or search and tap  -> moves on
               Describe it       How many? + required comment + optional photos      [Continue]
               Questions         each question on its own, Yes / No (some with Not sure)
               Add another job?  list of jobs so far, up to 3 (two titled sections if any is not eligible)
               Review page       only when needed: some jobs not eligible, or the visit is split in two
 2 Pick a time -> Booked (one or two visits), with the Service Request module if any job was not eligible
```

## Screens

| Screen | What the member does | Rules |
|---|---|---|
| **Pick a job** ("What needs fixing?", "Job 2 of up to 3") | Search box, then **10 category rows**. Tap a category (`#/job/plumbing`) for its jobs; tap a job to go **straight to its screen**. | No checkbox, no Continue. **All categories** button above and below a category's list; the page **Back** link always means the previous big step. A hint says the same job can be added again. A job already in the request shows **Added** but can be tapped again. |
| **Describe** (title is the job) | **How many?** (minus/plus, default 1, up to 6), the **required** comment, **optional photos** (up to 3). | Quantity multiplies the job's minutes. Every job has a quantity. |
| **Questions** ("A few questions", "About: job × 2") | Answers **each question on its own**: first under a blue chip **Job-Specific Qualification** (the job's own questions, 1 to 3), then under a **General Qualification** chip (the three overall questions, each with its own hint). The chips are small pill labels (14px, semibold, tinted) so they read as section labels, clearly different from the 18px question text: *Can you reach it with a standard step ladder?* (Yes / No, it's higher / Not sure), *Is the work only a swap or repair of what is already there, with no gas, new wiring or moved water lines?* (Yes / No / Not sure), *Do you have the part or fixture, if the job needs one?* (Yes / No). A progress line reads "2 of 6 answered" (and "These answers apply to all 2" for a quantity). | **No button to press while answering**: when the last question is answered and every answer is Yes, the screen moves on. **No** or **Not sure** on any question means the job is **not eligible**: a note appears ("<job> isn't eligible for Fast Fix. You can keep adding jobs…") and a **Continue** button, without needing to answer the rest. Flipping the answer back to Yes clears it. Every job gets these questions. |
| **Add another job?** | Each job so far (name × quantity, group, comment, photos) with **Edit** and **Remove**; **Add another job** (secondary) or **Continue** (primary). | Max **3 jobs**. When any job is not eligible the list becomes **two titled sections: Eligible for Fast Fix (n)** and **Requires Service Request (m)**; the summary on the right has the same two groups, and only eligible jobs count toward the visit length. Picking the same job again makes a second entry titled "(2)". |
| **Review page** | Shown when a job is not eligible, or when every job is eligible but needs two visits. | See below. |
| **Pick a time** | Real open times, start times only, for the visit (or each visit). | Visit length is the eligible jobs' minutes × quantity, whole hours, 1 to 3, not changeable. |
| **Booked** | Confirmation of each visit with date, time, hours and jobs. | If any job was not eligible there is **one confirmation module**, **Service request submitted**: "Our team will contact you to schedule these jobs. Your descriptions and photos came with the request." with the jobs listed. It has **no button**: the request was already submitted on the plan page. Back to dashboard is the one yellow button. |

### Review page ("Here’s the plan"): two plain panels, and this is where the service request is submitted

No right-hand summary on this page, no per-job cards, no repeated comments, photos or categories. Two panels, each with a heading, a status chip, one line, and one row per job:

- **Fast Fix** (blue panel), chip **Next: pick a time** (or **Next: pick times**): "One visit of about N hours." With two visits it lists **Visit 1 · 1 hour** and **Visit 2 · 3 hours**, each with its jobs.
- **Service request** (white panel), chip **Submitted when you continue**: "We send this to our team for you. Your notes and photos go along." Each job that did not pass is listed with the one reason ("No: <question>" or "Not sure: <question>").

**The big yellow button submits the service request and moves on to booking.** Its label says so: **Submit request and pick a time** (or **Submit request and pick times** for two visits), with the line beside it: "Submits your service request, then you pick a time". When nothing is eligible the button is **Submit for Service Request** ("Submits your service request") and ends on the request-sent page. The time screen then opens with "Your service request is submitted." and the right-hand summary reads "Submitted when you continue" under the job. Subtitle: "Continue to submit your service request and pick a time for Fast Fix."

Only when every job is eligible and splits into two visits is there a secondary **Send everything to our team instead**; a mix never offers it. Titles: "Here’s the plan" (mix), "We’ll book this as 2 Fast Fix visits" (all eligible, split), "This needs a service request" (none eligible). The time screen runs once per visit; visit 2 cannot overlap visit 1.

Limits: the **eligible** jobs split into two visits when their total is **at most 6 hours** and they can be packed into two visits of 3 hours or less. Jobs that are not eligible never count toward the hours. Past that limit: every job eligible goes to our team as one service request (open for the stakeholders); a mix shows "Remove a job or lower a quantity to continue" with Continue disabled.

Back goes one step at a time: questions to describe to picker to type; the list goes back to the last job's questions; Pick a time goes back to the review page when shown, otherwise to the list; visit 2 goes back to visit 1.

## Rules decided on the calls

- **Max 3 jobs**, **How many?** on every job, and picking the same job again are all in.
- **Each question is asked on its own** (the job's own, then the three overall ones). Nothing is grouped into one "does all of this apply".
- **Not eligible = any No or Not sure.** The member sees it immediately and again on every list, the review page and the confirmation page, always as two titled groups.
- **Eligible jobs are scheduled; the others are submitted automatically** when the member taps the yellow button on the plan page (before they pick a time). The confirmation page only confirms it. The service request carries the description, photos and quantity.
- **Over 3 hours of eligible work: two Fast Fix visits** (not a service request), whether or not other jobs are not eligible. Not handled: more than two visits.
- **A mix never goes entirely to a service request.** The eligible jobs are booked; the ineligible ones are submitted from the confirmation page.
- Still open for the stakeholders (Mark, Justin): when every job is eligible but needs more than two visits (or cannot be packed into two), the prototype sends it to our team as one service request; and whether members should instead get a single visit (the all-eligible split page offers "Send everything to our team instead").

## Notes for engineering

- Answers are not stored; they only decide routing. The compiled `job_requested` has one line per task: `- Task1: Mount a TV (Mounting & Hanging) x2: <comment>`.
- One service request holds all tasks; eligible tasks go into one booking (or two when split); the service request is created when the member continues from the plan page.
- Each job's own questions live in the catalog as `kq` (placeholder copy, in the workbook's last column). The three overall questions are the same for every job (`COMMON_Q` in `app.js`). The single question the other versions use is `ko`.
- Minutes are an internal estimate; quantity multiplies them.

## Try these

- Tap Mounting & Hanging → Mount a TV (drywall) → More three times (4) → comment → Continue → answer Yes down the list → Continue → the 2-visit page → Pick times for both visits.
- Same TV, then Add another → search "toilet rocks" → answer **No** to the first question → Continue → the list now has Eligible for Fast Fix and Requires Service Request → Continue → Pick a time for Fast Fix → pick a time → the page says "Submit request and pick a time"; tap it, pick a time, and the confirmation page shows "Service request submitted".
- A TV ×4 plus a job that is not eligible: the TV splits into 2 Fast Fix visits, the review page shows Eligible (with the 2 visits) and Requires Service Request, and the confirmation page shows both visits plus the module.
- A 4× long job plus a job that is not eligible: more than two visits of work, so the list says to remove a job or lower a quantity and Continue stays disabled.
- "Prototype states" → Jump to screen: Describe + photos, Questions, Add another job, What fits and Pick a time all work from a cold start.
