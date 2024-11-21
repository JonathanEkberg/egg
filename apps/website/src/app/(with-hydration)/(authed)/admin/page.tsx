import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/server/authentication"
import { cookies } from "next/headers"
import Link from "next/link"
import React from "react"

interface AdminPageProps {}

export default async function AdminPage({}: AdminPageProps) {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore, true)

  const buttons: {
    title: string
    description: string
    button: { link: string; name: string }
  }[] = [
    {
      title: "Create product",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      button: { link: "/admin/create-product", name: "Create product" },
    },
    // Visible at individual product pages instead
    // {
    //   title: "Edit product",
    //   description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    //   button: { link: "/admin/edit-product", name: "Edit product" },
    // },
    {
      title: "Manage orders",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      button: { link: "/admin/orders", name: "Orders" },
    },
    ...(session?.role === "super_admin"
      ? [
          {
            title: "Manage accounts",
            description: "Set which users have what permissions.",
            button: { link: "/admin/accounts", name: "Manage" },
          },
        ]
      : []),
  ]

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="grid grid-cols-2 gap-4">
        {buttons.map(card => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href={card.button.link}>{card.button.name}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
