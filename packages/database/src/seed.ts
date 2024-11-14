import { db, productTable } from "."

const eggs: string[] = [
  "Intergalactical",
  "Blue",
  "Gold",
  "Disco",
  "Chernobyl",
  "Fade",
  "Willys",
  "Apple",
  "The Last of Us",
  "Sir",
  "Hawaii",
  "Holy Grail",
  "Vanilla",
  "Pre cracked",
  "Pride",
  "Black",
  "Bullet Proof",
  "Kitsch",
  "Milkyway",
  "International",
  "Delicacy",
  "Probiotic",
  "Koh-i-Noor",
  "Rolex",
  "Fabergé",
  "Påsk",
]

async function seed() {
  const random = [...eggs].sort(() => Math.random() - 1)
  const values: {
    title: string
    description: string
    image: string
    now: Date
  }[] = []

  const date = new Date()
  for (let i = 0; i < random.length; i++) {
    const egg = random[i]
    const now = new Date(date.valueOf() + i * 100)
    values.push({
      title: egg,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      image: `/eggs/egg-${eggs.findIndex(val => val === egg)}.jpeg`,
      now,
    })
  }

  console.log(`Upserting ${values.length} products...`)
  const start = performance.now()
  await db.insert(productTable).values(
    values.map(v => ({
      createdAt: v.now,
      updatedAt: v.now,
      name: v.title,
      description: v.description,
      imageUrl: v.image,
      priceUsd: String(
        Math.floor(Math.random() * 15) +
          5 +
          Number((Math.random() * 0.95 + 0.05).toFixed(2)),
      ),
      stock: Math.floor(Math.random() * 50) + 10,
    })),
  )
  const time = performance.now() - start
  console.log(`Upserted products in ${time}ms`)
  process.exit(0)
}

seed()
