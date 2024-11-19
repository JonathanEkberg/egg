import { redirect } from "next/navigation"
import { isLoggedIn } from "@/server/authentication"
import { cookies } from "next/headers"
import { Orders } from "./Orders"
import { trpc } from "@/server/trpc/server"

export default async function OrdersPage() {
  const cookieStore = await cookies()
  const user = isLoggedIn(cookieStore)

  if (!user) {
    return redirect("/")
  }

  void (await trpc.order.getOrders.prefetch())

  return <Orders />
}
