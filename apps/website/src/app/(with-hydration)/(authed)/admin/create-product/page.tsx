import { CreateProduct } from "@/components/CreateProduct"
import { getUser } from "@/lib/auth"
// import { getUser } from "@/lib/user"
import { redirect } from "next/navigation"
import React from "react"

interface AdminCreateProductPageProps {}

export default function AdminCreateProductPage({}: AdminCreateProductPageProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <CreateProduct />
    </div>
  )
}
