# Fast Fix with Jev: concept

Prototype: `request-flow-jev-desktop.html` (1280) and `request-flow-jev-mobile.html` (390). The original version is unchanged (`request-flow-*.html`); both build from the same source.

## The idea

Instead of scanning 25 jobs, the member says what is wrong in their own words. Jev turns that into the right picks, asks a question only when it has to, and the member stays in control the whole way.

| Stakeholder ask | How it is met |
|---|---|
| Jev at the start of the flow | Step 1 opens with Jev, not a list. The list is one tap away ("Pick from the list instead") |
| Type a few things, Jev sorts them into picks | One box, any phrasing, several jobs at once. Jev returns picks from the existing 25-job list |
| Details box per pick is optional | Collapsed under "Add details (optional)", never validated, and pre-filled with the member's own words |

## Principles

1. **Show the work.** The member's sentence is shown back with the phrases Jev used highlighted (underline and tint, not colour alone). Each pick cites the words it came from.
2. **Ask, don't guess.** Ambiguous ("the toilet", "the door", "the faucet") gets a one-tap question. Anything Jev cannot place is offered as "Something else", never silently dropped or forced into a wrong job.
3. **The member decides.** Remove a pick, edit it, add more, edit the original sentence, browse the full list, or skip Jev. Jev never moves the member forward or submits anything on its own.
4. **Jev never answers safety questions.** If the words mention risk (second-story, new wiring, "need to buy"), Jev points at the matching quick-check question with the quote. The member still answers all three.
5. **Their words travel.** The optional details start as the member's own phrase, so Ops sees what was actually said (no more "Handyman - Other" with no context).
6. **No dead ends.** The list is always reachable, and if Jev is unavailable the flow falls back to it without losing anything typed.
7. **Native look.** Same tokens as the rest of HomeHub. Jev is an ink avatar (like the Home Manager avatars) with the sparkle icon; AI surfaces use the blue-tint "recommended" surface. Motion is subtle and switches off for people who ask for less.

## Flow

```
Request type -> Fast Fix
 1 Tell Jev -------- "Pick from the list instead" ----------.
   |  type a few things / tap an example                    |
   v                                                        v
   thinking -> Jev's picks (highlights, quick questions, unmatched) <-- browse all 25 jobs
   |  remove / edit details (optional) / add more / edit sentence
   |  too many jobs: Jev explains, button becomes "Send to our team"
   v
 2 Quick check  (Mark's 3 questions; Jev points at the ones the words touched)
   v
 3 Pick a time  (Jev explains the recommended length; member can change it)
   v
 Booked        (or: Sent to our team, from any no-go)
```

## States

| State | What the member sees |
|---|---|
| Ask | Jev header with an "AI helper" tag, a short greeting, the input, example chips, "Sort it out" (the one yellow button), "Pick from the list instead", one-line AI disclosure |
| Thinking | Their sentence, three typing dots, two skeleton cards. Announced to screen readers |
| Picks | "You said" with highlights and an Edit link, Jev's summary, quick questions, pick cards, "Anything else?" input, "Browse all 25 jobs", Continue |
| Quick question | "Is the toilet running, or clogged?" with Running / Clogged / Both / Skip |
| Unmatched | "I couldn't match 'the stairs squeak' to a job on our list. Add it as Something else?" |
| Heads-up | "You mentioned 'second-story'. I'll ask about reach in the next step." |
| Too many jobs | Jev note, button becomes "Send to our team" |
| Nothing matched | Jev says so and offers Something else or the list |
| Jev unavailable | "Jev isn't available right now. You can still pick your jobs from the list." The list opens, nothing is lost |
| Quick check | Jev message, plus a "From your message" line under any question the words touched |
| Pick a time | "Recommended by Jev", "Jev picked this for your 3 jobs", with Change |

## What Jev does and does not do

- **Does:** map to the 25-job allowlist, quote the phrase behind each pick, ask one-tap questions, notice risk signals, explain the recommended length.
- **Does not:** invent jobs outside the list, answer or skip the vetting questions, quote prices beyond the posted rate, promise outcomes, route or submit without showing the member first.

## Voice

Plain, warm, short, no exclamation marks. Examples: "I found 3 jobs in that. Check them over and change anything that is off." / "I couldn't place part of what you wrote." / "You mentioned 'rewire'. Work like that can need a licensed trade, so I'll ask about it next."

## Notes for engineering

- **The prototype's parser is a rule-based stand-in.** Everything after the parse step is real UI logic. In production, replace `jevParse` with a model call that returns structured output only.
  - Input: the member's text plus the allowlist (ids, titles, synonyms).
  - Output: `picks[{id, quote}]`, `questions[{text, options[ids]}]`, `unmatched[{quote}]`, `signals{ladder, trade, part}`.
  - Validate every id against the allowlist server-side and drop anything unknown. Cap input length (600 characters here).
  - Prefer a question over a low-confidence pick.
- **Latency and failure:** skeleton while waiting; a timeout of a few seconds falls back to the list (the "Jev unavailable" state).
- **Signals are hints, not routing.** They only add the "From your message" line. Routing still comes from the member's own answers.
- **Suggested metrics:** share using Jev vs the list; picks removed or edited (an accuracy proxy); questions answered vs skipped; unmatched converted to Something else; no-go rate vs the list version; time to booking; completion rate.
- **Evaluation:** collect real member phrasing and score pick accuracy before launch.

## Open questions

1. **What is Jev?** No page in Confluence or Jira mentions it, so Jev is treated as the AI helper's name and the avatar is a placeholder. Confirm name, avatar and tone.
2. **Data and privacy.** What the member's text is sent to, how long it is kept, and whether it may be logged.
3. **Jev as the front door.** The prototype starts at Fast Fix step 1. Jev could also sit on the request-type page and route between Fast Fix, Service request and Account. A natural next step.
4. **Details optional only in this version.** The original version still requires a box per pick. Decide whether to align them.
5. **Everything in `FLOW-SPEC.md` still applies** (price, 3-hour visits, eligibility, auto-submitted request routing).

## Try these in the prototype

- `The toilet keeps running, my front door lock sticks, and I need a TV mounted` (three clean picks)
- `...Also the stairs squeak and the faucet is a problem` (a question and an unmatched phrase)
- `Replace a light fixture in the second-story hallway and rewire a new outlet, I need to buy the fixture` (risk heads-ups carried to the quick check)
- A long list of five jobs (Jev explains it is more than a Fast Fix)
- Prototype states button: "Jev is unavailable", and "Jump to screen" > "Jev's picks"

## QA

105 scripted checks across both frames: every state above, optional details never blocking, member text never rendered as HTML, the fallback, flags not auto-answering the vetting questions, and axe-core (WCAG 2.1 A/AA) clean on ask, thinking, picks with details open, picks plus browse, quick check with flags, and pick a time. Reflows at 320px; mobile targets at least 44px.
