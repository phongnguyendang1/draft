# HM Portal: Fast Fix tasks

Prototype: `hm-portal-fast-fix.html` (responsive; checked at 1280, 390 and 320). Source: `src-hm/portal.html`, built with `python3 build_hm.py`.

## How this was made, and what is not verified

- **Staging was not reachable.** `hm-staging.prefixinc.com` is blocked by this environment's network policy, so the portal was never opened. There is also no "Claude browser" tool in this environment.
- The layout and colors come from the one screenshot (job `2-2-185153` view) plus the Slack note. Colors were sampled from the screenshot; **the font and exact spacing are approximations** (a Source Sans style stack that falls back to system fonts). The link blue is slightly darker than the screenshot so it passes contrast.
- All member data is fictional. "Existing portal" controls (edit pencils, Send HomeHub Login Email, Create a Recommendation, Add File(s), member link) are shown for fidelity and only show a toast.
- Taxonomy, incomplete reasons, labor charge and the status wording are demo values. Replace them with the real ones.

## The rule

A Fast Fix booking opens with one card per member task. Each is a **Fast Fix task**: it carries only the symptom, its group and the member's comment. The HM must replace every one with a real taxonomy task before the summary can be sent.

## What changed on the screen

| Area | Change |
|---|---|
| `job_requested` (left, red box in the note) | Compiled by the system, one line per task: `- Task1: Toilet rocks or leaks at the base (Plumbing): <member's comment>`. Never changes when tasks are replaced or deleted, so the member's original request is always visible. |
| Task card, before replace | Title `Symptom (Group)` with a **Fast Fix** tag, the member's note, and a **Replace task** button. No Sub-tasks, minutes, parts or notes yet. |
| 3-dots menu (green box in the note) | **Replace** (new, first) and **Delete**. Same menu on every task. |
| Replace dialog | Search by action, item or category. For a Fast Fix task the top 3 matches for the symptom are shown first under "Suggested for this request", then all tasks. The button stays disabled until one is picked. |
| Task card, after replace | Becomes a normal taxonomy task, titled like `Reset (Toilet)`: description, Completed, incomplete reason, Notes for Ops Support (Private), Add File(s), Minutes spent, Parts Cost. |
| Add Task | Opens the same dialog (no suggestions) and appends a normal task. |
| Delete | Asks first. For a Fast Fix task it says the original request stays in Job requested. |
| Time and charges table | Time Spent and Parts Charge roll up from the tasks. Labor Charge is a fixed $55.00 in the prototype. |
| Send Now | Disabled-looking (still focusable). Clicking it while blocked outlines the unfinished cards and moves focus to the first one. |

## Send rules (status line under the buttons)

1. No tasks: "Add at least one task before you can send your summary."
2. Any Fast Fix task left: "Replace all N Fast Fix tasks with a task from the list before you can send your summary."
3. Any real task not updated: "All tasks need to be updated before you can send your summary." (existing wording)
4. Otherwise Send Now is enabled.

A task is **updated** when Completed is checked, or when an incomplete reason is chosen. Ticking Completed disables and clears the reason. Send Later is always available.

## Decisions to confirm

1. **"Member asked for: ..." line on a replaced card.** The prototype keeps a small line with the original symptom under the new task's description. It is useful to the HM and to Ops, but it needs the original symptom stored on the task. If the replace API overwrites it (JC's note), delete that line; `job_requested` still holds the same information.
2. **Replace on a task that already has data.** Replacing a real task keeps its notes, minutes and parts. Alternative: clear them.
3. **Replace on a regular (non Fast Fix) task.** The menu shows Replace for every task. If it should only appear on Fast Fix tasks, hide it elsewhere.
4. **Line format.** `Task1` (no space) and the leading hyphen follow the Slack note literally.
5. **Suggestions** are a keyword stand-in. Production can rank by the symptom's mapped taxonomy tasks instead (a fixed symptom-to-task map is the simplest and most predictable).

## Try these

- Prototype states: New Fast Fix booking, One task replaced, Ready to send, Regular booking (looks like the screenshot, no Fast Fix UI).
- Click Send Now while blocked. Replace a task with the 3-dots menu. Search `faucet`, `mount`, `toilet`. Delete one. Add Task.
