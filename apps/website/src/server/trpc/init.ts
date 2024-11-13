import { cache } from "react"
import { initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { cookies } from "next/headers"
import { getSession } from "../authentication"

// const preparedFindUserById = db.query.userTable
//   .findFirst({
//     where: (user, { eq }) => eq(user.id, sql.placeholder("userId")),
//     columns: { id: true, role: true, name: true, email: true },
//   })
//   .prepare("prepared_find_user_by_id")

export const createTRPCContextClient = cache(
  async (opts?: FetchCreateContextFnOptions) => {
    const cookieStore = await cookies()
    const base = { cookies: cookieStore, isSsr: false }

    try {
      const session = await getSession(cookieStore, false)

      if (!session) {
        return { user: undefined, ...base }
      }

      return {
        user: {
          id: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
          emailVerified: session.emailVerified,
        },
        ...base,
      }
    } catch (e) {
      console.error(e)
      return { user: undefined, ...base }
    }
  },
)

export const createTRPCContextServer = cache(
  async (opts?: FetchCreateContextFnOptions) => {
    const cookieStore = await cookies()
    const base = { cookies: cookieStore, isSsr: true }
    try {
      const session = await getSession(cookieStore, true)

      if (!session) {
        return { user: undefined, ...base }
      }

      return {
        user: {
          id: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
          emailVerified: session.emailVerified,
        },
        ...base,
      }
    } catch (e) {
      console.error(e)
      return { user: undefined, ...base }
    }
  },
)

export type Context = Awaited<
  ReturnType<typeof createTRPCContextClient | typeof createTRPCContextServer>
>

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
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
