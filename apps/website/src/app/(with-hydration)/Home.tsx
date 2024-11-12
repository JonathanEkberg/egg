"use client"
import { CreateProduct } from "@/components/CreateProduct"
import { ProductList } from "@/components/ProductList"
import { trpc } from "@/server/trpc/client"
import { Loader, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Home() {
  // const meQuery = trpc.user.getMe.useQuery()
  const productsQuery = trpc.product.getProducts.useQuery()

  // if (meQuery.isLoading || productsQuery.isLoading) {
  //   // if (true) {
  //   return (
  //     <div className="mx-auto flex w-full max-w-xl justify-center space-y-8 pt-16 text-center">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //     </div>
  //   )
  // }

  return (
    <div className="mx-auto w-full max-w-xl space-y-8">
      {/* {meQuery.data?.role !== "user" && <CreateProduct />} */}
      <ul className="space-y-4">
        {productsQuery.data?.map(d => (
          <li key={d.id}>
            <Link href={`/products/${d.id}`}>
              <div className="flex items-center space-x-8">
                <Image
                  className="object-fit rounded-contain"
                  width={192}
                  height={192}
                  src={d.imageUrl}
                  alt={`Image for product '${d.name}'.`}
                />
                <div>
                  <div className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    {d.name}
                  </div>
                  <p>{d.description}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
