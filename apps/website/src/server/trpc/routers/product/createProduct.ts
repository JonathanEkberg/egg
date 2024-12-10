import { createProductSchema } from "@/lib/validation/product"
import { db, productTable } from "@egg/database"
import { TRPCError } from "@trpc/server"
import { adminProcedure } from "../../procedures"
import { sql } from "@egg/database/drizzle"
import { prepared } from "@egg/database/prepared"

export const createProductRoute = adminProcedure
  .input(createProductSchema)
  .mutation(async function ({ input, ctx, signal }) {
    try {
      const [result] = await prepared.createProduct.execute({
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        priceUsd: input.priceUsd,
        stock: input.stock,
      })

      return result
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create product.",
      })
    }
  })
