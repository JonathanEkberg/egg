import { db } from "@egg/database"
import { cookies } from "next/headers"

export async function getUser() {
  const cookieStore = await cookies()

  const uid = cookieStore.get("uid")

  if (!uid?.value) {
    return null
  }

  const user = await db.query.userTable.findFirst({
    where: (t, { eq }) => eq(t.id, uid.value),
    columns: { email: true, role: true },
  })

  if (!user) {
    return null
  }

  return { id: uid.value, ...user }
}
