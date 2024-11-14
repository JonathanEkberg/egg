"use client"
import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "@/server/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

interface VerifyPageProps {}

export default function VerifyPage({}: VerifyPageProps) {
  const params = useSearchParams()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  })
  const verify = trpc.auth.verify.useMutation({
    onSuccess(data, variables, context) {
      toast.success("Verified", {
        description: "Taking you to the store page.",
      })
      router.push("/")
    },
    onError(error, variables, context) {
      toast.error("Couldn't verify", { description: error.message })
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    verify.mutate({ code: Number(data.pin) })
  }

  useEffect(() => {
    if (!params.has("code")) {
      return
    }

    const code = params.get("code")!
    form.setValue("pin", code)
    const codeNumber = Number(code)

    if (!Number.isSafeInteger(codeNumber)) {
      return
    }

    verify.mutate({ code: codeNumber })
  }, [])

  return (
    <div className="grid h-full place-items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            disabled={verify.isPending}
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Please enter the one-time code sent to your email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}
