import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client"
import { afterAll, beforeEach, describe, expect, test } from "vitest"
import { AppRouter } from "./_app"
import { createDummySession } from "../../authentication"
import { randomUUID } from "node:crypto"
import { TRPCError } from "@trpc/server"
import { db, userTable } from "@egg/database"
import { eq } from "@egg/database/drizzle"

function getApi(jwt?: string) {
  // https://chatgpt.com/share/6746e420-81f0-8009-86cd-a1912a4a3a73
  // Cookie storage to persist cookies between requests
  const cookieStore = new Map<string, string>()

  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        async fetch(info, init) {
          // Build the `cookie` header using stored cookies and JWT
          let cookieHeader = ""

          // Add JWT and refresh token if provided
          if (jwt) {
            cookieHeader += `jwt=${jwt}; refresh=${randomUUID()}; `
          }

          // Append stored cookies
          for (const [key, value] of cookieStore) {
            cookieHeader += `${key}=${value}; `
          }

          // Merge headers and set `cookie` header
          const headers = new Headers(init?.headers)
          if (cookieHeader) {
            headers.set("cookie", cookieHeader.trim())
          }

          // Make the request
          const response = await fetch(info, {
            ...init,
            headers,
          })

          // Parse `Set-Cookie` header from the response and update cookie storage
          const setCookieHeaders = response.headers.get("set-cookie")
          if (setCookieHeaders) {
            const cookies = setCookieHeaders
              .split(",")
              .map(cookie => cookie.trim())

            for (const cookie of cookies) {
              const [keyValue, ...rest] = cookie.split(";")
              const [key, value] = keyValue.split("=")

              if (key && value) {
                cookieStore.set(key, value)
              }
            }
          }

          return response
        },
        url: "http://localhost:3000/api/trpc",
      }),
    ],
  })
}

test("cookie-test", async () => {
  const api = getApi()
  const COOKIE_NAME = "my-cookie"
  await api.setCookieTest.mutate(COOKIE_NAME)
  const result = await api.getCookieTest.query(COOKIE_NAME)
  expect(result).eq("123")
})

describe("Authentication", () => {
  const USER_NAME = "Johan Sundin"
  const USER_EMAIL = "johsuc@gmail.com"
  const USER_PASSWORD = "johndoe"

  afterAll(async () => {
    await db.delete(userTable).where(eq(userTable.email, USER_EMAIL))
  })

  test("Fail login", async () => {
    const api = getApi()
    try {
      await api.auth.login.mutate({
        email: USER_EMAIL,
        password: USER_PASSWORD,
      })
    } catch (e) {
      if (e instanceof TRPCClientError) {
        expect(e.shape.data.code).equals("BAD_REQUEST")
      } else {
        console.error(e)
        expect(false, "Failed to check registration conflict")
        return
      }
    }
  })

  test("Registration", async () => {
    const api = getApi()

    const result = await api.auth.register.mutate({
      name: USER_NAME,
      email: USER_EMAIL,
      password: USER_PASSWORD,
    })
    expect(result.name).eq(USER_NAME)
    expect(result.email).eq(USER_EMAIL)
    expect(result.emailVerified).eq(false)

    // Should throw conflict
    try {
      const api2 = getApi()
      const badResult = await api2.auth.register.mutate({
        name: USER_NAME,
        email: USER_EMAIL,
        password: USER_PASSWORD,
      })
      console.log(badResult)
    } catch (e) {
      if (e instanceof TRPCClientError) {
        expect(e.shape.data.code).equals("CONFLICT")
      } else {
        console.error(e)
        expect(false, "Failed to check registration conflict")
        return
      }
    }
  })

  test("Login", async () => {
    const api = getApi()

    const result = await api.auth.login.mutate({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    })
    expect(result.name).eq(USER_NAME)
    expect(result.email).eq(USER_EMAIL)
    expect(result.emailVerified).eq(false)
  })
})

describe("Authorization", () => {
  test("Unauthed", async () => {
    const api = getApi()
    try {
      await api.order.deleteOrder.mutate({ id: randomUUID() })
    } catch (e) {
      if (e instanceof TRPCClientError) {
        expect(e.shape.data.code).eq("UNAUTHORIZED")
      } else {
        console.error(e)
        expect(false, "Failed to check unauthed")
        return
      }
    }
  })

  test("Authed", async () => {
    const session = await createDummySession({
      name: "John Doe",
      email: "JohnDoe@mail.com",
      emailVerified: true,
      role: "user",
      userId: randomUUID(),
    })
    const api = getApi(session ?? undefined)
    try {
      await api.order.deleteOrder.mutate({ id: randomUUID() })
    } catch (e) {
      if (e instanceof TRPCError) {
        expect(e.code).eq("NOT_FOUND")
      }
    }
  })
})
