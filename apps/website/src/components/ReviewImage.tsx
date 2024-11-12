// "use client"
import React, { memo } from "react"
import Image, { ImageProps } from "next/image"
import review1 from "../../public/god/review-1.jpg"
import review2 from "../../public/god/review-2.jpg"
import review3 from "../../public/god/review-3.jpg"
import review4 from "../../public/god/review-4.jpg"
import review5 from "../../public/god/review-5.jpg"
import review6 from "../../public/god/review-6.jpg"
import review7 from "../../public/god/review-7.jpg"
import review8 from "../../public/god/review-8.jpg"
import review9 from "../../public/god/review-9.jpg"
import review10 from "../../public/god/review-10.jpg"
import review11 from "../../public/god/review-11.jpg"
import review12 from "../../public/god/review-12.jpg"

const MAX_GODS_IDX = 12

// function getStoredGod() {
//   try {
//     const value = localStorage.getItem("god")
//     console.log(value)

//     if (value === null) {
//       return null
//     }

//     const parsed = parseInt(value)

//     if (isFinite(parsed) && parsed >= 0) {
//       return parsed
//     }

//     return null
//   } catch {
//     return null
//   }
// }

// function useGodIdx(): number {
//   const [idx] = useState<number>(getStoredGod() ?? 0)

//   useEffect(function () {
//     if (typeof window === undefined) {
//       return
//     }

//     if (idx !== null) {
//       let newGod = (idx + 1) % MAX_GODS_IDX
//       console.log(`new god: ${newGod}`)
//       localStorage.setItem("god", String(newGod))
//       return
//     }

//     const newGod = Math.floor(Math.random() * (MAX_GODS_IDX + 1))
//     console.log(`init god: ${newGod}`)
//     localStorage.setItem("god", String(newGod))
//   }, [])

//   return idx
// }

// function useGodIdx(): number {
//   return idx
// }

interface ReviewImageProps extends Omit<ImageProps, "src"> {}

export const ReviewImage = memo(function ReviewImage(props: ReviewImageProps) {
  // const rounded = Math.floor(Date.now() / 3000) * 3000
  // console.log(rounded)
  // const t = Math.floor(Math.floor(rounded / 3)) * 3
  // console.log(t, `isServer: ${typeof window === "undefined"}`)
  // const idx = Math.floor(t * (MAX_GODS_IDX + 1))
  const idx = Math.floor(Date.now() % (MAX_GODS_IDX + 1))

  if (typeof window === "undefined") {
    console.log(`review-${idx + 1}.jpg`)
  }

  switch (idx) {
    case 0:
      return <Ed1 {...props} />
    case 1:
      return <Ed2 {...props} />
    case 2:
      return <Ed3 {...props} />
    case 3:
      return <Ed4 {...props} />
    case 4:
      return <Ed5 {...props} />
    case 5:
      return <Ed6 {...props} />
    case 6:
      return <Ed7 {...props} />
    case 7:
      return <Ed8 {...props} />
    case 8:
      return <Ed9 {...props} />
    case 9:
      return <Ed10 {...props} />
    case 10:
      return <Ed11 {...props} />
    default:
      return <Ed12 {...props} />
  }
})

const Ed1 = (props: ReviewImageProps) => <Image src={review1} {...props} />
const Ed2 = (props: ReviewImageProps) => <Image src={review2} {...props} />
const Ed3 = (props: ReviewImageProps) => <Image src={review3} {...props} />
const Ed4 = (props: ReviewImageProps) => <Image src={review4} {...props} />
const Ed5 = (props: ReviewImageProps) => <Image src={review5} {...props} />
const Ed6 = (props: ReviewImageProps) => <Image src={review6} {...props} />
const Ed7 = (props: ReviewImageProps) => <Image src={review7} {...props} />
const Ed8 = (props: ReviewImageProps) => <Image src={review8} {...props} />
const Ed9 = (props: ReviewImageProps) => <Image src={review9} {...props} />
const Ed10 = (props: ReviewImageProps) => <Image src={review10} {...props} />
const Ed11 = (props: ReviewImageProps) => <Image src={review11} {...props} />
const Ed12 = (props: ReviewImageProps) => <Image src={review12} {...props} />
