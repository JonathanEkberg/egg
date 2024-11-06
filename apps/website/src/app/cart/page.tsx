import React from "react"
import { pool } from "@/lib/database"
import { getUser } from "@/lib/user"
import { redirect } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { purchaseAction, removeCartItemAction } from "../actions"
import { CartItemAmount } from "@/components/Cart/CartItemAmount"
import { DollarFormatter } from "@/components/DollarFormatter"

const getShoppingCartItems = async (userId: number) => {
    const data = await pool.execute(
      `SELECT
sci.id as sci_id, sci.amount as sci_amount,
p.id as p_id, p.name as p_name, p.image as p_image, p.price_usd as p_price_usd
FROM shopping_cart_item sci
INNER JOIN product p ON p.id = sci.product_id
WHERE sci.user_id = ?;`,
      [userId],
    )

    return data[0] as {
      sci_id: number
      sci_amount: number
      p_id: number
      p_name: string
      p_image: string
      p_price_usd: number | null
    }[]
 }

const getShoppingCartTotal = async (userId: number) => {
    const data = await pool.execute(
      `SELECT
SUM(sci.amount * p.price_usd) as total_price
FROM shopping_cart_item sci
INNER JOIN product p ON p.id = sci.product_id
WHERE sci.user_id = ?;`,
      [userId],
    )

    return (
      data[0] as [
        {
          total_price: number
        },
      ]
    )[0].total_price
  }


interface CartPageProps {}

export default async function CartPage({}: CartPageProps) {
  const user = getUser()

  if (!user) {
    redirect("/")
  }

  const [items, total] = await Promise.all([
    getShoppingCartItems(user.id),
    getShoppingCartTotal(user.id),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* <h1 className="text-3xl font-bold tracking-tight">Shopping cart</h1> */}
      <Card>
        <CardHeader>
          <CardTitle>Shopping cart</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Product</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Remove</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.sci_id}>
                  <TableCell className="flex items-center space-x-4 font-medium">
                    <Image
                      className="rounded-xl"
                      src={item.p_image}
                      alt={`${item.p_name} image`}
                      width={96}
                      height={96}
                    />
                    <div className="overflow-hidden text-xl">{item.p_name}</div>
                  </TableCell>

                  <TableCell className="text-center font-medium">
                    <DollarFormatter value={item.p_price_usd ?? 0} />
                  </TableCell>

                  <TableCell className="text-center font-medium">
                    <CartItemAmount
                      sciId={item.sci_id}
                      defaultAmount={item.sci_amount}
                    />
                  </TableCell>

                  <TableCell className="text-center font-medium">
                    <DollarFormatter
                      value={item.sci_amount * (item.p_price_usd ?? 0)}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <form action={removeCartItemAction}>
                      <input
                        readOnly
                        hidden
                        type="number"
                        name="sciId"
                        value={item.sci_id}
                      />
                      <Button
                        className="h-8 w-8"
                        size="icon"
                        variant="destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex w-full justify-between">
          <div className="text-xl">
            <span className="text-muted-foreground">Total:</span>{" "}
            <DollarFormatter className="font-medium" value={total} />
          </div>
          <form action={purchaseAction}>
            <Button
              type="submit"
              variant="default"
              disabled={items.length === 0}
            >
              Purchase
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
