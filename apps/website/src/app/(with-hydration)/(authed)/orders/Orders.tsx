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

export function Orders() {
  return null
  // return (
  //   <div className="mx-auto w-full max-w-2xl">
  //     <Table>
  //       <TableHeader>
  //         <TableRow>
  //           <TableHead className="w-24 text-left">Order</TableHead>
  //           <TableHead className="w-24 text-left">Status</TableHead>
  //           <TableHead className="w-24 text-center">Total</TableHead>
  //           <TableHead className="w-full text-left">Items</TableHead>
  //           <TableHead className="text-right">Manage</TableHead>
  //         </TableRow>
  //       </TableHeader>
  //       <TableBody>
  //         {Object.entries(orders).map(([orderId, items]) => (
  //           <TableRow key={orderId}>
  //             <TableCell className="flex items-center space-x-4 font-medium">
  //               <div>{orderId}</div>
  //             </TableCell>

  //             <TableCell>
  //               <div>
  //                 {Boolean(items.at(0)?.delivered) === true ? (
  //                   <Badge className="bg-green-500 text-white">Delivered</Badge>
  //                 ) : (
  //                   <Badge className="bg-blue-500 text-white">Processing</Badge>
  //                 )}
  //               </div>
  //             </TableCell>

  //             <TableCell className="font-medium">
  //               <DollarFormatter
  //                 value={items
  //                   .map(item => Number(item.price_usd))
  //                   .reduce((total, curr) => total + curr)}
  //               />
  //             </TableCell>
  //             <TableCell className="font-medium">
  //               {items
  //                 .map(item => ({
  //                   id: item.product_id,
  //                   name: item.name,
  //                 }))
  //                 .map((product, idx) => (
  //                   <span key={product.id}>
  //                     <Link
  //                       className="underline"
  //                       href={`/products/${product.id}`}
  //                     >
  //                       {product.name}
  //                     </Link>
  //                     <span>{idx !== items.length - 1 && ", "}</span>
  //                   </span>
  //                 ))}
  //             </TableCell>

  //             <TableCell className="flex-end flex w-full space-x-2 text-right">
  //               {/* <form action={removeCartItemAction}> */}
  //               <input
  //                 readOnly
  //                 hidden
  //                 type="number"
  //                 name="sciId"
  //                 // value={item.sci_id}
  //               />
  //               <Button>
  //                 <Link href={`/orders/${orderId}`}>View</Link>
  //               </Button>
  //               <form action={deleteOrderAction}>
  //                 <input name="orderId" readOnly hidden value={orderId} />
  //                 <Button
  //                   disabled={items.at(0)?.delivered}
  //                   // className="w-10 h-10"
  //                   // size="icon"
  //                   variant="destructive"
  //                   type="submit"
  //                 >
  //                   Cancel
  //                   {/* <Trash size={16} /> */}
  //                 </Button>
  //               </form>
  //             </TableCell>
  //           </TableRow>
  //         ))}
  //       </TableBody>
  //     </Table>
  //   </div>
  // )
}
