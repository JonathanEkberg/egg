import { createTRPCRouter } from "../../init"
import { adminDeleteOrderRoute } from "./deleteOrder"
import { adminGetOrdersRoute } from "./getOrders"
import { adminSetOrderStatusRoute } from "./setOrderStatus"

export const adminRouter = createTRPCRouter({
  getOrders: adminGetOrdersRoute,
  deleteOrder: adminDeleteOrderRoute,
  setOrderStatus: adminSetOrderStatusRoute,
})
