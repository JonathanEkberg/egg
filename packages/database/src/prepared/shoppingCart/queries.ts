import { eq, sql, sum } from "drizzle-orm"
import { db, productTable, shoppingCartItemTable } from "../.."

export const getShoppingCartCountByUserId = db
  .select({ total: sum(shoppingCartItemTable.amount) })
  .from(shoppingCartItemTable)
  .where(eq(shoppingCartItemTable.userId, sql.placeholder("userId")))
  .prepare("prepared_get_shopping_cart_count")

export const getShoppingCartTotalByUserId = db
  .select({
    totalPrice: sql<number>`
        SUM(${productTable.priceUsd} * ${shoppingCartItemTable.amount})
      `.as("total_price"),
  })
  .from(shoppingCartItemTable)
  .innerJoin(productTable, eq(shoppingCartItemTable.productId, productTable.id))
  .where(eq(shoppingCartItemTable.userId, sql.placeholder("userId")))
  .prepare("prepared_get_shopping_cart_total")

export const getItemsByUserId = db.query.shoppingCartItemTable
  .findMany({
    where: (t, { eq }) => eq(t.userId, sql.placeholder("userId")),
    orderBy: (t, { desc }) => desc(t.createdAt),
    columns: {
      amount: true,
    },
    with: {
      product: true,
    },
  })
  .prepare("get_user_shopping_cart_items")
