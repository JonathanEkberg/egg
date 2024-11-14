import { db, productTable, shoppingCartItemTable } from "@egg/database"
import { and, eq, sql } from "@egg/database/drizzle"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { changeCartAmountSchema } from "@/lib/validation/cart"

export const changeCartAmountRoute = authProcedure
  .input(changeCartAmountSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      await db.transaction(async tx => {
        const item = await tx.query.shoppingCartItemTable.findFirst({
          where: (t, { eq }) =>
            and(eq(t.productId, input.productId), eq(t.userId, ctx.user.id)),
          columns: { productId: true, userId: true, amount: true },
          with: { product: { columns: { stock: true } } },
        })

        if (item === undefined) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Couldn't find cart item.",
          })
        }

        if (item!.amount + input.amount < 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Decreasing by this much would put stock below zero!",
          })
        }

        if (input.amount > item!.product.stock) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You cannot take more items than are in stock.",
          })
        }

        await Promise.all([
          tx
            .update(productTable)
            .set({
              stock:
                item!.amount > 0
                  ? sql`${productTable.stock} - ${input.amount}`
                  : sql`${productTable.stock} + ${Math.abs(input!.amount)}`,
            })
            .where(eq(productTable.id, input.productId)),
          tx
            .update(shoppingCartItemTable)
            .set({
              amount:
                item!.amount > 0
                  ? sql`${shoppingCartItemTable.amount} + ${input!.amount}`
                  : sql`${shoppingCartItemTable.amount} - ${Math.abs(input!.amount)}`,
            })
            .where(
              and(
                eq(shoppingCartItemTable.productId, input.productId),
                eq(shoppingCartItemTable.userId, ctx.user.id),
              ),
            ),
        ])
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
