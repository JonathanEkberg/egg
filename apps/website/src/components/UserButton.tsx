"use client"
import React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import Link from "next/link"
import { LogOut } from "lucide-react"
import type { UserRole } from "@egg/database"
import { trpc } from "@/server/trpc/client"

interface UserButtonProps {
  name: string
  role: UserRole
}

export function UserButton({ name, role }: UserButtonProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const logout = trpc.auth.logout.useMutation({
    onSuccess(data, variables, context) {
      utils.user.getMe.reset()
      router.refresh()
    },
  })

  async function onClick() {
    logout.mutate()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="text-2xl font-bold tracking-tighter">{name}</div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href="/orders">My orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">Account</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {role !== "user" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">Admin dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={onClick}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
