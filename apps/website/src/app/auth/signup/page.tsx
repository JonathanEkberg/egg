"use client"
import React from "react"
import { Input } from "@/components/ui/input"
import { ButtonLoader } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ReviewImage } from "@/components/ReviewImage"
import { Star } from "lucide-react"
import { trpc } from "@/server/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { registerSchema } from "@/lib/validation/auth"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"

interface SignupPageProps {}

export default function SignupPage({}: SignupPageProps) {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: process.env.NODE_ENV === "development" ? "John Doe" : undefined,
      email:
        process.env.NODE_ENV === "development" ? "john@doe.com" : undefined,
      password: process.env.NODE_ENV === "development" ? "johndoe" : undefined,
    },
  })
  const router = useRouter()
  const utils = trpc.useUtils()
  const register = trpc.auth.register.useMutation({
    onSuccess(data, variables, context) {
      if (!data.emailVerified) {
        router.push("/auth/verify")
        toast.success("Registered", {
          description: "Taking you to the account verification page.",
        })
      } else {
        router.push("/")
        toast.success("Registered", {
          description: "Taking you to the store page.",
        })
      }
      utils.user.getMe.setData(undefined, data)
    },
    onError(error, variables, context) {
      toast.error("Couldn't login", { description: error.message })
    },
  })

  function onSubmit(values: z.infer<typeof registerSchema>) {
    register.mutate(values)
  }

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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto flex w-full max-w-lg flex-col items-center space-y-4"
          >
            <div className="w-full">
              <CardHeader>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Sign up
                </h3>
                <p className="text-muted-foreground text-sm">
                  Create an account to start buying eggs today.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input required type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <ButtonLoader
                  loading={register.isPending}
                  type="submit"
                  className="w-full"
                >
                  Sign up
                </ButtonLoader>
              </CardFooter>
            </div>
            <p className="w-8/10 text-muted-foreground max-w-72 text-center text-sm">
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
        </Form>
      </div>
    </div>
  )
}
