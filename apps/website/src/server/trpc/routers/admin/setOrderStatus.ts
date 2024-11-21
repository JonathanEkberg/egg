import { prepared } from "@egg/database/prepared"
import { TRPCError } from "@trpc/server"
import { adminProcedure, authProcedure } from "../../procedures"
import { z } from "zod"
import { db, OrderStatus, orderStatus, orderTable } from "@egg/database"
import { eq, Placeholder, sql } from "@egg/database/drizzle"

const preparedUpdateOrderStatus = db
  .update(orderTable)
  .set({
    status: sql.placeholder("status") as any,
  })
  .where(eq(orderTable.id, sql.placeholder("orderId")))

export const adminSetOrderStatusRoute = adminProcedure
  .input(z.object({ orderId: z.string().uuid(), status: z.enum(orderStatus) }))
  .mutation(async function ({ ctx, input }) {
    try {
      return await preparedUpdateOrderStatus.execute({
        orderId: input.orderId,
        status: input.status,
      })
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update order status..",
      })
    }
  })
