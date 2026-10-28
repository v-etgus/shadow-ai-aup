import type { ProxyDnsLogRow, RetrievedHit } from "./types.ts";

export function retrieveQuery(row: ProxyDnsLogRow): string {
  return `AUP decision for destination ${row.destination} app ${row.app}`;
}

export function retrievePastDecisions(hmem: any, row: ProxyDnsLogRow): RetrievedHit[] {
  const result = hmem.query(retrieveQuery(row), { threshold: 0.08, topN: 5 });
  return result.memories.map((r: any) => ({
    memoryId: r.memory.id,
    relevance: r.relevance,
    content: r.memory.content,
  }));
}
