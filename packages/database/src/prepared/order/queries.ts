import { sql } from "drizzle-orm"
import { db } from "../.."

export const getOrdersByUserId = db.query.orderTable
  .findMany({
    where: (t, { eq }) => eq(t.userId, sql.placeholder("userId")),
    orderBy: (t, { desc }) => desc(t.createdAt),
    columns: {
      id: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      status: true,
    },
    with: {
      productOrders: {
        with: {
          product: true,
        },
      },
    },
  })
  .prepare("orders_by_user_id")
