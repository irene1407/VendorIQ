import { pgTable, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high", "critical"]);
export const supplierStatusEnum = pgEnum("supplier_status", ["active", "inactive", "under_review"]);

export const suppliersTable = pgTable("suppliers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  country: text("country").notNull(),
  category: text("category").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull().default("low"),
  riskScore: real("risk_score").notNull().default(0),
  onTimeDelivery: real("on_time_delivery").notNull().default(1),
  spend: real("spend").notNull().default(0),
  status: supplierStatusEnum("status").notNull().default("active"),
  website: text("website"),
  contactEmail: text("contact_email"),
  lat: real("lat"),
  lon: real("lon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliersTable.$inferSelect;
