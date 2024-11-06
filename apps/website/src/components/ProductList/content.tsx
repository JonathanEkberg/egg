import React from "react"
import { pool } from "@/lib/database"
import { Button } from "../ui/button"
import { Card, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "../ui/badge"
import { getUser } from "@/lib/user"

export const getProducts = async (page: number) => {
    const PRODUCT_PER_PAGE = 10
    const data = await pool.execute(
      `SELECT id, name, description, image FROM product ORDER BY created_at DESC, id LIMIT ? OFFSET ?;`,
      [PRODUCT_PER_PAGE, (page - 1) * PRODUCT_PER_PAGE],
    )

    return data[0] as {
      id: number
      name: string
      description: string
      image: string
    }[]
  }

interface ProductListContentProps {
  page: number
}

export async function ProductListContent({ page }: ProductListContentProps) {
  const user = getUser()
  const products = await getProducts(page)

  return (
    <ul className="space-y-6">
      {products.map(product => (
        <li key={product.id}>
          <Card className="px-6 py-4">
            <div className="flex h-full items-center space-x-4">
              <div className="relative aspect-[3/4] h-32 rounded-lg">
                {/* Show skeleton loader on images without alpha channel */}
                {product.image.endsWith(".jpg") ||
                product.image.endsWith(".jpeg") ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : null}
                <Image
                  className="rounded-lg object-cover"
                  alt={`${product.name} image`}
                  src={product.image}
                  fill
                />
              </div>
              <div className="flex h-full flex-grow flex-col items-start space-y-2">
                <CardTitle className="flex items-center gap-3  border-b pb-2 text-2xl lg:text-3xl">
                  {product.name}
                  <Badge>Egg</Badge>
                </CardTitle>
                <div className="h-full w-full flex-grow">
                  <p className="line-clamp-3 h-full text-base text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Button className="w-full" asChild>
                  <Link href={`/products/${product.id}`}>View</Link>
                </Button>
                {user?.role === "ADMIN" && (
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href={`/admin/edit-product/${product.id}`}>Edit</Link>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export function ProductListContentLoading() {
  return (
    <ul className="w-full space-y-6">
      {Array(10)
        .fill(null)
        .map((_, idx) => (
          <li key={idx} className="h-40 w-full">
            <Card className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="relative aspect-[3/4] h-32 rounded-lg">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
                <div className="w-full space-y-2">
                  <CardTitle className="flex items-center gap-3 border-b pb-2 text-2xl lg:text-3xl">
                    <Skeleton className="h-6 w-24" />
                  </CardTitle>
                  <Skeleton className="h-16 w-full" />
                </div>

                <Skeleton className="h-10 w-20" />
              </div>
            </Card>
          </li>
        ))}
    </ul>
  )
}
