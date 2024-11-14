"use client"
import React, { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Check, Minus, Plus } from "lucide-react"
// import { updateCartItemSpecificAmountAction } from "@/app/actions"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { trpc } from "@/server/trpc/client"

interface CartItemAmountProps {
  /** The product ID */
  productId: string
  /** The default amount chosen for the cart item */
  defaultAmount: number
}

export function CartItemAmount({
  defaultAmount,
  productId,
}: CartItemAmountProps) {
  const [amount, setAmount] = useState<number>(defaultAmount)
  const [numEditing, setNumEditing] = useState<boolean>(false)

  const utils = trpc.useUtils()
  const changeAmount = trpc.cart.changeCartAmount.useMutation({
    onError(error, variables, context) {
      toast.error(error.message)
      utils.cart.getMyCount.invalidate()
      utils.cart.getItems.invalidate()
      utils.cart.getTotal.invalidate()
    },
    onSuccess(data, variables, context) {
      utils.cart.getMyCount.invalidate()
      utils.cart.getItems.invalidate()
      utils.cart.getTotal.invalidate()
    },
  })

  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="flex flex-col items-center space-y-3">
        {numEditing ? (
          //   <form className="flex items-center space-x-2">
          <form
            className="space-y-2"
            onSubmit={e => {
              e.preventDefault()
              // e.target["as"]
              if (!("amount" in e.target)) {
                return
              }
              const amountInput = e.target["amount"] as HTMLInputElement
              const newAmount = amountInput.valueAsNumber
              setAmount(newAmount)
              setNumEditing(false)
              const diff = newAmount - amount
              // console.log(amount, diff)
              changeAmount.mutate({ amount: diff, productId })
            }}
          >
            <Input
              min={1}
              max={100_000}
              name="amount"
              className="w-min min-w-8 max-w-20"
              defaultValue={amount}
              type="number"
            />
            <Button type="submit" size="icon" className="h-6 w-6">
              <Check size={12} />
            </Button>
          </form>
        ) : (
          <>
            <Button
              disabled={amount > 100_000 || changeAmount.isPending}
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                changeAmount.mutate({ amount: 1, productId })
                setAmount(current => current + 1)
              }}
            >
              <Plus size={12} />
            </Button>
            <button onClick={() => setNumEditing(true)}>{amount}</button>
            <Button
              disabled={amount < 2 || changeAmount.isPending}
              type="submit"
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                changeAmount.mutate({ amount: -1, productId })
                setAmount(current => current - 1)
              }}
            >
              <Minus size={12} />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
