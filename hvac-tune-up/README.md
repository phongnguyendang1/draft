# HVAC tune-up booking prototype

A clickable HTML prototype of the HVAC tune-up flow in HomeHub. It has no backend. Open `index.html` in a browser; it needs no network.

## Flow

Every entry point (the HubSpot emails and the portal promotion) opens `member.prefixinc.com/tune-ups`.

1. **Choose a home.** Only shown to members with more than one home. The cards show the address and the number of HVAC systems, with no booking status (Nov 3 call).
2. **Choose a tune-up.** Standard ($29 per system) or Comprehensive ($79 per system), one type for every system at the home. The estimated total sits next to Continue. The off-season prices and savings text are hard-coded.
3. **Schedule.** This uses the enrollment flow's "Schedule Appointment" components (Figma HomeHub-WCAG, nodes 1516:118665, 1712:145556 and 1516:118811):
   - an info box with the service, systems, technician, address, duration and estimated total
   - "1. Select the date", with the legend for today, available, selected and scheduled days, then "View Times"
   - "2. What time works best?", with a date card and a list of time chips, then "Schedule Appointment"
4. **Booked.** Shows the visit card, plus a button to book another home.

## What the data is based on

- **Systems per home:** `Subscription.plan.allowed_hvac_count`. One tune-up task per system, all of the same type (PFX-590, PFX-593).
- **Prices:** off-season $29 and $79 per task; $125 and $250 are the regular prices. The final bill comes from the Housecall Pro invoice (PFX-596).
- **Duration:** 60 min Standard or 120 min Comprehensive, per system.
- **Times:** start times free in both PreFix and Housecall Pro (PFX-594).
- **Technician:** the territory's HVAC tune-up specialist assigned to the booking (PFX-593).
- **HVAC Plan status:** `PFUser.hvac_subscriber`.

Addresses, names, dates and availability are sample data.

## Open

The in-season state (when off-season tune-ups aren't available) still needs its copy and behavior defined.

## Prototype states

Use the **Prototype states** button (bottom right) to:

- Switch the member: one or three homes, on or off the HVAC Plan.
- Set calendar cases: no open dates, or the chosen time gets taken.
- Preview the 390px phone frame.
- Show build notes.
- Jump to any screen.
