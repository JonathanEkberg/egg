import { hash, verify } from "@node-rs/argon2"

const _secret = new TextEncoder().encode(
  "my-super-secure-secret-for-better-security",
)

export function hashPassword(password: string, abortSignal?: AbortSignal) {
  return hash(
    password,
    { secret: _secret, timeCost: 1, memoryCost: 512 },
    abortSignal,
  )
}

export async function verifyPassword(
  password: string,
  hashed: string,
  abortSignal?: AbortSignal,
) {
  try {
    return await verify(hashed, password, { secret: _secret }, abortSignal)
  } catch (e) {
    console.error(e)
    return false
  }
}
