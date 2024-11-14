import { db } from "@egg/database"
import { sql } from "@egg/database/drizzle"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { makeReviewSchema } from "@/lib/validation/product"
import { z } from "zod"

const preparedGetItems = db.query.shoppingCartItemTable
  .findMany({
    where: (t, { eq }) => eq(t.userId, sql.placeholder("userId")),
    columns: {
      amount: true,
    },
    with: {
      product: true,
    },
  })
  .prepare("get_user_shopping_cart_items")

export const getItemsRoute = authProcedure.query(async function ({
  ctx,
  input,
}) {
  try {
    return await preparedGetItems.execute({
      userId: ctx.user.id,
    })
  } catch (e) {
    console.error(e)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get cart items.",
    })
  }
})
