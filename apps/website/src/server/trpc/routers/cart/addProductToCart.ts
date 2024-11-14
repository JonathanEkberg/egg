import { db, productTable, shoppingCartItemTable } from "@egg/database"
import { and, eq, sql } from "@egg/database/drizzle"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { addProductToCartSchema } from "@/lib/validation/cart"

export const addProductToCartRoute = authProcedure
  .input(addProductToCartSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      const result = await db.transaction(async tx => {
        const product = await tx.query.productTable.findFirst({
          where: (t, { eq }) => eq(t.id, input.id),
          columns: { id: true, stock: true },
        })

        if (product === undefined) {
          tx.rollback()
        }

        if (product!.stock === 0) {
          throw new Error("Item is out of stock!")
        }

        await tx
          .update(productTable)
          .set({ stock: sql`${productTable.stock} - 1` })

        const shoppingCartItem = await tx.query.shoppingCartItemTable.findFirst(
          {
            where: (t, { eq }) =>
              and(eq(t.productId, input.id), eq(t.userId, ctx.user.id)),
            columns: { amount: true },
          },
        )

        let amount = 0
        if (!shoppingCartItem) {
          await tx.insert(shoppingCartItemTable).values({
            productId: input.id,
            userId: ctx.user.id,
            amount: 1,
          })
          amount = 1
        } else {
          const [val] = await tx
            .update(shoppingCartItemTable)
            .set({
              amount: sql`${shoppingCartItemTable.amount} + 1`,
            })
            .where(
              and(
                eq(shoppingCartItemTable.productId, input.id),
                eq(shoppingCartItemTable.userId, ctx.user.id),
              ),
            )
            .returning({ amount: shoppingCartItemTable.amount })
          amount = val.amount
        }

        return { amount }
      })

      return result
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add product to cart.",
      })
    }
  })
