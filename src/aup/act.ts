import type { CriticResult, DecisionRecord, ProxyDnsLogRow, RetrievedHit } from "./types.ts";

let seq = 0;

export function act(row: ProxyDnsLogRow, criticResult: CriticResult, retrieved: RetrievedHit[]): DecisionRecord {
  return {
    id: `dec-${++seq}`,
    timestamp: new Date().toISOString(),
    verdict: criticResult.verdict,
    reasons: criticResult.reasons,
    log: row,
    aupClassId: criticResult.aupClassId,
    inventoryName: criticResult.inventoryName,
    inventoryStatus: criticResult.inventoryStatus,
    retrievedMemoryIds: retrieved.map((h) => h.memoryId),
    minedMemoryIds: [],
    sampleMode: criticResult.sampleMode,
  };
}

export function resetActSeq(): void {
  seq = 0;
}
