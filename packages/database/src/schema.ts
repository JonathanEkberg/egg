import {
  text,
  timestamp,
  integer,
  pgEnum,
  uuid,
  varchar,
  pgTable,
  decimal,
  index,
  boolean,
  time,
  primaryKey,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const userRole = ["user", "admin", "super_admin"] as const
export type UserRole = (typeof userRole)[number]
export const userRoleEnum = pgEnum("role", userRole)

const base = {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
} as const

// Tables
export const userTable = pgTable("user", {
  ...base,
  role: userRoleEnum("role").default("user").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  password: varchar("password").notNull(),
})

export const refreshTokenTable = pgTable("refresh_token", {
  id: base.id,
  createdAt: base.createdAt,
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "restrict" }),
})

export const userEmailVerification = pgTable("order", {
  ...base,
  code: integer("code").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "restrict" }),
})

export const orderTable = pgTable("order", {
  ...base,
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "restrict" }),
})

export const productTable = pgTable(
  "product",
  {
    ...base,
    name: varchar("name").notNull(),
    description: text("description"),
    imageUrl: varchar("image_url").notNull(),
    priceUsd: decimal("price_usd").notNull(),
    stock: integer("stock").notNull(),
  },
  table => {
    return {
      createdAtIdx: index("created_at_idx").on(table.createdAt.asc()),
    }
  },
)

export const productOrderTable = pgTable("product_order", {
  ...base,
  amount: integer("amount").notNull(),
  priceUsd: decimal("price_usd").notNull(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orderTable.id, {
      onDelete: "cascade",
    }),
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id, {
      onDelete: "cascade",
    }),
})

export const reviewTable = pgTable("review", {
  ...base,
  stars: integer("stars").notNull(),
  text: text("text").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
    }),
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id, {
      onDelete: "cascade",
    }),
})

export const shoppingCartItemTable = pgTable(
  "shopping_cart_item",
  {
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    amount: integer("amount").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.userId, table.productId] }),
    }
  },
)

// Relations
export const userRelations = relations(userTable, ({ many }) => ({
  orders: many(orderTable),
  refreshTokens: many(refreshTokenTable),
  reviews: many(reviewTable),
  shoppingCartItems: many(shoppingCartItemTable),
}))

export const refreshTokenRelations = relations(
  refreshTokenTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [refreshTokenTable.userId],
      references: [userTable.id],
    }),
  }),
)

export const orderRelations = relations(orderTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [orderTable.userId],
    references: [userTable.id],
  }),
  productOrders: many(productOrderTable),
}))

export const productOrderRelations = relations(
  productOrderTable,
  ({ one }) => ({
    order: one(orderTable, {
      fields: [productOrderTable.orderId],
      references: [orderTable.id],
    }),
    product: one(productTable, {
      fields: [productOrderTable.productId],
      references: [productTable.id],
    }),
  }),
)

export const productRelations = relations(productTable, ({ many }) => ({
  productOrders: many(productOrderTable),
  reviews: many(reviewTable),
  shoppingCartItems: many(shoppingCartItemTable),
}))

export const reviewRelations = relations(reviewTable, ({ one }) => ({
  user: one(userTable, {
    fields: [reviewTable.userId],
    references: [userTable.id],
  }),
  product: one(productTable, {
    fields: [reviewTable.productId],
    references: [productTable.id],
  }),
}))

export const shoppingCartItemRelations = relations(
  shoppingCartItemTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [shoppingCartItemTable.userId],
      references: [userTable.id],
    }),
    product: one(productTable, {
      fields: [shoppingCartItemTable.productId],
      references: [productTable.id],
    }),
  }),
)

// const schema = pgSchema("public")

// export const role = schema.enum("role", ["user", "admin", "super_admin"])

// const timestamps = {
//   updated_at: timestamp()
//     .defaultNow()
//     .$onUpdate(() => new Date()),
//   created_at: timestamp().defaultNow().notNull(),
// }

// export const order = schema.table("order", {
//   id: text().primaryKey().notNull(),
//   ...timestamps,
//   user: text("user_id")
//     .references(() => user.id, { onDelete: "cascade" })
//     .notNull(),
// })

// export const productOrder = schema.table(
//   "product_order",
//   {
//     id: text().primaryKey().notNull(),
//     createdAt: timestamp("created_at", { precision: 3, mode: "string" })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updated_at", {
//       precision: 3,
//       mode: "string",
//     }).notNull(),
//     amount: integer().notNull(),
//     priceUsd: numeric("price_usd", { precision: 65, scale: 30 }).notNull(),
//     orderId: text("order_id").notNull(),
//     productId: text("product_id").notNull(),
//   },
//   table => {
//     return {
//       productOrderOrderIdFkey: foreignKey({
//         columns: [table.orderId],
//         foreignColumns: [order.id],
//         name: "product_order_order_id_fkey",
//       })
//         .onUpdate("cascade")
//         .onDelete("restrict"),
//       productOrderProductIdFkey: foreignKey({
//         columns: [table.productId],
//         foreignColumns: [product.id],
//         name: "product_order_product_id_fkey",
//       })
//         .onUpdate("cascade")
//         .onDelete("restrict"),
//     }
//   },
// )

// export const product = schema.table("product", {
//   id: text().primaryKey().notNull(),
//   createdAt: timestamp("created_at", { precision: 3, mode: "string" })
//     .default(sql`CURRENT_TIMESTAMP`)
//     .notNull(),
//   updatedAt: timestamp("updated_at", {
//     precision: 3,
//     mode: "string",
//   }).notNull(),
//   name: text().notNull(),
//   description: text(),
//   imageUrl: text("image_url").notNull(),
//   priceUsd: numeric("price_usd", { precision: 65, scale: 30 }).notNull(),
//   stock: integer().notNull(),
// })

// export const review = schema.table(
//   "review",
//   {
//     id: text().primaryKey().notNull(),
//     createdAt: timestamp("created_at", { precision: 3, mode: "string" })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updated_at", {
//       precision: 3,
//       mode: "string",
//     }).notNull(),
//     stars: integer().notNull(),
//     text: text().notNull(),
//     userId: text("user_id").notNull(),
//     productId: text("product_id").notNull(),
//   },
//   table => {
//     return {
//       reviewUserIdFkey: foreignKey({
//         columns: [table.userId],
//         foreignColumns: [user.id],
//         name: "review_user_id_fkey",
//       })
//         .onUpdate("cascade")
//         .onDelete("restrict"),
//       reviewProductIdFkey: foreignKey({
//         columns: [table.productId],
//         foreignColumns: [product.id],
//         name: "review_product_id_fkey",
//       })
//         .onUpdate("cascade")
//         .onDelete("restrict"),
//     }
//   },
// )

// export const shoppingCartItem = schema.table(
//   "shopping_cart_item",
//   {
//     id: text().primaryKey().notNull(),
//     createdAt: timestamp("created_at", { precision: 3, mode: "string" })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updated_at", {
//       precision: 3,
//       mode: "string",
//     }).notNull(),
//     amount: integer().notNull(),
//     userId: text("user_id").notNull(),
//     productId: text("product_id").notNull(),
//   },
//   table => {
//     return {
//       shoppingCartItemUserIdFkey: foreignKey({
//         columns: [table.userId],
//         foreignColumns: [user.id],
//         name: "shopping_cart_item_user_id_fkey",
//       })
//         .onUpdate("cascade")
//         .onDelete("restrict"),
//       shoppingCartItemProductIdFkey: foreignKey({
//         columns: [table.productId],
//         foreignColumns: [product.id],
//         name: "shopping_cart_item_product_id_fkey",
//       })
//         .onUpdate("cascade")
//         .onDelete("restrict"),
//     }
//   },
// )

// export const user = schema.table(
//   "user",
//   {
//     id: text().primaryKey().notNull(),
//     createdAt: timestamp("created_at", { precision: 3, mode: "string" })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updated_at", {
//       precision: 3,
//       mode: "string",
//     }).notNull(),
//     role: role().default("user").notNull(),
//     name: text().notNull(),
//     email: text().notNull(),
//     password: text().notNull(),
//   },
//   table => {
//     return {
//       emailKey: uniqueIndex("user_email_key").using(
//         "btree",
//         table.email.asc().nullsLast().op("text_ops"),
//       ),
//     }
//   },
// )
