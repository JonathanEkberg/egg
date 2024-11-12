import { createProductSchema } from "@/lib/validation/product"
import { db, productTable } from "@egg/database"
import { TRPCError } from "@trpc/server"
import { adminProcedure } from "../../procedures"
import { sql } from "@egg/database/drizzle"

const createProduct = db
  .insert(productTable)
  .values({
    name: sql.placeholder("name"),
    imageUrl: sql.placeholder("imageUrl"),
    priceUsd: sql.placeholder("priceUsd"),
    stock: sql.placeholder("stock"),
  })
  .returning({ id: productTable.id })
  .prepare("create_product")

export const createProductRoute = adminProcedure
  .input(createProductSchema)
  .mutation(async function ({ input, ctx, signal }) {
    try {
      const [result] = await createProduct.execute({
        name: input.name,
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
