import { drizzle as drizzzle } from "drizzle-orm/node-postgres"
// import { drizzle as drizzzle } from "drizzle-orm/postgres-js"
// import postgres from "postgres"
import * as schema from "./schema"

const DB_URL = process.env.DATABASE_URL!
const DB_CA = process.env.DATABASE_CA!

console.log(DB_CA)

// const queryClient = postgres(DB_URL!)

function makeDb() {
  // if (!DB_URL) {
  //   throw new Error("Missing postgres database url in env")
  // }

  return drizzzle({
    // client: queryClient,
    connection: {
      connectionString: DB_URL,
      ssl: DB_CA ? { rejectUnauthorized: true, ca: DB_CA } : undefined,
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
