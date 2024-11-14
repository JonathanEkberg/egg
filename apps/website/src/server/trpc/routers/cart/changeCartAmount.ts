import { db, productTable, shoppingCartItemTable } from "@egg/database"
import { sql } from "@egg/database/drizzle"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { changeCartAmountSchema } from "@/lib/validation/cart"

export const changeCartAmountRoute = authProcedure
  .input(changeCartAmountSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      await db.transaction(async tx => {
        const item = await tx.query.shoppingCartItemTable.findFirst({
          where: (t, { eq }) => eq(t.productId, input.productId),
          columns: { productId: true, userId: true, amount: true },
        })

        if (item === undefined) {
          tx.rollback()
        }

        if (item!.amount + input.amount < 0) {
          throw new Error("Decreasing by this much would put stock below zero!")
        }

        await tx
          .update(productTable)
          .set({ stock: sql`${productTable.stock} + ${item!.amount}` })
        await tx.update(shoppingCartItemTable).set({
          amount: sql`${shoppingCartItemTable.amount} + ${input.amount}`,
        })
      })
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to change cart item amount.",
      })
    }
  })
