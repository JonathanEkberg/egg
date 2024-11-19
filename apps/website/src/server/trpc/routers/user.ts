import { baseProcedure, createTRPCRouter } from "../init"

export const userRouter = createTRPCRouter({
  getMe: baseProcedure.query(async function ({ ctx, input, signal }) {
    if (!ctx.user) {
      return null
    }

    return ctx.user
  }),
})
