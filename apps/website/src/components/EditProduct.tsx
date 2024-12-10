"use client"
import { revalidatePath, revalidateTag } from "next/cache"
import React, { memo } from "react"
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
import { redirect, useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { createProductSchema } from "@/lib/validation/product"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/server/trpc/client"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"

// const schema = z.object({
//   name: z.string(),
//   description: z.string(),
//   image: z.string().url(),
//   price_usd: z.coerce
//     .number()
//     .min(0)
//     .max(2000000000, { message: "Price too high" })
//     .nullish(),
//   stock: z.coerce
//     .number()
//     .min(0)
//     .max(2000000000, { message: "Stock too large" })
//     .nullish(),
// })

// async function createProduct(formData: FormData) {
//   "use server"
//   const parsed = schema.safeParse({
//     name: formData.get("name")!.toString(),
//     description: formData.get("description")!.toString(),
//     image: formData.get("image")!.toString(),
//     price_usd: formData.get("price_usd")!.toString(),
//     stock: formData.get("stock")!.toString(),
//   })

//   if (parsed.success === false) {
//     let errors = [] as string[]

//     for (const value of Object.values(parsed.error.flatten().fieldErrors)) {
//       errors = [...errors, ...value]
//     }

//     redirect(
//       `/admin/create-product?toast=${encodeURIComponent(
//         JSON.stringify({ type: "error", message: errors.join(", ") }),
//       )}`,
//     )
//   }

//   const { name, description, image, price_usd: price, stock } = parsed.data
//   const values = [name, description, image, price, stock]
//   console.log("Creating product with values:", values)

//   const result = await pool.execute(
//     `INSERT INTO product (name, description, image, price_usd, stock) VALUES(?, ?, ?, ?, ?);`,
//     values,
//   )
//   const value = result[0]
//   revalidateTag("products")
//   revalidatePath("/")
//   redirect("/")
// }

interface EditProductProps {
  id: string
}

export const EditProduct = memo(function EditProduct({ id }: EditProductProps) {
  const data = trpc.product.getProduct.useQuery({ id })
  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: data.data?.name,
      description: data.data?.description ?? undefined,
      imageUrl: data.data?.imageUrl,
      priceUsd: data.data?.priceUsd,
      stock: data.data?.stock,
    },
  })
  // const router = useRouter()
  const utils = trpc.useUtils()
  const editProduct = trpc.product.editProduct.useMutation({
    async onSuccess(data, variables, context) {
      toast.success("Product updated")
      utils.product.getProducts.invalidate()
    },
    onError(error, variables, context) {
      toast.error("Couldn't create product", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  function onSubmit(values: z.infer<typeof createProductSchema>) {
    editProduct.mutate({
      id,
      ...values,
    })
  }

  return (
    // <Card className="bg-zinc-900 p-6 rounded-md w-full">
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit product</CardTitle>
        <CardDescription>Update an existing product.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="priceUsd"
                render={({ field, formState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>$ Price</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field, formState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <div className="flex-1">
                <Label htmlFor="price_usd">Price</Label>
                <Input
                  id="price_usd"
                  name="price_usd"
                  placeholder="Price in USD"
                  required
                  type="number"
                  defaultValue={
                    process.env.NODE_ENV === "development" ? 8 : undefined
                  }
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
                  defaultValue={
                    process.env.NODE_ENV === "development" ? 123 : undefined
                  }
                  min={0}
                />
              </div> */}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit">Update</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
})
