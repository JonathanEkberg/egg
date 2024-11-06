import React from "react"
import { pool } from "@/lib/database"
import { notFound } from "next/navigation"
import Image from "next/image"
import { BoxIcon, StarIcon } from "lucide-react"
import clsx from "clsx"
import { AddToCart } from "@/components/ProductPage/AddToCart"
import dayjs from "dayjs"
import dayjsRelativeTime from "dayjs/plugin/relativeTime"
import dayjsLocalized from "dayjs/plugin/localizedFormat"
import dayjsTimezone from "dayjs/plugin/timezone"
import dayjsUtc from "dayjs/plugin/utc"
import "dayjs/locale/sv"
import { MakeReviewButton } from "@/components/ProductPage/MakeReviewButton"
import localeData from "dayjs/plugin/localeData"
import { create } from "domain"

dayjs.extend(dayjsRelativeTime)
dayjs.extend(dayjsLocalized)
dayjs.extend(localeData)
dayjs.extend(dayjsUtc)
dayjs.extend(dayjsTimezone)
dayjs.locale("sv")

const getProduct = async (id: number) => {
    const data = await pool.execute(
      `SELECT id, name, description, image, price_usd, stock FROM product WHERE id = ?;`,
      [id],
    )

    return (
      data[0] as
        | [
            {
              id: number
              name: string
              description: string
              image: string
              price_usd: number | null
              stock: number | null
            },
          ]
        | []
    )[0]
  }

async function getReviews(product_id: number) {
  const data = await pool.execute(
    "SELECT review.id, stars, text, user_id, user.name as u_name, review.created_at FROM review INNER JOIN user ON review.user_id = user.id WHERE product_id=? ORDER BY created_at DESC;",
    [product_id],
  )
  return data[0] as {
    id: number
    stars: number
    text: string
    user_id: number
    u_name: string
    created_at: string
  }[]
}

async function Review({
  stars,
  createdAt,
  text,
  user,
}: {
  stars: number
  createdAt: string
  text: string
  user: { id: number; name: string }
}) {
  return (
    <div >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">{user.name}</span>
          <span className="text-lg font-bold">•</span>
          <div className="text-sm text-muted-foreground">
            {`${dayjs(dayjs(createdAt).utc(true)).fromNow()} - ${dayjs(dayjs(createdAt).utc(true)).tz("Europe/Stockholm",false).format(
              "LLL",
            )}`}
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
  )
}

interface ProductPageProps {
  // From the '[productsId]' dynamic route
  params: Promise<{ productId: string }>
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const productId = parseInt(params.productId)

  if (Number.isNaN(productId)) {
    notFound()
  }

  const [product, reviews] = await Promise.all([
    getProduct(productId),
    getReviews(productId),
  ])
  // ]).catch((e) => {
  //   console.error("HOLY", e);
  //   return [];
  // });

  // Product with id doesn't exist
  if (product === undefined || reviews === undefined) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 pt-8">
      <div className="flex items-center space-x-6">
        <Image
          className="rounded-xl"
          src={product.image}
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
            <div className="text-3xl font-bold">
              ${product.price_usd ?? "?"}
            </div>
            <div className="flex items-center space-x-1">
              <BoxIcon
                size={20}
                className={clsx(
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
                      <span className="font-medium text-foreground">
                        {product.stock}
                      </span>
                    </>
                  ) : (
                    <>
                      Out of stock:{" "}
                      <span className="font-medium text-foreground">0</span>
                    </>
                  )
                ) : (
                  <>Out of stock</>
                )}
              </div>
            </div>
          </div>
          <AddToCart productId={product.id} productStock={product.stock ?? 0} />
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
            <span className="font-medium text-muted-foreground">
              ({reviews.length})
            </span>
          </div>

          <div>
            <MakeReviewButton productId={productId} />
          </div>
        </div>
        <ul className="space-y-4">
          {reviews.map(review => (
            <li key={review.id}>
              <Review
                stars={review.stars}
                createdAt={review.created_at}
                text={review.text}
                user={{ id: review.user_id, name: review.u_name }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
