import { sql } from "drizzle-orm"
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
