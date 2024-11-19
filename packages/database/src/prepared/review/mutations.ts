import { eq, sql } from "drizzle-orm"
import { db } from "../.."
import { productTable, reviewTable } from "../../schema"

export const deleteReviewById = db
  .delete(reviewTable)
  .where(eq(reviewTable.id, sql.placeholder("id")))
  .prepare("delete_review")

export const createReview = db
  .insert(reviewTable)
  .values({
    productId: sql.placeholder("productId"),
    stars: sql.placeholder("stars"),
    text: sql.placeholder("text"),
    userId: sql.placeholder("userId"),
  })
  .prepare("create_review")
