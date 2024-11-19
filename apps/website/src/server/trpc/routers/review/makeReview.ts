import { db, productTable, reviewTable } from "@egg/database"
import { desc, sql } from "@egg/database/drizzle"
import { baseProcedure } from "../../init"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { makeReviewSchema } from "@/lib/validation/review"
import { prepared } from "@egg/database/prepared"

export const makeReviewRoute = authProcedure
  .input(makeReviewSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      return await prepared.createReview.execute({
        userId: ctx.user.id,
        productId: input.productId,
        stars: input.stars,
        text: input.review,
      })
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to make review.",
      })
    }
  })
