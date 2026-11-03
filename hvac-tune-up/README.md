# HVAC tune-up booking prototype

A clickable HTML prototype of the HVAC tune-up flow in HomeHub. It has no backend. Open `index.html` in a browser; it needs no network.

It uses the visual language of the HomeHub Fast Fix request-flow prototype.

## Flow

Every entry point (the HubSpot emails and the portal promotion) opens `member.prefixinc.com/tune-ups`.

1. **Choose a home.** This step only appears for members with more than one home. Each card shows the home's number of HVAC systems. A home with a booked tune-up is shown but can't be selected.
2. **Choose a tune-up.** Standard ($29 per system) or Comprehensive ($79 per system). The estimated total is the price × the home's systems.
3. **Pick a time.** The existing member calendar: a date, then a start time. It shows the visit length; "Confirm booking" books it.
4. **Booked.** Shows the visit card, plus a button to book another home when one is ready.

## What the data is based on

- **Systems per home:** `Subscription.plan.allowed_hvac_count`. Each booking gets one tune-up task per system, all of the same type (PFX-590, PFX-593).
- **Prices:** the OFFSEASON service types, $29 and $79 per task; $125 and $250 are the regular prices. The final bill comes from the Housecall Pro invoice (PFX-596).
- **Visit length:** 60 min (Standard) or 120 min (Comprehensive) per system (PFX-590).
- **Times:** start times on a 15-minute grid, free in both PreFix and Housecall Pro (PFX-594 and the Integrated Calendar requirements, A23).
- **HVAC Plan status:** `PFUser.hvac_subscriber`, which syncs with HubSpot.
- **Still to define:** the 6-month rule. It came up on the call but isn't in PFX-590.

Addresses, dates and availability in the prototype are sample data.

## Prototype states

Use the **Prototype states** button (bottom right) to:

- Switch the member: one or three homes, on or off the HVAC Plan, a started but unscheduled tune-up, a tune-up in the last 6 months.
- Set calendar cases: no open times, or the chosen time gets taken.
- Preview the 390px phone frame.
- Show build notes.
- Jump to any screen.
