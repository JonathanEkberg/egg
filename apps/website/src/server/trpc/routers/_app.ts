import { createTRPCRouter } from "../init"
import { authRouter } from "./auth"
import { userRouter } from "./user"
import { productRouter } from "./product"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  product: productRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
