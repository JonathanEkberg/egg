"use client"
import React from "react"
import { Button } from "./ui/button"
import { deleteProduct } from "@/app/actions"

interface EditProductDeleteButtonProps {
  id: number
}

export function EditProductDeleteButton({ id }: EditProductDeleteButtonProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      onClick={() => deleteProduct(id)}
    >
      Delete
    </Button>
  )
}
