import { trpc } from "@/server/trpc/server"
import { Accounts } from "./Accounts"

export default async function AdminAccountsPage() {
  void (await trpc.admin.getUsers.prefetch())
  return <Accounts />
}
