import { db, userTable } from "@egg/database"
import { eq } from "@egg/database/drizzle"
import { TRPCError } from "@trpc/server"
import { superAdminProcedure } from "../../procedures"
import { z } from "zod"

export const adminDeleteUserRoute = superAdminProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async function ({ ctx, input }) {
    try {
      await db.delete(userTable).where(eq(userTable.id, input.id))
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete user.",
      })
    }
  })
