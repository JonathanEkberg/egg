import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { deleteReviewSchema } from "@/lib/validation/review"
import { prepared } from "@egg/database/prepared"

export const deleteReviewRoute = authProcedure
  .input(deleteReviewSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      const [product] = await prepared.getReviewById.execute({ id: input.id })

      if (product.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot delete reviews you haven't made.",
        })
      }

      return await prepared.deleteReviewById.execute({
        id: input.id,
      })
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete review.",
      })
    }
  })
