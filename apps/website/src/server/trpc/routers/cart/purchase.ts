import {
  db,
  orderTable,
  productOrderTable,
  shoppingCartItemTable,
} from "@egg/database"
import { and, eq } from "@egg/database/drizzle"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"

export const purchaseRoute = authProcedure.mutation(async function ({
  ctx,
  input,
}) {
  try {
    if (!ctx.user.emailVerified) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must verify your email before you can make orders.",
      })
    }

    await db.transaction(async tx => {
      const items = await tx.query.shoppingCartItemTable.findMany({
        where: (t, { eq }) => eq(t.userId, ctx.user.id),
        columns: { productId: true, userId: true, amount: true },
        with: { product: { columns: { stock: true, priceUsd: true } } },
      })

      const [order] = await tx
        .insert(orderTable)
        .values({ userId: ctx.user.id })
        .returning({ id: orderTable.id })

      for (const item of items) {
        await tx.insert(productOrderTable).values({
          orderId: order.id,
          priceUsd: item.product.priceUsd,
          productId: item.productId,
          amount: item.amount,
        })
        await tx
          .delete(shoppingCartItemTable)
          .where(
            and(
              eq(shoppingCartItemTable.productId, item.productId),
              eq(shoppingCartItemTable.userId, ctx.user.id),
            ),
          )
      }
    })
  } catch (e) {
    if (e instanceof TRPCError) {
      throw e
    }

    console.error(e)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to change cart item amount.",
    })
  }
})
