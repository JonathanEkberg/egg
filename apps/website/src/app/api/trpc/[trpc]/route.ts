import { createTRPCContext } from "@/server/trpc/init"
import { appRouter } from "@/server/trpc/routers/_app"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

// export const revalidate = 0
// export const dynamic = "force-dynamic"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
