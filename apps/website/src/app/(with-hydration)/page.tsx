// "use client"
import { HydrateClient, trpc } from "@/server/trpc/server"
import { Home } from "./Home"
import { cookies } from "next/headers"
import { prefetchTimeout } from "../utils/prefetchTimeout"

export default async function HomePage() {
  void (await prefetchTimeout([trpc.product.getProducts.prefetch()]))

  return <Home />
}
