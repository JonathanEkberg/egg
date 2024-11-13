import { drizzle as drizzzle } from "drizzle-orm/node-postgres"
// import { drizzle as drizzzle } from "drizzle-orm/postgres-js"
import { Client, Pool } from "pg"
// import postgres from "postgres"
import * as schema from "./schema"

const DB_URL = process.env.DATABASE_URL!
// const DB_CA = process.env.DATABASE_CA!

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// })

// export const db = drizzzle(pool, { logger: true, schema })

// console.log(DB_CA)

function makeDb() {
  if (!DB_URL) {
    throw new Error("Missing postgres database url in env")
  }

  return drizzzle({
    // client: new Client(DB_URL!, {}),
    connection: {
      connectionString: DB_URL,
      // ssl: DB_CA ? { rejectUnauthorized: true, ca: DB_CA } : undefined,
    },
    schema,
    // logger: {
    //   logQuery(query, params) {
    //     console.log(query, params)
    //   },
    // },
  })
}

declare global {
  var drizzle: ReturnType<typeof makeDb>
}

const db = global.drizzle || makeDb()

if (process.env.NODE_ENV !== "production") {
  global.drizzle = db
}

export { db }
export * from "./schema"
