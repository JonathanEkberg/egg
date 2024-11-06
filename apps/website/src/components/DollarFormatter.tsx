import React from "react"

const formatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  currency: "USD",
  // unit: "1000",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

interface DollarFormatterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
}

export function DollarFormatter({ value, ...props }: DollarFormatterProps) {
  return (
    <span {...props}>
      <span className="text-muted-foreground">&#36;</span>
      {formatter.format(value)}
    </span>
  )
}
