import * as amqp from "amqplib"

const EMAIL_QUEUE = "email_queue"
const EMAIL_EXCHANGE = "email"
const EMAIL_ROUTING_KEY = ""

let channel: amqp.Channel | undefined

async function getChannel() {
  if (!channel) {
    const conn = await amqp.connect("amqp://localhost:5672")
    channel = await conn.createChannel()
  }

  await channel.assertExchange(EMAIL_EXCHANGE, "direct", { durable: false })
  await channel.assertQueue(EMAIL_QUEUE, { durable: false })
  await channel.bindQueue(EMAIL_QUEUE, EMAIL_EXCHANGE, EMAIL_ROUTING_KEY)
  return channel
}

export async function sendEmail(to: string, body: string) {
  const channel = await getChannel()

  return channel.publish(
    EMAIL_EXCHANGE,
    EMAIL_ROUTING_KEY,
    Buffer.from(
      JSON.stringify({
        type: "email",
        version: 1,
        data: { to, body },
      }),
    ),
    { headers: { "Content-Type": "application/json" } },
  )
}
