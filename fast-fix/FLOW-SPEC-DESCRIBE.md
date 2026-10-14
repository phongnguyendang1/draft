# Fast Fix: describe-first version

Prototype: `request-flow-describe-desktop.html` (1280) and `request-flow-describe-mobile.html` (390). The list-first version is unchanged (`request-flow-*.html`); both build from the same source.

## The idea

Step 1 starts with an ordinary input: **"Describe what you need."** The member types a few things in their own words, and the form selects the matching jobs from the existing 25-job list based on what they wrote. They check the selection, optionally add details to any job, and carry on.

Nothing about it is presented as a special feature. There is no assistant, no chat, no sparkle, and no product name. It reads as a form that selects jobs from what you typed.

| Ask | How it is met |
|---|---|
| A plain input at the start of the flow | A labelled textarea, three example chips and a "Find jobs" button. "Pick from the list instead" is always one tap away |
| Type a few things and have them sorted into the right picks | One description, several jobs at once, selected from the 25-job list |
| The details box for each pick is optional | Collapsed under "Add details (optional)". Never required. **Starts empty**, nothing is pre-filled |
| No recommendations shown across the flow | No suggestions, tips or "from your description" notes anywhere. The member's own answers drive everything |

## Principles

1. **Show what was selected and why.** The description is shown back with the matched phrases highlighted (underline and tint, not colour alone), and each job card shows the words it came from.
2. **Ask, don't guess.** An ambiguous phrase ("the toilet", "the door", "the faucet") gets a one-tap choice. A phrase that matches nothing is offered as "Something else", never dropped or forced into a wrong job.
3. **The member decides.** Remove a job, add another, edit the description, or browse the full list. Nothing moves forward or submits by itself.
4. **Never answers the quick check.** The description does not pre-answer, pre-flag or comment on any of the three questions. The member answers all three.
5. **Details are theirs.** The optional box per job starts empty and is labelled "More details about <job> (optional)". Whatever the member types goes to Ops with that job.
6. **No dead ends.** The list is always reachable, and if selection fails the form falls back to it without losing what was typed.
7. **Native look.** Same tokens as the rest of HomeHub: labelled field, chips, blue-tint choice cards, no new colours, no shadows. Motion is minimal and off for people who ask for less.

## Flow

```
Request type -> Fast Fix
 1 Describe what you need --- "Pick from the list instead" ---.
   |  type a few things / tap an example                       |
   v                                                           v
   Finding jobs... -> Selected jobs (highlights, choices, unmatched)  <-- browse all 25 jobs
   |  remove / add details (optional) / add another / edit the description
   |  too many jobs: note shown, button becomes "Send to our team"
   v
 2 Quick check   (the 3 questions, unchanged)
   v
 3 Pick a time   (recommended length, can be changed)
   v
 Booked          (or: Sent to our team, from any no-go)
```

## States

| State | What the member sees |
|---|---|
| Describe | Label, one-line hint, textarea, example chips, "Find jobs" (the one yellow button), "Pick from the list instead" |
| Finding jobs | Their description, "Finding jobs...", two skeleton cards |
| Selected jobs | "Your description" with highlights and Edit, a one-line summary ("3 jobs selected based on what you wrote."), choices, the **Selected jobs** list, "Add another job", "Browse all 25 jobs", Continue |
| Choice | "Is the faucet leaking, or do you want it replaced?" with Leaking / Replace it / Skip |
| Unmatched | "We couldn't match 'the stairs squeak' to a job on our list. Add it as Something else?" |
| Per-job details | "Add details (optional)" opens a labelled, empty box: "More details about Running toilet (optional)" |
| Too many jobs | Info note, button becomes "Send to our team" |
| Nothing selected | A plain message with Something else or the list |
| Selection unavailable | "We couldn't select jobs from that right now. You can still pick them from the list below." The list opens, nothing is lost |
| Quick check | The same three questions as the list-first version |
| Pick a time | "Recommended time", with Change |
| Summary rail | "Your description" (their original text) above the selected jobs |

## Notes for engineering

- **The prototype's selection is a rule-based stand-in** (`finderParse`). Everything after the parse step is real UI logic. Production can use any approach behind the same contract (rules, search, or a language model) as long as it returns only ids from the allowlist plus the phrase each came from, and the ids are validated server-side. The member never sees which method ran.
  - Output shape: `picks[{id, quote}]`, `questions[{text, options[ids]}]`, `unmatched[{quote}]`.
  - Cap the input length (600 characters here). Prefer a question over a low-confidence selection.
- **Latency and failure:** skeleton while waiting; a timeout of a few seconds falls back to the list.
- **Member text is data.** It is rendered as text only, never as markup.
- **Suggested metrics:** share who describe vs pick from the list; jobs removed after selection (an accuracy proxy); choices answered vs skipped; unmatched converted to Something else; share who add details; no-go rate vs the list version; time to booking; completion rate.

## Open questions

1. **Recommended time on step 3.** It is rule-based (sum of internal per-job estimates, rounded up, 1 to 3 hours) and was requested for the list-first version. It is kept here. If "no recommendations" should include it, step 3 can open on a plain 1 / 2 / 3 hour choice instead.
2. **What happens to the typed text?** Where it is stored, how long, and whether it is logged.
3. **Details optional only in this version.** The list-first version still requires a box per job. Decide whether to align them.
4. **Describe on the request-type page too?** A box there could route between Fast Fix, Service request and Account.
5. Everything in `FLOW-SPEC.md` still applies (price, 3-hour visits, eligibility, routing of the auto-submitted request).

## Try these in the prototype

- `The toilet keeps running, my front door lock sticks, and I need a TV mounted` (three clean matches)
- `...Also the stairs squeak and the faucet is a problem` (a choice and an unmatched phrase)
- Five jobs at once (the "more than a Fast Fix covers" note)
- Prototype states button: "Matching is unavailable", and "Jump to screen" > "Fast Fix 1 · Selected jobs"
