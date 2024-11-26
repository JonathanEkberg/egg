import { Header } from "@/components/Header"
import { HydrateClient, trpc } from "@/server/trpc/server"
import { cookies } from "next/headers"
import { prefetchTimeout } from "../utils/prefetchTimeout"
import { getSession, isLoggedIn } from "@/server/authentication"
import { redirect } from "next/navigation"
import { sendUserEmailVerificationCode } from "@/lib/email"
import { unstable_after } from "next/server"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore, true)

  if (session && !session.emailVerified) {
    unstable_after(() => {
      sendUserEmailVerificationCode(session.userId, session.email, session.name)
    })
    redirect("/auth/verify")
  }

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
