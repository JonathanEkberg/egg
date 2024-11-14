import {
  db,
  productTable,
  reviewTable,
  shoppingCartItemTable,
} from "@egg/database"
import { and, desc, eq, sql } from "@egg/database/drizzle"
import { baseProcedure } from "../../init"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { deleteProductItemSchema } from "@/lib/validation/cart"

export const deleteProductItemRoute = authProcedure
  .input(deleteProductItemSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      await db.transaction(async tx => {
        const item = await db.query.shoppingCartItemTable.findFirst({
          where: (t, { eq, and }) =>
            and(
              eq(shoppingCartItemTable.productId, input.id),
              eq(shoppingCartItemTable.userId, ctx.user.id),
            ),
          columns: { amount: true },
        })

        if (!item) {
          tx.rollback()
        }

        // Reset the stock
        await tx
          .update(productTable)
          .set({ stock: sql`${productTable.stock} + ${item!.amount}` })
          .where(eq(productTable.id, input.id))
        await tx
          .delete(shoppingCartItemTable)
          .where(
            and(
              eq(shoppingCartItemTable.productId, input.id),
              eq(shoppingCartItemTable.userId, ctx.user.id),
            ),
          )
      })
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove item from cart.",
      })
    }
  })
