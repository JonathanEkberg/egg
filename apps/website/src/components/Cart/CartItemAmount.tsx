"use client"
import React, { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Check, Minus, Plus } from "lucide-react"
import { updateCartItemSpecificAmountAction } from "@/app/actions"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface CartItemAmountProps {
  /** The shopping cart item ID */
  sciId: number
  /** The default amount chosen for the cart item */
  defaultAmount: number
}

export function CartItemAmount({ defaultAmount, sciId }: CartItemAmountProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [amount, setAmount] = useState<number>(defaultAmount)
  const [numEditing, setNumEditing] = useState<boolean>(false)

  useEffect(
    function () {
      if (loading || amount < 0) {
        return
      }

      const formData = new FormData()
      formData.set("sciId", String(sciId))
      formData.set("amount", String(amount))

      const timeout = setTimeout(async function () {
        try {
          setLoading(true)
          await updateCartItemSpecificAmountAction(formData)
        } catch (e) {
          if (e instanceof Error) {
            toast.error(e.message)
          }
        } finally {
          setLoading(false)
        }
      }, 500)

      return () => clearTimeout(timeout)
    },
    [amount],
  )

  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="flex flex-col items-center space-y-3">
        {numEditing ? (
          //   <form className="flex items-center space-x-2">
          <form
            className="space-y-2"
            // action={updateCartItemSpecificAmountAction}
            onSubmit={e => {
              e.preventDefault()
              // e.target["as"]
              if (!("amount" in e.target)) {
                return
              }
              const amountInput = e.target["amount"] as HTMLInputElement
              const amount = amountInput.valueAsNumber
              setAmount(amount)
              setNumEditing(false)
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
              disabled={amount > 100_000}
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              onClick={() => setAmount(current => (current += 1))}
            >
              <Plus size={12} />
            </Button>
            <div onClick={() => setNumEditing(true)}>{amount}</div>
            <Button
              disabled={amount < 2}
              type="submit"
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              onClick={() => setAmount(current => (current -= 1))}
            >
              <Minus size={12} />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
