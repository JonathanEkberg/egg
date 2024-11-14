import { createTRPCRouter } from "../init"
import { authRouter } from "./auth"
import { userRouter } from "./user"
import { productRouter } from "./product"
import { reviewRouter } from "./review"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  product: productRouter,
  review: reviewRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
