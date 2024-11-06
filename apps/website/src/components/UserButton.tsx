"use client"
import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { logoutAction } from "@/app/actions"
import { useRouter } from "next/navigation"
import { getCookie } from "cookies-next"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./ui/menubar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import Link from "next/link"
import { LogOut } from "lucide-react"

interface UserButtonProps {
  name: string
}

export function UserButton({ name }: UserButtonProps) {
  const router = useRouter()
  const role = getCookie("u_role", { httpOnly: false })

  async function onClick() {
    await logoutAction()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="text-xl font-bold tracking-tighter">{name}</div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href="/orders">My orders</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {role === "ADMIN" && (
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
