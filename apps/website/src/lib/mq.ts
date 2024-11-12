import * as amqp from "amqplib"

const EMAIL_QUEUE = "email_queue"
const EMAIL_EXCHANGE = "email"
const EMAIL_ROUTING_KEY = "email_route"

const conn = await amqp.connect("amqp://localhost:5672")
let channel: amqp.Channel | undefined

async function getChannel() {
  if (!channel) {
    channel = await conn.createChannel()
  }

  await Promise.all([
    channel.assertExchange(EMAIL_EXCHANGE, "direct"),
    new Promise<void>(async res => {
      if (channel) {
        await channel.assertQueue(EMAIL_QUEUE)
        await channel.bindQueue(EMAIL_QUEUE, EMAIL_EXCHANGE, EMAIL_ROUTING_KEY)
      }
      res()
    }),
  ])
  return channel
}

export async function sendEmail(to: string, body: string) {
  return (await getChannel()).publish(
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
