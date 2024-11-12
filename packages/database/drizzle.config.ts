import { defineConfig } from "drizzle-kit"

const DB_URL = process.env.DATABASE_URL!
const DB_CA = process.env.DATABASE_CA
console.log(DB_CA)

export default defineConfig({
  dbCredentials: {
    url: DB_URL,
    ssl: DB_CA ? { rejectUnauthorized: true, ca: DB_CA } : undefined,
  },
  dialect: "postgresql",
  schema: "./src/schema.ts",
})
