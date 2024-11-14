import {
  db,
  refreshTokenTable,
  userRole,
  UserRole,
  userTable,
} from "@egg/database"
import * as JWT from "jsonwebtoken"
import { z } from "zod"
import { addDays, isPast } from "date-fns"
import { eq, sql } from "@egg/database/drizzle"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { unstable_after as after } from "next/server"
import { cache } from "react"

const SECRET = process.env.JWT_SECRET
const JWT_COOKIE_NAME = "jwt"
const REFRESH_COOKIE_NAME = "refresh"

const JWT_EXPIRES_IN_SECONDS = 15 * 60

type Payload = {
  name: string
  userId: string
  role: UserRole
  email: string
  emailVerified: boolean
}

const payloadSchema = z.object({
  name: z.string(),
  role: z.enum(userRole),
  email: z.string().email(),
  emailVerified: z.boolean(),
})

async function createAccessToken(
  data: Payload,
  expiresInSeconds: number = 15 * 60,
): Promise<string | null> {
  if (!SECRET) {
    throw new Error("Missing JWT secret")
  }

  const parsed = await payloadSchema.safeParseAsync(data)

  if (!parsed.success) {
    return null
  }

  return JWT.sign(parsed.data, Buffer.from(SECRET), {
    subject: data.userId,
    expiresIn: expiresInSeconds,
  })
}

async function parseAccessToken(
  jwt: string,
): Promise<{ type: "success"; data: Payload } | { type: "expired" } | null> {
  if (!SECRET) {
    throw new Error("Missing JWT secret")
  }

  try {
    const token = JWT.verify(jwt, SECRET)

    if (typeof token === "string") {
      return null
    }

    if (!token.sub || !token.exp) {
      return null
    }

    // console.log("TOKEN:", token)
    if (token.exp < Math.floor(Date.now() / 1000)) {
      return { type: "expired" }
    }

    const parsed = await payloadSchema.safeParseAsync(token)

    if (!parsed.success) {
      return null
    }

    return { type: "success", data: { ...parsed.data, userId: token.sub } }
  } catch {
    return null
  }
}

const preparedCreateRefreshToken = db
  .insert(refreshTokenTable)
  .values({
    userId: sql.placeholder("userId"),
    expires: sql.placeholder("expires"),
  })
  .returning({
    id: refreshTokenTable.id,
  })
  .prepare("create_user_refresh_token")

export async function createRefreshToken(userId: string): Promise<string> {
  const [result] = await preparedCreateRefreshToken.execute({
    userId,
    expires: addDays(Date.now(), 7),
  })

  return result.id
}

export type SessionInfo = {
  name: string
  userId: string
  email: string
  emailVerified: boolean
  role: UserRole
}

export async function createSession(
  cookies: ReadonlyRequestCookies,
  { name, userId, email, emailVerified, role }: SessionInfo,
): Promise<boolean> {
  const jwt = await createAccessToken(
    {
      name,
      userId,
      email,
      role,
      emailVerified,
    },
    JWT_EXPIRES_IN_SECONDS,
  )

  if (!jwt) {
    return false
  }

  const refreshToken = await createRefreshToken(userId)

  cookies.set("jwt", jwt, {
    httpOnly: true,
    // maxAge: 60 * 15,
    maxAge: JWT_EXPIRES_IN_SECONDS,
  })
  cookies.set("refresh", refreshToken, {
    httpOnly: true,
    maxAge: 86400 * 7,
  })
  return true
}

const preparedDeleteRefreshToken = db
  .delete(refreshTokenTable)
  .where(eq(refreshTokenTable.id, sql.placeholder("refreshToken")))
  .prepare("delete_refresh_token")
export async function logout(
  cookies: ReadonlyRequestCookies,
  isSsr: boolean,
): Promise<void> {
  if (isSsr) {
    return
  }

  if (cookies.has(JWT_COOKIE_NAME)) {
    cookies.delete(JWT_COOKIE_NAME)
  }

  if (!cookies.has(REFRESH_COOKIE_NAME)) {
    return
  }

  const refreshCookie = cookies.get(REFRESH_COOKIE_NAME)!
  cookies.delete(REFRESH_COOKIE_NAME)
  // Delete the refresh token in the background so not blocking
  after(async () => {
    try {
      await preparedDeleteRefreshToken.execute({
        refreshToken: refreshCookie.value,
      })
    } catch {}
  })
}

const preparedGetRefreshToken = db
  .select({
    id: refreshTokenTable.id,
    expires: refreshTokenTable.expires,
    userId: refreshTokenTable.userId,
  })
  .from(refreshTokenTable)
  .where(eq(refreshTokenTable.id, sql.placeholder("id")))
  .prepare("get_user_refresh_token")

const preparedGetUserInfo = db
  .select({
    id: userTable.id,
    name: userTable.name,
    email: userTable.email,
    role: userTable.role,
    emailVerified: userTable.emailVerified,
  })
  .from(userTable)
  .where(eq(userTable.id, sql.placeholder("id")))
  .prepare("get_user_info")

async function refresh(cookies: ReadonlyRequestCookies, isSsr: boolean) {
  if (!cookies.has(REFRESH_COOKIE_NAME)) {
    return null
  }

  const refreshTokenId = cookies.get(REFRESH_COOKIE_NAME)?.value
  const [refresh] = await preparedGetRefreshToken.execute({
    id: refreshTokenId,
  })

  if (!refresh) {
    await logout(cookies, isSsr)
    return null
  }

  // Expired
  if (isPast(refresh.expires)) {
    await logout(cookies, isSsr)
    return null
  }

  const [userInfo] = await preparedGetUserInfo.execute({ id: refresh.userId })
  const session: SessionInfo = {
    ...userInfo,
    userId: userInfo.id,
  }
  const result = await createSession(cookies, session)

  if (result === true) {
    after(async () => {
      try {
        preparedDeleteRefreshToken.execute({ refreshToken: refreshTokenId })
      } catch {}
    })
  }

  return session
}

export async function getSession(
  cookies: ReadonlyRequestCookies,
  isSsr: boolean,
): Promise<{
  name: string
  userId: string
  email: string
  emailVerified: boolean
  role: UserRole
} | null> {
  if (!cookies.has(REFRESH_COOKIE_NAME)) {
    await logout(cookies, isSsr)
    return null
  }

  const jwt = cookies.get(JWT_COOKIE_NAME)
  const result = jwt?.value ? await parseAccessToken(jwt.value) : null

  if (!isSsr && (!result || result?.type === "expired")) {
    return await refresh(cookies, isSsr)
  }

  if (result?.type === "success") {
    return result.data
  }

  return null
}

export const isLoggedIn = cache(function isLoggedIn(
  cookies: ReadonlyRequestCookies,
): boolean {
  return cookies.has(JWT_COOKIE_NAME) || cookies.has(REFRESH_COOKIE_NAME)
})
