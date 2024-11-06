"use client"
import Image, { ImageProps } from "next/image"
import review1 from "../../public/god/review-1.jpg"
import review2 from "../../public/god/review-2.jpg"
import review3 from "../../public/god/review-3.jpg"
import review4 from "../../public/god/review-4.jpg"
import review5 from "../../public/god/review-5.jpg"
import review6 from "../../public/god/review-6.jpg"
import review7 from "../../public/god/review-7.jpg"

import React from "react"

interface ReviewImageProps extends Omit<ImageProps, "src"> {}

export function ReviewImage({ alt, ...props }: ReviewImageProps) {
  //   const idx = Math.floor(Math.random() * 7) + 1;
  const idx = (Math.floor(Date.now() / 1000) / 1.5) % 7
  const sources = [
    review1,
    review2,
    review3,
    review4,
    review5,
    review6,
    review7,
  ]
  const source = sources.at(idx)!

  return <Image src={source} alt={alt} {...props} />
}
