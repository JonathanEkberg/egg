import React from "react"

interface OrderItemPageProps {
  params: Promise<{ orderId: string }>
}

export default async function OrderItemPage(props: OrderItemPageProps) {
  const params = await props.params;
  return (
    <div className="grid h-full place-items-center">
      <h1 className="text-center text-[38rem] font-bold tracking-tight">
        {params.orderId}
      </h1>
    </div>
  )
}
