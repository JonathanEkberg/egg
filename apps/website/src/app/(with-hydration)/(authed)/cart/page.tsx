"use client"
import React from "react"
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
import { CartItemAmount } from "@/components/Cart/CartItemAmount"
import { DollarFormatter } from "@/components/DollarFormatter"
import { trpc } from "@/server/trpc/client"

interface CartPageProps {}

export default function CartPage({}: CartPageProps) {
  // const count = trpc.cart.getMyCount.useQuery()
  const total = trpc.cart.getTotal.useQuery()
  const items = trpc.cart.getItems.useQuery()

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
              {items.data &&
                items.data.map(item => (
                  <TableRow key={item.product.id}>
                    <TableCell className="flex items-center space-x-4 font-medium">
                      <Image
                        className="rounded-xl"
                        src={item.product.imageUrl}
                        alt={`${item.product.name} image`}
                        width={96}
                        height={96}
                      />
                      <div className="overflow-hidden text-xl">
                        {item.product.name}
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      <DollarFormatter
                        value={Number(item.product.priceUsd) ?? 0}
                      />
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      <CartItemAmount
                        productId={item.product.id}
                        defaultAmount={item.amount}
                      />
                    </TableCell>

                    <TableCell className="text-center font-medium">
                      <DollarFormatter
                        value={
                          item.amount * (Number(item.product.priceUsd) ?? 0)
                        }
                      />
                    </TableCell>

                    <TableCell className="text-right">
                      {/* <form action={removeCartItemAction}> */}
                      {/* <input
                        readOnly
                        hidden
                        type="number"
                        name="sciId"
                        value={item.sci_id}
                      /> */}
                      <Button
                        className="h-8 w-8"
                        size="icon"
                        variant="destructive"
                      >
                        <Trash size={16} />
                      </Button>
                      {/* </form> */}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex w-full justify-between">
          <div className="text-xl">
            <span className="text-muted-foreground">Total:</span>{" "}
            <DollarFormatter
              className="font-medium"
              value={total.data?.total ?? 0}
            />
          </div>
          {/* <form action={purchaseAction}> */}
          <Button
            type="submit"
            variant="default"
            disabled={items.data?.length === 0}
          >
            Purchase
          </Button>
          {/* </form> */}
        </CardFooter>
      </Card>
    </div>
  )
}
