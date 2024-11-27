"use client"
import { trpc } from "@/server/trpc/client"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import Logo from "@/app/icon.png"
import { Button } from "./ui/button"
import { ThemeButton } from "./ThemeButton"
import { UserButton } from "./UserButton"
import { ShoppingCartIcon } from "./ShoppingCartIcon"
import { Skeleton } from "./ui/skeleton"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface HeaderProps {
  onlyLogout?: boolean
}

export function Header({ onlyLogout = false }: HeaderProps) {
  trpc.cart.getMyCount.usePrefetchQuery()
  const me = trpc.user.getMe.useQuery()

  return (
    <header className="mx-auto flex w-full max-w-4xl items-center justify-between p-4">
      <Link href="/" className="flex items-center space-x-4">
        <Image
          className="w-12"
          loading="eager"
          src={Logo}
          alt="Egg store logo"
        />
        <h1 className="text-4xl font-bold tracking-tighter">Egg Store</h1>
      </Link>
      {onlyLogout ? (
        <LogoutButton />
      ) : me.isLoading ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <div className="flex items-center space-x-2">
          {!me.data ? (
            <div className="space-x-2">
              <Button asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <UserButton name={me.data.name} role={me.data.role} />
              <ShoppingCartIcon />
            </div>
          )}
          <ThemeButton />
        </div>
      )}
    </header>
  )
}

function LogoutButton() {
  const router = useRouter()
  const logout = trpc.auth.logout.useMutation({
    onSuccess: data => {
      if (data === true) {
        router.push("/")
      } else {
        toast.error("Couldn't log you out.")
      }
    },
  })
  return <Button onClick={() => logout.mutate()}>Logout</Button>
}
