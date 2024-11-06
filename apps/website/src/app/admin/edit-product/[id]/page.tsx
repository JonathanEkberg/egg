import React from "react"
import { pool } from "@/lib/database"
import { EditProduct } from "@/components/EditProduct"
import { getUser } from "@/lib/user"
import { notFound, redirect } from "next/navigation"

async function getProduct(id: number) {
  const data = await pool.execute(
    `SELECT id, name, description, image, price_usd as price, stock FROM product WHERE id = ?;`,
    [id],
  )

  return (
    data[0] as
      | [
          {
            id: number
            name: string
            description: string
            image: string
            price: number | null
            stock: number | null
          },
        ]
      | []
  )[0]
}

interface AdminCreateProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminCreateProductPage(props: AdminCreateProductPageProps) {
  const params = await props.params;

  const {
    id
  } = params;

  const user = getUser()

  if (!user || user.role !== "ADMIN") {
    return redirect("/")
  }

  const product = await getProduct(parseInt(id))

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <EditProduct {...product} />
    </div>
  )
}
