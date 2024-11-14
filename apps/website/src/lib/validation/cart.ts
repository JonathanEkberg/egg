import { z } from "zod"

export const deleteProductItemSchema = z.object({
  id: z.string().uuid(),
})

export const addProductToCart = z.object({
  id: z.string().uuid(),
})
