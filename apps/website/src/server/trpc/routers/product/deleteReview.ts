import { db, productTable, reviewTable } from "@egg/database"
import { and, desc, eq, sql } from "@egg/database/drizzle"
import { baseProcedure } from "../../init"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"
import { deleteReviewSchema, makeReviewSchema } from "@/lib/validation/product"

const preparedGetReviewById = db
  .select({ userId: reviewTable.userId })
  .from(reviewTable)
  .where(eq(reviewTable.id, sql.placeholder("id")))
  .prepare("get_review_by_id")
const preparedDeleteReview = db
  .delete(reviewTable)
  .where(eq(reviewTable.id, sql.placeholder("id")))
  .prepare("delete_review")

export const deleteReviewRoute = authProcedure
  .input(deleteReviewSchema)
  .mutation(async function ({ ctx, input }) {
    try {
      const [product] = await preparedGetReviewById.execute({ id: input.id })

      if (product.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot delete reviews you haven't made.",
        })
      }

      return await preparedDeleteReview.execute({
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
