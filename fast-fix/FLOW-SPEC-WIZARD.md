# Fast Fix: one job at a time (wizard)

Prototype: `request-flow-wizard-desktop.html` (1280) and `request-flow-wizard-mobile.html` (390). This is the main version now. The other three (`request-flow-*.html`, `request-flow-describe-*.html`) still build from the same source (`python3 build.py`) but are no longer being updated, so they do not have the changes below.

## The idea

Finish one job completely, then decide whether to add another. Every choice that can move you on with one tap does; a button only appears where there is something to type or confirm. Anything that does not fit Fast Fix is flagged on the spot and explained on one clear page before booking.

```
Request type -> Fast Fix
 1 Your jobs   Pick a job       tap a category, tap a job; or search and tap  -> moves on
               Describe it      How many? + required comment + optional photos    [Continue]
               One question     the conditions as a list; tap Yes (moves on) or No   (skipped for 2 jobs)
               Add another job? list of jobs so far, up to 3
               What fits        only when a job did not fit: fits vs needs a service request
 2 Quick check The three overall questions, once for the whole visit
 3 Pick a time -> Booked (or a button for the service request), or Sent to our team
```

## Screens

| Screen | What the member does | Rules |
|---|---|---|
| **Pick a job** ("What needs fixing?", "Job 2 of up to 3") | Search box, then **10 category rows**. Tap a category (`#/job/plumbing`) for its jobs; tap a job to go **straight to its screen**. Search matches job names, category names and related words and shows the category beside each result. | No checkbox, no Continue. Inside a category an **All categories** button sits above and below the list; the page **Back** link always means the previous big step. A hint under the search says the same job can be added again (two TVs). A job already in the request shows **Added** but can be tapped again. The service-request pointer and "can't find my job" modal work as before. |
| **Describe** (title is the job) | **How many?** (a minus/plus, default 1, up to 6), the **required** comment ("Where is it, and anything else we should know?"), and **optional photos** (up to 3, photos only, 10 MB each). | Quantity multiplies the job's minutes in the visit length; the comment needs a few words; photos never block. Every job has a quantity (all or none, so there is nothing to configure per job). |
| **One question** ("One quick question", "About: job") | Reads **what Fast Fix covers for this job** as a short list (2 to 3 conditions), then answers **one** question: **Does all of this apply to your job?** Taps **Yes** or **No** (answer buttons, not radios, so the arrow keys never answer by accident). | **Yes moves on at once.** **No** stays, says "<job> doesn't fit Fast Fix. You can keep adding jobs. Before you continue, we'll show you what fits and what needs a service request.", and the button becomes **Continue**. Two jobs have no question and skip this screen. |
| **Add another job?** | Sees each job so far (name × quantity, group, comment, photos) with **Edit** and **Remove**; **Add another job** (secondary) or **Continue** (primary). | Max **3 jobs** (Add another then disables, "the most a Fast Fix covers"). The 3-hour limit counts only jobs that fit, times their quantity: past it the note shows and the button becomes **Send to our team**. When any job did not fit, every row is tagged **Fits Fast Fix** or **Needs a service request**. Picking the same job again makes a second entry, titled "(2)", with its own comment, photos, quantity and question. |
| **What fits** ("Here's what fits Fast Fix") | Only shown when at least one job did not fit. Two separate sections: **Fits Fast Fix (n)** (the jobs, with their comments) and **Needs a service request (m)** (each job with the conditions Fast Fix covers). Then a line on what happens next. | **Primary: "Book the n Fast Fix job(s)"** goes on to the quick check and time. The jobs that did not fit show as a separate service request in the summary, and after booking a button takes the member to a service request for them (their description and photos come with them). **Secondary: "Send all N jobs as one service request"** for someone who wants one visit. **Change my jobs or answers** goes back. If nothing fits there is only the service-request section and one button, **Send as a service request**. |
| **Quick check** | The three overall questions only (Yes is right on all three). | A failing answer sends the whole request to the team. Back goes to the what-fits page when it was shown, otherwise to the list. |
| **Pick a time, Booked, Sent** | Unchanged. | Visit length is the fitting jobs' minutes × quantity, whole hours, 1 to 3, not changeable. Booked lists only the jobs being booked and offers "Submit a service request for your other job(s)" when some did not fit. Sent says why: "Some of your jobs don't fit Fast Fix, so our team will plan all of them together as one service request." |

Back goes one step at a time: question to describe to picker to type (from inside a category it leaves the picker; use All categories to go up a level); the list goes back to the last job's question (or describe if it has none); the quick check goes back to the what-fits page when shown; while editing, Back returns to the list.

## Rules decided on the calls

- **Max 3 jobs** (Mark: "maybe we just change it to 3").
- **Same job twice:** pick it again (Mark, Alex), and a **How many?** on every job (JC: "all or none"; Mark agreed). Both are in.
- **One question per job**, shown as conditions plus one Yes/No (JC); nothing is stored, the answer only routes.
- **What fits page:** a No does not silently end the request. The member sees what fits and chooses to book it or send everything as one service request (Phong's two-button page; Velislav and Mark's "give them the option" for people who want a single visit).
- **Not handled (yet):** creating the service request automatically and then booking the Fast Fix jobs (JC's idea); the carry-over of descriptions and photos is described, but the service-request flow is a handoff in this prototype.

## Notes for engineering

- Answers to the job question are not persisted; the result only decides routing. `Ops` sees the description, photos and quantity (the compiled `job_requested`, one line per task: `- Task1: Mount a TV (Mounting & Hanging) x2: <comment>`).
- Conditions live in the catalog as `kc` (placeholder copy, generated from the earlier questions; they sit in the workbook's last column). The single question the other versions use is `ko`.
- Minutes are an internal estimate; quantity multiplies them. Jobs that did not fit never count toward the 3-hour limit.

## Try these in the prototype

- Tap Mounting & Hanging → Mount a TV (drywall) → More once → comment → photo → Continue → Yes → Add another job → search "toilet rocks" → comment → Continue → **No** → Continue → Continue → the what-fits page → Book the 1 Fast Fix job.
- Add the same TV twice (Add another → search the TV again). Add 3 jobs (Add another disables). TV with quantity 4 (over 3 hours).
- A job that does not fit on its own (only job): the page shows just the service-request section.
- "Prototype states" → Jump to screen: Describe + photos, One question, Add another job and What fits all work from a cold start.
