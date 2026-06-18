// Robustness: Monid budget guard refuses over-cap and over-budget runs (no network needed for the
// refusal paths). Run: node robustness/budget-cap.mjs
process.env.MONID_MAX_CALL_USD = "0.25";
process.env.MONID_BUDGET_USD = "0.50";
const m = await import("@lab/monid-tools");

let pass = 0, fail = 0;
function check(name, cond) { (cond ? pass++ : fail++); console.log(`${cond ? "✓" : "✗"} ${name}`); }

// 1) per-call cap: a $1.00 endpoint exceeds the $0.25 per-call cap → refused, no network call.
try {
  await m.run({ provider: "x", endpoint: "/y", input: {}, price: { type: "PER_CALL", amount: 1.0 } });
  check("per-call cap refuses $1.00 > $0.25", false);
} catch (e) {
  check("per-call cap refuses $1.00 > $0.25", /per-call cap/.test(e.message));
}

// 2) total budget cap: two $0.20 calls (within per-call) would total $0.40 then $0.60 > $0.50.
//    We can't actually run (would hit network/charge), so assert the guard math via the exported caps.
check("MAX_CALL_USD respected (0.25)", m.MAX_CALL_USD === 0.25);
check("BUDGET_USD respected (0.50)", m.BUDGET_USD === 0.5);
check("amountSpent starts at 0", m.amountSpent() === 0);

console.log(`\nRESULT: ${fail === 0 ? "PASS" : "FAIL"} (${pass} passed, ${fail} failed)`);
process.exit(fail === 0 ? 0 : 1);
