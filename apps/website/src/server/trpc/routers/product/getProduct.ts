import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { baseProcedure } from "../../init"
import { db } from "@egg/database"
import { sql } from "@egg/database/drizzle"

const getProductWithReviewsById = db.query.productTable
  .findFirst({
    where: (fields, { eq }) => eq(fields.id, sql.placeholder("productId")),
    columns: {
      id: true,
      createdAt: true,
      updatedAt: true,
      name: true,
      description: true,
      imageUrl: true,
      priceUsd: true,
      stock: true,
    },
    with: {
      reviews: {
        where: (f, { eq }) => eq(f.productId, sql.placeholder("productId")),
        orderBy: (f, { desc }) => desc(f.createdAt),
        limit: 10,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        columns: {
          userId: false,
          productId: false,
        },
      },
    },
  })
  .prepare("get_product_with_reviews_by_id")

export const getProductRoute = baseProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .query(async function ({ input }) {
    try {
      return await getProductWithReviewsById.execute({
        productId: input.id,
      })
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Couldn't find product.",
      })
    }
  })
