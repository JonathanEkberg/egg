import { z } from "zod"

export const makeReviewSchema = z.object({
  productId: z.string().uuid(),
  stars: z.number().min(1).max(5),
  review: z.string().max(8192),
})

export const deleteReviewSchema = z.object({
  id: z.string().uuid(),
})
