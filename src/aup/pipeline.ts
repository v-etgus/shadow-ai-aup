import fs from "node:fs";
import path from "node:path";
import { act, resetActSeq } from "./act.ts";
import { critic } from "./critic.ts";
import { intake } from "./intake.ts";
import { mineDecision } from "./mine.ts";
import { retrievePastDecisions } from "./retrieve.ts";
import { assertSampleModeOffline } from "./sample-mode.ts";
import type { DecisionRecord, IntakeBundle } from "./types.ts";

export interface PipelineResult {
  intake: IntakeBundle;
  decisions: DecisionRecord[];
}

export async function seedPriorDecisions(hmem: any, texts: string[]): Promise<void> {
  for (const text of texts) {
    const mined = await hmem.mine("chat_message", text);
    if (mined.length === 0) {
      hmem.add({ content: text, type: "factual", source: "aup:prior", tags: ["aup", "prior"] });
    }
  }
}

export async function runPipeline(hmem: any, rootDir?: string): Promise<PipelineResult> {
  assertSampleModeOffline();
  resetActSeq();
  const bundle = intake(rootDir);
  await seedPriorDecisions(hmem, bundle.priorDecisions);

  const decisions: DecisionRecord[] = [];
  for (const row of bundle.logs) {
    const retrieved = retrievePastDecisions(hmem, row);
    const scored = critic(row, bundle.inventory, bundle.aupClasses, retrieved);
    const decision = act(row, scored, retrieved);
    decision.minedMemoryIds = await mineDecision(hmem, decision);
    decisions.push(decision);
  }
  return { intake: bundle, decisions };
}

export function writeDecisions(filePath: string, decisions: DecisionRecord[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(decisions, null, 2) + "\n", "utf-8");
}
