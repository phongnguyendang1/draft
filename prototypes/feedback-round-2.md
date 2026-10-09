# Round 2: feedback decisions (Sep 29)

Sources: Phong's notes, the call with Mark (Sep 28) and the call with James (Sep 29).

## Applied to every option

| Change | Source |
| --- | --- |
| Nav is Dashboard, Appointments, Recommendations, Appliances, Timeline. Membership and billing, help and sign-out move to the account menu. | Phong |
| Recent visits removed. Past visits live in Appointments and Timeline. | Phong, Mark |
| Page title is the home's address. With two or more homes it reads "Your homes", shows everything together by default, and a filter narrows to one home. Items carry a short home tag. | Mark |
| "Good morning" greeting removed. One top message slot instead: the welcome first, then the seasonal message. | Mark |
| Seasonal and promotion cards removed from the dashboard; seasonal content uses the message slot. The Sibi offer belongs on the Appliances page. Exception: Option 1 brings back the Specialty HVAC and Sibi offers as photo promo cards in the right column (Phong, Sep 30). | Mark, James, Phong |
| Recommendations: the critical one in full, the rest as one-line rows with Send and Decline. No photos. The time estimate stays. | Mark |
| Critical recommendations can't be declined, so they only offer Send. | Mark |
| Recommendations copy no longer ties them to one visit ("found on recent visits", with a found date per item). | Mark |
| Home Health Report summary (counts and bar) sits with Recommendations and opens the full report. | Phong, James |
| Upcoming visits show only date, work and time. Details and changes are in Appointments. | Mark |
| Your PreFix team is two small avatars with one line each, inside Your savings. | Phong, Mark |
| Referral code added next to credits, with Copy. | Mark |
| Plan details (what's included, year in review) move to Membership and billing. The dashboard keeps the plan line and services used. | James |

## Per option

- **Option 1 (round 2; see round 3 below):** left column is Ready to schedule, Recommendations with the Home Health Report, then PreFix Protect with services used and not used shown in full. The narrower right column holds Your savings (credits, referral, team), Upcoming visits, then two promo cards with photos: Specialty HVAC and the Sibi appliance offer. Each promo can be hidden with its close button.
- **Option 2:** Needs your attention, a one-row Coming up (moved near the top), the plan card with savings, credits and team beside what the membership covered (by service, not by visit) and services used, then Recommendations.
- **Option 3:** Ready to schedule, a Home health card (report summary and preventive maintenance), compact system tiles with one recommendation each, then visits and savings.
- **Option 4:** Needs you, then Coming up down to a Today marker. The past is on the Timeline page.
- **Option 5:** five cards plus a stage lead card, reordered by member stage.

## Round 3: Option 1 (Oct 5)

Leadership found the dashboard too busy. Option 1 is rebuilt as compact cards; Options 2 to 5 are unchanged.

- **Request service is the page's main action.** A large yellow button sits beside the page title and opens the request flow (which home, what's wrong, photos, times); it does not try to take the request inline. It is the only yellow button on the page (Schedule and Send are outlined). When it scrolls away, it docks: in the sticky top bar on desktop, in a bottom bar on mobile.
- **Your PreFix team is its own card**, with the role first ("Home Manager", "Maintenance technician"), the name second, a PreFix badge on each avatar and a Message button. It no longer sits inside savings, where the names read like people on the account.
- **Same columns as round 2, with items as small cards.** The wide left column (Ready to schedule, Recommendations, PreFix Protect) and the 380px right rail (Saved this year, Upcoming visits, Your PreFix team, the two offers) stay where they were. In Ready to schedule and Recommendations, items sit in a 2-column grid of small cards with one action each, and the whole card opens the detail page. Descriptions, durations of visits, booking notes and plan prices are gone from the dashboard and stay on their own pages.
- **Upcoming visits show the visit type** as a small badge above the title: Service visit, Preventive maintenance, Specialty visit or Enrollment visit.
- **Each recommendation card shows** severity, who does the work (Home Manager, Specialty HVAC) and which home on one line, the visit it came from ("From Preventive maintenance, Apr 14") on the next, plus, for critical items only, one line on the risk of leaving it. No time estimate. Send is the only action; Decline (with a reason) moves to the Recommendations page.
- **The Home Health Report** stays at the top of Recommendations, one line per home: the counts and the bar.
- **PreFix Protect** shows services as pills: filled for used, outlined for not used yet (these link to booking).

## Round 4: Option 1, team review (Oct 9)

Source: the design review in sprint planning with Mark, JC (Juan Carlos), Velislav and Alex. Only changes the meeting clearly settled are applied.

| Change | Source |
| --- | --- |
| The Home Health Report moves out of Recommendations into its own module at the top of the left column, so its counts aren't read as recommendation counts. | JC, Mark, Phong |
| It is called the Home Health Snapshot (the PM snapshot). "Home Health Report" is the existing service-history page. | Mark, JC |
| Each home shows the visit and date the snapshot came from ("Preventive maintenance, Apr 14 · 30 checks"), so the counts read as results of that visit's checks. | Mark, Alex |
| Ready to schedule: service visits are titled "Service visit", with their tasks below, comma-separated and cut off with "…". | JC, Phong |
| Ready to schedule: each card shows how long the visit takes. | Mark |
| Ready to schedule: a "Schedule all" button at the top. | Mark, Phong |
| Ready to schedule shows at most 4 cards; "See all" in the header opens the rest in Appointments (no load-more button). | Alex, Phong |
| Item cards show a "Details" cue, so it's clear they open. Applied to recommendation cards too (same card). | Velislav |
| Upcoming visits are titled by visit type ("Service visit", "Specialty visit", "Preventive maintenance"), with the tasks below. | JC, Phong |
| Saved this year compares with "market rates", not "Austin market rates": homes can be in different markets, and the number sums all homes. | JC, Phong |
| Your PreFix team: no message buttons. Members can't message a Home Manager directly. | Velislav, Mark, Phong |
| Promotions have no close (X) button. Promotions can't be closed; they always show. | Velislav, Phong |

Not changed, or still open:

- **Top message.** Phong hid it while presenting. Alex wants a reserved, full-width place for banners (welcome, card expiring, payment) so closing one doesn't shift only one column; the slot is already full width and shows one message at a time. A fuller "message center" is still to design.
- **Credits and referral code.** Shown once for all homes. Today each subscription has its own code and credits; the team leans toward moving both to the user level (Mark, Velislav, JC), which is a backend decision.
- **The savings number.** Mark wants to rethink it; not changed yet.
- **Promotions format.** The promotions backend doesn't support an hourly rate, a credit or styled text yet, and promotions can only link to a URL (Velislav, JC). JC: promotions should be text and links, not an image, for WCAG; the prototype already is.
- **PreFix Protect.** Unchanged. Mark liked an earlier presentation; it isn't clear which. A service pill should open Request service with that service filled in (Mark), which needs the request flow.
- **Multiple homes.** How each module presents several homes still needs work (Mark, JC).
- **PFR-101.** Members will get a primary or secondary Home Manager, whoever is available; the team card is fine for now (Velislav).
- **One-sentence role of the dashboard.** Homework for everyone (Mark).

## Not applied

- **A blocking pop-up for critical recommendations before the dashboard.** Critical items can't be declined, so the pop-up would trap members; it also stacks with the onboarding modal and works against "land and go". Critical items lead Recommendations instead.
- **Timeline under Account.** The nav now has its own Timeline item, per Phong.
- **Moving services used off the dashboard.** Mark suggested dropping it; Phong asked to keep it expanded, and James liked "4 of 10 services used".

## Open

- A one-sentence North Star for HomeHub (Mark and Phong both drafting). A starting point: "HomeHub lets members see what their home needs, take care of it quickly, and get back to their day."
- Whether members schedule from the dashboard or from the email link (check in Metabase).
- Whether a savings number is shown before the maths is validated.
