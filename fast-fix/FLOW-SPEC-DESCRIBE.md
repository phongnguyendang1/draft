# Fast Fix: describe-first version

Prototype: `request-flow-describe-desktop.html` (1280) and `request-flow-describe-mobile.html` (390). The list-first version is unchanged (`request-flow-*.html`); both build from the same source.

## The idea: one direction, no branches

1. **Describe.** One text box, one button. That is all.
2. **Your jobs.** The matching jobs are already selected. The member can remove any, or add more from a searchable list of 100 jobs in 10 groups. There is no record of what was typed and no way to edit it.
3. **Quick check, Pick a time, Booked.** Unchanged from the list-first version.

Nothing is presented as a special feature: no assistant, chat, avatar, sparkle, product name or "suggested for you". It reads as a form that fills in your jobs from what you wrote.

```
Request type -> Fast Fix
 1 Describe         one text box, Continue
 2 Your jobs        Selected jobs (remove, optional details)
                    Add more jobs: search + 10 groups of 10
 3 Quick check      the 3 questions (unchanged)
 4 Pick a time     (unchanged) -> Booked, or Sent to our team from any no-go
```

## Step 1: Describe

- Label "Describe what you need", hint "One job or several. Say it your way.", a large textarea (example in the placeholder), and the single yellow **Continue**.
- Empty submit: an inline error under the box, scrolled into view, focus in the box.
- Nothing else on the screen. No list, no chips, no examples to click, no skip.

## Step 2: Your jobs

**Selected jobs (top).** One card per job: icon, name, its group, **Remove**, and **Add details (optional)**. Details open an empty, labelled box: "More details about Running toilet (optional)". Never pre-filled, never required.

- Removing a job is one tap and also updates the group list below.
- Nothing about the original description is shown: not echoed, not editable, no "Edit".
- If nothing matched (or matching is unavailable) a plain note replaces the list: "We couldn't match your description to a job. Search or browse below to add some."

**Add more jobs (below).** A search box, then 10 groups. Each group is a row (icon, name, "10 jobs", a "2 selected" badge when it holds selections, chevron). Open a group to see its jobs as tiles (2 columns on desktop, 1 on mobile). Ticking a tile adds it to Selected jobs; unticking removes it. Groups are collapsed by default.

| Group | Examples |
|---|---|
| Plumbing | Running toilet, Leaky faucet, Clogged sink or drain |
| Doors & Locks | Door lock issue, Sticking or loose door, Replace a door knob |
| Walls, Paint & Tile | Patch a drywall hole, Caulk a tub, Re-grout |
| Mounting & Hanging | Mount a TV, Hang shelves, Hang a mirror |
| Lighting & Electrical Swaps | Replace a light fixture, Replace an outlet or switch, Smoke detector batteries |
| Kitchen & Appliances | Appliance diagnostic, Dishwasher issue, Cabinet handles |
| Furniture & Assembly | Assemble furniture, Bed frame, Anchor furniture to the wall |
| Windows & Blinds | Install blinds, Replace a window screen, Fix a sticking window |
| Home Care & Safety | Safety latches, Grab bar, HVAC filters, Squeaky stair |
| Outdoors & Other | Gate latch, Fence panel, Garage door keypad, Something else |

**Search** matches the job name, its group name and related words (so "plumbing" opens the Plumbing group with all 10 jobs, "faucet" finds the faucet jobs across groups, "flapper" finds Running toilet). Matching groups open automatically and show how many of their jobs match; clearing the search returns to the collapsed groups. No results: "No jobs match that. Try another word, or clear the search."

**Rules**
- **Something else** needs a few words in its details box before Continue (the one place details are asked for).
- **Too many jobs** (internal estimates add up to more than 3 hours): note under Selected jobs, the status by the button reads "More than a Fast Fix covers", and the button becomes **Send to our team**. Estimates are never shown.
- **Continue with nothing selected**: error under Selected jobs, scrolled into view.
- A second description (Back to step 1) adds to the selection; it never removes anything. The box is always empty when you arrive.
- The description is **kept with the request for Ops but never displayed** to the member again (see open question 2).

## Notes for engineering

- **Matching is a rule-based stand-in** (`matchText` in `app.js`, keywords in `catalog.js`). Production can use any approach behind the same contract (rules, search, or a language model) as long as it returns only job ids from the catalog and the ids are validated server-side. One job per clause of the description; when unsure, prefer fewer. The member never sees which method ran.
- **Catalog**: `catalog.js` holds the 100 jobs, their groups, search keywords and internal minutes. The real list is curated with Ops.
- **Suggested metrics:** share of auto-selected jobs removed (accuracy), jobs added by search vs by group, searches with no result (catalog gaps), "Something else" rate, no-go rate vs the list-first version, time to booking, completion rate.
- Member text is rendered as text only, never as markup.

## Open questions

1. **Visit length on step 4.** The length is still derived from the selected jobs (sum of internal per-job estimates, rounded up, 1 to 3 hours). This version labels it "Visit length" with "Based on the jobs you selected" and shows no "Recommended" badges. If even that should go, step 4 can open on a plain 1 / 2 / 3 hour choice.
2. **What happens to the typed text?** It is kept with the request so Ops can read what the member said. Where it is stored, for how long and whether it is logged still needs deciding. If it must not be kept, the "Something else" details box becomes the only place for free text.
3. **Details optional only in this version.** The list-first version still requires a box per job.
4. Everything in `FLOW-SPEC.md` still applies (price, 3-hour visits, eligibility, routing of the auto-submitted request).

## Try these in the prototype

- `The toilet keeps running, my front door lock sticks, and I need a TV mounted` (three jobs selected)
- `the stairs squeak and I want a new faucet` (two jobs, from different groups)
- `blorp zazzle` (nothing matched: search or browse)
- Search `plumbing`, `door`, `faucet`, `flapper`
- "Prototype states": "Matching is unavailable", and Jump to screen
