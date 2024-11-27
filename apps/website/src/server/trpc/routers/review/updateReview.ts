import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { makeReviewSchema } from "@/lib/validation/review"
import { db, reviewTable, userTable } from "@egg/database"
import { z } from "zod"
import { and, eq } from "@egg/database/drizzle"

export const updateReviewRoute = authProcedure
  .input(makeReviewSchema.extend({ id: z.string().uuid() }))
  .mutation(async function ({ ctx, input }) {
    try {
      return await db
        .update(reviewTable)
        .set({
          stars: input.stars,
          text: input.review,
        })
        .where(and(eq(reviewTable.id, input.id), eq(userTable.id, ctx.user.id)))
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update review.",
      })
    }
  })
