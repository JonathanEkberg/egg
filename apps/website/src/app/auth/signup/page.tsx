import React from "react"
import { pool } from "@/lib/database"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ReviewImage } from "@/components/ReviewImage"
import { Star } from "lucide-react"
import { hash } from "argon2"

async function signupAction(formData: FormData) {
  "use server"
  const [name, email, password] = [
    formData.get("name"),
    formData.get("email"),
    formData.get("password"),
  ]

  if (!email || !password) {
    redirect(
      `/auth/signup?toast=${encodeURIComponent(
        JSON.stringify({
          type: "success",
          message: "Missing email or password",
        }),
      )}`,
    )
  }

  const existing = await pool.execute(
    "SELECT id, name FROM user WHERE email=?;",
    [email],
  )
  const user = existing[0] as [{ id: number; name: string } | undefined]

  if (user.at(0) !== undefined) {
    redirect(
      `/auth/signup?toast=${encodeURIComponent(
        JSON.stringify({
          type: "success",
          message: "Account already exists",
        }),
      )}`,
    )
  }

  const hashed = await hash(String(password))
  console.log("NEW HASHED:", hashed)

  await pool.execute(
    "INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, 'USER');",
    [name, email, hashed],
  )
  const newUser = await pool.execute(
    "SELECT id, name, role FROM user WHERE email=?;",
    [email],
  )
  const uuser = newUser[0] as [
    { id: number; name: string; role: "ADMIN" | "USER" },
  ]
  console.log("NEW USER:", uuser)
  (await cookies()).set("u_id", String(uuser[0]!.id), { maxAge: 3600 * 24 })
  (await cookies()).set("u_name", uuser[0]!.name, { maxAge: 3600 * 24 })
  (await cookies()).set("u_role", uuser[0].role, { maxAge: 3600 * 24 })
  redirect("/")
}

interface SignupPageProps {}

export default function SignupPage({}: SignupPageProps) {
  return (
    <div className="grid h-full md:grid-cols-2">
      <div className="relative hidden h-full w-full bg-red-600/50 md:block">
        <div className="absolute left-0 z-10 h-full w-1/2 bg-gradient-to-r from-zinc-950/50 to-zinc-950/60"></div>
        <div className="absolute right-0 z-10 h-full w-1/2 bg-gradient-to-r from-zinc-950/60 to-zinc-950/80"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full">
          <ReviewImage
            alt="Review"
            placeholder="blur"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-16 left-8 z-20 space-y-4 pr-8">
          <div className="flex items-center space-x-4">
            <blockquote className="block font-serif text-5xl font-semibold tracking-tight text-white">
              &quot;De godaste äggen jag har ätit.&quot;
            </blockquote>
            <span className="hidden text-5xl text-white 2xl:block">-</span>
            <div className="hidden space-x-1 2xl:flex">
              {Array(5)
                .fill(null)
                .map((_, idx) => (
                  <Star key={idx} size={32} stroke="#f7bf23" fill="#ebaf2f" />
                ))}
            </div>
          </div>
          <cite className="block pl-6 text-xl not-italic text-white/75">
            - Edward Blom
          </cite>
        </div>
      </div>
      <div className="grid w-full place-items-center px-12">
        <form
          action={signupAction}
          className="mx-auto flex w-full max-w-lg flex-col items-center space-y-4"
        >
          <div className="w-full">
            <CardHeader>
              <CardTitle>Sign up</CardTitle>
              <CardDescription>
                Create an account to start buying eggs today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label>Name</Label>
                  <Input
                    name="name"
                    type="text"
                    required
                    defaultValue={
                      process.env.NODE_ENV === "development"
                        ? "John Doe"
                        : undefined
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    required
                    defaultValue={
                      process.env.NODE_ENV === "development"
                        ? "john@doe.com"
                        : undefined
                    }
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    min={6}
                    defaultValue={
                      process.env.NODE_ENV === "development"
                        ? "johndoe"
                        : undefined
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Sign up
              </Button>
            </CardFooter>
          </div>
          <p className="w-8/10 max-w-72 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a className="underline" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="underline" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  )
}
