# Fast Fix: one job at a time (wizard)

Prototype: `request-flow-wizard-desktop.html` (1280) and `request-flow-wizard-mobile.html` (390). This is the main version. The other three (`request-flow-*.html`, `request-flow-describe-*.html`) still build from the same source (`python3 build.py`) but are no longer being updated, so they do not have the changes below.

## The idea

Finish one job completely, then decide whether to add another. Every choice that can move you on with one tap does; a button only appears where there is something to type or confirm. There is **no separate quick-check step**: the three overall questions are part of each job's own question. Anything that does not fit Fast Fix is flagged on the spot and explained on one clear page before booking, and a visit that would run past 3 hours becomes two Fast Fix visits when every job fits.

```
Request type -> Fast Fix
 1 Your jobs   Pick a job        tap a category, tap a job; or search and tap  -> moves on
               Describe it       How many? + required comment + optional photos      [Continue]
               One question      the conditions as a list; tap Yes (moves on) or No
               Add another job?  list of jobs so far, up to 3
               Review page       only when needed: some jobs don't fit, or the visit is split in two
 2 Pick a time -> Booked (one or two visits) or Sent to our team
```

## Screens

| Screen | What the member does | Rules |
|---|---|---|
| **Pick a job** ("What needs fixing?", "Job 2 of up to 3") | Search box, then **10 category rows**. Tap a category (`#/job/plumbing`) for its jobs; tap a job to go **straight to its screen**. Search matches job names, category names and related words and shows the category beside each result. | No checkbox, no Continue. Inside a category an **All categories** button sits above and below the list; the page **Back** link always means the previous big step. A hint says the same job can be added again. A job already in the request shows **Added** but can be tapped again. The service-request pointer and "can't find my job" modal work as before. |
| **Describe** (title is the job) | **How many?** (minus/plus, default 1, up to 6), the **required** comment, and **optional photos** (up to 3). | Quantity multiplies the job's minutes in the visit length. Every job has a quantity (all or none, so nothing to configure per job). |
| **One question** ("One quick question", "About: job × 2") | Reads **what Fast Fix covers for this job** (2 to 3 job-specific conditions), then **"And for any job:"** the three overall conditions (standard step ladder; only a swap or repair with no gas, new wiring or moved water lines; you have the part), then answers **one** question: **Does all of this apply to your job?** (with a quantity of 2 or more it reads **Does all of this apply to every one?** and a line says "You're adding 2 of these"). Taps **Yes** or **No**. | **Yes moves on at once.** **No** stays, says "<job> doesn't fit Fast Fix. You can keep adding jobs. Before you continue, we'll show you what fits and what needs a service request.", and the button becomes **Continue**. Every job gets this question. "Not sure" is treated as No. |
| **Add another job?** | Each job so far (name × quantity, group, comment, photos) with **Edit** and **Remove**; **Add another job** (secondary) or **Continue** (primary). | Max **3 jobs**. When any job did not fit, rows are tagged **Fits Fast Fix** / **Needs a service request**, and the summary on the right splits **Fast Fix** from **Service request** (only the fast-fixable jobs count toward the visit length). Picking the same job again makes a second entry titled "(2)". |
| **Review page** | Shown when a job did not fit, or when everything fits but needs two visits. | See the two cases below. |
| **Pick a time** | Real open times, start times only, for the visit (or each visit). | Visit length is the fitting jobs' minutes × quantity, whole hours, 1 to 3, not changeable. |
| **Booked / Sent** | Confirmation. | Booked lists each visit with date, time, hours and jobs. If some jobs did not fit it says a **service request was created** for them and our team will be in touch (no extra flow to start). |

### Review page, case 1: some jobs do not fit

"Here's what fits Fast Fix": **Fast Fix: book a time now (n)** (the jobs that fit) and **Needs a service request (m)** (each job with the conditions Fast Fix covers). One line says **everything you picked goes in as one request**: the member picks a time for the Fast Fix jobs now, and our team schedules the others and is in touch. Primary **Submit and pick a time** (or **Submit service request** when nothing fits). Secondary **Send all N jobs to our team instead** (no booking, one visit with our team). **Change my jobs or answers** goes back.

### Review page, case 2: over 3 hours, every job fits (split in two)

"We'll book this as 2 Fast Fix visits": each visit with its hours and jobs (whole jobs kept together when possible, otherwise units of a job are shared out; visits are as even as possible). Primary **Pick times for both visits**; secondary **Send everything to our team instead**. The time screen then runs once per visit ("Pick a time: visit 1 of 2", a note naming that visit's jobs, button **Confirm visit 1, then pick visit 2**, then **Confirm both visits**). Visit 2 cannot overlap visit 1. Back on visit 2 returns to visit 1. Booked shows both.

Limits: split only when **every job fits**, the total is **at most 6 hours**, and the jobs can be packed into two visits of 3 hours or less (three 2-hour jobs cannot: each visit holds one). If a job does not fit and the rest is over 3 hours, or the total is over 6 hours, the whole request goes to our team ("Send to our team").

Back goes one step at a time: question to describe to picker to type; the list goes back to the last job's question; Pick a time goes back to the review page when shown, otherwise to the list; visit 2 goes back to visit 1.

## Rules decided on the calls

- **Max 3 jobs.** **How many?** on every job, and picking the same job again are both in.
- **One question per job** with the overall questions folded in (JC: one question, Phong: add the three into each task). Conditions are shown as a list plus one Yes/No; the question mentions the quantity.
- **One request:** everything the member picks is one service request; the fitting jobs are booked and the rest are scheduled by our team. A No does not end the request silently; the review page shows what fits.
- **Over 3 hours and every job fits: two Fast Fix visits** (not a service request). Not handled: more than two visits.
- The right-hand summary splits fast-fixable from the rest, and only the fast-fixable jobs count toward the 3 hours.
- Still open for the stakeholders (Mark, Justin): whether members should instead get a single visit; the prototype offers "Send everything to our team instead" so the choice is theirs.

## Notes for engineering

- Answers are not stored; the result only decides routing. The compiled `job_requested` has one line per task: `- Task1: Mount a TV (Mounting & Hanging) x2: <comment>`.
- Booking and request model (JC): one service request holds all tasks; fitting tasks are added to one booking, or to two when split; the others stay on the service request for ops to schedule.
- Conditions live in the catalog as `kc` (placeholder copy, in the workbook's last column). The three overall conditions are the same on every job (`COMMON` in `app.js`). The single question the other versions use is `ko`.
- Minutes are an internal estimate; quantity multiplies them.

## Try these

- Tap Mounting & Hanging → Mount a TV (drywall) → More three times (4) → comment → Continue → Yes → Continue → the 2-visit page → Pick times for both visits.
- Same TV, then Add another → search "toilet rocks" → **No** → Continue → Continue → the what-fits page → Submit and pick a time → Booked with the service-request note.
- A TV ×4 plus a job that doesn't fit: over 3 hours and not every job fits, so it is not split.
- "Prototype states" → Jump to screen: Describe + photos, One question, Add another job, What fits and Pick a time all work from a cold start.
