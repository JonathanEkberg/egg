"use client"
import React, { useState } from "react"
import { Button } from "../ui/button"
import { PlusIcon, StarIcon } from "lucide-react"
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { makeReviewAction } from "@/app/actions"
import { toast } from "sonner"
import { Label } from "../ui/label"

interface MakeReviewButtonProps {
  productId: number
}

export function MakeReviewButton({ productId }: MakeReviewButtonProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [stars, setStars] = useState<number>(5)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true)
    try {
      e.preventDefault()

      if (!("review" in e.target)) {
        return
      }

      const reviewInput = e.target["review"] as HTMLTextAreaElement
      const form = new FormData()
      form.set("stars", String(stars))
      form.set("review", reviewInput.value)
      form.set("productId", String(productId))
      await makeReviewAction(form)
      setOpen(false)
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={loading}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Make review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Make review</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Stars</Label>
            <div className="flex items-center">
              {Array(stars)
                .fill(null)
                .map((_, idx) => (
                  <StarIcon
                    onClick={() => setStars(idx + 1)}
                    size={24}
                    className="cursor-pointer hover:opacity-75"
                    stroke="#f7bf23"
                    fill="#ebaf2f"
                    key={idx}
                  />
                ))}
              {Array(5 - stars)
                .fill(null)
                .map((_, idx) => (
                  <StarIcon
                    onClick={() => setStars(stars + idx + 1)}
                    size={24}
                    className="cursor-pointer stroke-zinc-300 hover:opacity-75 dark:stroke-[#fff9]"
                    // stroke="#fff9"
                    key={idx}
                  />
                ))}
            </div>
          </div>
          <div>
            <Label>Review</Label>
            <Textarea className="max-h-64" minLength={3} name="review" />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
