import { isSampleMode } from "./sample-mode.ts";
import type { AupClass, CriticResult, ProxyDnsLogRow, RetrievedHit, SaasApp, Verdict } from "./types.ts";

function hostMatches(destination: string, suffix: string): boolean {
  const dest = destination.toLowerCase();
  const s = suffix.toLowerCase();
  return dest === s || dest.endsWith(`.${s}`);
}

export function findInventory(row: ProxyDnsLogRow, inventory: SaasApp[]): SaasApp | undefined {
  return inventory.find(
    (app) =>
      app.domains.some((d) => hostMatches(row.destination, d)) ||
      app.name.toLowerCase() === row.app.toLowerCase()
  );
}

export function findAupClass(row: ProxyDnsLogRow, classes: AupClass[]): AupClass | undefined {
  return classes.find(
    (cls) =>
      cls.hostSuffixes.some((s) => hostMatches(row.destination, s)) ||
      cls.apps.some((a) => a.toLowerCase() === row.app.toLowerCase())
  );
}

function pastVerdictHint(hits: RetrievedHit[], row: ProxyDnsLogRow): Verdict | undefined {
  const dest = row.destination.toLowerCase();
  const app = row.app.toLowerCase();
  for (const hit of hits) {
    const text = hit.content.toLowerCase();
    if (!text.includes(dest) && !text.includes(app)) continue;
    if (/\bnever allow\b|\bblock\b|\bprohibited\b/.test(text)) return "block";
    if (/\breview\b/.test(text)) return "review";
    if (/\ballow\b/.test(text)) return "allow";
  }
  return undefined;
}

function severity(v: Verdict): number {
  return v === "block" ? 2 : v === "review" ? 1 : 0;
}

function stricter(a: Verdict, b: Verdict): Verdict {
  return severity(a) >= severity(b) ? a : b;
}

/**
 * Deterministic AUP critic. SAMPLE_MODE (and the default path) never calls an LLM.
 */
export function critic(
  row: ProxyDnsLogRow,
  inventory: SaasApp[],
  classes: AupClass[],
  retrieved: RetrievedHit[]
): CriticResult {
  const sampleMode = isSampleMode();
  const reasons: string[] = [];
  let verdict: Verdict = "review";

  const aup = findAupClass(row, classes);
  if (aup) {
    verdict = aup.defaultVerdict;
    reasons.push(`AUP class ${aup.id}: ${aup.reason}`);
  } else {
    reasons.push("No AUP class matched; defaulting toward review");
  }

  const app = findInventory(row, inventory);
  if (app) {
    reasons.push(`SaaS inventory ${app.name} status=${app.status}`);
    if (app.status === "prohibited") verdict = "block";
    else if (app.status === "unsanctioned") verdict = stricter(verdict, "review");
    else if (app.status === "sanctioned" && verdict !== "block") {
      verdict = aup?.defaultVerdict === "allow" ? "allow" : verdict;
    }
  } else {
    reasons.push("Destination not in sanctioned SaaS inventory (possible shadow-AI)");
    if (verdict === "allow") verdict = "review";
  }

  const hint = pastVerdictHint(retrieved, row);
  if (hint) {
    reasons.push(`H-MEM prior decision hint=${hint} from ${retrieved.map((h) => h.memoryId).join(", ") || "none"}`);
    verdict = stricter(verdict, hint);
  } else if (retrieved.length === 0) {
    reasons.push("No similar H-MEM decisions retrieved");
  }

  return {
    verdict,
    reasons,
    aupClassId: aup?.id,
    inventoryName: app?.name,
    inventoryStatus: app?.status,
    sampleMode,
  };
}
