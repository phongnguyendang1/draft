# HomeHub onboarding prototype

A clickable, front-end-only prototype of the HomeHub onboarding flow:

Introduction → Home Enrollment → Preventive Maintenance → Confirmation → You're All Set.

It matches the flow Alex built ([HomeHub Onboarding Flow](https://prefixinc.atlassian.net/wiki/spaces/PDS/pages/3313991682/HomeHub+Onboarding+Flow)), plus Mark's proposed copy. That copy sets expectations that the first Preventive Maintenance may be a while out. The change is copy only: no new logic, screens, or data. The scheduling API and calendar behave as they do today.

The changes:

1. **Intro:** Mark's new Preventive Maintenance line (deck, slide 2).
2. **Preventive Maintenance details:** a "How checkups are scheduled" section above "Why it matters" (deck, slide 6).
3. **You're All Set:** a "Create a Service Request" button. This is the only service request button in the flow, and it appears after both visits are booked.

Open `index.html` in a browser. It is a single self-contained file. It needs no build step, but it loads the DM Sans font from Google Fonts.

The dark bar at the top is prototype chrome, not product UI:

- **Copy:** switches between *As built* and *Proposed*.
- **First PM slot:** switches the fake availability between *Next week* and *~4 months out*. This is the same data the scheduling API would return; the flow itself does not change.
- **Change notes:** shows numbered markers for the three changes, plus a side panel listing what was removed since the last version and the open questions.
- **Controls:** switch between Desktop and Mobile preview, jump to any screen, or restart.

All dates, names and availability are sample data. "Today" is fixed at Tue, Oct 27, 2026.

The FAQ questions match the build. Only one answer ("What happens after the visit?") is visible in the build screenshots. The others show a labelled placeholder, because the approved answers are in the FAQ copy doc (PFX-382).

The "Select a home" screen from Figma is not included. Per the Confluence page, the build runs the modal once per home.
