import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AupClass, IntakeBundle, ProxyDnsLogRow, SaasApp } from "./types.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "..", "..");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function firstExistingDir(candidates: string[]): string {
  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
  }
  throw new Error(`No fixture directory found. Looked in: ${candidates.join(", ")}`);
}

export function intake(rootDir: string = ROOT): IntakeBundle {
  const sourceDir = firstExistingDir([
    path.join(rootDir, "fixtures"),
    path.join(rootDir, "data"),
  ]);

  const logs = readJson<ProxyDnsLogRow[]>(path.join(sourceDir, "proxy-dns-logs.json"));
  const inventory = readJson<SaasApp[]>(path.join(sourceDir, "saas-inventory.json"));
  const aupClasses = readJson<AupClass[]>(path.join(sourceDir, "aup-classes.json"));

  const priorPath = path.join(sourceDir, "prior-decisions.json");
  const priorDecisions = fs.existsSync(priorPath) ? readJson<string[]>(priorPath) : [];

  if (!Array.isArray(logs) || logs.length === 0) {
    throw new Error("intake: proxy/DNS logs fixture is empty");
  }
  if (!Array.isArray(inventory)) {
    throw new Error("intake: SaaS inventory fixture missing");
  }
  if (!Array.isArray(aupClasses) || aupClasses.length === 0) {
    throw new Error("intake: AUP classes fixture is empty");
  }

  return { logs, inventory, aupClasses, priorDecisions, sourceDir };
}
