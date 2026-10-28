import type { DecisionRecord } from "./types.ts";

function decisionText(decision: DecisionRecord): string {
  const why = decision.reasons[0] ?? "policy match";
  return `We decided to ${decision.verdict} ${decision.log.destination} (${decision.log.app}) because ${why}. This must be remembered as an AUP enforcement decision.`;
}

export async function mineDecision(hmem: any, decision: DecisionRecord): Promise<string[]> {
  const text = decisionText(decision);
  const mined = await hmem.mine("plan_completion", text);
  if (mined.length > 0) return mined.map((m: { id: string }) => m.id);

  const record = hmem.add({
    content: text,
    type: "factual",
    source: "aup:decision",
    tags: ["aup", `verdict:${decision.verdict}`, `dest:${decision.log.destination}`],
  });
  return [record.id];
}
