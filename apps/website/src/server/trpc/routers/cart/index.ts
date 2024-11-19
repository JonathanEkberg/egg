import { createTRPCRouter } from "../../init"
import { authProcedure } from "../../procedures"
import { getItemsRoute } from "./getItems"
import { addProductToCartRoute } from "./addProductToCart"
import { deleteProductItemRoute } from "./deleteProductItem"
import { changeCartAmountRoute } from "./changeCartAmount"
import { TRPCError } from "@trpc/server"
import { prepared } from "@egg/database/prepared"
import { purchaseRoute } from "./purchase"

export const cartRouter = createTRPCRouter({
  getItems: getItemsRoute,
  purchase: purchaseRoute,
  addProductTocCart: addProductToCartRoute,
  changeCartAmount: changeCartAmountRoute,
  deleteProductItem: deleteProductItemRoute,
  getMyCount: authProcedure.query(async function ({ ctx }) {
    try {
      const [result] = await prepared.getShoppingCartCountByUserId.execute({
        userId: ctx.user.id,
      })

      return { count: Number(result.total) ?? 0 }
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not get your cart count.",
      })
    }
  }),
  getTotal: authProcedure.query(async function ({ ctx }) {
    try {
      const [result] = await prepared.getShoppingCartTotalByUserId.execute({
        userId: ctx.user.id,
      })

      return { total: Number(result.totalPrice) ?? 0 }
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not get your cart total.",
      })
    }
  }),
})
