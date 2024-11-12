import { db, shoppingCartItemTable } from "@egg/database"
import { baseProcedure, createTRPCRouter } from "../init"
import { authProcedure } from "../procedures"
import { count, eq, sql } from "@egg/database/drizzle"

const preparedGetShoppingCartCount = db
  .select({ count: count() })
  .from(shoppingCartItemTable)
  .where(eq(shoppingCartItemTable.userId, sql.placeholder("userId")))
  .prepare("prepared_get_shopping_cart_count")

export const userRouter = createTRPCRouter({
  getMe: baseProcedure.query(async function ({ ctx, input, signal }) {
    if (!ctx.user) {
      return null
    }

    return ctx.user
  }),
  getMyShoppingCartCount: authProcedure.query(async function ({
    ctx,
    input,
    signal,
  }) {
    const [result] = await preparedGetShoppingCartCount.execute({
      userId: ctx.user.id,
    })

    return { count: result.count }
  }),
})
