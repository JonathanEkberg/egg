import React from "react"
// import { StarIcon } from "lucide-react"
// import dayjs from "dayjs"
import { ProductPageComponent } from "./ProductId"
import { trpc } from "@/server/trpc/server"

interface ProductPageProps {
  // From the '[productsId]' dynamic route
  params: Promise<{ productId: string }>
}

export default async function ProductIdPage(props: ProductPageProps) {
  const productId = (await props.params).productId
  void (await trpc.product.getProduct.prefetch({ id: productId }))

  return <ProductPageComponent productId={productId} />
}
