import { db, productTable, shoppingCartItemTable } from "@egg/database"
import { sum, eq, sql } from "@egg/database/drizzle"
import { createTRPCRouter } from "../../init"
import { authProcedure } from "../../procedures"
import { getItemsRoute } from "./getItems"
import { addProductToCartRoute } from "./addProductToCart"
import { deleteProductItemRoute } from "./deleteProductItem"

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
  .prepare("prepared_get_shopping_cart_count")

export const cartRouter = createTRPCRouter({
  getItems: getItemsRoute,
  addProductTocCart: addProductToCartRoute,
  deleteProductItem: deleteProductItemRoute,
  getMyCount: authProcedure.query(async function ({ ctx }) {
    const [result] = await preparedGetShoppingCartCount.execute({
      userId: ctx.user.id,
    })

    return { count: Number(result.total) ?? 0 }
  }),
  getTotal: authProcedure.query(async function ({ ctx }) {
    const start = performance.now()
    const [result] = await preparedGetShoppingCartTotal.execute({
      userId: ctx.user.id,
    })
    const time = performance.now() - start
    console.log(`Get total time: ${time}ms`)

    return { total: Number(result.totalPrice) ?? 0 }
  }),
})
