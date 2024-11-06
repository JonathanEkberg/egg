import { cookies, type UnsafeUnwrappedCookies } from "next/headers"

// async function resetUserCookies() {
//   const cookieStore = await cookies()
//   cookieStore.delete("u_id")
//   cookieStore.delete("u_name")
//   cookieStore.delete("u_role")
// }

export async function getUser(): Promise<{
  id: number
  name: string
  role: "USER" | "ADMIN"
} | null> {
  const cookieStore = await cookies()
  const [id, name, role] = [
    cookieStore.get("u_id"),
    cookieStore.get("u_name"),
    cookieStore.get("u_role"),
  ]

  if (!id || !name || !role) {
    // resetUserCookies();
    return null
  }

  const parsed = parseInt(id.value)

  if (Number.isNaN(parsed)) {
    // resetUserCookies();
    return null
  }

  if (!["USER", "ADMIN"].includes(role.value)) {
    // resetUserCookies();
    return null
  }

  return { id: parsed, name: name.value, role: role.value as "USER" | "ADMIN" }
}
