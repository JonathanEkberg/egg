import React from "react"
import { redirect } from "next/navigation"
import { isLoggedIn } from "@/server/authentication"
import { cookies } from "next/headers"
import { Header } from "@/components/Header"

interface VerifyLayoutProps {
  children: React.ReactNode
}

export default async function VerifyLayout({ children }: VerifyLayoutProps) {
  const cookieStore = await cookies()
  if (!isLoggedIn(cookieStore)) {
    redirect("/")
  }

  return (
    <>
      <Header onlyLogout />
      {children}
    </>
  )
}
