"use client"
import React, { useEffect } from "react"
import { BoxIcon, StarIcon, Trash } from "lucide-react"
import dayjs from "dayjs"
import { trpc } from "@/server/trpc/client"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { MakeReviewButton } from "@/components/ProductPage/MakeReviewButton"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AddToCart } from "@/components/ProductPage/AddToCart"
import Link from "next/link"

function Review({
  id,
  productId,
  stars,
  createdAt,
  text,
  user,
}: {
  id: string
  productId: string
  stars: number
  createdAt: string
  text: string
  user: { id: string; name: string }
}) {
  // const router = useRouter()
  const me = trpc.user.getMe.useQuery()
  const utils = trpc.useUtils()
  const deleteReview = trpc.review.deleteReview.useMutation({
    onError(error, variables, context) {
      toast.error(error.message)
    },
    onSuccess() {
      utils.product.getProduct.invalidate({ id: productId })
    },
  })
  const isCreator = user.id === me.data?.id

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">{user.name}</span>
            <span className="text-lg font-bold">•</span>
            <div className="text-muted-foreground text-sm">
              {`${dayjs(createdAt).fromNow()} - ${dayjs(
                dayjs(createdAt),
              ).format("LLL")}`}
            </div>
          </div>
        </div>
        <div className="mb-2 flex">
          {Array(stars)
            .fill(null)
            .map((_, idx) => (
              <StarIcon size={20} stroke="#f7bf23" fill="#ebaf2f" key={idx} />
            ))}
          {Array(5 - stars)
            .fill(null)
            .map((_, idx) => (
              <StarIcon
                size={20}
                className="stroke-zinc-300 dark:stroke-[#fff9]"
                stroke="#fff9"
                key={idx}
              />
            ))}
        </div>
        <p className="break-words">{text}</p>
      </div>
      {me.isLoading ? (
        <Skeleton className="h-8 w-8" />
      ) : (
        isCreator && (
          <Button onClick={() => deleteReview.mutate({ id })} size="icon">
            <Trash />
          </Button>
        )
      )}
    </div>
  )
}

interface ProductPageProps {
  productId: string
}

export function ProductPageComponent({ productId }: ProductPageProps) {
  const router = useRouter()
  const me = trpc.user.getMe.useQuery()
  // console.log(typeof trpc.product)
  // console.log(typeof trpc.product.getProduct)
  const productQuery = trpc.product.getProduct.useQuery(
    { id: productId },
    {
      retry: false,
    },
  )
  // const [product, reviews] = await Promise.all([
  //   getProduct(productId),
  //   getReviews(productId),
  // ])

  useEffect(() => {
    if (productQuery.isError && productQuery.error.data?.code === "NOT_FOUND") {
      router.replace("/")
    }
  }, [productQuery.error])

  if (productQuery.isLoading || !productQuery.data) {
    return null
  }

  const product = productQuery.data

  // return <pre>{JSON.stringify(productQuery.data)}</pre>
  // return JSON.stringify(productQuery.data)
  // ]).catch((e) => {
  //   console.error("HOLY", e);
  //   return [];
  // });

  // // Product with id doesn't exist
  // if (product === undefined || reviews === undefined) {
  //   notFound()
  // }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 pt-8">
      <div className="flex items-center space-x-6">
        <Image
          className="rounded-xl"
          src={product.imageUrl}
          alt={`${product.name} image`}
          width={148}
          height={148}
        />
        <div className="flex-grow">
          <h1 className="mb-2 text-5xl font-bold tracking-tight">
            {product.name}
          </h1>
        </div>
        <div className="flex flex-col items-center space-y-4 rounded-md border p-4">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">${product.priceUsd ?? "?"}</div>
            <div className="flex items-center space-x-1">
              <BoxIcon
                size={20}
                className={cn(
                  product.stock && product.stock > 0
                    ? "text-teal-500"
                    : "text-red-500",
                )}
              />
              <div className="text-muted-foreground">
                {product.stock !== null ? (
                  product.stock > 0 ? (
                    <>
                      In stock:{" "}
                      <span className="text-foreground font-medium">
                        {product.stock}
                      </span>
                    </>
                  ) : (
                    <>
                      Out of stock:{" "}
                      <span className="text-foreground font-medium">0</span>
                    </>
                  )
                ) : (
                  <>Out of stock</>
                )}
              </div>
            </div>
          </div>
          <AddToCart productId={product.id} productStock={product.stock ?? 0} />
          {me.data?.role !== "user" && (
            <Button asChild>
              <Link href={`/admin/edit-product/${product.id}`}>Edit</Link>
            </Button>
          )}
          {/* <form action={addToCartAction}>
            <input hidden readOnly value={product.id} name="productId" />
            <Button type="submit" disabled={!product.stock}>
              Add to cart
            </Button>
          </form> */}
        </div>
      </div>

      <p className="line-clamp-3">{product.description}</p>

      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="text-2xl font-bold tracking-tight">
            Reviews{" "}
            <span className="text-muted-foreground font-medium">
              ({product.reviews.length})
            </span>
          </div>

          <div>
            <MakeReviewButton productId={productId} />
          </div>
        </div>
        <ul className="space-y-4">
          {product.reviews.map(review => (
            <li key={review.id}>
              <Review
                id={review.id}
                productId={productId}
                stars={review.stars}
                createdAt={review.createdAt}
                text={review.text}
                user={{ id: review.user.id, name: review.user.name }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
