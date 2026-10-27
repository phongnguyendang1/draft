# HomeHub onboarding prototype

A clickable, front-end-only prototype of the HomeHub onboarding flow:

Introduction → Home Enrollment → Preventive Maintenance → Confirmation → You're All Set.

It matches the flow Alex built ([HomeHub Onboarding Flow](https://prefixinc.atlassian.net/wiki/spaces/PDS/pages/3313991682/HomeHub+Onboarding+Flow)), with proposed changes that set expectations that the first Preventive Maintenance may be a while out. There's no new logic, screen, or data: the scheduling API behaves as it does today.

The changes are mostly copy, plus one button at the very end and one calendar card. They fall into two groups.

**Mark's proposed copy** (orange markers, from his deck):

1. **Intro:** Mark's new Preventive Maintenance line (slide 2).
2. **Preventive Maintenance details:** a "How checkups are scheduled" section above "Why it matters" (slide 6).
3. **You're All Set:** a "Create a Service Request" button. This is the only service request button in the flow, and it appears after both visits are booked.

**Proposed additions** (purple markers), for Mark to accept or cut. Changes 4–6 come from the call transcript:

4. **Preventive Maintenance details:** one more sentence saying the first open time may be a few months out, why, and that members still get both checkups.
5. **FAQ "Why can't I book it for this week?":** a proposed answer. The question is already in the build; this answer would replace or merge with the one in the FAQ doc.
6. **You're All Set:** one line above the button: "Need something done before your checkup? You don't have to wait. Request service anytime."
7. **Calendar:** a Calendly-style card when the month on screen has no open times: "No times available in October", "Next available: Tuesday, November 3, 2026", and a "Jump to next available date" button. Members no longer click Next past empty months. Open question for Alex: does the scheduling API return slots across months in one call, or one month at a time?

Open `index.html` in a browser. It is a single self-contained file. It needs no build step, but it loads the DM Sans font from Google Fonts.

The dark bar at the top is prototype chrome, not product UI:

- **Copy:** switches between *As built* and *Proposed*.
- **First PM slot:** switches the fake availability between *Next week* and *~4 months out*. This is the same data the scheduling API would return; the flow itself does not change. With ~4 months out, change 7's card shows on the empty months.
- **Change notes:** shows numbered markers for the seven changes, plus a side panel with each change's source (deck slide or transcript timestamp), what was removed since the last version, and the open questions.
- **Controls:** switch between Desktop and Mobile preview, jump to any screen, or restart.

All dates, names and availability are sample data. "Today" is fixed at Tue, Oct 27, 2026.

The FAQ questions match the build. Only one answer ("What happens after the visit?") is visible in the build screenshots. The others show a labelled placeholder, because the approved answers are in the FAQ copy doc (PFX-382). With Proposed copy, "Why can't I book it for this week?" shows the answer from change 5.

The "Select a home" screen from Figma is not included. Per the Confluence page, the build runs the modal once per home.
