import React from 'react'
import { InfiniteMovingCards } from './ui/InfiniteMovingCards'
import '../styles/ReviewStack.css'

const testimonials = [
  {
    quote:
      "The craftsmanship on these Moradabad brass pieces is utterly breathtaking. They brought an unmatched warmth, texture, and architectural gravity to my client’s penthouse living space.",
    name: "Sarah Jenkins",
    title: "Interior Architect · London, UK",
  },
  {
    quote:
      "Taif’s attention to detail is evident in every hand-hammered curve. The brass accents complement rich walnut textures in a way that feels timeless yet unmistakably modern.",
    name: "Michael Chen",
    title: "Design Director · New York, USA",
  },
  {
    quote:
      "An extraordinary piece of living heritage. The fusion of traditional Indian metalworking with clean Scandinavian proportions creates something truly rare in contemporary design.",
    name: "Emma Thompson",
    title: "Art Collector · Paris, France",
  },
  {
    quote:
      "I have specified luxury artisanal decor across Europe for over 15 years. The custom bronze vessels from Taif stand in a class of their own for quality and hand-burnished lustre.",
    name: "David Rossi",
    title: "Residential Architect · Milan, Italy",
  },
  {
    quote:
      "The centerpiece bowl we commissioned is pure art. It anchors our entire dining room and captures the natural light from morning till dusk with incredible patina depth.",
    name: "Olivia Martinez",
    title: "Private Collector · Madrid, Spain",
  },
]

export default function ReviewStack() {
  return (
    <div className="review-section-wrapper">
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
    </div>
  )
}
