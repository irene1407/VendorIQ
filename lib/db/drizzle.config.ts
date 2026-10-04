import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: [
  "./src/schema/suppliers.ts",
  "./src/schema/contracts.ts",
  "./src/schema/alerts.ts",
  ],
    
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});