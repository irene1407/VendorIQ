import { Router } from "express";
import { db } from "@workspace/db";
import { suppliersTable } from "@workspace/db";
import { eq, ilike, and, type SQL } from "drizzle-orm";

const router = Router();

router.get("/suppliers", async (req, res) => {
  const { page = "1", limit = "20", country, riskLevel, category, q } = req.query as Record<string, string>;

  const conditions: SQL[] = [];
  if (country) conditions.push(eq(suppliersTable.country, country));
  if (riskLevel) conditions.push(eq(suppliersTable.riskLevel, riskLevel as "low" | "medium" | "high" | "critical"));
  if (category) conditions.push(eq(suppliersTable.category, category));
  if (q) conditions.push(ilike(suppliersTable.name, `%${q}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [allRows, countResult] = await Promise.all([
    db.select().from(suppliersTable).where(whereClause)
      .limit(Number(limit)).offset((Number(page) - 1) * Number(limit)),
    db.select().from(suppliersTable).where(whereClause),
  ]);

  res.json({
    items: allRows,
    total: countResult.length,
    page: Number(page),
    limit: Number(limit),
  });
});

router.post("/suppliers", async (req, res) => {
  const { name, country, category, website, contactEmail, lat, lon } = req.body;
  const [created] = await db.insert(suppliersTable).values({
    name, country, category,
    website: website ?? null,
    contactEmail: contactEmail ?? null,
    lat: lat ?? null,
    lon: lon ?? null,
  }).returning();
  res.status(201).json(created);
});

router.get("/suppliers/:id", async (req, res) => {
  const [supplier] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, req.params.id));
  if (!supplier) return res.status(404).json({ error: "Supplier not found" });
  res.json(supplier);
});

router.patch("/suppliers/:id", async (req, res) => {
  const { name, country, category, website, contactEmail, status } = req.body;
  const update: Partial<typeof suppliersTable.$inferInsert> = {};
  if (name !== undefined) update.name = name;
  if (country !== undefined) update.country = country;
  if (category !== undefined) update.category = category;
  if (website !== undefined) update.website = website;
  if (contactEmail !== undefined) update.contactEmail = contactEmail;
  if (status !== undefined) update.status = status;

  const [updated] = await db.update(suppliersTable).set(update).where(eq(suppliersTable.id, req.params.id)).returning();
  if (!updated) return res.status(404).json({ error: "Supplier not found" });
  res.json(updated);
});

router.delete("/suppliers/:id", async (req, res) => {
  await db.delete(suppliersTable).where(eq(suppliersTable.id, req.params.id));
  res.status(204).send();
});

router.get("/suppliers/:id/risk-history", (_req, res) => {
  const today = Date.now();
  const DAY = 86400000;
  const points = Array.from({ length: 90 }, (_, i) => {
    const daysAgo = 89 - i;
    const base = 45 + Math.sin(daysAgo * 0.12) * 20;
    const score = Math.min(100, Math.max(0, base + (Math.random() - 0.5) * 8));
    const rounded = Math.round(score * 10) / 10;
    let riskLevel = "low";
    if (rounded >= 75) riskLevel = "critical";
    else if (rounded >= 55) riskLevel = "high";
    else if (rounded >= 35) riskLevel = "medium";
    return { date: new Date(today - daysAgo * DAY).toISOString().split("T")[0], riskScore: rounded, riskLevel };
  });
  res.json(points);
});

export default router;
