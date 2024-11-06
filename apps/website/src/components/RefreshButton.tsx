"use client"

import { refreshProducts } from "@/app/actions"
import React, { useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { RefreshCcw } from "lucide-react"

interface RefreshButtonProps {}

export function RefreshButton({}: RefreshButtonProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form action={refreshProducts} ref={formRef}>
      <Button type="submit" variant="outline">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </form>
  )
}
