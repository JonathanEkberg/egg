import React from "react"
import { redirect } from "next/navigation"
import { isLoggedIn } from "@/server/authentication"
import { cookies } from "next/headers"

interface VerifyLayoutProps {
  children: React.ReactNode
}

export default async function AuthedLayout({ children }: VerifyLayoutProps) {
  const cookieStore = await cookies()

  if (!isLoggedIn(cookieStore)) {
    redirect("/")
  }

  return children
}
