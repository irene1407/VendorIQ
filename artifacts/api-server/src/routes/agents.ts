import { Router } from "express";

const router = Router();

router.get("/agents/status", (_req, res) => {
  const now = new Date().toISOString();
  res.json([
    { id: "agent-risk", name: "Risk Analyst", type: "risk_analyst", status: "idle", lastRun: new Date(Date.now() - 3600000).toISOString(), tasksCompleted: 2841, currentTask: null, avgResponseMs: 42 },
    { id: "agent-price", name: "Price Forecaster", type: "price_forecaster", status: "running", lastRun: now, tasksCompleted: 428, currentTask: "Updating lithium carbonate 90-day forecast", avgResponseMs: 187 },
    { id: "agent-contract", name: "Contract Analyst", type: "contract_analyst", status: "idle", lastRun: new Date(Date.now() - 7200000).toISOString(), tasksCompleted: 73, currentTask: null, avgResponseMs: 1840 },
    { id: "agent-fraud", name: "Fraud Investigator", type: "fraud_investigator", status: "running", lastRun: now, tasksCompleted: 5219, currentTask: "Analyzing bid pattern for RFP-2024-441", avgResponseMs: 28 },
    { id: "agent-copilot", name: "Procurement Copilot", type: "procurement_copilot", status: "idle", lastRun: new Date(Date.now() - 1800000).toISOString(), tasksCompleted: 847, currentTask: null, avgResponseMs: 680 },
  ]);
});

const CANNED_RESPONSES: Record<string, string> = {
  default: "Based on current procurement data, I've analysed your query across 342 active suppliers. Here are my findings:",
  risk: "Our Risk Analyst has scored this supplier at 78.4/100 (High). The primary drivers are payment delays (SHAP: +18.4) and geopolitical concentration in high-risk regions (+14.2). I recommend reviewing the contract and qualifying alternative sources.",
  supplier: "I found 12 suppliers matching your criteria. The top performers by on-time delivery rate are: Siemens AG (98.1%), Infosys (97.3%), and DHL Supply Chain (96.8%). All three are in the low-risk tier.",
  fraud: "No active fraud investigations match this query. However, I've flagged 2 suppliers in this category that warrant monitoring: Global Procurement Partners (shell company indicators) and Meridian Supplies (duplicate invoice pattern).",
  contract: "I've identified 12 contracts expiring in the next 90 days with a combined value of ₹2,357Cr. The highest-priority renewal is the Samsung Electronics MSA (₹373Cr) expiring Jan 2026. Shall I draft a renewal recommendation?",
  savings: "Based on your current supplier portfolio, our models project ₹197Cr in savings this year: ₹69.7Cr from risk-based supplier switching, ₹35.7Cr from fraud prevention, and ₹92Cr from process automation.",
};

function selectResponse(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("risk") || m.includes("score")) return CANNED_RESPONSES.risk;
  if (m.includes("supplier") || m.includes("deliver") || m.includes("late")) return CANNED_RESPONSES.supplier;
  if (m.includes("fraud") || m.includes("suspicious")) return CANNED_RESPONSES.fraud;
  if (m.includes("contract") || m.includes("expir")) return CANNED_RESPONSES.contract;
  if (m.includes("savings") || m.includes("cost") || m.includes("money")) return CANNED_RESPONSES.savings;
  return CANNED_RESPONSES.default;
}

// In-memory agent state (resets on server restart — fine for a demo)
const agentState: Record<string, { status: "idle" | "running" | "error"; currentTask: string | null; tasksCompleted: number }> = {
  "agent-risk":     { status: "idle",    currentTask: null, tasksCompleted: 2841 },
  "agent-price":    { status: "running", currentTask: "Updating lithium carbonate 90-day forecast", tasksCompleted: 428 },
  "agent-contract": { status: "idle",    currentTask: null, tasksCompleted: 73 },
  "agent-fraud":    { status: "running", currentTask: "Analyzing bid pattern for RFP-2024-441", tasksCompleted: 5219 },
  "agent-copilot":  { status: "idle",    currentTask: null, tasksCompleted: 847 },
};

const AGENT_TASKS: Record<string, string[]> = {
  "agent-risk":     ["Re-scoring supplier portfolio against latest ESG indices", "Running geopolitical concentration check for APAC suppliers", "Updating SHAP explainability report for top-10 high-risk vendors"],
  "agent-price":    ["Updating lithium carbonate 90-day forecast", "Fetching LME spot prices for copper and aluminum", "Retraining price model with last 30 days of actuals"],
  "agent-contract": ["Scanning 47 contracts for PDPB compliance gaps", "Flagging auto-renewal clauses expiring within 90 days", "Extracting SLA penalty terms from new MSA batch"],
  "agent-fraud":    ["Analyzing bid pattern for RFP-2024-441", "Cross-referencing vendor bank accounts against shell-company registry", "Running duplicate-invoice check on last 60 days of AP data"],
  "agent-copilot":  ["Syncing context from latest risk and fraud reports", "Pre-computing supplier Q&A embeddings", "Updating market intelligence digest"],
};

router.post("/agents/:agentId/run", (req, res) => {
  const { agentId } = req.params;
  const state = agentState[agentId];
  if (!state) return res.status(404).json({ error: "Agent not found" });

  // Pick a random task for this agent type
  const tasks = AGENT_TASKS[agentId] ?? ["Processing tasks..."];
  const task = tasks[Math.floor(Math.random() * tasks.length)];

  // Mark as running immediately
  state.status = "running";
  state.currentTask = task;

  // Simulate completion after 8–15 seconds
  const delay = 8000 + Math.floor(Math.random() * 7000);
  setTimeout(() => {
    state.status = "idle";
    state.currentTask = null;
    state.tasksCompleted += 1;
  }, delay);

  const baseAgents = [
    { id: "agent-risk",     name: "Risk Analyst",         type: "risk_analyst",         lastRun: new Date().toISOString(), avgResponseMs: 42 },
    { id: "agent-price",    name: "Price Forecaster",      type: "price_forecaster",     lastRun: new Date().toISOString(), avgResponseMs: 187 },
    { id: "agent-contract", name: "Contract Analyst",      type: "contract_analyst",     lastRun: new Date().toISOString(), avgResponseMs: 1840 },
    { id: "agent-fraud",    name: "Fraud Investigator",    type: "fraud_investigator",   lastRun: new Date().toISOString(), avgResponseMs: 28 },
    { id: "agent-copilot",  name: "Procurement Copilot",   type: "procurement_copilot",  lastRun: new Date().toISOString(), avgResponseMs: 680 },
  ];
  const base = baseAgents.find(a => a.id === agentId)!;
  return res.json({ ...base, ...state });
});

router.post("/agents/query", (req, res) => {
  const { message, agentType } = req.body as { message: string; agentType?: string };
  const type = agentType ?? "procurement_copilot";
  const responseText = selectResponse(message);

  res.json({
    agentType: type,
    message: responseText,
    confidence: 0.87 + Math.random() * 0.1,
    sources: ["Supplier Risk Database", "MLflow Model Registry", "Contract Intelligence Engine", "News Intelligence Feed"],
    actions: [
      { label: "View full risk report", type: "navigate", payload: { path: "/risk" } },
      { label: "Export to PDF", type: "export", payload: { format: "pdf" } },
    ],
  });
});

export default router;
