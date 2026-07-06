import { pgTable, text, real, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractStatusEnum = pgEnum("contract_status", ["active", "expiring", "expired", "under_review"]);
export const clauseRiskEnum = pgEnum("clause_risk", ["low", "medium", "high"]);

export const contractsTable = pgTable("contracts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  supplierId: text("supplier_id").notNull(),
  supplierName: text("supplier_name").notNull(),
  title: text("title").notNull(),
  status: contractStatusEnum("status").notNull().default("active"),
  value: real("value").notNull().default(0),
  content: text("content"),
  summary: text("summary"),
  riskScore: real("risk_score"),
  clauseCount: integer("clause_count"),
  riskyClauseCount: integer("risky_clause_count"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contractClausesTable = pgTable("contract_clauses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  contractId: text("contract_id").notNull(),
  clauseType: text("clause_type").notNull(),
  text: text("text").notNull(),
  riskLevel: clauseRiskEnum("risk_level").notNull().default("low"),
  explanation: text("explanation").notNull(),
  recommendation: text("recommendation"),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
export type ContractClause = typeof contractClausesTable.$inferSelect;
