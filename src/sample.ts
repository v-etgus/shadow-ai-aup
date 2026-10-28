// SAMPLE_MODE: synthetic Shadow-AI / AUP case (rule critic + H-MEM).
// Offline when Nightshift is down. When METERLESS_* is set and Runtime is
// online, one chat/completions proves Nightshift→Nemotron for the demo.

process.env.SAMPLE_MODE = process.env.SAMPLE_MODE ?? "1";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadHMEM } from "./engine.ts";
import { runPipeline, writeDecisions } from "./aup/pipeline.ts";
import type { Verdict } from "./aup/types.ts";
import { meterlessChat, meterlessHealth } from "./meterless.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const REQUIRED: Verdict[] = ["allow", "review", "block"];

async function nightshiftBeat(): Promise<{ status: string; model?: string }> {
  if (!process.env.METERLESS_RUNTIME_TOKEN || process.env.METERLESS_RUNTIME_TOKEN === "rt-local") {
    return { status: "skipped" };
  }
  try {
    const h = await meterlessHealth();
    if (h !== "online") return { status: h };
    const block = (await import("./aup/types.ts"), null);
    void block;
    const r = await meterlessChat(
      "One sentence: confirm Shadow-AI AUP demo Nightshift path is live."
    );
    return { status: "ok", model: r.model };
  } catch (err) {
    return { status: `error:${(err as Error).message}` };
  }
}

async function main(): Promise<void> {
  process.env.SAMPLE_MODE = "1";
  delete process.env.ANTHROPIC_API_KEY;
  const { HMEM, source } = await loadHMEM();

  const persistDir = path.join(root, ".notebook", "sample");
  const hmem = new HMEM({ persistDir, actor: "aup-enforcer" });
  const { intake, decisions } = await runPipeline(hmem, root);

  const outFile = path.join(persistDir, "decisions.json");
  writeDecisions(outFile, decisions);

  const seen = new Set(decisions.map((d) => d.verdict));
  const missing = REQUIRED.filter((v) => !seen.has(v));

  for (const d of decisions) {
    console.log(
      `${d.id} ${d.verdict.padEnd(6)} ${d.log.destination}  reasons=${d.reasons.length} mined=${d.minedMemoryIds.join(",") || "-"}`
    );
  }
  console.log(`intake: ${intake.logs.length} logs from ${intake.sourceDir}`);
  console.log(`wrote ${decisions.length} decision records -> ${outFile}`);

  if (missing.length > 0) {
    console.error(`SAMPLE assertion failed: missing verdicts: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log("SAMPLE assertion passed: allow, review, and block each appeared at least once.");

  const ns = await nightshiftBeat();
  const modelBit = ns.model ? ` | model=${ns.model}` : "";
  console.log(`SAMPLE_MODE=${process.env.SAMPLE_MODE} | engine=${source} | llm=off | nightshift=${ns.status}${modelBit}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});