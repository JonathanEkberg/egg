import React from "react"
import { redirect } from "next/navigation"
import { getSession, isLoggedIn } from "@/server/authentication"
import { cookies } from "next/headers"

interface VerifyLayoutProps {
  children: React.ReactNode
}

export default async function AuthedLayout({ children }: VerifyLayoutProps) {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore, true)

  if (!session || !["admin", "super_admin"].includes(session.role)) {
    redirect("/")
  }

  return children
}
