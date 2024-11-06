import React from "react"
import { pool } from "@/lib/database"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cookies } from "next/headers"
import { RedirectType, redirect } from "next/navigation"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Star } from "lucide-react"
import { ReviewImage } from "@/components/ReviewImage"
import { verify } from "argon2"

async function loginAction(formData: FormData) {
  "use server"
  const [email, password] = [formData.get("email"), formData.get("password")]

  if (!email || !password) {
    throw new Error("You must provide email and password!")
  }

  const query = await pool.execute(
    "SELECT id, name, role, password FROM user WHERE email=?",
    [email],
  )

  const parsed = query[0] as [
    | {
        id: number
        name: string
        role: "USER" | "ADMIN"
        password: string
      }
    | undefined,
  ]

  const user = parsed[0]

  if (!user) {
    redirect(
      `/auth/login?toast=${encodeURIComponent(
        JSON.stringify({
          type: "error",
          message: "Wrong password or the user doesn't exist.",
        }),
      )}`,
      RedirectType.replace,
    )
  }

  const isCorrectPassword = await verify(user.password, password.toString())

  if (!isCorrectPassword) {
    redirect(
      `/auth/login?toast=${encodeURIComponent(
        JSON.stringify({
          type: "error",
          message: "Wrong password or the user doesn't exist.",
        }),
      )}`,
      RedirectType.replace,
    )
  }

  const cookie_store = await cookies()

  cookie_store.set("u_id", String(user.id), { maxAge: 3600 * 24 })
  cookie_store.set("u_name", user.name, { maxAge: 3600 * 24 })
  cookie_store.set("u_role", user.role, { maxAge: 3600 * 24 })
  redirect("/")
}

interface LoginPageProps {}

export default function LoginPage({}: LoginPageProps) {
  return (
    <div className="grid h-full md:grid-cols-2">
      <div className="relative hidden h-full w-full bg-red-600/50 md:block">
        <div className="absolute left-0 z-10 h-full w-1/2 bg-gradient-to-r from-zinc-950/50 to-zinc-950/60"></div>
        <div className="absolute right-0 z-10 h-full w-1/2 bg-gradient-to-r from-zinc-950/60 to-zinc-950/80"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full">
          {/* <Image */}
          <ReviewImage
            // src={review1}
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
            <span className="hidden text-5xl 2xl:block">-</span>
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
      <div className="grid place-items-center px-12">
        <form
          action={loginAction}
          className="mx-auto flex w-full max-w-lg flex-col items-center space-y-4"
        >
          <div className="w-full">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your account to start buying eggs today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
                    autoComplete="current-password"
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
                Login
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
