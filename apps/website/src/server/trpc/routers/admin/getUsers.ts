import { prepared } from "@egg/database/prepared"
import { TRPCError } from "@trpc/server"
import {
  adminProcedure,
  authProcedure,
  superAdminProcedure,
} from "../../procedures"
import { z } from "zod"
import { db, OrderStatus, orderStatus, orderTable } from "@egg/database"
import { asc, eq, Placeholder, sql } from "@egg/database/drizzle"

export const adminGetUsersRoute = superAdminProcedure.query(async function ({
  ctx,
  input,
}) {
  try {
    return await db.query.userTable.findMany({
      orderBy: t => asc(t.createdAt),
    })
  } catch (e) {
    console.error(e)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update order status..",
    })
  }
})
