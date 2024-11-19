import { createTRPCRouter } from "../../init"
import { deleteOrderRoute } from "./deleteOrder"
import { getOrdersRoute } from "./getOrders"

export const orderRouter = createTRPCRouter({
  getOrders: getOrdersRoute,
  deleteOrder: deleteOrderRoute,
})
