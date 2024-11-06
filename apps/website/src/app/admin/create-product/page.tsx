import { CreateProduct } from "@/components/CreateProduct"
import { getUser } from "@/lib/user"
import { redirect } from "next/navigation"
import React from "react"

interface AdminCreateProductPageProps {}

export default function AdminCreateProductPage({}: AdminCreateProductPageProps) {
  const user = getUser()

  if (!user || user.role !== "ADMIN") {
    return redirect("/")
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <CreateProduct />
    </div>
  )
}
