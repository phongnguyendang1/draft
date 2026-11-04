# HVAC tune-up booking prototype

A clickable HTML prototype of the HVAC tune-up flow in HomeHub. It has no backend. Open `index.html` in a browser; it needs no network.

## Flow

Every entry point (the HubSpot emails and the portal promotion) opens `member.prefixinc.com/tune-ups`.

1. **Choose a home.** Only shown to members with more than one home. The cards show the address and the number of HVAC systems, with no booking status.
2. **Choose a tune-up.** Standard or Comprehensive, one type for every system at the home. The estimated total sits next to Continue.
3. **Schedule.** Uses the enrollment flow's "Schedule Appointment" components (Figma HomeHub-WCAG): "1. Select the date", then "2. What time works best?".
4. **Booked.** Shows the visit card, plus a button to book another home.

## Edge cases

Each one can be set from the **Prototype states** panel. Changing a member, season or home state replays the `/tune-ups` link.

| Scenario | What happens |
|---|---|
| Signed out | The HomeHub sign-in, then back into the flow |
| Membership not active | Stop: "Your membership isn't active", with phone numbers |
| Off-season | Off-season prices with savings badges |
| Off-season ends soon | A notice on the first step; the calendar stops at the last off-season date |
| Old link, in season: **proposal A** | "Off-season pricing has ended"; book at regular prices ($125 / $250) |
| Old link, in season: **proposal B** | Stop: "Off-season tune-ups have ended"; the dashboard promotion is hidden |
| Home already booked this season | Stop after the home is chosen; shows the booked visit, Manage in Appointments |
| Home already done this season | Stop after the home is chosen; shows the last tune-up date |
| Home has no HVAC system on file | The card says so; stop with phone numbers |
| Tune-up started, no time picked | Resumes at scheduling and reuses the existing booking |
| No open dates | Message with phone numbers; View Times stays disabled |
| Calendar won't load | Error with Try again and phone numbers |
| Chosen time gets taken | Error on the time list; the time is removed |
| Booking fails | Error; nothing booked; retry works |
| Off-season ends mid-booking | Stop: "Off-season tune-ups ended before you finished" |

## Still to decide

- **Old links clicked in season:** proposal A or B.
- **"One tune-up per season":** what counts as a season, and how to look up a home's tune-up bookings. The screens for this are ready.

## What the data is based on

- **Systems per home:** `Subscription.plan.allowed_hvac_count`. One tune-up task per system (PFX-590, PFX-593).
- **Prices:** off-season $29 and $79 per task; regular $125 and $250 (PFX-593). The final bill comes from the Housecall Pro invoice (PFX-596).
- **Duration:** 60 min Standard or 120 min Comprehensive, per system.
- **Times:** free in both PreFix and Housecall Pro; a taken slot or a Housecall Pro failure is refused with a plain error (PFX-594, PFX-595).
- **Season dates:** the off-season service type's bookable date range (Integrated Calendar A21).
- **HVAC Plan status:** `PFUser.hvac_subscriber`.

Addresses, names, dates and availability are sample data.
