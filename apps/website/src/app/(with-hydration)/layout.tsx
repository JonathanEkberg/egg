import { Header } from "@/components/Header"
import { TRPCProvider } from "@/server/trpc/client"
import { HydrateClient, trpc } from "@/server/trpc/server"
import { cookies } from "next/headers"
import { prefetchTimeout } from "../utils/prefetchTimeout"
import { isLoggedIn } from "@/server/authentication"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  // Prefetch header content if logged in
  if (isLoggedIn(cookieStore)) {
    void (await prefetchTimeout([
      trpc.user.getMe.prefetch(),
      trpc.cart.getMyCount.prefetch(),
    ]))
  }

  return (
    <HydrateClient>
      <Header />
      <div className="pt-8">{children}</div>
    </HydrateClient>
  )
}
