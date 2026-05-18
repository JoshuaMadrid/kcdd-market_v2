# KC DIME — User Testing Scenarios (Maze.com)

These are unmoderated test scripts for Maze.com. Each scenario has a stated **Goal**, **Setup**, **Step-by-step task**, and **Success signals** (pass/fail criteria you can read off Maze recordings + heatmaps).

The site is pre-loaded with real Kansas City nonprofits (Harvesters, Operation Breakthrough, reStart, Connections to Success, Boys & Girls Clubs, Synergy Services, plus Heartland Center & KC Pet Project sitting in the admin approval queue), 5 sample requests, and 3 active campaigns. Images are clearly watermarked "Placeholder photo."

---

## Critical setup notes for every scenario

**Base URL:** the URL you point Maze at (local dev = `http://localhost:3000`, staging = the Vercel preview URL).

**Stripe test mode — fake card for the donation flow:**
- **Card number:** `4242 4242 4242 4242`
- **Expiry:** any future date (e.g. `12 / 30`)
- **CVC:** any 3 digits (e.g. `123`)
- **ZIP:** the ZIP field is hidden on this build; no entry required.

> 💡 No real charges happen. Stripe is in test mode and a `STRIPE_BYPASS_CONNECT` flag is on, so you can complete checkout even though the org hasn't onboarded a real Stripe Connect account.

**For scenarios that need a fresh email:** use a disposable inbox like `https://temp-mail.org/en/` so testers aren't asked for their real email.

**Maze setup tip:** Each scenario below should be a separate **Mission** in Maze. Use the "Open question" + "Path test" + "Multiple choice" steps to ask the success-signal questions after the task.

---

## Scenario 1 — Donor: browse and find a cause that matches you

**Goal:** Confirm donors can land on the homepage, understand what the site is, and reach a campaign or request that resonates.

**Setup:** Start at homepage `/`. Tester is signed out.

**Steps:**
1. Read the hero on the homepage.
2. Click "Browse Requests" (top nav or hero button).
3. Scan the 3 campaigns. Pick the one you'd most likely donate to.
4. Click into it (the campaign card).

**Success signals:**
- ✅ Tester clicks "Browse Requests" within 15 seconds of landing.
- ✅ Tester opens at least one campaign detail page.
- ❌ Tester clicks "About Us" or scrolls past the fold without clicking — indicates the call-to-action isn't obvious enough.
- ❌ Tester closes the tab — indicates copy/visual isn't pulling them in.

**Ask after:** "In your own words, what does KC DIME do?" — checks that the homepage actually communicates the platform's purpose.

---

## Scenario 2 — Donor: complete a $25 test donation with the fake card

**Goal:** Validate the full checkout flow works end-to-end and the success-state UI is clear.

**Setup:** Start at `/requests`. Tester is signed in as a test donor (or in scenarios where guest checkout is supported, signed out).

**Steps:**
1. Click into a campaign — e.g. "Stock the Pantry: 50,000 Meals by August."
2. Find and click the **Donate** / **Give Now** button.
3. Enter the test card: `4242 4242 4242 4242`, expiry `12 / 30`, CVC `123`.
4. Submit the donation.
5. Wait for the success / thank-you screen.

**Success signals:**
- ✅ Tester reaches the success page within 60 seconds of landing on the campaign.
- ✅ Stripe Elements renders without console errors (check Maze recording).
- ✅ Confirmation message clearly states the donation amount + org name.
- ❌ Tester gets stuck on the card form — indicates the test-card hint isn't visible enough.
- ❌ Tester sees an error toast — capture which one.

**Ask after:** "On a scale of 1–5, how confident were you that your donation went through?"

---

## Scenario 3 — Donor: find a campaign by cause (filter)

**Goal:** Validate the cause-area filter works and surfaces relevant content.

**Setup:** Start at `/requests`. Three campaigns are seeded across Education, Children & Families, Poverty & Hunger Relief, Digital Access, and Education & Youth.

**Steps:**
1. Click "Filter by Cause."
2. Pick **Education** (or any cause that matches your interest).
3. Note which campaigns remain.
4. Clear the filter.

**Success signals:**
- ✅ Tester applies and clears the filter without help.
- ✅ Filtered list updates within 1 second visually.
- ❌ Tester opens the filter but doesn't apply anything — copy might be unclear.

**Ask after:** "Did the campaigns shown match the cause you picked?"

---

## Scenario 4 — Donor: deep-dive into an organization profile

**Goal:** Verify org-profile pages surface the right info to build donor trust (mission, verification badge, active requests).

**Setup:** Start at `/requests`. Tester is browsing campaigns.

**Steps:**
1. On the "Stock the Pantry" campaign card, click the **Harvesters — The Community Food Network** org name (orange link above the title).
2. Read the mission statement.
3. Click the **Campaigns** tab (top of org page).
4. Click the **Updates** tab.
5. Click **Visit Website** to confirm the external link opens.

**Success signals:**
- ✅ Tester finds the "Verified Organization" badge.
- ✅ Tester moves between About / Campaigns / Updates / Team tabs.
- ❌ Tester misses the verification badge — copy/placement may need work.

**Ask after:** "What did this org's profile tell you about whether to trust them?"

---

## Scenario 5 — Organization: sign up and onboard a new CBO

**Goal:** Validate that a brand-new nonprofit can sign up as a CBO and complete onboarding without help.

**Setup:** Tester starts signed out. They have a temp-mail address ready.

**Steps:**
1. From homepage, click **For Organizations** in the top nav.
2. Click **Sign up** (or **Get Started**).
3. Enter the temp-mail email + a password.
4. Verify the email (check temp-mail inbox, paste the 6-digit code — for dev/staging, the Clerk test-user shortcut `424242` works).
5. On the role-selection modal, pick **"I represent an organization."**
6. Fill out: org name, mission (2–3 sentences), EIN (any 9-digit number for testing), website, phone.
7. Submit.

**Success signals:**
- ✅ Tester lands on `/cbo/dashboard` after submitting.
- ✅ Tester sees a banner / state indicating "Your account is pending verification."
- ❌ Tester gets stuck on email verification — Clerk modal usability issue.
- ❌ Tester sees a 500 error or null-id error — bug; capture.

**Ask after:** "Were the questions during signup clear? What would you have liked to know upfront?"

---

## Scenario 6 — Organization: create your first donation request

**Goal:** Validate the CBO can post a new technology/funding request and it lands in their dashboard.

**Setup:** Tester is signed in as a CBO from the existing test account `test+clerk_test@example.com` (or the one they just created in Scenario 5). They're at `/cbo/dashboard`.

**Steps:**
1. Click **+ New Request** (or the empty-state CTA in My Requests).
2. Fill out:
   - **Description:** "Replace 12 broken laptops in our after-school computer lab."
   - **Cause area:** Digital Access or Education
   - **Urgency:** Medium
   - **Zipcode:** 64108
   - **Amount:** $3,600
   - **Beneficiaries:** 12
3. Submit.
4. Return to dashboard and confirm the request appears in the list.

**Success signals:**
- ✅ Request appears in dashboard within 5 seconds.
- ✅ Tester submits without missing any required fields.
- ❌ Tester submits and sees an error — capture; likely a missing required field or RLS issue.

**Ask after:** "Was there anything you wished the form asked you about your request?"

---

## Scenario 7 — Organization: edit your profile (cover image, mission, team)

**Goal:** Validate CBO can update their public profile and changes save round-trip.

**Setup:** Tester signed in as a CBO. They're on their org profile.

**Steps:**
1. On `/cbo/profile`, click **Edit Profile**.
2. Change the tagline to something new.
3. Update the mission statement.
4. Save.
5. Reload the page and confirm changes persisted.
6. Go to the **Team** tab and add one team member: name, role, email.
7. Save.

**Success signals:**
- ✅ All edits visible after a hard reload.
- ✅ Team member appears in Team tab.
- ❌ Edits revert on reload — DB write didn't happen.

**Ask after:** "Was the edit interface intuitive? Anything missing?"

---

## Scenario 8 — Admin: approve a pending organization

**Goal:** Validate admin verification flow gates public visibility correctly.

**Setup:** Tester is signed in as **admin** (`hello@joshuamadrid.com`). Two orgs (Heartland Center for Behavioral Change, KC Pet Project) are sitting unvetted in the queue.

**Steps:**
1. Go to `/admin`.
2. Open **Users** (sidebar) or **Organizations**.
3. Filter by **Status: Unverified**.
4. Open one of the pending orgs.
5. Change verification status from **Unverified** → **Verified**.
6. Open `/requests` or that org's public profile in a new tab — confirm it's now visible to the public.

**Success signals:**
- ✅ Status flip persists (reload to confirm).
- ✅ Org appears publicly within ~10 seconds.
- ❌ Status reverts on reload — DB write failed silently.

**Ask after:** "Was it clear which orgs needed your attention?"

---

## Scenario 9 — Donor: review your donation history

**Goal:** Validate the donor dashboard correctly surfaces past donations and tax receipts.

**Setup:** Tester is signed in as a donor who has made at least one donation (e.g. complete Scenario 2 first, or use the seeded `Connections to Success — Interview Wardrobe` fulfilled request as reference data).

**Steps:**
1. Click the avatar (top right) → **Dashboard**.
2. On `/donor/dashboard`, find the **My Donations** entry in the sidebar.
3. Click on a past donation.
4. Click **Download Receipt** (PDF).
5. Open the PDF and confirm it has: donor name, amount, org name, date, EIN, "no goods or services were provided" language.

**Success signals:**
- ✅ Receipt PDF downloads.
- ✅ All IRS-required 501(c)(3) fields present.
- ❌ Receipt missing the "no goods/services" line — compliance bug.

**Ask after:** "If you needed this for tax purposes, is anything missing?"

---

## Scenario 10 — Donor: change your account & notification preferences

**Goal:** Validate Settings page actually persists changes (this surface was broken until recently and is worth retesting with users).

**Setup:** Tester is signed in as a donor on `/donor/dashboard`.

**Steps:**
1. Open **Settings** (sidebar).
2. Change your display name.
3. Toggle off "Email me about new campaigns."
4. Update your service-area zipcode.
5. Save.
6. Reload the page and confirm everything persisted.

**Success signals:**
- ✅ All three changes still present after reload.
- ❌ Any setting reverts — same class of bug we just fixed; capture.

**Ask after:** "Was it clear what each toggle did?"

---

## Scenario 11 — Mobile-only: donate from your phone

**Goal:** Validate the mobile donation flow doesn't have layout or input issues.

**Setup:** Maze recorded on a phone (iPhone 14 / Pixel 7 device frame).

**Steps:**
1. Open `/requests` on your phone.
2. Tap into "Teen Tech Lab Renovation."
3. Tap **Donate**.
4. Enter the test card `4242 4242 4242 4242`, `12/30`, `123`.
5. Submit.

**Success signals:**
- ✅ All buttons hit-targetable with a thumb (44pt minimum).
- ✅ Stripe Elements doesn't overflow off-screen.
- ✅ No horizontal scrolling at any step.
- ❌ Keyboard hides the Submit button — common mobile bug.

**Ask after:** "Did anything about doing this on a phone feel awkward?"

---

## Scenario 12 — Accessibility: complete a donation using only the keyboard

**Goal:** Validate keyboard accessibility for the donation flow (Tab order, focus rings, Enter to submit).

**Setup:** Recruit a tester who uses a keyboard or screen reader, or instruct testers to put their mouse away.

**Steps:**
1. Land on homepage.
2. Tab through to "Browse Requests."
3. Tab into the first campaign card and Enter to open it.
4. Tab to the **Donate** button and press Enter.
5. Tab through the Stripe card field and enter the test card.
6. Tab to Submit and press Enter.

**Success signals:**
- ✅ Visible focus indicator on every interactive element.
- ✅ Stripe Elements receives focus correctly.
- ❌ Any element trap or skipped element — capture.

**Ask after (if testing with screen-reader users):** "Did anything not get announced clearly?"

---

## Scenario 13 — Stress test: search and find a specific org by name

**Goal:** Validate the search bar on `/requests` and any global search surfaces work.

**Setup:** Tester on `/requests`.

**Steps:**
1. In the search bar (top of campaigns list), type **"food"** slowly.
2. Note what shows up.
3. Clear and search **"Boys & Girls."**
4. Clear and search **"xyz123"** (intentional no-match).

**Success signals:**
- ✅ "food" returns Harvesters / Stock the Pantry.
- ✅ "Boys & Girls" returns the Teen Tech Lab campaign.
- ✅ "xyz123" shows a graceful empty state — not a crash.

**Ask after:** "Was the search fast enough? Did it search what you expected (org names? campaign titles? cause areas?)"

---

## Scenario 14 — Donor: share a campaign with a friend

**Goal:** Validate social / share affordances (if present) — and surface whether they're missing.

**Setup:** Tester on any campaign detail page.

**Steps:**
1. Look for a way to share this campaign with a friend.
2. If a share button exists, use it.
3. If not, copy the URL and report how you'd share it.

**Success signals:**
- ✅ Tester finds a built-in share path within 20 seconds.
- ❌ Tester resorts to copying the URL — surface a "Share" feature in product backlog.

**Ask after:** "How would you have wanted to share this with someone?"

---

## Scenario 15 — Re-entry: come back to a campaign you donated to

**Goal:** Validate that returning donors see their relationship to the campaign reflected.

**Setup:** Tester previously donated (Scenario 2). They sign out, then sign back in 30 seconds later.

**Steps:**
1. Sign back in.
2. Navigate to the same campaign you donated to.
3. Look for any indication that says "You've donated $X to this campaign" or shows your name in supporters.

**Success signals:**
- ✅ Donation state reflected somewhere on the page.
- ❌ No indication — surface in product backlog if this is desired behavior.

**Ask after:** "Did the campaign remember you? Would you have liked it to?"

---

## Scoring rubric (use across all scenarios)

For each scenario, Maze will give you a "Mission completion rate" and "Average time on task." Pair those with the success signals above:

| Signal mix | Interpretation |
|---|---|
| Completion > 80% **and** avg time within 25% of your "expert" path | Ship-ready |
| Completion 50–80% | Friction worth fixing before launch |
| Completion < 50% | Hard blocker — re-design before retesting |

Always read the **drop-off heatmap** for every Mission. The page where users bounce is almost always where the bug or unclear copy is.

---

## Maze test card cheat sheet (paste into the Maze intro screen)

> **Use this fake card. No real money is charged.**
>
> **Card:** 4242 4242 4242 4242
> **Expiry:** 12 / 30 (any future date works)
> **CVC:** 123 (any 3 digits)
> **ZIP:** not required on this build

---

## Pre-flight checklist before sending to Maze

- [ ] Site is on a stable URL (Vercel preview deploy, not localhost).
- [ ] Two seeded admin accounts intact (`hello@joshuamadrid.com` + the other).
- [ ] Stripe is in **test mode**, `STRIPE_BYPASS_CONNECT=true`, and webhook listener running for live receipt generation OR `/api/dev/generate-test-receipt` exposed.
- [ ] At least 3 active campaigns and 3 open requests in the DB.
- [ ] Heartland Center + KC Pet Project still pending so Scenario 8 has something to approve.
- [ ] Watermark "Placeholder photo" still visible on org/campaign images.
- [ ] You've run through every scenario yourself first as an "expert path" baseline.
