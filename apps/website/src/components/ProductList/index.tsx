import { pool } from "@/lib/database"
import React, { Suspense } from "react"
import { RefreshButton } from "../RefreshButton"
import Link from "next/link"
import { Button } from "../ui/button"
import { ProductListContent, ProductListContentLoading } from "./content"
import { getUser } from "@/lib/user"
import { PlusIcon } from "lucide-react"
import { ProductListPagination } from "./pagination"
import { redirect } from "next/navigation"

export async function getProductCount() {
  try {
    const data = await pool.query(`SELECT COUNT(id) as count FROM product;`)
    return (data[0] as [{ count: number }])[0]["count"]
  } catch (e) {
    return 0
  }
}

interface ProductListProps {
  page: number
}

export async function ProductList({ page: userPage = 1 }: ProductListProps) {
  const user = getUser()
  // const productCount = await getProductCount()
  // const totalPages = Math.ceil(productCount / 10)

  // if (totalPages > 0 && userPage && userPage > totalPages) {
  //   redirect(`/?page=${encodeURIComponent(totalPages)}`)
  // }

  // // const page = Math.min(Math.max(userPage ?? 1, 1), totalPages);
  // const page = userPage

  return (
    <div className="w-full space-y-4">
      {/* <div className="flex justify-between px-2">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          Products
        </h2>
        <div className="flex space-x-2">
          <RefreshButton />
          {user?.role === "ADMIN" && (
            <Button asChild variant="secondary">
              <Link href="/admin/create-product">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create
              </Link>
            </Button>
          )}
        </div>
      </div>
      <Suspense fallback={<ProductListContentLoading />}>
        <ProductListContent page={page} />
      </Suspense>
      <div className="pb-4">
        <ProductListPagination page={page} total={totalPages} />
      </div> */}
    </div>
  )
}
