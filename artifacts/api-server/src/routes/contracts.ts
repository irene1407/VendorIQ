import { Router } from "express";
import { db } from "@workspace/db";
import {
  contractsTable,
  contractClausesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

const ML_API_URL =
  process.env.ML_API_URL ?? "http://127.0.0.1:8000";

type ContractAnalysis = {
  summary?: string;
  risk_score?: number;
  missing_clauses?: string[];
  compliance_issues?: string[];
  clauses?: {
    clause_type?: string;
    text?: string;
    risk_level?: "low" | "medium" | "high";
    explanation?: string;
    recommendation?: string;
  }[];
};

router.get("/contracts", async (req, res) => {
  try {
    const { supplierId, status } =
      req.query as Record<string, string | undefined>;

    const conditions = [];

    if (supplierId) {
      conditions.push(
        eq(contractsTable.supplierId, supplierId),
      );
    }

    if (status) {
      conditions.push(
        eq(
          contractsTable.status,
          status as
            | "active"
            | "expiring"
            | "expired"
            | "under_review",
        ),
      );
    }

    const contracts = await db
      .select()
      .from(contractsTable)
      .where(
        conditions.length > 0
          ? and(...conditions)
          : undefined,
      );

    res.json(contracts);
  } catch (error) {
    console.error(
      "Failed to fetch contracts:",
      error,
    );

    res.status(500).json({
      error: "Failed to fetch contracts.",
    });
  }
});

router.post("/contracts", async (req, res) => {
  try {
    const {
      supplierId,
      supplierName,
      title,
      content,
      value,
      expiresAt,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        error: "Contract title is required.",
      });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        error:
          "Contract content is required for AI analysis.",
      });
    }

    const mlResponse = await fetch(
      `${ML_API_URL}/analyze-contract`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: String(content),
        }),
      },
    );

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();

      console.error(
        "Contract NLP service error:",
        errorText,
      );

      return res.status(502).json({
        error: "Contract NLP service failed.",
      });
    }

    const analysis =
      (await mlResponse.json()) as ContractAnalysis;

    const clauses = Array.isArray(analysis.clauses)
      ? analysis.clauses
      : [];

    const missingClauses = Array.isArray(
      analysis.missing_clauses,
    )
      ? analysis.missing_clauses
      : [];

    const complianceIssues = Array.isArray(
      analysis.compliance_issues,
    )
      ? analysis.compliance_issues
      : [];

    const riskyClauseCount = clauses.filter(
      (clause) =>
        clause.risk_level === "high" ||
        clause.risk_level === "medium",
    ).length;

    const contractId = `c-${Date.now()}`;

    const resolvedSupplierName =
      supplierName || "New Supplier";

    const expiresAtValue =
      expiresAt
        ? new Date(expiresAt)
        : new Date(
            Date.now() + 365 * 86400000,
          );

    const [createdContract] = await db
      .insert(contractsTable)
      .values({
        id: contractId,
        supplierId:
          supplierId || "unknown",
        supplierName:
          resolvedSupplierName,
        title: String(title),
        status: "under_review",
        value:
          Number(value) || 0,
        content: String(content),
        summary:
          analysis.summary ?? "",
        missingClauses:
          JSON.stringify(missingClauses),
        complianceIssues:
          JSON.stringify(complianceIssues),
        riskScore:
          Number(analysis.risk_score) || 0,
        clauseCount:
          clauses.length,
        riskyClauseCount,
        expiresAt:
          expiresAtValue,
      })
      .returning();

    if (!createdContract) {
      return res.status(500).json({
        error:
          "Failed to save contract.",
      });
    }

    const clauseRows = clauses.map(
      (clause, index) => ({
        id: `${contractId}-cl-${index + 1}`,
        contractId,
        clauseType:
          clause.clause_type ??
          "Unclassified Clause",
        text:
          clause.text ?? "",
        riskLevel:
          clause.risk_level ?? "low",
        explanation:
          clause.explanation ?? "",
        recommendation:
          clause.recommendation ?? "",
      }),
    );

    let createdClauses: typeof contractClausesTable.$inferSelect[] =
      [];

    if (clauseRows.length > 0) {
      createdClauses = await db
        .insert(contractClausesTable)
        .values(clauseRows)
        .returning();
    }

    return res.status(201).json({
      ...createdContract,
      missingClauses,
      complianceIssues,
      clauses: createdClauses,
    });
  } catch (error) {
    console.error(
      "Contract creation failed:",
      error,
    );

    return res.status(500).json({
      error:
        "Contract AI analysis failed.",
    });
  }
});

router.get(
  "/contracts/:id",
  async (req, res) => {
    try {
      const [contract] = await db
        .select()
        .from(contractsTable)
        .where(
          eq(
            contractsTable.id,
            req.params.id,
          ),
        );

      if (!contract) {
        return res.status(404).json({
          error: "Contract not found.",
        });
      }

      const clauses = await db
        .select()
        .from(contractClausesTable)
        .where(
          eq(
            contractClausesTable.contractId,
            req.params.id,
          ),
        );

      let missingClauses: string[] = [];
      let complianceIssues: string[] = [];

      try {
        if (contract.missingClauses) {
          const parsed =
            JSON.parse(contract.missingClauses);

          if (Array.isArray(parsed)) {
            missingClauses = parsed;
          }
        }

        if (contract.complianceIssues) {
          const parsed =
            JSON.parse(
              contract.complianceIssues,
            );

          if (Array.isArray(parsed)) {
            complianceIssues = parsed;
          }
        }
      } catch (parseError) {
        console.error(
          "Failed to parse persisted contract analysis:",
          parseError,
        );
      }

      res.json({
        ...contract,
        missingClauses,
        complianceIssues,
        clauses,
      });
    } catch (error) {
      console.error(
        "Failed to fetch contract:",
        error,
      );

      res.status(500).json({
        error:
          "Failed to fetch contract.",
      });
    }
  },
);

router.get(
  "/contracts/:id/clauses",
  async (req, res) => {
    try {
      const clauses = await db
        .select()
        .from(contractClausesTable)
        .where(
          eq(
            contractClausesTable.contractId,
            req.params.id,
          ),
        );

      res.json(clauses);
    } catch (error) {
      console.error(
        "Failed to fetch contract clauses:",
        error,
      );

      res.status(500).json({
        error:
          "Failed to fetch contract clauses.",
      });
    }
  },
);

export default router;