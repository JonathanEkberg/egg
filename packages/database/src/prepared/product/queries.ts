import { sql } from "drizzle-orm"
import { db } from "../.."

export const getProductWithReviewsById = db.query.productTable
  .findFirst({
    where: (fields, { eq }) => eq(fields.id, sql.placeholder("productId")),
    columns: {
      id: true,
      createdAt: true,
      updatedAt: true,
      name: true,
      description: true,
      imageUrl: true,
      priceUsd: true,
      stock: true,
    },
    with: {
      reviews: {
        where: (f, { eq }) => eq(f.productId, sql.placeholder("productId")),
        orderBy: (f, { desc }) => desc(f.createdAt),
        limit: 10,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        columns: {
          userId: false,
          productId: false,
        },
      },
    },
  })
  .prepare("get_product_with_reviews_by_id")
