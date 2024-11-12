import { db, productTable } from "@egg/database"
import { desc } from "@egg/database/drizzle"
import { baseProcedure } from "../../init"
import { TRPCError } from "@trpc/server"

export const getProductsRoute = baseProcedure.query(async function () {
  try {
    return await db
      .select()
      .from(productTable)
      .orderBy(desc(productTable.createdAt))
      .limit(100)
  } catch (e) {
    console.error(e)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get products.",
    })
  }
})
