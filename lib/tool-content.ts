// Long-form content for each tool page: How it works, a worked example,
// when to use it, and an FAQ. Sourced from Steve Dunn's reviewed draft.
// Rendered by components/tool-content.tsx below each tool.

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolContent {
  howItWorks: string[];
  example: string[];
  whenToUse: string[];
  faqs: ToolFaq[];
}

export const toolContent: Record<string, ToolContent> = {
  "/tools/negotiation-visualizer": {
    howItWorks: [
      `Most negotiations are easier to understand as a picture than as a list of numbers. The Negotiation Visualizer charts a settlement negotiation round by round: enter each offer as it happens, and the chart plots the plaintiff's demands and the defendant's offers as two converging lines.`,
      `The tool accepts two kinds of moves. A firm offer is a single number, like 500,000. A bracket is a range, entered like 200,000-400,000, which appears on the chart as a shaded band with a dotted line through its midpoint. When both sides have brackets on the table and the brackets overlap, the overlapping zone is highlighted in green — often the first visible sign of where a deal might land.`,
      `Once both sides have made at least three moves, you can turn on a projected convergence point. It fits a straight line through each side's three most recent moves and extends both lines to where they would intersect — the round and the dollar figure where the parties meet if the current pattern simply continues. Negotiations rarely move in straight lines, but the projection is a useful reality check on pace.`,
      `Everything runs in your browser. No offer you enter is stored on a server or transmitted anywhere, and you can export the chart and offer history to PDF for your file.`,
    ],
    example: [
      `Suppose the plaintiff opens at $500,000 and the defendant responds at $100,000. The plaintiff comes down to $400,000; the defendant comes up to $200,000. The plaintiff then offers a bracket of $300,000–$450,000 and the defendant counters with a bracket of $225,000–$325,000. The chart shows the two paths closing, the two brackets overlapping between $300,000 and $325,000 in green, and — with three moves on each side — a projected convergence in the low $300,000s a round or two ahead.`,
    ],
    whenToUse: [
      `Use it live during a mediation to keep a clean record of the bidding, to show a client how far the other side has actually moved, or after a session to study the pattern before the next round. The exported chart also makes a clear exhibit for a client update letter.`,
    ],
    faqs: [
      {
        q: `How do I enter a bracket in the Negotiation Visualizer?`,
        a: `Type the range with a dash, like 200,000-400,000. The chart draws it as a shaded band with its midpoint marked. The order doesn't matter — the tool sorts the endpoints.`,
      },
      {
        q: `What does the green area on the chart mean?`,
        a: `Green marks where the two sides' brackets overlap. An overlap doesn't guarantee a deal, but it usually means the parties' signaled ranges already contain a common number.`,
      },
      {
        q: `How is the projected convergence calculated?`,
        a: `It is a straight-line projection based on each side's three most recent moves. The tool fits a line through each side's last three offers and extends both lines to their intersection. It appears only after both sides have made at least three offers, and it is a projection of the current pattern — not a prediction.`,
      },
      {
        q: `Is my negotiation data saved anywhere?`,
        a: `No. Offers exist only in your browser for the current session and are never sent to a server. Closing the tab clears them. Use Export as PDF if you want a record.`,
      },
    ],
  },
  "/tools/bracket-generator": {
    howItWorks: [
      `Brackets are a staple of settlement negotiation: “we'll come down to X if you come up to Y.” The arithmetic is simple, but in the middle of a mediation it's easy to get wrong — and the midpoint of a bracket is often the number doing the real talking.`,
      `The Bracket Generator takes any two of three values — our number, their number, and the midpoint — and calculates the third instantly. Enter both endpoints and it gives you the midpoint. Enter one endpoint and the midpoint you want to signal, and it tells you where the other endpoint has to be.`,
      `Changing the midpoint after all three values are filled shifts both endpoints by equal amounts, keeping the spread of the bracket the same. That makes it easy to slide a bracket up or down the range while preserving its width.`,
    ],
    example: [
      `You're at $500,000 and want your next bracket to signal a midpoint of $350,000. Enter 500,000 as our number and 350,000 as the midpoint: the tool fills in $200,000 as the other endpoint. If $200,000 feels too low to say out loud, nudge the midpoint up and watch both ends move together.`,
    ],
    whenToUse: [
      `Use it whenever you're constructing or decoding a bracket: before proposing one, to make sure the midpoint says what you intend, or when you receive one, to see instantly what midpoint the other side is signaling.`,
    ],
    faqs: [
      {
        q: `What is a settlement bracket?`,
        a: `A bracket is a conditional paired move: one side proposes that it will come down to a number if the other side comes up to a number, putting both figures on the table at once. Brackets are commonly used to break stalemates and signal ranges without either side bidding against itself.`,
      },
      {
        q: `Why does the midpoint of a bracket matter?`,
        a: `There are a lot of things you can do with brackets, but what most people are doing most of the time with brackets is proposing midpoints a little more advantageous than their actual target range. Whether or not you would accept the midpoint, you should always at least know what it is. And you should consider the likelihood the other side will interpret the midpoint as a signal.`,
      },
      {
        q: `Does a bracket commit me to its endpoints?`,
        a: `A bracket is an offer like any other — typically conditional and revocable until accepted. But endpoints carry signaling weight: once you have put a bracket out there, the other side knows you will get within its range. It is usually pointless, or at least a waste of time, to move outside a bracket you have already proposed. That is part of the beauty of brackets. They help us move along!`,
      },
    ],
  },
  "/tools/convergence-calculator": {
    howItWorks: [
      `Comparing your last move to the other side’s, you have enough information to ask a simple question: if both sides keep moving at this pace, where do the numbers meet?`,
      `Enter two offers from each party. The tool treats each side's pair of offers as a straight line — the plaintiff's coming down, the defendant's going up — and extends both lines forward to the round and dollar value where they would intersect. The chart shows the actual moves as solid lines and the extrapolation as dotted lines, with the intersection marked in green.`,
      `If the lines never meet — because the parties are moving apart, or moving in parallel — the tool says so instead of inventing a number. That answer is just as useful: it means the current pattern doesn't get anyone to a deal.`,
    ],
    example: [
      `The plaintiff demands $500,000, then $450,000 — moving $50,000. The defendant offers $50,000, then $75,000 — moving $25,000. If this pattern holds, the lines cross at $200,000.`,
    ],
    whenToUse: [
      `This tool is particularly helpful for deciding whether to continue a pattern: if the intersection is a number you can accept, continuing the trend may get you there without drama. If the intersection is unacceptable, you know the pattern has to change.`,
    ],
    faqs: [
      {
        q: `What does the fractional round number mean?`,
        a: `An intersection at “round 3.25” means the lines cross a quarter of the way between rounds 3 and 4. In practice it means the parties would be effectively together by round 4 if the pattern held.`,
      },
      {
        q: `What if the trend points to a number I would not accept?`,
        a: `When the trend is unsustainable, we must find ways to communicate this to the other side. You can let the numbers speak for themselves by adjusting your move to fit a trend that lands in an acceptable range. Or you could simply tell the other side directly, “this trend is not going to result in settlement, so we need to change course.” Or better yet, do both! One caveat: even if the trend cannot hold forever, it might work for a while to narrow the gap.`,
      },
      {
        q: `How is this different from the Negotiation Visualizer's projection?`,
        a: `This tool is a quick two-offers-per-side calculator. The Negotiation Visualizer tracks a whole negotiation round by round and bases its projection on each side's three most recent moves. Use this one for a fast read; use the Visualizer to chart the full negotiation.`,
      },
    ],
  },
  "/tools/employment-damages-estimator": {
    howItWorks: [
      `Employment cases tend to settle around a back-of-the-envelope damages model, and this tool builds that envelope properly. It estimates a plaintiff's potential recovery as the sum of net back pay, front pay, and other damages.`,
      `Back pay is monthly compensation plus the monthly value of benefits, multiplied by the months since termination. Mitigation — what the plaintiff actually earned from other jobs during that period — is subtracted. You can list multiple mitigation jobs, each with its own duration and monthly pay.`,
      `Front pay is forward-looking: months of front pay multiplied by the difference between the old compensation and the current job's pay (if the plaintiff is working — check the “currently employed” box on that job and the offset applies automatically).`,
      `Additional damages cover the categories that vary by statute and case: compensatory damages for emotional distress, liquidated damages (2× back-pay compensation under FLSA/ADEA/EPA-type statutes, 2× compensation plus benefits under FMLA, or 3× under some state statutes), punitive damages, and anything else. The breakdown shows every component so the total is easy to defend — or attack.`,
    ],
    example: [
      `A plaintiff earning $7,000 a month plus $1,500 in benefits, terminated 12 months ago, has gross back pay of $102,000. She worked 6 of those months at $5,000 a month — $30,000 of mitigation — leaving net back pay of $72,000. Six months of front pay offset by the $5,000 current job adds $12,000 ($2,000 × 6). Add $50,000 of emotional distress and the estimate is $134,000 before any liquidated or punitive component.`,
    ],
    whenToUse: [
      `Run it at intake to sanity-check a demand, before mediation to set client expectations, or during one to test the other side's number. Run it several ways — best case, worst case, likely case. The spread between those runs is usually more informative than any single total.`,
    ],
    faqs: [
      {
        q: `How is back pay calculated in an employment case?`,
        a: `As a rule of thumb: (monthly compensation + monthly value of benefits) × months since termination, reduced by what the plaintiff earned in mitigation during the same period. Courts apply jurisdiction-specific rules; this tool gives you the standard arithmetic.`,
      },
      {
        q: `What are liquidated damages?`,
        a: `Statutory damages some employment laws add on top of back pay — commonly an amount equal to the back-pay award (a “doubling”) under the FLSA, ADEA, and Equal Pay Act when the violation is willful, or under the FMLA absent good faith. The tool's options mirror those patterns; whether they apply is a legal question.`,
      },
      {
        q: `Does the estimate account for caps on damages?`,
        a: `No. Title VII and many state statutes cap compensatory and punitive damages depending on employer size. Apply any caps to the relevant lines yourself — the itemized breakdown makes that straightforward.`,
      },
      {
        q: `Is this the amount my case will settle for?`,
        a: `No. It is an estimate of exposure, not a prediction of settlement. Cases settle at discounts to exposure for risk, cost, delay, and collectability. Pair this tool with the Plaintiff's Expected Value calculator to apply those discounts.`,
      },
    ],
  },
  "/tools/personal-injury-damages-estimator": {
    howItWorks: [
      `This tool estimates personal injury damages using the multiplier method — the longest-standing shorthand in injury valuation. Economic damages are added up directly: medical expenses to date, future medical expenses, lost earnings to date, future lost earnings, and property damage.`,
      `Non-economic damages — pain and suffering, loss of enjoyment — are estimated by multiplying total medical expenses (past and future combined) by a factor between 1× and 5×. Minor, fully-resolved injuries sit near the bottom of that range; severe, permanent, well-documented injuries sit near the top.`,
      `The output is an itemized breakdown, so you can see exactly how much of the total is hard economic loss and how much rides on the multiplier — which is usually where the negotiation actually happens.`,
    ],
    example: [
      `Medicals of $25,000 to date plus $10,000 expected — $35,000 total — at a 3× multiplier produces $105,000 of non-economic damages. Add $15,000 in lost earnings to date, $20,000 future, and $5,000 in property damage, and the estimate is $180,000. At 2× the same case is $145,000; at 4× it is $215,000. That range is the real output.`,
    ],
    whenToUse: [
      `Use it to frame a demand, test a reserve, or give a client a realistic bracket for their case. Run it at two or three multipliers rather than one — the spread shows how much of the case's value is judgment rather than arithmetic.`,
    ],
    faqs: [
      {
        q: `What is the multiplier method?`,
        a: `A valuation shorthand that estimates pain and suffering as a multiple — typically 1× to 5× — of medical expenses. It is a starting point used by adjusters and lawyers, not a legal rule, and the appropriate multiplier depends on injury severity, permanence, documentation, and jurisdiction.`,
      },
      {
        q: `What multiplier should I use?`,
        a: `Soft-tissue injuries that resolve fully tend toward 1–2×. Fractures, surgeries, and injuries with lasting effects support 3× or more. Permanent, life-altering injuries can justify the top of the range or more than this tool offers. When in doubt, run several and present the range.`,
      },
      {
        q: `Are medical expenses based on billed or paid amounts?`,
        a: `Jurisdictions differ on whether the jury sees billed charges, amounts actually paid, or both. Enter the figure your jurisdiction uses — the multiplier compounds whatever base you give it, so this choice matters.`,
      },
      {
        q: `Does the calculation include punitive damages or comparative fault?`,
        a: `No. Punitive damages, comparative-fault reductions, liens, and subrogation all sit outside this estimate. Treat the output as a gross full-liability number and adjust from there.`,
      },
    ],
  },
  "/tools/plaintiffs-expected-value": {
    howItWorks: [
      `A case worth $250,000 if you win is not worth $250,000. This tool calculates what economists call expected value: the verdict figure adjusted for the probability of winning, the time value of money, and the costs of getting there.`,
      `The math runs in three steps. First, total damages are multiplied by your estimated probability of success. Second, that probability-adjusted figure is discounted to present value based on how many years away payment is and an annual discount rate — a dollar at trial in two years is worth less than a dollar in a settlement today. Third, the costs of continuing are subtracted: attorneys' fees (leave blank for contingency arrangements, where fees scale with recovery), litigation costs, and intangible costs — the stress, lost time, and reputational exposure parties consistently underestimate.`,
      `The result is a rational benchmark to hold against the settlement number on the table.`,
    ],
    example: [
      `Damages of $250,000 with a 60% chance of success is $150,000 probability-adjusted. Payment two years out at a 4% discount rate brings it to about $138,683. Subtract $10,000 in remaining litigation costs and $5,000 of intangible costs, and the expected value of pressing on is roughly $123,683. A settlement offer near that number is not a discount — it is the math.`,
    ],
    whenToUse: [
      `Use it when a real settlement number is on the table and the client asks “should we take it?” — or before mediation, to know your own walk-away analytically rather than emotionally. Test it at several probabilities; most litigants are too optimistic about their chances, and watching the expected value move as the probability drops is often the most persuasive chart in the room.`,
    ],
    faqs: [
      {
        q: `What is the expected value of a lawsuit?`,
        a: `The probability-weighted average of outcomes: roughly, what you'd expect to net per case if you could try the same case many times. It is the standard rational benchmark for evaluating a settlement offer against continued litigation.`,
      },
      {
        q: `Why discount for the time value of money?`,
        a: `Because a settlement pays now and a judgment pays later — often years later, after trial and appeal. Money received sooner can be invested, and money received later carries risk in the meantime. The discount rate converts a future recovery to today's dollars.`,
      },
      {
        q: `What discount rate should I use?`,
        a: `A common starting point is a risk-free rate (Treasury yields) or your client's actual cost of money. The default of 4% is in that neighborhood; the right number depends on the client and the era. The result usually moves less with the rate than with the probability of success — focus your honesty there.`,
      },
      {
        q: `Why include intangible costs?`,
        a: `Because they are real. Years of stress, depositions, document productions, and distraction from work and family have a price, and parties who ignore it systematically overvalue litigating. Put a number on it, even a rough one. And remember, most people dramatically undervalue this line item. It is hard to know the value of peace of mind, or a good night’s sleep, but it’s probably more than you think.`,
      },
    ],
  },
  "/tools/defendants-expected-cost": {
    howItWorks: [
      `This is the mirror image of the plaintiff's expected-value analysis: what does continuing to litigate actually cost the defendant, all-in?`,
      `The model has three parts. Exposure on the merits: the plaintiff's damages multiplied by the probability the plaintiff prevails. Fee-shifting exposure: in cases where a prevailing plaintiff recovers attorneys' fees — most employment statutes, many consumer statutes — the plaintiff's fees and costs multiplied by the probability of fee shifting. And the defendant's own certain costs: defense fees, litigation costs, and intangibles like management time, business disruption, and reputational exposure.`,
      `The sum is the number a settlement should be measured against. A defendant who compares a demand only to the damages exposure is ignoring most of the bill.`,
    ],
    example: [
      `Damages of $250,000 with a 40% chance of a plaintiff's verdict is $100,000 of expected exposure. The plaintiff's fees and costs are projected at $75,000 with the same 40% probability of shifting — another $30,000. Defense fees of $100,000, $25,000 in costs, and $10,000 of intangibles are spent win or lose. Total expected cost: $265,000 — for a case the defendant thinks it probably wins.`,
    ],
    whenToUse: [
      `Use it to set reserves, to brief decision-makers before a mediation, or in a caucus to show why “we'll probably win” and “we should try this case” are different conclusions. The fee-shifting line is especially clarifying in employment cases, where it often dwarfs the damages exposure.`,
    ],
    faqs: [
      {
        q: `Why include defense fees if we expect to win?`,
        a: `Because in the American system each side generally pays its own lawyers regardless of outcome. Defense fees and costs are spent win or lose, which is why they appear at full value rather than probability-weighted.`,
      },
      {
        q: `What is fee shifting?`,
        a: `A statutory or contractual rule that makes the loser pay the winner's attorneys' fees. Many employment, civil rights, and consumer statutes let a prevailing plaintiff recover fees — which means a defendant's real exposure includes the plaintiff's legal bill, not just the damages.`,
      },
      {
        q: `What probability should I use for fee shifting?`,
        a: `If fees follow automatically when the plaintiff prevails, use the same percentage as the damages probability. Use a different number only where fee recovery is discretionary or independently uncertain.`,
      },
      {
        q: `How do I use this number in a negotiation?`,
        a: `Any settlement below the total expected cost is, based purely on numbers, a good outcome for the defendant — before even counting the value of certainty and closure. It reframes the demand from “that's more than they'd win” to “that's less than this will cost.” Although there are many factors beyond pure numbers to consider in deciding whether to settle, an informed litigant should at least know where the negotiation stands compared to a strict rational outcome.`,
      },
    ],
  },
  "/tools/contingency-calculator": {
    howItWorks: [
      `The number that matters to a plaintiff is not the settlement figure — it's the check. This calculator does the math: enter the settlement amount, the contingency fee percentage, and litigation costs, and it shows the attorney's fee, the costs, and the plaintiff's net recovery. You can set the percentage with the slider or enter a precise number in the text box.`,
      `The fee is calculated as a percentage of the gross settlement, with costs deducted separately — the most common structure. Everything is itemized so the client can see exactly where each dollar goes.`,
    ],
    example: [
      `A $250,000 settlement with a 33.333% fee produces an attorney's fee of $83,332.50. Subtract $10,000 in litigation costs and the plaintiff nets $156,667.50 — almost $95,000 less than the headline number. Having that figure on screen before the final demand avoids the worst moment in any mediation: the client learning their net for the first time after agreeing.`,
    ],
    whenToUse: [
      `Use it in every mediation involving a contingency-fee plaintiff — early, not at the end. Clients evaluate offers by their net, and showing the arithmetic at the start of the day prevents disappointment and misunderstanding.`,
    ],
    faqs: [
      {
        q: `How are contingency fees calculated?`,
        a: `Usually as a percentage of the gross recovery, with litigation costs reimbursed separately. Whether the percentage applies before or after costs are deducted depends on the fee agreement — this calculator uses the gross-fee structure, which is the most common.`,
      },
      {
        q: `What is a typical contingency fee percentage?`,
        a: `Arrangements vary widely by case type, jurisdiction, and stage — there is no single “correct” percentage, which is why this tool doesn't default to one. Common arrangements often step up if a case goes to trial. Check the actual fee agreement.`,
      },
      {
        q: `Are litigation costs the same as attorney's fees?`,
        a: `No. Fees compensate the lawyer's work; costs are out-of-pocket expenses — filing fees, depositions, experts, records. In most contingency arrangements costs are charged in addition to the fee, which is why they're entered separately here.`,
      },
    ],
  },
  "/tools/employment-contingency-calculator": {
    howItWorks: [
      `Employment settlements have an extra step that ordinary contingency math misses: after fees and costs, the plaintiff's net recovery has to be allocated between wages and non-wage income, and that allocation drives taxes.`,
      `This calculator runs the standard contingency arithmetic — settlement amount, fee percentage, litigation costs, net to plaintiff — and then splits the net by a wage-allocation percentage you control. The wage portion is generally treated as W-2 income subject to payroll tax withholding; the non-wage portion (for example, compensatory damages for emotional distress) is typically reported on a 1099 without payroll taxes.`,
      `Allocation must reflect the actual claims in the case — it is a characterization of what the settlement pays for, not a dial for minimizing taxes. But within the range the claims support, the split makes a real difference to what the client keeps, and it's better negotiated deliberately.`,
    ],
    example: [
      `A $250,000 employment settlement with a 40% fee and $10,000 in costs nets the plaintiff $140,000. Allocated 50/50, that's $70,000 of wages (subject to withholding) and $70,000 of non-wage income. To see what the allocation means in after-tax dollars, carry both numbers into the Rough Guess After Taxes Estimator.`,
    ],
    whenToUse: [
      `Use it when drafting or negotiating the settlement agreement in an employment case — the allocation belongs in the written agreement, and this shows both sides what each split means before anyone signs.`,
    ],
    faqs: [
      {
        q: `Why are employment settlements split between wages and non-wages?`,
        a: `Because the tax treatment differs. Amounts paid for lost wages are wages — subject to income and payroll tax withholding, reported on a W-2. Amounts paid for non-wage claims like emotional distress are generally reported on a 1099 and not subject to payroll taxes. The settlement agreement should say which is which.`,
      },
      {
        q: `Can we allocate everything to non-wages to save taxes?`,
        a: `No. The allocation has to reasonably reflect the claims being settled — a case pleaded almost entirely as lost wages can't plausibly settle as 100% emotional distress. Unreasonable allocations invite IRS scrutiny for both sides. Get tax advice on the specific case.`,
      },
      {
        q: `Is the wage portion taxed differently from the non-wage portion?`,
        a: `Yes. Wages bear income tax plus the employee's share of FICA, with employer withholding. Non-wage damages are still ordinary income (unless for physical injury) but avoid payroll taxes. The after-tax difference is what makes the allocation worth negotiating carefully.`,
      },
    ],
  },
  "/tools/simple-interest-calculator": {
    howItWorks: [
      `Judgments, prejudgment interest, and many settlement terms accrue simple — non-compounding — interest. This calculator computes it for any principal, any annual rate, and any period entered in days, months, or years.`,
      `The formula is the classic one: principal × annual rate × time in years. Time is converted using a 365-day year. Because the interest never compounds, the result grows in a straight line — interest on a judgment does not itself earn interest under most statutes.`,
    ],
    example: [
      `A $100,000 judgment at 8% simple interest for 18 months: $100,000 × 0.08 × 1.5 = $12,000 of interest, for a total of $112,000. The same calculation works for prejudgment interest measured in days — 245 days at 8% on $100,000 is $100,000 × 0.08 × (245/365) ≈ $5,369.86.`,
    ],
    whenToUse: [
      `Use it to compute prejudgment or post-judgment interest for a demand, to check the other side's interest math, or to price the time element of a structured deal where interest is part of the negotiation.`,
    ],
    faqs: [
      {
        q: `What is the difference between simple and compound interest?`,
        a: `Simple interest is calculated only on the original principal, so it accrues in a straight line. Compound interest is calculated on principal plus previously accrued interest, so it accelerates. Statutory judgment interest is usually simple; if your deal compounds, use the Payment Over Time Calculator instead — its amortization math compounds each period.`,
      },
      {
        q: `Does this use a 360-day or 365-day year?`,
        a: `365 days. Some courts and financial institutions use a 360-day convention, which produces slightly higher interest for the same nominal rate. If your jurisdiction uses 360, expect the numbers to differ by about 1.4%.`,
      },
      {
        q: `What interest rate applies to a judgment?`,
        a: `It varies by jurisdiction and case type — some states set a fixed statutory rate, others float with a benchmark, and federal post-judgment interest follows the weekly one-year Treasury yield. Look up the rate for your jurisdiction; this tool accepts any rate, including rates above the slider via typing.`,
      },
    ],
  },
  "/tools/payment-over-time": {
    howItWorks: [
      `When a settlement is paid over time rather than in one check, the structure has more moving parts than people expect: up-front payments, installment amounts, frequency, and whether the unpaid balance bears interest. This calculator builds the complete payment schedule.`,
      `Enter the total settlement, any up-front payments (each with its own label — “at signing,” “30 days,” whatever fits the deal), and the installment terms. The calculator works in either direction: fix the number of payments and it computes the payment amount, or fix the payment amount and it computes how many payments are needed. Frequency can be monthly, quarterly, or any custom interval in days.`,
      `If interest applies, the tool uses standard amortization — each level payment contains a declining interest component and a growing principal component, exactly like a loan. The schedule shows every payment broken into principal, interest, and remaining balance, and the summary totals what the payor ultimately pays.`,
    ],
    example: [
      `A $120,000 settlement with $20,000 at signing leaves $100,000 to amortize. Paid over 12 monthly installments at 6% interest, each payment is $8,606.64, total interest is about $3,279.71, and the payor's all-in cost is $123,279.71. At 0% the same structure is twelve flat payments of $8,333.33.`,
    ],
    whenToUse: [
      `Use it while negotiating structure — it answers “what does $10,000 a month for two years actually total?” instantly — and when drafting, because the exported schedule can go straight into the settlement agreement as an exhibit.`,
    ],
    faqs: [
      {
        q: `Should a settlement paid over time include interest?`,
        a: `That's a negotiation point. Interest compensates the plaintiff for waiting and for credit risk; payors resist it. Even at modest rates it adds up — this tool shows both sides exactly what any rate costs, which usually shortens that part of the conversation.`,
      },
      {
        q: `How is the installment payment calculated with interest?`,
        a: `With the standard amortization formula used for loans: a level payment such that interest accrues on the unpaid balance each period and the balance reaches zero on the final payment. Early payments are interest-heavy; later payments are principal-heavy. The schedule shows the split for every payment.`,
      },
      {
        q: `What happens if the payment amount is too small to cover the interest?`,
        a: `The balance would grow forever — so the calculator warns you instead of producing an endless schedule. Increase the payment or lower the rate.`,
      },
      {
        q: `Can I model an up-front payment plus installments?`,
        a: `Yes — that's the typical structure. Up-front payments are applied to the balance before installments begin, and you can list several with different labels and timing.`,
      },
    ],
  },
  "/tools/take-home-after-taxes": {
    howItWorks: [
      `Settlement decisions get made on after-tax dollars, but tax answers usually arrive weeks later from an accountant. This estimator produces a rough guess on the spot — good enough to compare structures during a negotiation, clearly labeled as the rough guess it is.`,
      `Enter income in up to three buckets: W-2 wages (subject to income tax and FICA withholding), 1099 income (with or without self-employment tax), and tax-free personal injury proceeds excluded under IRC §104(a)(2). Pick a filing status and state, and the tool applies 2026 federal brackets and the standard deduction, Social Security and Medicare taxes including the wage base and the Additional Medicare Tax, the self-employment tax with its half-SE deduction and a simplified QBI deduction, plus state income tax brackets and state payroll programs (SDI, PFML, and similar).`,
      `The output shows take-home by income category and taxes by type, with an effective rate. Every rate and threshold is sourced — IRS, SSA, the Tax Foundation, and state agencies — and the page's disclaimer lists what the model deliberately leaves out: credits, itemized deductions, local taxes, AMT, and more. It is a rough guess by design. Real decisions deserve a tax professional.`,
    ],
    example: [
      `An employment settlement allocates $70,000 to wages and $70,000 to non-wage 1099 income for a single filer in North Carolina. The estimator shows the federal and state income tax on the full $140,000, FICA on the wage portion only — and what actually lands in the client's account. Move the same $140,000 to a 60/40 split and watch the take-home change; that's the comparison that matters at the table.`,
    ],
    whenToUse: [
      `Use it during settlement negotiations to compare allocations — wages versus non-wages, taxable versus §104 personal-injury dollars — and to keep a client's expectations anchored to net, not gross. It pairs naturally with the Employment Contingency Calculator.`,
    ],
    faqs: [
      {
        q: `Are settlement proceeds taxable?`,
        a: `Usually yes — settlements for lost wages, emotional distress (without physical injury), and most other claims are ordinary income. The main exception is damages on account of physical injury or sickness, excluded under IRC §104(a)(2). Punitive damages and interest are taxable even in injury cases.`,
      },
      {
        q: `Why does it matter whether 1099 income is self-employment income?`,
        a: `Self-employment income bears SE tax — both halves of Social Security and Medicare, roughly 15.3% before adjustments. Non-SE 1099 income, such as most non-wage settlement damages, bears income tax but not SE tax. The difference is thousands of dollars on a typical settlement, so the tool asks.`,
      },
      {
        q: `How accurate is the estimate?`,
        a: `It applies real 2026 rates, brackets, wage bases, and standard deductions, so it's in the right neighborhood for straightforward situations. It ignores credits, itemized deductions, local taxes, AMT, and other particulars — which is why it's called a rough guess. Use it to compare scenarios, not to file.`,
      },
      {
        q: `Is my financial information stored?`,
        a: `No. The calculation runs entirely in your browser; nothing you enter is sent to or stored on any server.`,
      },
    ],
  },
  "/tools/days-between-dates": {
    howItWorks: [
      `A precise day count, expressed every way you might need it: years/months/days, total months, weeks and days, and total days. Enter two dates by typing or with the dropdowns, and all four formats compute at once.`,
      `The “include end day” option adds one day to the count, for the situations — common in statutory deadline and accrual calculations — where both the first and last day count. The tool handles leap years and month-length differences correctly, which is exactly where mental arithmetic goes wrong.`,
    ],
    example: [
      `From March 15, 2024 to June 11, 2026 is 2 years, 2 months, 27 days — 26 months and 27 days — 116 weeks and 6 days — 818 days. With “include end day” checked, the total becomes 819 days.`,
    ],
    whenToUse: [
      `Use it for limitations math, computing ages of cases or claims, interest periods measured in days, or anywhere a brief says “X days later” and you want to verify rather than trust.`,
    ],
    faqs: [
      {
        q: `When should I include the end day in a date calculation?`,
        a: `When the convention you're applying counts both endpoints — some statutes and contracts count the first and last day, others exclude the trigger day. The option adds exactly one day so you can match either convention. The governing rule (such as Federal Rule 6 or its state analog) decides which is right.`,
      },
      {
        q: `Why do the months-and-days and total-days figures look inconsistent?`,
        a: `Because months have different lengths, “2 months” from January 31 is not the same number of days as “2 months” from March 1. The tool computes each format independently and correctly; the total-days figure is the unambiguous one.`,
      },
      {
        q: `Does the calculator handle leap years?`,
        a: `Yes — leap days are counted like any other day, and February 29 is handled correctly in both directions.`,
      },
    ],
  },
  "/tools/add-subtract-date": {
    howItWorks: [
      `Start from any date and move forward or backward by any combination of years, months, weeks, and days. The result shows the landing date, its day of the week, and the total calendar and business days traveled.`,
      `The business-days option changes how the days component is counted: instead of calendar days, it skips weekends and, if selected, federal holidays — including observed holidays, like a July 4th that falls on a Saturday and is observed Friday. Years, months, and weeks always move on the calendar; only the days component switches to business-day counting.`,
      `The federal holiday calendar covers all eleven federal holidays with their weekend-observation rules. State court holidays vary; if your deadline depends on a state holiday calendar, verify against the court's published list.`,
    ],
    example: [
      `Thirty days from June 11, 2026 is July 11, 2026 — a Saturday, which matters if something is due. Thirty business days excluding federal holidays lands on July 27, 2026, because the count skips twelve weekend days, Juneteenth (Friday, June 19), and the observed Independence Day holiday on Friday, July 3.`,
    ],
    whenToUse: [
      `Use it for deadline calculations, option and notice periods, and scheduling — any time an agreement or rule says “within N days” and you need the actual date, not an estimate.`,
    ],
    faqs: [
      {
        q: `How are business days calculated?`,
        a: `Business days are weekdays — Monday through Friday — excluding, if you choose, federal holidays. When a federal holiday falls on a Saturday it is observed the preceding Friday; on a Sunday, the following Monday. The tool applies those observation rules automatically.`,
      },
      {
        q: `Which holidays does the calculator exclude?`,
        a: `The eleven U.S. federal holidays: New Year's Day, MLK Day, Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, and Christmas, each with weekend observation. It does not include state-specific court holidays — check those separately.`,
      },
      {
        q: `Can it calculate court deadlines?`,
        a: `It does the date arithmetic deadline rules require, including business-day counting. But deadline rules have their own conventions — when the clock starts, what happens when a deadline lands on a weekend, service additions — so apply the governing rule and use this to do the counting.`,
      },
    ],
  },
};
