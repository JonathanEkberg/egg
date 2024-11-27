import { TRPCError } from "@trpc/server"
import { superAdminProcedure } from "../../procedures"
import { z } from "zod"
import { db, userRole, userTable } from "@egg/database"
import { eq, sql } from "@egg/database/drizzle"

const preparedUpdateUserRole = db
  .update(userTable)
  .set({
    role: sql.placeholder("role") as any,
  })
  .where(eq(userTable.id, sql.placeholder("userId")))
  .prepare("update_user_role")

export const adminSetUserRoleRoute = superAdminProcedure
  .input(z.object({ userId: z.string().uuid(), role: z.enum(userRole) }))
  .mutation(async function ({ input }) {
    try {
      return await preparedUpdateUserRole.execute({
        userId: input.userId,
        role: input.role,
      })
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user role.",
      })
    }
  })
