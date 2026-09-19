# Cold Outreach — Templates & Sequences

Companion to `warm-network-templates.md`. Warm gets you intros; cold is the
repeatable origination engine the strategy doc says the whole plan gates on
(`~/AI-Consulting-SMB-Strategy-2026.md` §1.2: *"Proving you can originate
sales — before you prove you can build."*).

> **Adversarial review applied (2026-06-06):** an earlier draft of this file
> led every touch with the free audit and offered CFOs a referral % in the
> first cold email. Both were attacked and fixed: the strategy's §8 gate is
> **paid**-diagnostic conversion (free-audit clicks are a vanity signal), and
> unsolicited commission offers to CPAs collide with AICPA §1.520 / TX TAC
> §501.71 independence rules. Details in the session results doc.

**The math to respect** (from the strategy research): cold email replies run
1–5%, CAC ≈ $440/client. Generic "AI automation" pitches are the commodity
floor — >12,000 agencies send them. The ONLY cold motion that pays is
**vertical-specific + falsifiable number + tiny ask**.

**Vertical placeholder:** templates use `[VERTICAL]` / `[SYSTEM]` (their
system of record). Current recommendation (devil's-advocate-tested, Brian to
confirm): **commercial specialty-trade subcontractors' AP + certified-payroll
back office, on Sage 100 Contractor / Foundation** — see results doc for the
reasoning and the week-1 falsification test. Do NOT send a generic version.

**Rules of engagement**
- One named observation about *their* business in sentence one. No "I hope this finds you well."
- One falsifiable number, **in the reader's own frame**: owners think in hires
  and hours ("≈ half a back-office salary"), controllers/CFOs think in
  cost-per-invoice ($12–22 manual → $2–5 automated). Don't swap them.
- One tiny ask. Never "hop on a quick 30-minute discovery call."
- The free audit link appears ONLY in the walk-away touch. It's a graceful
  exit, not the offer — a self-serve link in touch 1 hands the prospect a way
  to avoid replying to a human.
- 3-touch maximum, then stop. Persistence past 3 burns the local market.
- Track per-template reply rates from message #1. If <2% replies at 50 sends,
  change the template OR the vertical — one variable, not both.

---

## Sequence A — Owner/GM of a [VERTICAL] business (email)

### Touch 1 — give value first
**Subject:** how [VERTICAL] offices are killing the invoice pile

> Hi [first name],
>
> [One specific observation: "Saw you run a 12-tech shop out of Round Rock" / "Noticed you're hiring a second office admin"].
>
> I wrote a teardown on how a [VERTICAL] back office gets its vendor-invoice
> and paperwork pile down to two human approvals a week using [SYSTEM] plus
> one integration — including where it breaks and what still needs a person.
> No email gate: [link to teardown artifact].
>
> I'm an Austin engineer who does fixed-scope automation for [VERTICAL] back
> offices on [SYSTEM]. No subscriptions, no "AI transformation" — just the
> paperwork gone.
>
> If the teardown matches what your office deals with, worth 15 minutes?
>
> — Brian Stoker, Stoked Consulting

### Touch 2 — the number, in owner language (4–6 days later)
**Subject:** re: the invoice pile

> Hi [first name] — one more and then I'll leave you alone.
>
> The short version of that teardown in dollars: at [estimated volume]
> invoices/month, manual processing runs the industry $12–22 each. Automated
> on [SYSTEM] it's $2–5. For a shop your size that's **roughly half a
> back-office hire you don't have to make** — and the half that's left is the
> judgment work, not the typing.
>
> I scope this as a fixed **$2,500 diagnostic**: one week, I map your actual
> invoice/document flow, and you get a written plan with the real numbers for
> *your* books — whoever builds it. If I'm wrong about the savings, the plan
> says so and you've spent $2.5k to dodge a $25k mistake.
>
> Want the 15 minutes to see if the diagnostic is worth it?

### Touch 3 — the walk-away (5–7 days later)
**Subject:** closing the loop

> [First name] — last note from me.
>
> If back-office drag isn't a top-3 problem this quarter, ignore this with a
> clear conscience.
>
> If it is and the timing's wrong: my AI agent runs a free 5-minute readiness
> audit at https://consulting.stokd.cloud/ai — it emails you a 1-page report
> you can act on without ever talking to me.
>
> Either way: good luck with [specific thing from touch 1].

---

## Sequence B — LinkedIn DM variant (when no email)

### Touch 1 (connect note — 280 chars)
> [First name] — fellow Austin operator. I automate [VERTICAL] back offices
> on [SYSTEM] (vendor invoices, certified payroll docs). Wrote a teardown on
> exactly how — happy to share, no pitch.

### Touch 2 (after accept)
> Thanks for connecting. The teardown: [link]. The dollars version: manual
> invoice processing runs $12–22 each; automated on [SYSTEM] it's $2–5 — at
> most shops' volume that's half an admin hire. I do a fixed $2.5k one-week
> diagnostic that maps it for your books. If the teardown's wrong about your
> [SYSTEM] setup, tell me where — that's worth more to me than a sale.

---

## Sequence C — Advisory-CFO / bookkeeper channel (email)

The strategy's highest-leverage channel (§5): one fractional CFO or
bookkeeping firm sees dozens of [VERTICAL] back offices. **Lead with making
them look good — never with money.** (No referral % in cold: for attest
clients AICPA §1.520 / TX §501.71 restrict commissions outright, and offering
one unsolicited reads as not understanding their profession. Compensation
comes up after interest, structured around *their* independence requirements.)

**Subject:** the AP question your [VERTICAL] clients keep asking

> Hi [first name],
>
> You see more [VERTICAL] books than anyone I could ever cold-email, so I'll
> be direct.
>
> I'm an Austin engineer doing fixed-scope AP/document automation for
> [VERTICAL] back offices on [SYSTEM] — cost-per-invoice from the $12–22
> manual range to $2–5, with the controller's approval step preserved. I make
> your client's control environment stronger, not scarier, and you stay the
> trusted advisor; I'm the wrench.
>
> Two things I can put in your hands:
> 1. A teardown you can forward under your own banner: [link].
> 2. As I work across [VERTICAL] shops I'm building a per-unit cost benchmark
>    ("here's where your AP costs sit vs. peers") — yours to use in client
>    reviews as your own deliverable.
>
> If a client's document load is eating your team's margin, the engagement
> starts as a $2.5k one-week diagnostic — your client gets a written plan
> either way. Any arrangement between us gets structured to fit your
> independence requirements, disclosed, your call.
>
> 20 minutes to see if our standards match?

---

## Instrumentation (non-negotiable)

Per send: log {template, vertical, company, touch#, date} in a sheet.
Per reply: log {sentiment, objection-verbatim}.
The objections ARE the market research — they feed the vertical filter (§8)
and the audit-bot playbook prompts.

**What we're actually measuring (the §8 origination gate):** outbound →
**paid $2.5k diagnostic** conversion. Target ≥2 paid per 100 touches by week
6. Free-audit completions and report-email captures are *supporting* signals,
not the gate.

Kill criteria (from strategy §8): <2% reply after 100 sends in a vertical, or
2+ replies of "our [SYSTEM] already does this" → the platform has absorbed the
gap; change vertical or offer, per the research's early-warning test.
