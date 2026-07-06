import { Router } from "express";

const router = Router();

const CONTRACTS = [
  { id: "c-001", supplierId: "s-002", supplierName: "Samsung Electronics", title: "PCB Assembly Master Supply Agreement", status: "active", value: 45_000_000, expiresAt: "2026-01-15T00:00:00.000Z", riskScore: 22.1, clauseCount: 34, riskyClauseCount: 2 },
  { id: "c-002", supplierId: "s-003", supplierName: "Foxconn", title: "Contract Manufacturing Agreement FY2025", status: "under_review", value: 128_000_000, expiresAt: "2025-12-31T00:00:00.000Z", riskScore: 67.4, clauseCount: 51, riskyClauseCount: 9 },
  { id: "c-003", supplierId: "s-001", supplierName: "Siemens AG", title: "Industrial Automation Services SLA", status: "active", value: 18_500_000, expiresAt: "2026-06-30T00:00:00.000Z", riskScore: 14.8, clauseCount: 28, riskyClauseCount: 0 },
  { id: "c-004", supplierId: "s-004", supplierName: "BASF SE", title: "Chemical Supplies Framework Agreement", status: "expiring", value: 31_200_000, expiresAt: "2025-10-01T00:00:00.000Z", riskScore: 28.3, clauseCount: 42, riskyClauseCount: 3 },
  { id: "c-005", supplierId: "s-013", supplierName: "Vale SA", title: "Iron Ore Offtake Agreement 2024-2027", status: "active", value: 89_400_000, expiresAt: "2027-03-31T00:00:00.000Z", riskScore: 58.7, clauseCount: 38, riskyClauseCount: 6 },
  { id: "c-006", supplierId: "s-008", supplierName: "Infosys", title: "IT Managed Services Agreement", status: "active", value: 12_800_000, expiresAt: "2026-09-30T00:00:00.000Z", riskScore: 11.2, clauseCount: 24, riskyClauseCount: 1 },
  { id: "c-007", supplierId: "s-010", supplierName: "DHL Supply Chain", title: "Logistics Services Master Contract", status: "expiring", value: 22_100_000, expiresAt: "2025-11-15T00:00:00.000Z", riskScore: 19.4, clauseCount: 31, riskyClauseCount: 2 },
  { id: "c-008", supplierId: "s-014", supplierName: "Alibaba Cloud", title: "Cloud Infrastructure Services Agreement", status: "active", value: 8_600_000, expiresAt: "2026-03-31T00:00:00.000Z", riskScore: 52.1, clauseCount: 19, riskyClauseCount: 4 },
];

const CLAUSES_BY_CONTRACT: Record<string, object[]> = {
  "c-002": [
    { id: "cl-1", clauseType: "Limitation of Liability", text: "Supplier's total liability under this agreement shall not exceed the amounts paid in the preceding 30-day period.", riskLevel: "high", explanation: "30-day cap is dangerously low for a ₹1,062Cr manufacturing contract. Standard is 12-month contract value.", recommendation: "Negotiate minimum 12-month aggregate cap or include carve-outs for IP indemnification." },
    { id: "cl-2", clauseType: "Force Majeure", text: "Supplier may suspend performance for any event beyond its reasonable control, including government actions, without liability.", riskLevel: "high", explanation: "Overly broad language. 'Government actions' could include regulatory actions against Foxconn, allowing exit without penalty.", recommendation: "Define qualifying events exhaustively. Require mitigation obligations." },
    { id: "cl-3", clauseType: "Intellectual Property", text: "All tooling, processes, and manufacturing know-how developed under this agreement remain the property of Supplier.", riskLevel: "high", explanation: "Customer-funded tooling should belong to customer. This clause creates supplier lock-in.", recommendation: "Require assignment of customer-funded IP. Escrow tooling specifications." },
    { id: "cl-4", clauseType: "Termination for Convenience", text: "Either party may terminate this agreement upon 180 days' written notice.", riskLevel: "medium", explanation: "6-month notice period for customer is reasonable, but supplier termination on same terms creates supply risk.", recommendation: "Extend supplier termination notice to 12 months. Include transition assistance obligations." },
    { id: "cl-5", clauseType: "Price Adjustment", text: "Prices may be adjusted quarterly based on published commodity indices.", riskLevel: "medium", explanation: "No cap on price adjustments. Open-ended commodity pass-through without ceiling.", recommendation: "Add annual adjustment cap of 5-8%. Include reference to specific indices (LME, PPI)." },
  ],
};

router.get("/contracts", (req, res) => {
  let contracts = [...CONTRACTS];
  const { supplierId, status } = req.query;
  if (supplierId) contracts = contracts.filter(c => c.supplierId === supplierId);
  if (status) contracts = contracts.filter(c => c.status === status);
  res.json(contracts);
});

router.post("/contracts", (req, res) => {
  const { supplierId, title, content, value, expiresAt } = req.body;
  const newContract = {
    id: `c-${Date.now()}`,
    supplierId,
    supplierName: "New Supplier",
    title,
    status: "under_review",
    value: value ?? 0,
    expiresAt: expiresAt ?? new Date(Date.now() + 365 * 86400000).toISOString(),
    summary: "AI analysis complete. Contract contains standard procurement terms with 3 clauses flagged for review.",
    riskScore: 38.2,
    missingClauses: ["Cybersecurity Requirements", "ESG Compliance", "Audit Rights"],
    complianceIssues: ["Limitation of liability below company policy minimum", "No data residency requirements specified"],
    clauseCount: 28,
    riskyClauseCount: 3,
  };
  res.status(201).json(newContract);
});

router.get("/contracts/:id", (req, res) => {
  const contract = CONTRACTS.find(c => c.id === req.params.id) ?? CONTRACTS[1];
  res.json({
    ...contract,
    summary: "This manufacturing agreement covers high-volume assembly services with quarterly price adjustment provisions. Several clauses present elevated risk: the liability cap, force majeure scope, and IP ownership provisions warrant negotiation before renewal.",
    missingClauses: ["Cybersecurity Incident Notification", "Modern Slavery Act Compliance", "Business Continuity Requirements"],
    complianceIssues: ["Liability cap below ₹4.2Cr policy floor", "No audit rights clause", "Personal Data Protection Bill addendum absent"],
  });
});

router.get("/contracts/:id/clauses", (req, res) => {
  const clauses = CLAUSES_BY_CONTRACT[req.params.id] ?? CLAUSES_BY_CONTRACT["c-002"];
  res.json(clauses);
});

export default router;
