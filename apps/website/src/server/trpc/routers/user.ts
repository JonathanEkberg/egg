import { db, shoppingCartItemTable } from "@egg/database"
import { baseProcedure, createTRPCRouter } from "../init"
import { authProcedure } from "../procedures"
import { eq, sql, sum } from "@egg/database/drizzle"

export const userRouter = createTRPCRouter({
  getMe: baseProcedure.query(async function ({ ctx, input, signal }) {
    if (!ctx.user) {
      return null
    }

    return ctx.user
  }),
})
