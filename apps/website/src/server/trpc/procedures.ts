import { TRPCError } from "@trpc/server"
import { baseProcedure, Context } from "./init"

export function ensureNoSsr(ctx: Context) {
  if (ctx.isSsr) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "SSR not supported for this route.",
    })
  }
}

export const unAuthedProcedure = baseProcedure.use(async function ({
  next,
  ctx,
}) {
  if (ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You can't be logged in to do this.",
    })
  }

  return next({ ctx })
})

export const authProcedure = baseProcedure.use(async function ({ next, ctx }) {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to do this.",
    })
  }

  return next({ ctx: { user: ctx.user, cookies: ctx.cookies } })
})

export const adminProcedure = authProcedure.use(async function ({ next, ctx }) {
  if (ctx.user.role === "user") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be an admin in to do this.",
    })
  }

  return next({
    ctx: {
      user: {
        ...ctx.user,
        role: ctx.user.role,
      },
      cookies: ctx.cookies,
    },
  })
})
