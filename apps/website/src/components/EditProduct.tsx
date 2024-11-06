import { pool } from "@/lib/database"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { z } from "zod"
import { EditProductDeleteButton } from "./EditProductDeleteButton"

const schema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  price_usd: z.coerce
    .number()
    .min(0)
    .max(2000000000, { message: "Price too high" })
    .nullish(),
  stock: z.coerce
    .number()
    .min(0)
    .max(2000000000, { message: "Stock too large" })
    .nullish(),
})

export async function editProduct(formData: FormData) {
  "use server"

  const parsed = schema.safeParse({
    id: formData.get("id")!.toString(),
    name: formData.get("name")!.toString(),
    description: formData.get("description")!.toString(),
    image: formData.get("image")!.toString(),
    price_usd: formData.get("price_usd")!.toString(),
    stock: formData.get("stock")!.toString(),
  })

  if (parsed.success === false) {
    let errors = [] as string[]

    for (const value of Object.values(parsed.error.flatten().fieldErrors)) {
      errors = [...errors, ...value]
    }

    redirect(
      `/admin/edit-product/${formData
        .get("id")!
        .toString()}?toast=${encodeURIComponent(
        JSON.stringify({ type: "error", message: errors.join(", ") }),
      )}`,
    )
  }

  const { name, description, image, price_usd: price, stock, id } = parsed.data
  const values = [name, description, image, price, stock, id]
  console.log("Creating product with values:", values)

  await pool.execute(
    `UPDATE product SET name=?, description=?, image=?, price_usd=?, stock=? WHERE id=?;`,
    values,
  )
  revalidateTag("products")
  revalidatePath("/")
  redirect("/")
}

export interface EditProductProps {
  id: number
  name: string
  description: string
  image: string
  price: number | null
  stock: number | null
}

export function EditProduct({
  id,
  name,
  description,
  image,
  price,
  stock,
}: EditProductProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit product</CardTitle>
        <CardDescription>Modify existing products.</CardDescription>
      </CardHeader>
      <form action={editProduct}>
        <input hidden readOnly name="id" value={id} />
        <CardContent className="space-y-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Name of the product"
              required
              defaultValue={name}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Product description"
              required
              defaultValue={description}
            />
          </div>
          <div>
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              name="image"
              placeholder="Image URL"
              required
              defaultValue={image}
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="price_usd">Price</Label>
              <Input
                id="price_usd"
                name="price_usd"
                placeholder="Price in USD"
                required
                type="number"
                defaultValue={price ?? undefined}
                min={0}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                placeholder="Stock"
                required
                type="number"
                defaultValue={stock ?? undefined}
                min={0}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <EditProductDeleteButton id={id} />
          <Button type="submit">Save</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
