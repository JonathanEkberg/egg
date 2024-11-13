"use client"
import React, { useEffect, useMemo, useState } from "react"
import { AppProgressBar as ProgressBar } from "next-nprogress-bar"
import { useTheme, UseThemeProps } from "next-themes"

export function NProgress({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [color, setColor] = useState<UseThemeProps["theme"] | undefined>()

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const newColor =
      resolvedTheme === "dark" ? "rgb(250, 250, 250)" : "rgb(24, 24, 27)"
    console.log(`NEW COLOR: ${newColor}`)
    setColor(newColor)
  }, [resolvedTheme])

  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color={color}
        delay={100}
        options={{ showSpinner: true }}
        shallowRouting
      />
    </>
  )
}
