import { CreateProduct } from "@/components/CreateProduct"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getUser } from "@/lib/user"
import Link from "next/link"
import { redirect } from "next/navigation"
import React from "react"

const buttons: {
  title: string
  description: string
  button: { link: string; name: string }
}[] = [
  {
    title: "Create product",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    button: { link: "/admin/create-product", name: "Create" },
  },
  // {
  //     title:" product",
  //     description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  //     link:"/admin/create-product"
  // }
]

interface AdminPageProps {}

export default function AdminPage({}: AdminPageProps) {
  const user = getUser()

  if (!user || user.role !== "ADMIN") {
    return redirect("/")
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="grid grid-cols-2">
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
