"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { trpc } from "@/server/trpc/client"
import { toast } from "sonner"
import type { UserRole } from "@egg/database"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Accounts() {
  const accounts = trpc.admin.getUsers.useQuery()

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24 text-left">Name</TableHead>
            <TableHead className="w-24 text-left">Role</TableHead>
            <TableHead className="w-24 text-left">Email</TableHead>
            <TableHead className="w-24 text-left">Verified</TableHead>
            <TableHead className="text-right">Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.data?.map(user => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center space-x-4 font-medium">
                {user.name}
              </TableCell>

              <TableCell>{user.role}</TableCell>

              <TableCell>{user.email}</TableCell>

              <TableCell>
                <UserRole userId={user.id} role={user.role} />
              </TableCell>

              <TableCell className="flex space-x-2">
                <DeleteUserButton userId={user.id} disabled={false} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface UserRoleProps {
  userId: string
  role: UserRole
}

function UserRole({ userId, role }: UserRoleProps) {
  const [stateRole, setStateRole] = useState<UserRole>(role)
  const updateRole = trpc.admin.setUserRole.useMutation({
    onSuccess(error, variables, context) {
      toast("User role updated")
    },
    onError(error, variables, context) {
      toast.error(error.message)
    },
  })

  return (
    <Select
      onValueChange={value => {
        setStateRole(value as UserRole)
        updateRole.mutate({ role: value as UserRole, userId })
      }}
      value={stateRole}
      defaultValue={stateRole}
    >
      <SelectTrigger>
        <SelectValue placeholder={"Role"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="super_admin">Super Admin</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="user">User</SelectItem>
      </SelectContent>
    </Select>
  )
  // return status === "pending" ? (
  //   <Badge className="bg-zinc-500 text-white">Pending</Badge>
  // ) : status === "processing" ? (
  //   <Badge className="bg-blue-500 text-white">Processing</Badge>
  // ) : status === "shipped" ? (
  //   <Badge className="bg-orange-500 text-white">Shipped</Badge>
  // ) : (
  //   <Badge className="bg-green-500 text-white">Delivered</Badge>
  // )
}

interface DeleteUserButtonProps {
  userId: string
  disabled: boolean
}

export function DeleteUserButton({ userId, disabled }: DeleteUserButtonProps) {
  const utils = trpc.useUtils()
  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess(data, variables, context) {
      utils.admin.getUsers.invalidate()
    },
    onError(error, variables, context) {
      toast.error(error.message)
    },
  })

  return (
    <Button
      onClick={() => deleteUser.mutate({ id: userId })}
      disabled={disabled}
      variant="destructive"
    >
      Delete
    </Button>
  )
}
