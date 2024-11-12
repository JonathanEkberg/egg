import { cache } from "react"
import { initTRPC } from "@trpc/server"
import { hashPassword } from "../password"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import SuperJSON from "superjson"
import { db, orderTable, userTable, UserRole } from "@egg/database"
import { sql, eq } from "@egg/database/drizzle"
import { cookies } from "next/headers"

const preparedFindUserById = db.query.userTable
  .findFirst({
    where: (user, { eq }) => eq(user.id, sql.placeholder("userId")),
    columns: { id: true, role: true, name: true, email: true },
  })
  .prepare("prepared_find_user_by_id")

export const createTRPCContext = cache(
  async (opts?: FetchCreateContextFnOptions) => {
    const cookieStore = await cookies()

    try {
      const userId = cookieStore.get("uid")

      if (!userId?.value) {
        return { user: undefined, cookies: cookieStore }
      }

      const dbUser = await preparedFindUserById.execute({
        userId: userId.value,
      })

      return { user: dbUser, cookies: cookieStore }
    } catch (e) {
      console.error(e)
      return { user: undefined, cookies: cookieStore }
    }
  },
)

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: SuperJSON,
})

// Base router and procedure helpers
export const createTRPCRouter = t.router
export const baseProcedure = t.procedure
// export const baseProcedure = t.procedure.use(async ({ next, path }) => {
//   const start = performance.now()
//   const result = await next()
//   const time = performance.now() - start
//   console.log(`${time.toFixed(2)}ms   ${path}`)

//   return result
// })
export const createCallerFactory = t.createCallerFactory
