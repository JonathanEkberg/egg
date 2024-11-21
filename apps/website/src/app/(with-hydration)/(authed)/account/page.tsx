"use client"
import { CreateProduct } from "@/components/CreateProduct"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getUser } from "@/lib/auth"
import { trpc } from "@/server/trpc/client"
// import { getUser } from "@/lib/user"
import Link from "next/link"
import { redirect } from "next/navigation"
import React from "react"

interface AccountPageProps {}

export default function AccountPage({}: AccountPageProps) {
  const sendVerification = trpc.auth.sendTwoFactorEmail.useMutation()

  return (
    <div className="container mx-auto">
      <Button onClick={() => sendVerification.mutate()}>
        Send verification email
      </Button>
    </div>
  )
}
