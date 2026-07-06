import { Router } from "express";

const router = Router();

type AgentStatusValue = "idle" | "running" | "error";

interface AgentRecord {
  id: string;
  name: string;
  type: string;
  avgResponseMs: number;
  status: AgentStatusValue;
  currentTask: string | null;
  tasksCompleted: number;
  lastRun: string;
}

// Single in-memory source of truth for all agent state (resets on server restart — fine for a demo).
const AGENTS: Record<string, AgentRecord> = {
  "agent-risk": { id: "agent-risk", name: "Risk Analyst", type: "risk_analyst", avgResponseMs: 42, status: "idle", currentTask: null, tasksCompleted: 2841, lastRun: new Date(Date.now() - 3600000).toISOString() },
  "agent-price": { id: "agent-price", name: "Price Forecaster", type: "price_forecaster", avgResponseMs: 187, status: "running", currentTask: "Updating lithium carbonate 90-day forecast", tasksCompleted: 428, lastRun: new Date().toISOString() },
  "agent-contract": { id: "agent-contract", name: "Contract Analyst", type: "contract_analyst", avgResponseMs: 1840, status: "idle", currentTask: null, tasksCompleted: 73, lastRun: new Date(Date.now() - 7200000).toISOString() },
  "agent-fraud": { id: "agent-fraud", name: "Fraud Investigator", type: "fraud_investigator", avgResponseMs: 28, status: "running", currentTask: "Analyzing bid pattern for RFP-2024-441", tasksCompleted: 5219, lastRun: new Date().toISOString() },
  "agent-copilot": { id: "agent-copilot", name: "Procurement Copilot", type: "procurement_copilot", avgResponseMs: 680, status: "idle", currentTask: null, tasksCompleted: 847, lastRun: new Date(Date.now() - 1800000).toISOString() },
};

router.get("/agents/status", (_req, res) => {
  res.json(Object.values(AGENTS));
});

const CANNED_RESPONSES: Record<string, string> = {
  default: "Based on current procurement data, I've analysed your query across 342 active suppliers. Here's what stands out: spend is trending 3.2% below last year (₹84.7Cr YTD), 18 entities are flagged high-risk and need review, and our models project ₹2.4Cr in additional savings this quarter. Ask me about a specific supplier, risk factor, contract, or market trend for more detail.",
  risk: "Our Risk Analyst has scored this supplier at 78.4/100 (High). The primary drivers are payment delays (SHAP: +18.4) and geopolitical concentration in high-risk regions (+14.2). I recommend reviewing the contract and qualifying alternative sources.",
  supplier: "I found 12 suppliers matching your criteria. The top performers by on-time delivery rate are: Siemens AG (98.1%), Infosys (97.3%), and DHL Supply Chain (96.8%). All three are in the low-risk tier.",
  fraud: "No active fraud investigations match this query. However, I've flagged 2 suppliers in this category that warrant monitoring: Global Procurement Partners (shell company indicators) and Meridian Supplies (duplicate invoice pattern).",
  contract: "I've identified 12 contracts expiring in the next 90 days with a combined value of ₹2,357Cr. The highest-priority renewal is the Samsung Electronics MSA (₹373Cr) expiring Jan 2026. Shall I draft a renewal recommendation?",
  savings: "Based on your current supplier portfolio, our models project ₹197Cr in savings this year: ₹69.7Cr from risk-based supplier switching, ₹35.7Cr from fraud prevention, and ₹92Cr from process automation.",
  forecast: "Lithium carbonate prices are forecast to rise 12.4% over the next 90 days, driven by supply constraints in the APAC region. Copper and aluminum remain range-bound. I recommend locking in forward contracts for lithium-dependent categories before the projected spike in week 6.",
  news: "In the last 30 days, sentiment across your supplier base is 68% neutral, 21% positive, and 11% negative. The most notable negative event was a labor dispute at a Foxconn facility, which may affect electronics component lead times.",
  graph: "Your procurement knowledge graph currently tracks 342 suppliers, 1,204 contracts, and 87 commodity nodes. The most connected entity is Samsung Electronics, linked to 14 active contracts and 6 risk alerts.",
  simulate: "Running that scenario against current data: switching 15% of high-risk APAC suppliers to alternative low-risk vendors would reduce portfolio risk exposure by an estimated 22% while adding ₹4.1Cr in one-time transition costs.",
  greeting: "Hello! I'm your Procurement Copilot, connected to all supplier, risk, contract, and market data. Try asking me about supplier risk, expiring contracts, fraud alerts, price forecasts, or potential savings.",
};

function selectResponse(message: string): string {
  const m = message.toLowerCase();
  if (/^(hi|hey|hello|yo)\b/.test(m.trim())) return CANNED_RESPONSES.greeting;
  if (m.includes("risk") || m.includes("score")) return CANNED_RESPONSES.risk;
  if (m.includes("fraud") || m.includes("suspicious")) return CANNED_RESPONSES.fraud;
  if (m.includes("contract") || m.includes("expir")) return CANNED_RESPONSES.contract;
  if (m.includes("savings") || m.includes("cost") || m.includes("money") || m.includes("save")) return CANNED_RESPONSES.savings;
  if (m.includes("forecast") || m.includes("price") || m.includes("commodity") || m.includes("lithium") || m.includes("aluminum") || m.includes("copper")) return CANNED_RESPONSES.forecast;
  if (m.includes("news") || m.includes("sentiment") || m.includes("event")) return CANNED_RESPONSES.news;
  if (m.includes("graph") || m.includes("network") || m.includes("connect")) return CANNED_RESPONSES.graph;
  if (m.includes("simulat") || m.includes("what if") || m.includes("what-if") || m.includes("scenario")) return CANNED_RESPONSES.simulate;
  if (m.includes("supplier") || m.includes("deliver") || m.includes("late") || m.includes("vendor")) return CANNED_RESPONSES.supplier;
  return CANNED_RESPONSES.default;
}

const AGENT_TASKS: Record<string, string[]> = {
  "agent-risk":     ["Re-scoring supplier portfolio against latest ESG indices", "Running geopolitical concentration check for APAC suppliers", "Updating SHAP explainability report for top-10 high-risk vendors"],
  "agent-price":    ["Updating lithium carbonate 90-day forecast", "Fetching LME spot prices for copper and aluminum", "Retraining price model with last 30 days of actuals"],
  "agent-contract": ["Scanning 47 contracts for PDPB compliance gaps", "Flagging auto-renewal clauses expiring within 90 days", "Extracting SLA penalty terms from new MSA batch"],
  "agent-fraud":    ["Analyzing bid pattern for RFP-2024-441", "Cross-referencing vendor bank accounts against shell-company registry", "Running duplicate-invoice check on last 60 days of AP data"],
  "agent-copilot":  ["Syncing context from latest risk and fraud reports", "Pre-computing supplier Q&A embeddings", "Updating market intelligence digest"],
};

router.post("/agents/:agentId/run", (req, res) => {
  const { agentId } = req.params;
  const agent = AGENTS[agentId];
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  // Pick a random task for this agent type
  const tasks = AGENT_TASKS[agentId] ?? ["Processing tasks..."];
  const task = tasks[Math.floor(Math.random() * tasks.length)];

  // Mark as running immediately — this mutates the same AGENTS record read by GET /agents/status,
  // so polling clients see the running state consistently until the timeout below flips it back.
  agent.status = "running";
  agent.currentTask = task;
  agent.lastRun = new Date().toISOString();

  // Simulate completion after 8–15 seconds
  const delay = 8000 + Math.floor(Math.random() * 7000);
  setTimeout(() => {
    agent.status = "idle";
    agent.currentTask = null;
    agent.tasksCompleted += 1;
  }, delay);

  return res.json({ ...agent });
});

const FOLLOW_UP_HINTS = ["more", "elaborate", "explain", "why", "detail", "go on", "continue", "and", "also", "what about", "that one", "it"];

router.post("/agents/query", (req, res) => {
  const { message, agentType, context } = req.body as {
    message: string;
    agentType?: string;
    context?: { history?: { role: "user" | "agent"; content: string }[] };
  };
  const type = agentType ?? "procurement_copilot";

  const history = context?.history ?? [];
  const lastAgentTurn = [...history].reverse().find((h) => h.role === "agent");
  const isFollowUp =
    history.length > 0 &&
    FOLLOW_UP_HINTS.some((hint) => message.toLowerCase().includes(hint)) &&
    message.trim().split(/\s+/).length <= 6;

  let responseText = selectResponse(message);
  if (isFollowUp && lastAgentTurn) {
    responseText = `Following up on that — ${responseText.charAt(0).toLowerCase()}${responseText.slice(1)}`;
  }

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
