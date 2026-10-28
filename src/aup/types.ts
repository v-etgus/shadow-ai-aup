export type Verdict = "allow" | "review" | "block";
export type InventoryStatus = "sanctioned" | "unsanctioned" | "prohibited";

export interface ProxyDnsLogRow {
  id: string;
  timestamp: string;
  user: string;
  srcIp: string;
  destination: string;
  queryType: string;
  method: string;
  app: string;
  bytes: number;
  notes?: string;
}

export interface SaasApp {
  name: string;
  domains: string[];
  status: InventoryStatus;
  category: string;
  owner?: string;
}

export interface AupClass {
  id: string;
  defaultVerdict: Verdict;
  hostSuffixes: string[];
  apps: string[];
  reason: string;
}

export interface RetrievedHit {
  memoryId: string;
  relevance: number;
  content: string;
}

export interface CriticResult {
  verdict: Verdict;
  reasons: string[];
  aupClassId?: string;
  inventoryName?: string;
  inventoryStatus?: InventoryStatus;
  sampleMode: boolean;
}

export interface DecisionRecord {
  id: string;
  timestamp: string;
  verdict: Verdict;
  reasons: string[];
  log: ProxyDnsLogRow;
  aupClassId?: string;
  inventoryName?: string;
  inventoryStatus?: InventoryStatus;
  retrievedMemoryIds: string[];
  minedMemoryIds: string[];
  sampleMode: boolean;
}

export interface IntakeBundle {
  logs: ProxyDnsLogRow[];
  inventory: SaasApp[];
  aupClasses: AupClass[];
  priorDecisions: string[];
  sourceDir: string;
}
