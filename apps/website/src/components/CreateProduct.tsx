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

interface CreateProductProps {}

export const CreateProduct = memo(
  function CreateProduct({}: CreateProductProps) {
    const form = useForm<z.infer<typeof createProductSchema>>({
      resolver: zodResolver(createProductSchema),
      defaultValues: {
        name:
          process.env.NODE_ENV === "development"
            ? `Egg ${new Date().getUTCMonth() + 1}-${new Date().getUTCDay()} ${Math.round(Date.now() / 1000) % 86400}`
            : undefined,
        // description:
        //   process.env.NODE_ENV === "development"
        //     ? `Long and insightful description for egg ${new Date().getUTCFullYear()}-${new Date().getUTCMonth() + 1}-${new Date().getUTCDay()} ${Math.round(Date.now() / 1000) % 86400}`
        //     : undefined,
        imageUrl:
          process.env.NODE_ENV === "development"
            ? // ? `http://localhost:3000/eggs/egg-${Math.floor(Math.random() * 26)}.jpeg`
              `/eggs/egg-${Math.floor(Math.random() * 26)}.jpeg`
            : undefined,
        priceUsd:
          process.env.NODE_ENV === "development"
            ? String(
                Math.floor(Math.random() * 15) +
                  5 +
                  Number((Math.random() * 0.95 + 0.05).toFixed(2)),
              )
            : undefined,
        stock:
          process.env.NODE_ENV === "development"
            ? Math.floor(Math.random() * 100)
            : undefined,
      },
    })
    // const router = useRouter()
    const utils = trpc.useUtils()
    const createProduct = trpc.product.createProduct.useMutation({
      async onSuccess(data, variables, context) {
        toast.success("Product created")
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
      createProduct.mutate(values)
    }

    return (
      // <Card className="bg-zinc-900 p-6 rounded-md w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create product</CardTitle>
          <CardDescription>Add more products for us to sell.</CardDescription>
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
              <Button type="submit">Create</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    )
  },
)
