"use client"
import React, { useRef, useState } from "react"
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
// import { makeReviewAction } from "@/app/actions"
import { toast } from "sonner"
import { Label } from "../ui/label"
import { trpc } from "@/server/trpc/client"
import { useRouter } from "next/navigation"
import { produce } from "immer"

interface MakeReviewButtonProps {
  productId: string
}

export function MakeReviewButton({ productId }: MakeReviewButtonProps) {
  const router = useRouter()
  const me = trpc.user.getMe.useQuery()
  const reviewTextRef = useRef<HTMLTextAreaElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [stars, setStars] = useState<number>(4)

  const utils = trpc.useUtils()
  const makeReview = trpc.review.makeReview.useMutation({
    onError(error, variables, context) {
      toast.error(error.message)
    },
    onSuccess(error, variables, context) {
      utils.product.getProduct.invalidate({ id: productId })
    },
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const review = reviewTextRef.current?.value

    if (!review) {
      return
    }
    try {
      e.preventDefault()

      makeReview.mutate({
        productId,
        review,
        stars,
      })
      setOpen(false)
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        onClick={e => {
          if (!me.data) {
            e.preventDefault()
            router.push("/auth/login")
            setOpen(false)
          }
        }}
      >
        <Button variant="secondary" disabled={makeReview.isPending}>
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
                    onClick={() => {
                      if (!makeReview.isPending) {
                        setStars(idx + 1)
                      }
                    }}
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
                    onClick={() => {
                      if (!makeReview.isPending) {
                        setStars(stars + idx + 1)
                      }
                    }}
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
            <Textarea
              disabled={makeReview.isPending}
              ref={reviewTextRef}
              className="max-h-64"
              minLength={3}
              name="review"
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
