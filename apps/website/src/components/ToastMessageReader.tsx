"use client"
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import React, { useEffect } from "react"
import { toast } from "sonner"
import { z } from "zod"

const schema = z.object({
  type: z.enum(["success", "error"]),
  message: z.string().max(128),
})

interface ToastMessageReaderProps {}

export function ToastMessageReader({}: ToastMessageReaderProps) {
  const path = usePathname()
  const query = useSearchParams()
  const router = useRouter()
  const toastValue = query.get("toast")

  useEffect(
    function () {
      if (toastValue === null || toastValue.length === 0) {
        return
      }
      try {
        const json = JSON.parse(toastValue)
        const result = schema.safeParse(json)

        if (result.success) {
          const type = result.data.type
          const message = result.data.message

          switch (type) {
            case "error":
              toast.error(message)
              break
            case "success":
              toast.error(message)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setTimeout(() => {
          router.replace(path)
        }, 100)
      }
    },
    [toastValue, path],
  )

  return null
}
