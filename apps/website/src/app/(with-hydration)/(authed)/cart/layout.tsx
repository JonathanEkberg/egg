import { Header } from "@/components/Header"
import { TRPCProvider } from "@/server/trpc/client"
import { HydrateClient, trpc } from "@/server/trpc/server"
import { cookies } from "next/headers"
import { isLoggedIn } from "@/server/authentication"
import { prefetchTimeout } from "@/app/utils/prefetchTimeout"

export default async function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  void (await prefetchTimeout([
    // trpc.cart.getMyCount.prefetch(),
    trpc.cart.getTotal.prefetch(),
    trpc.cart.getItems.prefetch(),
  ]))

  return children
}
