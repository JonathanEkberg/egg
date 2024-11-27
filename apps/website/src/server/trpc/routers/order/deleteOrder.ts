import { db, orderTable, productOrderTable, productTable } from "@egg/database"
import { and, eq, sql } from "@egg/database/drizzle"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { deleteOrderSchema } from "@/lib/validation/order"

export const deleteOrderRoute = authProcedure
  .input(deleteOrderSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      await db.transaction(async tx => {
        const order = await tx.query.orderTable.findFirst({
          where: (t, { eq }) =>
            and(eq(t.userId, ctx.user.id), eq(t.id, input.id)),
        })

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Could not find the order to delete.",
          })
        }

        const productOrders = await tx.query.productOrderTable.findMany({
          where: (t, { eq }) => and(eq(t.orderId, input.id)),
          columns: { id: true, amount: true, productId: true },
        })

        // Restore the product stock
        for (const p of productOrders) {
          await tx
            .update(productTable)
            .set({
              stock: sql`${productTable.stock} + ${p.amount}`,
            })
            .where(eq(productTable.id, p.productId))
          await tx
            .delete(productOrderTable)
            .where(eq(productOrderTable.id, p.id))
        }

        await tx
          .delete(orderTable)
          .where(
            and(
              eq(orderTable.userId, ctx.user.id),
              eq(orderTable.id, input.id),
            ),
          )
      })
    } catch (e) {
      if (e instanceof TRPCError) {
        throw e
      }

      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete order.",
      })
    }
  })
