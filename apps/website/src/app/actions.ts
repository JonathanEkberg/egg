"use server"

import { pool } from "@/lib/database"
import { getUser } from "@/lib/user"
import { revalidatePath, revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function refreshProducts() {
  revalidatePath("/")
}

export async function makeReviewAction(formData: FormData) {
  const user = getUser()

  if (!user) {
    throw new Error("You must be logged in to make a review!")
  }

  const [review, stars, productId] = [
    formData.get("review"),
    formData.get("stars"),
    formData.get("productId"),
  ]

  // 1. Get shopping cart items
  await pool.execute(
    `INSERT INTO \`review\` (text, stars, product_id, user_id) VALUES (?, ?, ?, ?);`,
    [
      review,
      parseInt(stars!.toString()),
      parseInt(productId!.toString()),
      user.id,
    ],
  )

  revalidateTag("product-id")
  revalidatePath(`/product/${productId}`)
}

export async function deleteOrderAction(formData: FormData) {
  const user = getUser()

  if (!user) {
    throw new Error("You must be logged in to remove a order!")
  }
  const orderId = formData.get("orderId")

  const conn = await pool.getConnection()

  await conn.beginTransaction()

  const orderItemsQuery = await conn.execute(
    `SELECT amount, product_id from order_item WHERE order_id = ?
  `,
    [orderId],
  )

  const orderItems = orderItemsQuery[0] as {
    amount: number
    product_id: number
  }[]

  for (const item of orderItems) {
    await pool.execute(`UPDATE product SET stock=stock+? WHERE id=?`, [
      item.amount,
      item.product_id,
    ])
  }
  await pool.execute(`DELETE FROM \`order\` WHERE id = ?`, [orderId])

  await conn.commit()

  revalidateTag("orders")
  revalidateTag("cart-total")
  revalidateTag("cart-items")
  revalidatePath(`/orders`)
}

export async function deleteProduct(id: number) {
  const user = getUser()

  if (!user || user.role !== "ADMIN") {
    throw new Error("You must be an admin to remove a product!")
  }

  await pool.execute(`DELETE FROM product WHERE id=?`, [id])

  revalidateTag("orders")
  revalidateTag("cart-total")
  revalidateTag("cart-items")
  revalidateTag("products")
  revalidatePath(`/`)
  redirect("/")
}

export async function purchaseAction() {
  const user = getUser()

  if (!user) {
    throw new Error("You must be logged in to add to cart!")
  }

  // await pool.beginTransaction();
  const conn = await pool.getConnection()

  await conn.beginTransaction()

  // 1. Get shopping cart items
  const itemsQuery = await conn.execute(
    `SELECT sci.id, product_id, user_id, amount, stock, SUM(amount * price_usd) as real_price
    FROM shopping_cart_item sci
    INNER JOIN product ON sci.product_id = product.id
    WHERE sci.user_id = ? 
    GROUP BY sci.id;`,
    [user.id],
  )
  const items = itemsQuery[0] as {
    id: number
    product_id: number
    user_id: number
    amount: number
    stock: number
    real_price: number
  }[]

  if (items.length === 0) {
    return
  }

  const productStockUpdates = []
  for (const item of items) {
    // Ordering more than in stock
    if (item.amount > item.stock) {
      await conn.rollback()
      redirect(
        `/cart?toast=${encodeURIComponent(
          JSON.stringify({
            type: "error",
            message: `You cannot order more items than we have in stock. Ordering ${item.amount} but ${item.stock} in stock.`,
          }),
        )}`,
      )
    }

    if (item.real_price > 2_000_000_000) {
      await conn.rollback()
      redirect(
        `/cart?toast=${encodeURIComponent(
          JSON.stringify({
            type: "error",
            message: "You're buying too many eggs",
          }),
        )}`,
      )
    }

    productStockUpdates.push(
      await conn.execute(
        `UPDATE \`product\` p SET p.stock=p.stock-? WHERE id=?;`,
        [item.amount, item.product_id],
      ),
    )
    revalidatePath(`/products/${item.product_id}`)
  }
  console.log(`Updating ${productStockUpdates.length} product stocks`)
  await Promise.all(productStockUpdates)

  await conn.execute(`INSERT INTO \`order\` (user_id) VALUES (?);`, [user.id])
  const orderQuery = await conn.execute(
    `SELECT id from \`order\` WHERE user_id = ? ORDER BY created_at DESC;`,
    [user.id],
  )

  const order = orderQuery[0] as [
    {
      id: number
    },
  ]

  // 2. Get each item product and the prices
  for (const item of items) {
    await conn.execute(
      `INSERT INTO order_item (order_id, product_id, price_usd, amount) VALUES (?, ?, ?, ?);`,
      [order[0].id, item.product_id, item.real_price, item.amount],
    )
  }

  await conn.execute(`DELETE FROM shopping_cart_item WHERE user_id = ?;`, [
    user.id,
  ])

  await conn.commit()
  revalidateTag("orders")
  revalidateTag("cart-total")
  revalidateTag("cart-items")
  revalidatePath(`/orders`)
  redirect("/orders")
}

export async function addToCartAction(formData: FormData) {
  const productId = formData.get("productId")

  if (!productId) {
    throw new Error("Missing product id")
  }

  const user = getUser()

  if (!user) {
    throw new Error("You must be logged in to add to cart!")
  }

  // 1. Check if product exists
  const data = await pool.execute("SELECT id FROM product WHERE id=?", [
    productId,
  ])

  const id = data[0] as [{ id: number }] | []

  if (!id) {
    throw new Error("Could not find product")
  }

  await pool.execute(
    `INSERT INTO shopping_cart_item (user_id, product_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE amount = amount + 1;`,
    [user.id, productId],
  )
  revalidatePath(`/products/${productId}`)
  revalidateTag("cart-items")
  revalidateTag("cart-total")
}

export async function updateCartItemAmountAction(formData: FormData) {
  const user = getUser()

  if (!user) {
    throw new Error("You must be logged in!")
  }

  const [cartItemId, direction] = [
    formData.get("sciId"),
    formData.get("direction"),
  ]

  if (!cartItemId || !direction) {
    throw new Error("Failed to update")
  }

  const sciId = parseInt(cartItemId.toString())

  if (!Number.isSafeInteger(sciId)) {
    throw new Error("Invalid shopping cart item ID")
  }

  // 1. Check if cart item exists
  const data = await pool.execute(
    "SELECT id FROM shopping_cart_item WHERE id=?",
    [sciId],
  )

  const id = data[0] as [{ id: number }] | []

  if (!id[0]?.id) {
    throw new Error("Could not find product")
  }

  await pool.execute(
    `UPDATE shopping_cart_item SET amount = amount ${
      direction === "+" ? "+" : "-"
    } 1 WHERE id = ?;`,
    [id[0].id],
  )
  revalidateTag("cart-items")
  revalidateTag("cart-total")
}

export async function updateCartItemSpecificAmountAction(formData: FormData) {
  const user = getUser()

  if (!user) {
    throw new Error("You must be logged in!")
  }

  const [unsafeCartItemId, unsafeAmount] = [
    formData.get("sciId"),
    formData.get("amount"),
  ]

  if (!unsafeCartItemId || unsafeAmount === null) {
    throw new Error("Failed to update")
  }

  const sciId = parseInt(unsafeCartItemId.toString())
  const amount = parseInt(unsafeAmount.toString())

  if (!Number.isSafeInteger(sciId) || sciId < 0) {
    throw new Error("Invalid shopping cart item ID")
  }

  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new Error("Amount must be a valid integer greater than zero.")
  }

  const data = await pool.execute(
    "SELECT id FROM shopping_cart_item WHERE id=?",
    [sciId],
  )

  const id = data[0] as [{ id: number }] | []

  if (!id[0]?.id) {
    throw new Error("Could not find cart item.")
  }

  await pool.execute(`UPDATE shopping_cart_item SET amount = ? WHERE id = ?;`, [
    amount,
    id[0].id,
  ])
  revalidateTag("cart-items")
  revalidateTag("cart-total")
}

export async function removeCartItemAction(formData: FormData) {
  const user = getUser()

  if (!user) {
    throw new Error("You must be logged in!")
  }

  const cartItemId = formData.get("sciId")

  if (!cartItemId) {
    throw new Error("Failed to update")
  }

  const sciId = parseInt(cartItemId.toString())

  if (!Number.isSafeInteger(sciId)) {
    throw new Error("Invalid shopping cart item ID")
  }

  // 1. Check if cart item exists
  await pool
    .execute("DELETE FROM shopping_cart_item WHERE id=?", [sciId])
    .catch(e => {})
  revalidateTag("cart-total")
}

export async function logoutAction() {
  "use server"
  (await cookies()).delete("u_id")
  (await cookies()).delete("u_name")
  (await cookies()).delete("u_role")
  revalidatePath("/")
}

const eggs: string[] = [
  "Intergalactical",
  "Blue",
  "Gold",
  "Disco",
  "Chernobyl",
  "Fade",
  "Willys",
  "Apple",
  "The Last of Us",
  "Sir",
  "Hawaii",
  "Holy Grail",
  "Vanilla",
  "Pre cracked",
  "Pride",
  "Black",
  "Bullet Proof",
  "Kitsch",
  "Milkyway",
  "International",
  "Delicacy",
  "Probiotic",
  "Koh-i-Noor",
  "Rolex",
  "Fabergé",
  "Påsk",
]

export async function resetDatabase(formData: FormData) {
  "use server"
  await pool.execute("DELETE FROM product WHERE true;")

  // "sort" is in-place so make a copy
  const random = [...eggs].sort(() => Math.random() * 2 - 1)
  const sql = `
INSERT INTO product (name, description, image) VALUES
${random.map(() => "  (?, ?, ?)").join(",\n")};`
  const values: string[] = []
  for (let i = 0; i < random.length; i++) {
    const egg = random[i]
    values.push(
      egg,
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      `https://d0018e.aistudybuddy.se/eggs/egg-${eggs.findIndex(
        val => val === egg,
      )}.jpeg`,
    )
  }
  await pool.execute(sql, values)
  revalidateTag("products")
  revalidatePath("/")
}
