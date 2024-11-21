import { db, orderTable, productOrderTable, productTable } from "@egg/database"
import { and, eq, sql } from "@egg/database/drizzle"
import { TRPCError } from "@trpc/server"
import { adminProcedure, authProcedure } from "../../procedures"
import { deleteOrderSchema } from "@/lib/validation/order"

export const adminDeleteOrderRoute = adminProcedure
  .input(deleteOrderSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      await db.transaction(async tx => {
        const productOrders = await tx.query.productOrderTable.findMany({
          where: (t, { eq }) => eq(t.orderId, input.id),
          columns: { id: true, amount: true, productId: true },
        })
        console.log("PRODUCT ORDERS:", productOrders)

        // Restore the product stock
        for (const p of productOrders) {
          console.log(p)
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
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete order.",
      })
    }
  })
