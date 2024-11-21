import { createTRPCRouter } from "../../init"
import { adminDeleteOrderRoute } from "./deleteOrder"
import { adminDeleteUserRoute } from "./deleteUser"
import { adminGetOrdersRoute } from "./getOrders"
import { adminGetUsersRoute } from "./getUsers"
import { adminSetOrderStatusRoute } from "./setOrderStatus"
import { adminSetUserRoleRoute } from "./setUserRole"

export const adminRouter = createTRPCRouter({
  getOrders: adminGetOrdersRoute,
  deleteOrder: adminDeleteOrderRoute,
  deleteUser: adminDeleteUserRoute,
  setOrderStatus: adminSetOrderStatusRoute,
  getUsers: adminGetUsersRoute,
  setUserRole: adminSetUserRoleRoute,
})
