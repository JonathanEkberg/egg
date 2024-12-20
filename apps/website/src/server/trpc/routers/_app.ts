import { baseProcedure, createTRPCRouter } from "../init"
import { authRouter } from "./auth"
import { userRouter } from "./user"
import { productRouter } from "./product"
import { reviewRouter } from "./review"
import { cartRouter } from "./cart"
import { orderRouter } from "./order"
import { adminRouter } from "./admin"
import { z } from "zod"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  product: productRouter,
  review: reviewRouter,
  cart: cartRouter,
  order: orderRouter,
  admin: adminRouter,
  setCookieTest: baseProcedure.input(z.string()).mutation(({ ctx, input }) => {
    ctx.cookies.set(input, "123")
  }),
  getCookieTest: baseProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.cookies.get(input)?.value
  }),
})

// export type definition of API
export type AppRouter = typeof appRouter
