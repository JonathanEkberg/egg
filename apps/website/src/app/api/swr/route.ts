export const dynamic = "force-dynamic"

export async function GET(_: Request) {
  await new Promise<void>(res => setTimeout(res, 5000))

  return new Response(`Hello ${new Date().toISOString()}!`, {
    headers: { "cache-control": "max-age=10, stale-while-revalidate=10" },
  })
}
