# Fast Fix: one job at a time (wizard)

Prototype: `request-flow-wizard-desktop.html` (1280) and `request-flow-wizard-mobile.html` (390). The other three versions are unchanged and build from the same source (`python3 build.py`). Same 100 symptom tasks, one question per task, optional photos, same visit length and calendar rules as `FLOW-SPEC.md`.

## The idea

Finish one job completely, then decide whether to add another. **Every choice moves you on with one tap**: no checkboxes, no select-then-Continue. A button only appears where there is something to type or confirm.

```
Request type -> Fast Fix
 1 Your jobs   Pick a job      (tap a category, tap a job; or search and tap) -> moves on
               Describe it     (required comment + optional photos, 1 screen)   [Continue]
               One question    (tap Yes -> moves on; tap No -> explains)         (skipped for the 2 tasks with none)
               Add another job?  -> yes: back to "Pick a job" (Job 2 of up to 4)
                                 -> no:  Continue
 2 Quick check The three overall questions, asked once for the whole visit
 3 Pick a time -> Booked, or Sent to our team from any no-go
```

## Screens

| Screen | What the member does | Rules |
|---|---|---|
| **Pick a job** ("What needs fixing?", "Job 2 of up to 4") | A search box, then **10 category rows**. Tapping a category (`#/job/plumbing`) shows its jobs as rows; tapping a job goes **straight to its description screen**. Search lists jobs from any category (with the category shown) and also finds a whole category by its name; tapping a result moves on. Jobs already in the request show **Added** and cannot be tapped. | No checkbox, no Continue, no bottom button. **Inside a category, an "All categories" button (chevron, tinted pill) sits above the list and again below it** (long lists on a phone) and returns to the 10 categories. The page-level **Back** link always means the previous big step (the list of jobs so far, or Request type), never "up a level"; the browser Back button still steps from a category to the categories. The service-request pointer and "found 2 of my 3 jobs" modal work as before. |
| **Describe** (title is the job name) | Writes what is going on (required, "say how many if more than one"). Optionally adds up to 3 photos (photos only, 10 MB each, Remove). | Comment needs a few words. Photos never block. |
| **One question** ("One quick question", "About: job") | Taps **Yes** or **No** (two answer buttons, not radios, so arrow keys never answer by accident). | **Yes moves on at once.** No stays and shows the job name and: with other jobs in the request, **Remove this job and keep going** (back to the list, with a note that a service request button follows booking); if it is the only job, **Pick a different job instead**. The button says **Send to our team** and sends the whole request. |
| **Add another job?** | Sees each job so far (name, group, comment, photo count) with **Edit** and **Remove**. **Add another job** (secondary) or **Continue** (primary). | Add another is disabled at 4 jobs ("the most a Fast Fix covers") and when the jobs already add up to more than 3 hours (note + button becomes **Send to our team**). Edit reopens the job (description, then its question, then back to this list). Removing the last job returns to Pick a job. |
| **Quick check** | The three overall questions only (Yes is right on all three). | A job-level question is never asked here; it was asked with its job. A failing answer sends the whole request to the team, as before. |
| **Pick a time, Booked, Sent** | Unchanged. | Visit length is the sum of the jobs, whole hours, 1 to 3, not changeable. |

Back goes one step at a time: question to describe to pick to type (from inside a category it leaves the picker; use All categories to go up a level); the list goes back to the last job's question (or describe if it has none); Quick check goes back to the list; while editing, Back returns to the list.

## Why the tree went away

The accordion (10 groups that open in place, with checkboxes) existed so someone could browse and tick several jobs on one page. Here a person picks one job at a time, so it only added a tap to open, a tick, and a Continue. Categories then jobs is the same layered structure, but each level is one clean list where a tap commits: the same two taps to reach a job (category, job) as open-group, tick, and no scrolling past other open groups on a phone. Search still matches job names, category names and related words, and shows the category next to each result.

## Decisions I made (change any of them)

1. **The three overall questions come once, at the end** (not per job): they are about the visit (ladder, wiring/water, part), and asking them four times would be noise.
2. **Add another job?** is its own screen so the choice is explicit, rather than a button buried on the describe screen.
3. **Caps:** 4 jobs and 3 hours both apply, as in the other versions. The 4-job cap counts jobs; there is no quantity control (see `FLOW-SPEC.md`).
4. **Answers are buttons, not radios,** because an answer moves you on; radios change with the arrow keys and would advance by accident.
5. **A "No" on a job question** removes just that job if there are others (same rule as the pick-it-yourself version), otherwise offers a different job.

## Compared with the pick-it-yourself version

More screens (3 per job instead of one long page), but each is short, picking and answering are one tap, and the mobile page never grows tall. The cost is more taps for a 3 or 4 job request.

## Try these in the prototype

- Tap Mounting & Hanging → Mount a TV (drywall) → add a photo → Continue → Yes → Add another job → Toilet rocks or leaks → answer No → Remove this job and keep going → Continue → Quick check.
- Add 4 jobs (Add another disables); add two long jobs (note, Send to our team).
- Edit a job from the list; Remove the last job.
- "Prototype states" → Jump to screen (Describe + photos, One question, Add another job work from a cold start).
