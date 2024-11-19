import { z } from "zod"

export const deleteOrderSchema = z.object({
  id: z.string().uuid(),
})
