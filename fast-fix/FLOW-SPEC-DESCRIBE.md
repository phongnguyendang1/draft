# Fast Fix: describe-first version

Prototype: `request-flow-describe-desktop.html` (1280) and `request-flow-describe-mobile.html` (390). The list-first version is unchanged (`request-flow-*.html`); both build from the same source.

## The idea: one surface, one selection

Step 1 is a single screen. An optional input, **"Describe what you need"**, sits directly above the job list. As the member types, the matching jobs are ticked in that same list. They can also tick jobs themselves. There is only ever one selection, and it lives in the list.

Nothing about it is presented as a special feature. No assistant, chat, avatar, sparkle, product name, or "suggested for you". It reads as a form that selects jobs from what you typed.

What this replaced: an earlier build had three phases (describe, matching, results) behind a "Find jobs" button, a separate "Selected jobs" list that could read "nothing selected", an "Add another job" input, and a "Browse all jobs" toggle that opened a second selection grid. That meant two places to select, three places to type, and a path that depended on which button was pressed first.

| Ask | How it is met |
|---|---|
| A plain input at the start of the flow | A labelled textarea at the top of step 1. No button needed |
| Type a few things and have them sorted into the right picks | After a short pause, matching jobs are ticked in the list below |
| Pick from the list if you prefer | The list is always visible: 10 jobs, "Show all 25 jobs". No mode switch |
| The details box for each pick is optional | "Add details (optional)" under each ticked job opens an **empty** labelled box. Never required, never pre-filled |
| No recommendations shown across the flow | No suggestion lines anywhere. Each ticked job only shows the member's own words it came from |

## Layout

```
What do you need done?
Describe it, pick from the list, or both. Adding details is optional.

+--------------------------------------------------------------+
| Describe what you need                                        |
| Write it your way, one job or several. Matching jobs are      |
| selected below.                                               |
| [ textarea ........................................ ]         |
| v 3 jobs selected below.                                      |
| [ one-tap question cards, only when needed ]                  |
|                                                               |
| Pick everything that applies                                  |
| [x] Running toilet        "the toilet keeps running"          |
|       Add details (optional)                                  |
| [ ] Clogged toilet                                            |
| [x] Door lock issue       "my front door lock sticks"         |
|       Add details (optional)                                  |
| ...10 rows...                                                 |
| Show all 25 jobs                                              |
|                                              [ Continue ]     |
+--------------------------------------------------------------+
```

Mobile is the same order in one column, with the single yellow button in the sticky dock and a short status above it.

## Interaction model

- **Matching runs after a pause** (about half a second after typing stops), never per keystroke, and again when Continue is pressed. Focus never moves while typing.
- **Ticking by hand always wins.** Matching only ever adds. A job the member unticks stays off while their text still matches it, and comes back only if they tick it again.
- **Auto-ticked jobs follow the text.** If the member deletes the phrase, its untouched auto-tick is removed. A job with details written, or one ticked by hand, is never removed by an edit.
- **Each ticked job shows its source phrase** ("the toilet keeps running") so it is obvious why it was ticked.
- **Ambiguous words** ("the toilet", "the door", "the faucet") show a one-tap question between the input and the list: "Is the faucet leaking, or do you want it replaced?" Leaking / Replace it / Skip. Ticking one of the options in the list yourself also resolves it. Answers are remembered per topic while the text still mentions it.
- **Unmatched phrases** are offered as "Something else": "We couldn't match 'the stairs squeak' to a job on our list. Add it as Something else?" The member's words are never dropped. The full description also travels with the request and is shown in the summary.
- **Questions never block.** Continue works with a question open; the description still goes to Ops.
- **Continue flushes pending text.** If that selects jobs, the page stays once with "We selected N jobs from what you wrote. Check them, then press Continue." so nothing is selected behind the member's back.
- **Too many jobs** (internal estimates add up to more than 3 hours): info note under the list, and the button becomes "Send to our team". Unticking reverts both. Estimates are never shown.
- **Matching unavailable**: "We couldn't select jobs from that right now. Pick them from the list below." Nothing is lost.

## States

| State | What the member sees |
|---|---|
| Load | Empty input, 10 unticked rows, "Show all 25 jobs", one yellow Continue. No counter, no "nothing selected" message |
| Typed | Matching rows ticked in place, each with its source phrase, "N jobs selected below." under the input, the dock status on mobile |
| Question | Blue-tint card between the input and the list with one-tap answers |
| Unmatched | Blue-tint card offering "Add as Something else" or Skip |
| Details | "Add details (optional)" opens "More details about Running toilet (optional)", empty |
| Show all | All 25 rows in the same list, same order. A ticked job beyond the first 10 appears in place even when collapsed |
| Too many jobs | Note under the list, "Send to our team" |
| Nothing ticked, Continue | Inline error: pick at least one job or describe what you need |
| Matching unavailable | Plain note under the input, list still works |

## Notes for engineering

- **The prototype's matching is a rule-based stand-in** (`finderParse`). Everything after the parse step is real UI logic. Production can use any approach behind the same contract (rules, search, or a language model) as long as it returns only ids from the allowlist plus the phrase each came from, and the ids are validated server-side. The member never sees which method ran.
  - Output shape: `picks[{id, quote}]`, `questions[{key, text, options[ids]}]`, `unmatched[{quote}]`.
  - Cap the input length (600 characters here). Prefer a question over a low-confidence selection. Only high-confidence matches should tick.
- **Selection state** is one set of job ids. Bookkeeping per job: where it came from (text or hand), the phrase, and whether the member removed it. Details text is kept when a job is unticked and restored if it is ticked again; only ticked jobs are sent.
- **Latency and failure:** match on pause; if a call fails or takes more than a few seconds, show the quiet note and leave everything as is. Drop stale responses.
- **Member text is data.** It is rendered as text only, never as markup.
- **Suggested metrics:** share who type vs only tick; auto-ticked jobs later unticked (an accuracy proxy); questions answered vs skipped; unmatched converted to Something else; share who add details; no-go rate vs the list-first version; time to booking; completion rate.

## Open questions

1. **Recommended time on step 3.** It is rule-based (sum of internal per-job estimates, rounded up, 1 to 3 hours) and was requested for the list-first version. It is kept here. If "no recommendations" should include it, step 3 can open on a plain 1 / 2 / 3 hour choice.
2. **What happens to the typed text?** Where it is stored, how long, and whether it is logged.
3. **Details optional only in this version.** The list-first version still requires a box per job. Decide whether to align them.
4. **Describe on the request-type page too?** A box there could route between Fast Fix, Service request and Account.
5. Everything in `FLOW-SPEC.md` still applies (price, 3-hour visits, eligibility, routing of the auto-submitted request).

## Try these in the prototype

Open "Prototype states" (bottom right), "Try a description":

- `The toilet keeps running, my front door lock sticks, and I need a TV mounted` (three clear jobs)
- `The faucet is a problem and the stairs squeak` (a question and an unmatched phrase)
- `Mount a TV, hang shelves, assemble a dresser, replace a faucet and caulk the tub` (too many jobs)
- Switch "Matching is unavailable" on and type
