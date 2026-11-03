# HVAC tune-up booking prototype

A clickable HTML prototype of the redesigned HVAC tune-up flow in HomeHub. It has no backend. Open `index.html` in a browser; it needs no network, because the DM Sans font and Remix icons are embedded.

The visual language comes from the HomeHub Fast Fix request-flow prototype: the same tokens, cards, option tiles, stepper, summary rail and prototype-states panel.

## Flow

Every entry point opens one URL, `member.prefixinc.com/tune-ups`: the HubSpot email, a Campaign Monitor email and the portal promotion.

1. **Sign in**, if needed. The member comes back to the tune-up flow afterwards.
2. **Choose a home.** Each home is a card with a status: ready, booked, ready to schedule (started but no time yet) or not due (tune-up in the last 6 months). This step is skipped for members with one home.
3. **Tune-up and systems.** Choose Standard ($29, retail $125) or Comprehensive ($79, retail $250), priced per HVAC system. The systems on file are listed, and the member can choose a tune-up per system or correct the system count. Systems over 5 years old show Comprehensive as suggested.
4. **Pick a time.** A Monday to Friday week strip, then a morning (8:00–11:30am) or afternoon (12:00–5:30pm) arrival window.
5. **Review and confirm.** Billed to the card on file after the visit. For members not on the HVAC Plan, confirming also starts the complimentary plan.
6. **Booked.** Shows a visit card, and offers "Schedule another home" when another home is ready.

Other screens: already booked (reschedule or cancel), not due yet, no open times (send a scheduling request), and the email's "Not Interested" page.

## Prototype states

Use the **Prototype states** button (bottom right) to:

- Switch the member: signed in, one or three homes, on or off the HVAC Plan.
- Turn on an unfinished booking, a recent tune-up, no open times, or a chosen window getting taken.
- Preview the 390px phone frame.
- Show build notes: dashed yellow notes for the dev team.
- Jump to any screen.

All data is sample data.
