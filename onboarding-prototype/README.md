# HomeHub onboarding prototype

A clickable, front-end-only prototype of the HomeHub member onboarding flow (Introduction → Home Enrollment → Preventive Maintenance → Confirmation). It is based on the "Onboarding popup" section of the HomeHub-WCAG Figma file.

This version is updated for the scheduling discussion about pushing out a new member's **first Preventive Maintenance** when demand in their territory is over capacity.

Open `index.html` in a browser. It is a single self-contained file. It needs no build step, but it loads the DM Sans font from Google Fonts.

The dark bar at the top is prototype chrome, not product UI:

- **Scenario:** *First-PM window* shows the new flow. *Normal availability* shows today's flow.
- **Change notes:** numbered markers on the screens, plus a side panel listing each change with its transcript timestamp, open questions, and what was left out.
- **Controls:** switch between 1 and 2 homes, switch between Desktop and Mobile preview, jump to any screen, or restart.

All dates, times and availability are fake. "Today" is fixed at Mon, Oct 26, 2026, and the first checkup window is Jan 4 – Feb 26, 2027.
