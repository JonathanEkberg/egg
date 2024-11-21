import { eq, sql } from "drizzle-orm"
import { db } from "../.."
import { productTable } from "../../schema"

export const createProduct = db
  .insert(productTable)
  .values({
    name: sql.placeholder("name"),
    imageUrl: sql.placeholder("imageUrl"),
    priceUsd: sql.placeholder("priceUsd"),
    stock: sql.placeholder("stock"),
  })
  .returning({ id: productTable.id })
  .prepare("create_product")

export const editProduct = db
  .update(productTable)
  .set({
    name: sql.placeholder("name") as any,
    imageUrl: sql.placeholder("imageUrl") as any,
    priceUsd: sql.placeholder("priceUsd") as any,
    stock: sql.placeholder("stock") as any,
  })
  .where(eq(productTable.id, sql.placeholder("id")))
  .returning({ id: productTable.id })
  .prepare("edit_product")
