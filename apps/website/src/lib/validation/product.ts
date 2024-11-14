import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().max(256),
  description: z.string().max(65536).optional(),
  priceUsd: z.string(),
  stock: z.number().positive(),
  imageUrl: z.string().url(),
})
