export type AgentStatusValue = "idle" | "running" | "error";

export interface AgentRecord {
  id: string;
  name: string;
  type: string;
  avgResponseMs: number;
  status: AgentStatusValue;
  currentTask: string | null;
  tasksCompleted: number;
  lastRun: string;
}

// Single in-memory source of truth for all agent state, shared across routes
// (agents.ts mutates it on /run, dashboard.ts reads it for live activity).
// Resets on server restart — fine for a demo.
export const AGENTS: Record<string, AgentRecord> = {
  "agent-risk": { id: "agent-risk", name: "Risk Analyst", type: "risk_analyst", avgResponseMs: 42, status: "idle", currentTask: null, tasksCompleted: 2841, lastRun: new Date(Date.now() - 3600000).toISOString() },
  "agent-price": { id: "agent-price", name: "Price Forecaster", type: "price_forecaster", avgResponseMs: 187, status: "running", currentTask: "Updating lithium carbonate 90-day forecast", tasksCompleted: 428, lastRun: new Date().toISOString() },
  "agent-contract": { id: "agent-contract", name: "Contract Analyst", type: "contract_analyst", avgResponseMs: 1840, status: "idle", currentTask: null, tasksCompleted: 73, lastRun: new Date(Date.now() - 7200000).toISOString() },
  "agent-fraud": { id: "agent-fraud", name: "Fraud Investigator", type: "fraud_investigator", avgResponseMs: 28, status: "running", currentTask: "Analyzing bid pattern for RFP-2024-441", tasksCompleted: 5219, lastRun: new Date().toISOString() },
  "agent-copilot": { id: "agent-copilot", name: "Procurement Copilot", type: "procurement_copilot", avgResponseMs: 680, status: "idle", currentTask: null, tasksCompleted: 847, lastRun: new Date(Date.now() - 1800000).toISOString() },
};
