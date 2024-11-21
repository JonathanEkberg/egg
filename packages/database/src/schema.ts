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

export const orderStatus = [
  "pending",
  "processing",
  "shipped",
  "delivered",
] as const
export type OrderStatus = (typeof orderStatus)[number]
export const orderStatusEnum = pgEnum("order_status", orderStatus)

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
    .references(() => userTable.id, { onDelete: "cascade" }),
})

export const userEmailVerificationTable = pgTable("user_email_verification", {
  ...base,
  code: integer("code").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id, { onDelete: "cascade" }),
})

export const orderTable = pgTable("order", {
  ...base,
  status: orderStatusEnum("status").default("pending").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
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
export const userRelations = relations(userTable, ({ many, one }) => ({
  orders: many(orderTable),
  refreshTokens: many(refreshTokenTable),
  reviews: many(reviewTable),
  shoppingCartItems: many(shoppingCartItemTable),
}))

export const userEmailVerificationRelations = relations(
  refreshTokenTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [refreshTokenTable.userId],
      references: [userTable.id],
    }),
  }),
)

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
