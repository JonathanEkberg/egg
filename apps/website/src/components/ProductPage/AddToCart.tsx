"use client"
import React from "react"
import { Button } from "../ui/button"
import { Loader } from "lucide-react"
import { trpc } from "@/server/trpc/client"
import { toast } from "sonner"

interface AddToCartProps {
  productId: string
  productStock: number
}

export function AddToCart({ productId, productStock }: AddToCartProps) {
  const utils = trpc.useUtils()
  const add = trpc.cart.addProductTocCart.useMutation({
    onError(error, variables, context) {
      toast.error(error.message)
    },
    onSuccess(data, variables, context) {
      utils.cart.getMyCount.invalidate()
      utils.product.getProduct.invalidate({ id: productId })
    },
  })

  return (
    <Button
      type="button"
      onClick={() => add.mutate({ id: productId })}
      disabled={add.isPending || !productStock}
    >
      {/* {add.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />} */}
      Add to cart
    </Button>
  )
}
