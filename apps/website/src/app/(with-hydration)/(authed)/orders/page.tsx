import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { DollarFormatter } from "@/components/DollarFormatter"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { getSession, isLoggedIn } from "@/server/authentication"
import { cookies } from "next/headers"
import { Orders } from "./Orders"

export default async function OrdersPage() {
  const cookieStore = await cookies()
  const user = await getSession(cookieStore, true)

  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return redirect("/")
  }

  return <Orders />
}
