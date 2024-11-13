import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().max(256),
  description: z.string().max(65536).optional(),
  priceUsd: z.string(),
  stock: z.number().positive(),
  imageUrl: z.string().url(),
})

export const makeReviewSchema = z.object({
  productId: z.string().uuid(),
  stars: z.number().min(1).max(5),
  review: z.string().max(8192),
})

export const deleteReviewSchema = z.object({
  id: z.string().uuid(),
})

export const addProductToCart = z.object({
  id: z.string().uuid(),
})
