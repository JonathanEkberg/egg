import { prepared } from "@egg/database/prepared"
import { TRPCError } from "@trpc/server"
import { adminProcedure, authProcedure } from "../../procedures"

export const adminGetOrdersRoute = adminProcedure.query(async function ({
  ctx,
  input,
}) {
  try {
    return await prepared.getAllOrders.execute()
  } catch (e) {
    console.error(e)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get cart items.",
    })
  }
})
