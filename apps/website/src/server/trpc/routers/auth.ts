import { baseProcedure, createTRPCRouter } from "../init"
import { db, userEmailVerificationTable, userTable } from "@egg/database"
import { TRPCError } from "@trpc/server"
import { hashPassword, verifyPassword } from "@/server/password"
import { loginSchema, registerSchema } from "@/lib/validation/auth"
import { authProcedure, unAuthedProcedure } from "../procedures"
import { z } from "zod"
import { sendEmail } from "@/lib/mq"
import { createSession, logout } from "@/server/authentication"
import { and, eq, sql } from "@egg/database/drizzle"
import { addMinutes, isFuture, isPast } from "date-fns"
import { unstable_after } from "next/server"
import { sendUserEmailVerificationCode } from "@/lib/email"

const preparedRegisterUser = db
  .insert(userTable)
  .values({
    name: sql.placeholder("name"),
    email: sql.placeholder("email"),
    password: sql.placeholder("password"),
    role: sql.placeholder("role"),
  })
  .returning({
    id: userTable.id,
    name: userTable.name,
    email: userTable.email,
    role: userTable.role,
    emailVerified: userTable.emailVerified,
  })
  .prepare("prepared_register_user")

export const authRouter = createTRPCRouter({
  sendTwoFactorEmail: authProcedure.mutation(async function ({ ctx }) {
    try {
      return sendUserEmailVerificationCode(
        ctx.user.id,
        ctx.user.email,
        ctx.user.name,
      )
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send two factor email",
      })
    }
  }),
  verify: authProcedure
    .input(
      z.object({
        code: z.number().min(0),
      }),
    )
    .mutation(async function ({ ctx, input }) {
      try {
        const result = await db.query.userEmailVerificationTable.findFirst({
          where: (t, { eq }) =>
            and(eq(t.userId, ctx.user.id), eq(t.code, input.code)),
          columns: {
            id: true,
            expires: true,
            code: true,
          },
        })

        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "No active verifications. Go to your account and request a new verification code.",
          })
        }

        if (isPast(result.expires)) {
          await db
            .delete(userEmailVerificationTable)
            .where(eq(userEmailVerificationTable.id, result.id))
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "This verification code has expired.",
          })
        }

        if (result.code !== input.code) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Wrong verification code.",
          })
        }

        await Promise.all([
          db
            .update(userTable)
            .set({ emailVerified: true })
            .where(eq(userTable.id, ctx.user.id)),
          db
            .delete(userEmailVerificationTable)
            .where(eq(userEmailVerificationTable.userId, ctx.user.id)),
        ])
        await createSession(ctx.cookies, {
          userId: ctx.user.id,
          name: ctx.user.name,
          email: ctx.user.email,
          // They are noe 2FA'd
          emailVerified: true,
          role: ctx.user.role,
        })

        return true
      } catch (e) {
        if (e instanceof TRPCError) {
          throw e
        }

        console.error(e)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check email verification code.",
        })
      }
    }),
  register: unAuthedProcedure.input(registerSchema).mutation(async function ({
    ctx,
    input,
    signal,
  }) {
    const existing = await db.query.userTable.findFirst({
      where: (u, { eq }) => eq(u.email, input.email),
      columns: { id: true },
    })

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `User is already registered with that email.`,
      })
    }

    // console.log("Hashing password...")
    // const start = performance.now()
    const hashedPassword = await hashPassword(input.password, signal)
    // const time = performance.now() - start
    // console.log(`Hashed password in ${time}ms`)

    const [user] = await preparedRegisterUser.execute({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: "user",
    })

    await createSession(ctx.cookies, {
      userId: user.id,
      name: user.name,
      email: user.email,
      emailVerified: false,
      role: user.role,
    })
    unstable_after(() => {
      sendUserEmailVerificationCode(user.id, user.email, user.name)
    })

    const { id, name, email, role, emailVerified } = user
    return { id, name, email, role, emailVerified }
  }),
  login: unAuthedProcedure.input(loginSchema).mutation(async function ({
    ctx,
    input,
    signal,
  }) {
    const existing = await db.query.userTable.findFirst({
      where: (u, { eq }) => eq(u.email, input.email),
      columns: {
        id: true,
        name: true,
        role: true,
        email: true,
        password: true,
        emailVerified: true,
      },
    })

    if (!existing) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No user is registered with that email.`,
      })
    }

    console.log("Verifying password...")
    const start = performance.now()
    const validPassword = await verifyPassword(
      input.password,
      existing.password,
      signal,
    )
    const time = performance.now() - start
    console.log(`Valid ${validPassword}. Verified password in ${time}ms`)

    if (!validPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `Wrong password.`,
      })
    }

    const { id: userId, name, email, emailVerified, role } = existing
    const sessionSuccess = await createSession(ctx.cookies, {
      name,
      userId,
      email,
      // Set to false so they have to do email 2FA
      emailVerified: false,
      role,
    })

    if (!sessionSuccess) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not sign you in. Try again.",
      })
    }

    unstable_after(() => {
      sendUserEmailVerificationCode(userId, email, name)
    })

    return { id: userId, name: existing.name, email, role, emailVerified }
  }),
  logout: baseProcedure.mutation(async function ({ ctx, input, signal }) {
    try {
      await logout(ctx.cookies, ctx.isSsr)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
    // ctx.cookies.delete("uid")
  }),
})
