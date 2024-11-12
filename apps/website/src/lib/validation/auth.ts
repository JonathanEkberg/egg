import { z } from "zod"

const emailSchema = z.object({
  email: z.string().email().max(1000),
})

const nameSchema = z.object({
  name: z.string().max(128),
})

const passwordSchema = z.object({
  password: z.string().max(128),
})

export const registerSchema = nameSchema
  .merge(emailSchema)
  .merge(passwordSchema)

export const loginSchema = emailSchema.merge(passwordSchema)
