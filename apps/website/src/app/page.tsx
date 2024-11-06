import { ProductList } from "@/components/ProductList"
import { redirect } from "next/navigation"

export const dynamic = "auto"
export const revalidate = 3600

interface HomeProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams;

  const {
    page
  } = searchParams;

  // await db
  //   .insert(usersTable)
  //   .values([{ name: "Name", age: 50, email: "email@email.com" }])
  // db.query.usersTable.findFirst({where: })
  // let parsed: number | undefined = undefined
  // if (typeof page === "string") {
  //   const pageInt = parseInt(page)
  //   parsed = Number.isSafeInteger(pageInt) ? pageInt : 1

  //   if (parsed < 1) {
  //     redirect(`/`)
  //   }
  // }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-between p-8">
      {/* <ProductList page={parsed ?? 1} /> */}
      {/* {users.map(u => (
        <div key={u.id}>{JSON.stringify(u)}</div>
      ))} */}
    </main>
  )
}
