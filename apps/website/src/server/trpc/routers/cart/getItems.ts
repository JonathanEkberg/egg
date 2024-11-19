import { prepared } from "@egg/database/prepared"
import { TRPCError } from "@trpc/server"
import { authProcedure } from "../../procedures"

export const getItemsRoute = authProcedure.query(async function ({
  ctx,
  input,
}) {
  try {
    return await prepared.getItemsByUserId.execute({
      userId: ctx.user.id,
    })
  } catch (e) {
    console.error(e)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get cart items.",
    })
  }
})
