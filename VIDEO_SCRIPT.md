# VIDEO SCRIPT — Baghewala Well-to-Surface Digital Twin (SIH26120)

**Target length: 8–10 minutes** (allowed window 7–10; with the two insert scenes below, aim ~10 minutes).
Read only the 🎙️ **SAY** lines out loud. They use short sentences and simple words on purpose — about 1,450 words total, roughly 10 minutes at a calm pace.
**Already recorded scenes 1–4, 6, 7, 8?** Just record the three blocks marked 🔴 NEW / 🔴 REVISED below and splice them in — Scene 5 replaces your old pump part, Scenes 6A + 6B slot between Scene 6 and Scene 7.

**How to read this file while recording:**

- 🎙️ **SAY** = the exact words to speak. Read these lines only.
- 🖱️ **GO TO / CLICK / SHOW** = what your mouse must do. Do these silently while speaking.
- ⏸️ **PAUSE** = stay quiet for a few seconds and let the judge look at the screen.

**Backup for the live demo:** our app has a **▶ Guided Tour** button (sidebar, topbar, and home page). If judges ask to see the product live, click it — it walks them through the same screens by itself.

---

## Before you press record (2 minutes)

1. Run the app (`npm install` → `npm run dev`) and open it in the browser.
2. Make the browser full screen (1920×1080), close all other tabs.
3. Internet must be ON — the field map loads real map pictures from the internet.
4. Reload the page once so everything is fresh, and stay on the home page.
5. Test your mic for 10 seconds. Keep water nearby.

---

## SCENE 1 — Introduction: who we are and what we built (0:00–1:00)

🖱️ **GO TO:** Home page. **SHOW:** the full screen, don't click anything yet.

> 🎙️ **SAY:** "Hello judges. We are Team [your team name], and this is our product for problem statement SIH26120 from Oil India Limited.
>
> Let me start with the problem in one minute. In Rajasthan, there is an oil field called Baghewala. The oil there is very, very thick — like cold honey. It does not flow on its own.
>
> So engineers do two things. First, they push hot steam into the ground to melt the oil. Second, they run big pumps to pull the oil up. The trouble is, these two teams work separately. The steam team decides steam by habit. The pump team changes pump speed only after something breaks. Result: wasted steam, broken pump rods, and less oil.
>
> Our product fixes exactly this. It is one smart screen where steam and pump decisions are taken together. Let me show you."

---

## SCENE 2 — The live field map (1:00–2:10)

🖱️ **GO TO:** Click **Field Overview** in the left menu.
🖱️ **SHOW:** Zoom the map in twice with your mouse wheel. Then click the **BGW-07** green dot, and click **"Open digital twin"** in the small popup.

> 🎙️ **SAY:** "This is our field view. You can see all twelve wells on a real map — not a drawing, a real map with real roads and desert tracks. You can zoom it, move it, and click any well.
>
> On top, you see the full field numbers — how much oil the whole field makes per day, the steam-to-oil ratio, and how many warnings are active. One screen, full field, live.
>
> Now I am opening one well, BGW-07, to show you what happens inside."

⏸️ **PAUSE:** 3 seconds. Let the well page load fully.

---

## SCENE 3 — The digital twin of one well (2:10–3:10)

🖱️ **GO TO:** You are on the **BGW-07 Digital Twin** page now.
🖱️ **SHOW:** Scroll slowly from the top numbers, down to the well diagram, then to the two charts. Point at each for 3–4 seconds.

> 🎙️ **SAY:** "This is the digital twin — meaning, a living copy of the real well on our screen.
>
> At the top: today's truth of this well — how much oil it makes, how hot it is underground, how thick the oil is.
>
> Below: a simple diagram of the well — from the surface machine, down one thousand metres of pipe, to the pump, to the oil layer. Everything is labelled, so even a non-engineer can follow it.
>
> And these two charts are the heart of our product. The first shows how much oil this well *can* give. The second shows how heat melts the thick oil. When the rock is hot, the oil flows. When it cools, the oil becomes honey again. Our whole product is built on this one idea."

---

## SCENE 4 — Core function 1: the steam planner (3:10–4:20)

🖱️ **GO TO:** Click **CSS Optimization** (left menu or the button on the page).
🖱️ **SHOW:** Drag the **steam slider** from 410 up to 500. Wait 3 seconds while production climbs. Drag it back to 410. Then drag the **soak slider** up by 12 hours. Point at the result numbers (production up, steam bill unchanged).

> 🎙️ **SAY:** "This is our first core function — the steam planner.
>
> Before spending lakhs of rupees on steam, the engineer tests it here. Move the steam slider, and the screen at once shows: how far the heat will reach, how much oil will come out, and the steam-to-oil ratio. Watch — more steam, clearly more oil. Steam pays.
>
> But steam also costs real money every day. So here is the smarter question — what if we get oil WITHOUT buying steam? I add just twelve hours of soaking time — waiting longer costs zero rupees — and production still climbs while the steam bill stays exactly flat. That free gain is the saving our product finds automatically.
>
> No engineer in Baghewala can see this trade today. With us, they see it *before* ordering steam."

---

## SCENE 5 — Core function 2: the pump controller (4:20–5:20) 🔴 REVISED — re-record this one

🖱️ **GO TO:** Click **SRP Optimization**. Reload the page once so sliders are at default.
🖱️ **SHOW:** Point at the two card pictures for 3 seconds (default speed). Then drag the **SPM (pump speed) slider** slowly up to 6.6 — hold 5 seconds while the loops move. Point at the dashed PPRL/MPRL lines. Drag SPM back to 5.4. Point at the green safety numbers.

> 🎙️ **SAY:** "This is our second core function — the pump controller.
>
> These two pictures are called pump cards. They are like an ECG report for the pump — a doctor reads a heartbeat, our engineer reads pump health from these shapes.
>
> Watch what happens when I increase pump speed. The loops physically move — the top dashed line is the peak load climbing, and a dent grows on the left side. That dent means the pump is starving for oil. You are watching the pump get sick, live, before anything breaks in real life.
>
> And see — both pictures share one fixed scale, so this motion is real, not a redrawn picture. Beside them are simple safety numbers in green, yellow and red. Today Baghewala learns about a broken rod after the breakdown. With us, they see it coming on screen, in seconds."

⏸️ **PAUSE:** 2 seconds on the green safety numbers.

---

## SCENE 6 — Core function 3: the profit finder (5:20–6:20) — ⭐ OUR WINNING FEATURE

🖱️ **GO TO:** Click **Surface Optimizer**.
🖱️ **SHOW:** Point at the recommended steam, soak and pump-speed numbers at the top. Then move to the dotted graph, hover over 2 bubbles so the money tooltip appears. Then scroll to the "Why this optimum" list.

> 🎙️ **SAY:** "And now the feature that makes us win.
>
> This page answers the only question that matters: *what is the best setting?* Not more oil at any cost — the setting that earns the most money per day. Oil income, minus steam cost, minus power cost, minus risk. Our system checks hundreds of combinations and gives one clear answer — shown at the top in plain numbers.
>
> This graph proves it honestly. Each bubble is one tested combination, sized by profit — bigger bubble, more money per day. The winner sits at the top of the ranking, and below, the system explains its answer point by point, with numbers. No black box, no magic. Any judge can check our maths by hand."

⏸️ **PAUSE:** 3 seconds on the graph. This is your strongest visual — let it breathe.

---

## SCENE 6A — Core function 5: the 30-day forecast (insert after Scene 6) 🔴 NEW — record this

🖱️ **GO TO:** Click **Forecast** (left menu, inside the BGW-07 section).
🖱️ **SHOW:** Read the 4 number boxes at the top. Click the **7D** tab — hold 2 seconds. Click the **30D** tab — hold 4 seconds while the green band opens up. Scroll to the two lower charts, point at the falling temperature line, then the falling fillage line.

> 🎙️ **SAY:** "Our fifth function looks into the future.
>
> Pick 7 days or 30 days. The green line is the expected oil rate, and the shaded band around it is our honest uncertainty — notice how the band opens wider the further we look. We never pretend the future is exact.
>
> Below: the rock is cooling back toward its natural heat, the oil is thickening again, and pump fillage is slowly falling. The day the temperature line crosses the danger mark, the screen tells us to plan the next steam cycle — weeks before the well actually gets sick. That early warning is the whole point of a forecast."

⏸️ **PAUSE:** 2 seconds on the 30-day band chart.

---

## SCENE 6B — Core function 6: the what-if lab (insert after Scene 6A) 🔴 NEW — record this

🖱️ **GO TO:** Click **What-If Lab** (left menu, inside the BGW-07 section). Reload once so both sides match.
🖱️ **SHOW:** Point at the top tag showing **Margin Δ +₹0/day** (both sides equal). Drag the **steam volume slider** up by ~50 (440 → 490). Hold 4 seconds on the green verdict box showing about **+₹78,000/day**. Click **Reset to baseline**. Then drag the **soak time slider** up by 12 hours (90 → 102). Hold 4 seconds on the green verdict box showing about **+₹14,000/day**.

> 🎙️ **SAY:** "And our sixth function — the what-if lab. This is where an engineer argues with the computer.
>
> Left side is today. Right side is my idea. The tag on top keeps live score in rupees per day. Watch: I add more steam — production jumps from thirty-five to forty-seven barrels, and the verdict box turns green, nearly eighty thousand rupees a day more. Steam pays — but it needs a bigger steam bill, a bigger generator, more fuel.
>
> Reset. Now instead I only add twelve hours of soaking time — waiting longer costs nothing, zero extra steam. Read the verdict box with me: green again, fourteen thousand rupees a day more — free money. Bought gains versus free gains, settled in ten seconds, with proof the judge can read. This is exactly the kind of decision Baghewala takes by gut feeling today."

⏸️ **PAUSE:** 2 seconds on the green verdict box.

> ⚠️ **If your numbers differ slightly** (versions move a little): no problem — just read YOUR verdict box out loud ("earns…" with its number). The box is always honest; your narration stays true by quoting it. The pattern always holds: steam earns but costs, soak earns for free.

---

## SCENE 7 — Core function 4: safety alarms + sensor check (6:20–7:20)

🖱️ **GO TO:** Click **Risk & Alerts**. Scroll the alert cards slowly.
🖱️ **GO TO:** Then click **Sensor Integrity**. Click the **"Simulate field recalibration"** button. Hold 3 seconds on the green zero.

> 🎙️ **SAY:** "Two more functions, quickly.
>
> First, safety alarms. Every warning shows its danger limit openly — no hidden scores. It tells *what* is wrong, in plain units, and *what to do* — like reduce pump speed. A judge can disagree with our limit, but nobody has to guess it.
>
> Second, sensor honesty. Here one temperature sensor is reading 8 degrees too high. Our system catches the lie, ignores that sensor, and uses the remaining good sensors instead. Press one button to repair it, and trust is restored. A normal dashboard would just show the wrong number. Ours protects you from it."

---

## SCENE 8 — Why we will win + closing (7:20–8:30)

🖱️ **GO TO:** Click **Engineering Basis**. Scroll slowly down the two tables. Hold 3 seconds. **Stop recording.**

> 🎙️ **SAY:** "Let me close with why this product deserves to win, in four plain points.
>
> One — it is real. Real map, real field numbers from Oil India and published research, real physics equations. Every number on every screen traces back to a source listed on this page. Challenge anything — it traces here.
>
> Two — it does the job the problem asked for. Steam planning, pump control, profit finding, forecasting, what-if testing, safety alarms — the six functions I just showed you, working together on one screen, not six separate tools.
>
> Three — it is honest. It shows profit, not just production. It shows danger limits openly. It admits what it is not — a calibrated model ready for live field data, not a fake claim of live data.
>
> Four — anyone can use it. A student can click the Guided Tour button and understand the full product in five minutes, with zero training.
>
> Steam plus pump, together at last. Thank you, judges."

---

## After recording (10 minutes)

- Cut silences longer than 1.5 seconds. Keep the 3-second pauses on the map, the profit graph, and the green zero — judges read slower than you speak.
- Add 7 text captions at the bottom at the right moments: **Real map · Steam planner · Pump ECG (live) · Profit finder · 30-day forecast · What-if lab · Honest alarms**.
- Edit order for the final video: Scenes 1–4 → **new Scene 5** → Scene 6 → **new Scenes 6A, 6B** → Scenes 7–8.
- Export 1080p, H.264, under 200 MB. Name it `SIH26120_Baghewala_DigitalTwin_Demo.mp4`.
- Watch once fully: did every click listed above happen? Is every spoken number visible on screen? Total under 9:30?

## If judges ask questions (simple answers, memorise these)

| Question | Simple answer |
|---|---|
| Is this real data or fake? | Real public data. Field numbers come from Oil India and research papers — all listed on our last page. Well positions are sample layouts inside the real field area. No live sensor connection is claimed. |
| Why 12 wells and not 52? | To keep the demo fast. The maths scales directly — the page itself shows how 12 wells scale to the full-field record. |
| What is new compared to old software? | Old tools plan steam and pump separately. Ours plans them together on one screen and picks the most profitable setting, with proof. |
| How do you catch a breaking rod? | We compute the pulling force on the rod every second. If the safety margin falls below the safe limit, the screen turns red before the real rod breaks. |
| What is steam-oil ratio? | Steam put in divided by oil got out. Lower is better. Our target is below 3. |
| Can it connect to real field sensors later? | Yes. The sensor page already has the full safety design — wrong sensors are caught and ignored. Connecting live data is plumbing work, not rebuilding. |
| What is your biggest weakness? | We have not yet tuned the model on private well files — only on public data. We say this openly on the site itself. |

## tiny dictionary (only if a non-oil judge asks)

- **Steam injection (CSS)** — push hot steam in, wait, then take oil out. Same well, three steps.
- **Sucker-rod pump** — a surface machine that moves rods up and down to pull oil up, like a hand pump on a large scale.
- **Digital twin** — a living copy of the real well on screen. Change something here, see what happens there — without touching the real well.
- **Fillage** — how full the pump is. Full pump, happy well. Half-empty pump, trouble coming.
- **BOPD** — barrels of oil per day. Just the daily oil count.
