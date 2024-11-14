import { db, productTable, shoppingCartItemTable } from "@egg/database"
import { sum, eq, sql } from "@egg/database/drizzle"
import { createTRPCRouter } from "../../init"
import { authProcedure } from "../../procedures"
import { getItemsRoute } from "./getItems"
import { addProductToCartRoute } from "./addProductToCart"
import { deleteProductItemRoute } from "./deleteProductItem"
import { changeCartAmountRoute } from "./changeCartAmount"
import { TRPCError } from "@trpc/server"

const preparedGetShoppingCartCount = db
  .select({ total: sum(shoppingCartItemTable.amount) })
  .from(shoppingCartItemTable)
  .where(eq(shoppingCartItemTable.userId, sql.placeholder("userId")))
  .prepare("prepared_get_shopping_cart_count")

const preparedGetShoppingCartTotal = db
  .select({
    totalPrice: sql<number>`
        SUM(${productTable.priceUsd} * ${shoppingCartItemTable.amount})
      `.as("total_price"),
  })
  .from(shoppingCartItemTable)
  .innerJoin(productTable, eq(shoppingCartItemTable.productId, productTable.id))
  .where(eq(shoppingCartItemTable.userId, sql.placeholder("userId")))
  .prepare("prepared_get_shopping_cart_total")

export const cartRouter = createTRPCRouter({
  getItems: getItemsRoute,
  addProductTocCart: addProductToCartRoute,
  changeCartAmount: changeCartAmountRoute,
  deleteProductItem: deleteProductItemRoute,
  getMyCount: authProcedure.query(async function ({ ctx }) {
    try {
      const [result] = await preparedGetShoppingCartCount.execute({
        userId: ctx.user.id,
      })

      return { count: Number(result.total) ?? 0 }
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not get your count.",
      })
    }
  }),
  getTotal: authProcedure.query(async function ({ ctx }) {
    try {
      const [result] = await preparedGetShoppingCartTotal.execute({
        userId: ctx.user.id,
      })

      return { total: Number(result.totalPrice) ?? 0 }
    } catch (e) {
      console.error(e)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not get your total.",
      })
    }
  }),
})
