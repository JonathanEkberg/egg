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
  const random = [...eggs].sort(() => Math.random() * 2 - 1)
  const values: { title: string; description: string; image: string }[] = []

  for (let i = 0; i < random.length; i++) {
    const egg = random[i]
    values.push({
      title: egg,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      image: `/eggs/egg-${eggs.findIndex(val => val === egg)}.jpeg`,
    })
  }

  await db.insert(productTable).values(
    values.map(v => ({
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
}

seed()
