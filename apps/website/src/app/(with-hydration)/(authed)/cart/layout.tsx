import { trpc } from "@/server/trpc/server"
import { prefetchTimeout } from "@/app/utils/prefetchTimeout"

export default async function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  void (await Promise.allSettled([
    trpc.cart.getTotal.prefetch(),
    trpc.cart.getItems.prefetch(),
  ]))

  return children
}
