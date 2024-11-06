"use client"
import React, { useState } from "react"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { addToCartAction } from "@/app/actions"
import { Loader } from "lucide-react"

interface AddToCartProps {
  productId: number
  productStock: number
}

export function AddToCart({ productId, productStock }: AddToCartProps) {
  const [loading, setLoading] = useState<boolean>(false)
  return (
    <form
      action={async formData => {
        setLoading(true)
        try {
          await addToCartAction(formData)
          toast.success("Product added to shopping cart.", {})
        } catch (e) {
          toast.error("Could not add item to shopping cart")
        } finally {
          setLoading(false)
        }
      }}
    >
      <input hidden readOnly value={productId} name="productId" />
      <Button type="submit" disabled={loading || !productStock}>
        {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        Add to cart
      </Button>
    </form>
  )
}
