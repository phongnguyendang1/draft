# HomeHub dashboard prototypes

HTML/CSS prototypes for the Member Portal (HomeHub) dashboard redesign. Each option has one desktop screen (1280 wide) and one mobile screen (390 wide). Open `index.html`, or open any `desktop.html` / `mobile.html` directly. Every page is a single self-contained file (font, icons, CSS and JS inlined), so it can be shared or opened offline.

| Option | Desktop | Mobile |
| --- | --- | --- |
| 1 · Action Center | [desktop.html](option-1-action-center/desktop.html) | [mobile.html](option-1-action-center/mobile.html) |
| 2 · Membership at Work | [desktop.html](option-2-membership-at-work/desktop.html) | [mobile.html](option-2-membership-at-work/mobile.html) |
| 3 · Home Health | [desktop.html](option-3-home-health/desktop.html) | [mobile.html](option-3-home-health/mobile.html) |
| 4 · Timeline | [desktop.html](option-4-timeline/desktop.html) | [mobile.html](option-4-timeline/mobile.html) |
| 5 · Adaptive Stack | [desktop.html](option-5-adaptive-stack/desktop.html) | [mobile.html](option-5-adaptive-stack/mobile.html) |

Links to other pages are inert. Interactions on the page work: the home filter (All homes or one home), the account and mobile menus, expand/collapse panels, sending, declining (with a reason) or undoing recommendations, copying the referral code, the top message (welcome, then the seasonal message), the docking Request service button in Option 1, and swiping the mobile carousel in Option 2.

Round 4 (Oct 9) applies the team review to Option 1 (Home Health Snapshot module, service visits titled by type, visit durations, no chat or close buttons). Round 3 (Oct 5) rebuilds Option 1 as compact cards with Request service leading the page; see the round 3 section of [`feedback-round-2.md`](feedback-round-2.md). Round 2 (Sep 29) applies stakeholder feedback to every option: a five-item nav, the address or "Your homes" as the page title, one top message, no recent visits, compact recommendations with the Home Health Report summary, one-line team members inside savings, and date-only upcoming visits. See [`feedback-round-2.md`](feedback-round-2.md).

## Prototype states

The dark **Prototype states** button in the bottom-right corner is not part of the design. It turns conditional elements on and off:

- Payment issue banner
- Top message (the welcome message; dismissing it shows the seasonal message)
- Nothing to schedule (the empty state for visits to schedule)
- Member has 2 homes ("Your homes" with the All homes filter, or a single address)

In Option 5 the panel also has a **Member stage** picker (Active member, Getting started, Payment issue, Prepaid year ending). Picking a stage reorders the cards and swaps the lead card, which is the point of that option.

## Design language

Tokens come from the two reference frames in Figma (`Prefix – Phong`, Plans page, nodes `12:10199` and `12:7872`): DM Sans at optical size 14 with −2% tracking, Regular and SemiBold only; navy ink `#0a2041`; brand blue `#4498e5`; yellow `#f7cf46` for the primary action; red `#e0310a` for problems; 1px `#ccd7dc` borders; 24px card radius; 44px pill buttons; no shadows.

Two reference colors fail WCAG 2.1 AA as text, so text uses the closest passing value. Both are single variables in `src/shared/tokens.css`:

| Use | Reference | Used for text | Contrast on white |
| --- | --- | --- | --- |
| Secondary text | `#888888` (3.5:1) | `--text-2: #6b6b6b` | 5.3:1 |
| Blue text, white text on blue | `#4498e5` (3.1:1) | `--blue-text: #1f6fc0` | 5.1:1 |

`#4498e5` is still used for borders, icons, progress and other non-text elements.

## Editing

Source lives in `src/`:

- `src/shared/tokens.css`: design tokens
- `src/shared/components.css`: buttons, cards, badges, feature rows, menus
- `src/shared/modules.css`: page chrome and dashboard modules shared by every option
- `src/shared/prototype.js`: in-page interactions
- `src/shared/icons/`: Remix Icon SVGs (Apache 2.0) used by the templates
- `src/shared/fonts/`: DM Sans variable font (SIL OFL)
- `src/shared/photos/`: photos for the Option 1 promo cards (`hvac-tune-up`, `sibi-appliances`; .jpg, .webp or .png, at least 760 × 380). A missing photo builds as a tinted placeholder.
- `src/shared/partials/`: markup shared by every option (header, page title, top message, ready to schedule, recommendations, Home Health Report, visits, savings, team, plan, footer), pulled in with `<!-- @include name -->`
- `src/<option>/dashboard.html` and `layout.css`: one template per option; the desktop and mobile screens share the markup, and the layout switches on the frame width with container queries

After editing, rebuild the pages:

```bash
python3 prototypes/build.py                          # every option
python3 prototypes/build.py option-1-action-center   # one option
```

To use a new icon, copy its SVG from the [Remix Icon](https://remixicon.com) set into `src/shared/icons/` and reference it as `<svg class="i"><use href="#ri-name"/></svg>`.
