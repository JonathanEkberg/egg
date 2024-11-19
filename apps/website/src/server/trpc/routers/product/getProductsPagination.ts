import { db, productTable } from "@egg/database"
import { count, desc, sql } from "@egg/database/drizzle"
import { baseProcedure } from "../../init"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

const query = db.query.productTable
  .findMany({
    orderBy: (t, { desc }) => desc(t.createdAt),
    offset: sql.placeholder("offset"),
    limit: sql.placeholder("limit"),
  })
  .prepare("paginated_products_query")

const preparedProductCount = db
  .select({ count: count() })
  .from(productTable)
  .prepare("prepared_get_product_count")

export const getProductsPaginationRoute = baseProcedure
  .input(
    z.object({ limit: z.number().min(1).max(50), offset: z.number().min(0) }),
  )
  .query(async function ({ input }) {
    try {
      const [items, count] = await Promise.all([
        query.execute({
          offset: input.offset,
          limit: input.limit,
        }),
        preparedProductCount.execute(),
      ])
      return { items, total: count, limit: input.limit, offset: input.offset }
      // const last = items.pop()
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get products.",
      })
    }
  })
