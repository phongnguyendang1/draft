# HomeHub dashboard prototypes

HTML/CSS prototypes for the Member Portal (HomeHub) dashboard redesign. Each option has one desktop screen (1280 wide) and one mobile screen (390 wide). Open `index.html`, or open any `desktop.html` / `mobile.html` directly. Every page is a single self-contained file (font, icons, CSS and JS inlined), so it can be shared or opened offline.

| Option | Desktop | Mobile |
| --- | --- | --- |
| 1 · Action Center | [desktop.html](option-1-action-center/desktop.html) | [mobile.html](option-1-action-center/mobile.html) |
| 2 · Membership at Work | [desktop.html](option-2-membership-at-work/desktop.html) | [mobile.html](option-2-membership-at-work/mobile.html) |

Links to other pages are inert. Interactions on the page work: expand/collapse panels, the home switcher, the account and mobile menus, sending, declining (with a reason) or undoing recommendations, and swiping the mobile carousel in Option 2.

## Prototype states

The dark **Prototype states** button in the bottom-right corner is not part of the design. It turns conditional elements on and off:

- Payment issue banner
- Welcome card
- Nothing to schedule (the action center's empty state)
- Member has 2 homes (home switcher and the other-home nudge)

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
- `src/shared/partials/`: markup shared by every option (header, welcome, recommendations, visits, team, promotion, footer), pulled in with `<!-- @include name -->`
- `src/<option>/dashboard.html` and `layout.css`: one template per option; the desktop and mobile screens share the markup, and the layout switches on the frame width with container queries

After editing, rebuild the pages:

```bash
python3 prototypes/build.py
```

To use a new icon, copy its SVG from the [Remix Icon](https://remixicon.com) set into `src/shared/icons/` and reference it as `<svg class="i"><use href="#ri-name"/></svg>`.
