import { z } from "zod"

export const deleteProductItemSchema = z.object({
  id: z.string().uuid(),
})

export const addProductToCartSchema = z.object({
  id: z.string().uuid(),
})

export const changeCartAmountSchema = z.object({
  productId: z.string().uuid(),
  amount: z.number().int(),
})
