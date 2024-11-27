import React from "react"
import { Button } from "../ui/button"
import { trpc } from "@/server/trpc/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CartPurchaseButtonProps {
  hasItems: boolean
}

export function CartPurchaseButton({ hasItems }: CartPurchaseButtonProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const purchase = trpc.cart.purchase.useMutation({
    onError(error, variables, context) {
      toast.error(error.message)
    },
    onSuccess() {
      utils.cart.getMyCount.invalidate()
      router.push("/orders")
    },
  })

  return (
    <Button
      onClick={() => purchase.mutate()}
      type="submit"
      variant="default"
      disabled={purchase.isPending || !hasItems}
    >
      Purchase
    </Button>
  )
}
