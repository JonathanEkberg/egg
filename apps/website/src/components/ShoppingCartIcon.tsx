import React from "react"
import { pool } from "@/lib/database"
import Link from "next/link"
import { Button } from "./ui/button"
import { getUser } from "@/lib/user"
import { ShoppingBasket } from "lucide-react"
import clsx from "clsx"

async function getShoppingCartCount(userId: number) {
  const query = await pool.execute(
    "SELECT SUM(amount) as sum FROM shopping_cart_item WHERE user_id=?",
    [userId],
  )
  return (query[0] as [{ sum: number }])[0].sum
}

interface ShoppingCartIconProps {}

export async function ShoppingCartIcon({}: ShoppingCartIconProps) {
  const user = getUser()

  if (!user) {
    return null
  }

  const count = await getShoppingCartCount(user.id)

  return (
    <Link href={`/cart`} className="relative">
      <Button size="icon">
        <ShoppingBasket />
      </Button>

      {count > 0 && (
        <div
          className={clsx(
            "absolute -right-3 -top-3 min-h-6 min-w-6 rounded-full border bg-card p-0.5 text-center text-sm font-bold shadow-sm",
            count > 99
              ? "-right-6 -top-4 px-2"
              : count > 9
                ? "-right-5 -top-4 px-2"
                : undefined,
          )}
        >
          {count > 99 ? "99+" : count}
        </div>
      )}
    </Link>
  )
}
