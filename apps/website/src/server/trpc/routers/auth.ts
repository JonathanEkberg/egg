import { baseProcedure, createTRPCRouter } from "../init"
import { db, userTable } from "@egg/database"
import { TRPCError } from "@trpc/server"
import { hashPassword, verifyPassword } from "@/server/password"
import { loginSchema, registerSchema } from "@/lib/validation/auth"
import { unAuthedProcedure } from "../procedures"
import { z } from "zod"
import { sendEmail } from "@/lib/mq"

export const authRouter = createTRPCRouter({
  sendTwoFactorEmail: unAuthedProcedure
    .input(
      z.object({
        to: z.string().email(),
        body: z.string().max(8096),
      }),
    )
    .mutation(async function ({ input }) {
      try {
        return await sendEmail(input.to, input.body)
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send two factor email",
        })
      }
    }),
  register: unAuthedProcedure.input(registerSchema).mutation(async function ({
    ctx,
    input,
    signal,
  }) {
    // db.select().from(userTable).where(eq(userTable.email, input.email))
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

    console.log("Hashing password...")
    const start = performance.now()
    const hashedPassword = await hashPassword(input.password, signal)
    const time = performance.now() - start
    console.log(`Hashed password in ${time}ms`)

    const [user] = await db
      .insert(userTable)
      .values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: "user",
      })
      .returning({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
      })

    // TODO: Implement real sessions
    ctx.cookies.set("uid", user.id, { httpOnly: true, maxAge: 86400 })

    const { id, name, email, role } = user
    return { id, name, email, role }
  }),
  login: unAuthedProcedure.input(loginSchema).mutation(async function ({
    ctx,
    input,
    signal,
  }) {
    // db.select().from(userTable).where(eq(userTable.email, input.email))
    const existing = await db.query.userTable.findFirst({
      where: (u, { eq }) => eq(u.email, input.email),
      columns: {
        id: true,
        name: true,
        role: true,
        email: true,
        password: true,
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

    // TODO: Implement real sessions
    ctx.cookies.set("uid", existing.id, { httpOnly: true, maxAge: 86400 })

    const { id, name, email, role } = existing
    return { id, name, email, role }
  }),
  logout: baseProcedure.mutation(async function ({ ctx, input, signal }) {
    ctx.cookies.delete("uid")
  }),
})
