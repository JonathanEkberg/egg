import { eq, sql } from "drizzle-orm"
import { db, reviewTable } from "../.."

export const getReviewById = db
  .select({ userId: reviewTable.userId })
  .from(reviewTable)
  .where(eq(reviewTable.id, sql.placeholder("id")))
  .prepare("get_review_by_id")
