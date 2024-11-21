"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { DollarFormatter } from "@/components/DollarFormatter"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { getSession, isLoggedIn } from "@/server/authentication"
import { cookies } from "next/headers"
import { trpc } from "@/server/trpc/client"
import { toast } from "sonner"
import type { OrderStatus } from "@egg/database"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

export function Orders() {
  const orders = trpc.order.getOrders.useQuery()

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24 text-left">Order</TableHead>
            <TableHead className="w-24 text-left">Status</TableHead>
            <TableHead className="w-24 text-center">Total</TableHead>
            <TableHead className="w-full text-left">Items</TableHead>
            <TableHead className="text-right">Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.data?.map(order => (
            <TableRow key={order.id}>
              <TableCell className="flex items-center space-x-4 font-medium">
                <div>{order.id}</div>
              </TableCell>

              <TableCell>
                <div>
                  <OrderStatus orderId={order.id} status={order.status} />
                </div>
              </TableCell>

              <TableCell className="font-medium">
                <DollarFormatter
                  value={order.productOrders
                    .map(item => Number(item.priceUsd) * item.amount)
                    .reduce((total, curr) => total + curr, 0)}
                />
              </TableCell>
              <TableCell className="font-medium">
                {order.productOrders
                  .map(item => ({
                    id: item.id,
                    name: item.product.name,
                  }))
                  .map((product, idx) => (
                    <div key={product.id}>
                      <Link
                        className="underline"
                        href={`/products/${product.id}`}
                      >
                        {product.name}
                      </Link>
                      {/* <span>{idx !== items.length - 1 && ", "}</span> */}
                    </div>
                  ))}
              </TableCell>

              <TableCell className="flex space-x-2">
                <Button>
                  <Link href={`/orders/${order.id}`}>View</Link>
                </Button>
                <CancelOrderButton orderId={order.id} disabled={false} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface CancelOrderButtonProps {
  orderId: string
  disabled: boolean
}

export function CancelOrderButton({
  orderId,
  disabled,
}: CancelOrderButtonProps) {
  const utils = trpc.useUtils()
  const deleteOrder = trpc.order.deleteOrder.useMutation({
    onSuccess(data, variables, context) {
      utils.order.getOrders.invalidate()
    },
    onError(error, variables, context) {
      toast.error(error.message)
    },
  })

  return (
    <Button
      onClick={() => deleteOrder.mutate({ id: orderId })}
      disabled={disabled}
      variant="destructive"
    >
      Cancel
    </Button>
  )
}

interface OrderStatusProps {
  orderId: string
  status: OrderStatus
}

function OrderStatus({ orderId, status }: OrderStatusProps) {
  const [stateStatus, setStateStatus] = useState<OrderStatus>(status)
  const updateStatus = trpc.admin.setOrderStatus.useMutation({
    onSuccess(error, variables, context) {
      toast("Order status updated")
    },
    onError(error, variables, context) {
      toast.error(error.message)
    },
  })

  return (
    <Select
      onValueChange={value => {
        setStateStatus(value as OrderStatus)
        updateStatus.mutate({ status: value as OrderStatus, orderId })
      }}
      value={stateStatus}
      defaultValue={stateStatus}
    >
      <SelectTrigger>
        <SelectValue placeholder={"Status"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="processing">Processing</SelectItem>
        <SelectItem value="shipped">Shipped</SelectItem>
        <SelectItem value="delivered">Delivered</SelectItem>
      </SelectContent>
    </Select>
  )
  // return status === "pending" ? (
  //   <Badge className="bg-zinc-500 text-white">Pending</Badge>
  // ) : status === "processing" ? (
  //   <Badge className="bg-blue-500 text-white">Processing</Badge>
  // ) : status === "shipped" ? (
  //   <Badge className="bg-orange-500 text-white">Shipped</Badge>
  // ) : (
  //   <Badge className="bg-green-500 text-white">Delivered</Badge>
  // )
}
