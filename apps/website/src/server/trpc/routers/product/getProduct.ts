import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { baseProcedure } from "../../init"
import { prepared } from "@egg/database/prepared"

export const getProductRoute = baseProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .query(async function ({ input }) {
    try {
      const product = await prepared.getProductWithReviewsById.execute({
        productId: input.id,
      })

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Couldn't find product.",
        })
      }

      return product
    } catch (e) {
      if (e instanceof TRPCError) {
        throw e
      }
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Couldn't find product.",
      })
    }
  })
