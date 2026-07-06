import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertTypeEnum = pgEnum("alert_type", [
  "high_risk_supplier", "contract_expiring", "price_spike",
  "drift_detected", "pipeline_failure", "negative_news", "fraud_detected",
]);
export const alertSeverityEnum = pgEnum("alert_severity", ["info", "warning", "error", "critical"]);

export const smartAlertsTable = pgTable("smart_alerts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: alertTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  supplierId: text("supplier_id"),
  supplierName: text("supplier_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  dismissedAt: timestamp("dismissed_at"),
});

export const insertAlertSchema = createInsertSchema(smartAlertsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type SmartAlert = typeof smartAlertsTable.$inferSelect;
