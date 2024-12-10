import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { db, productTable } from "@egg/database"
import { eq } from "@egg/database/drizzle"
import { adminProcedure } from "../../procedures"

export const deleteProductRoute = adminProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .mutation(async function ({ input }) {
    try {
      await db.transaction(async tx => {
        const product =await  tx.query.productTable.findFirst({where:(t, {eq}) => eq(t.id, input.id), columns: {id: true}})
        if (!product) {
          throw new TRPCError({
            code:"NOT_FOUND",
            message:"Couldn't find the product to delete."
          })
        }
        await tx.delete(productTable).where(eq(productTable.id,product.id))
      })
    } catch (e) {
      if (e instanceof TRPCError) {
        throw e
      }
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete product.",
      })
    }
  })
