// "use client"
import React, { useEffect } from "react"
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"
import { useRouter } from "next/router"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
