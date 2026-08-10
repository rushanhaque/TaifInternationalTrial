import { useState } from 'react'
import { Link } from '../lib/router'
import { CATEGORIES } from '../data/catalogue'
import { useContent, railProducts } from '../lib/content'
import { CharCascade, Dilate } from '../components/Reveal'
import ProductCard from '../components/ui/ProductCard'
import CircularGallery from '../components/reactbits/CircularGallery'
import { productImg } from '../data/images'

const OPTIONS = ['All', ...CATEGORIES]

export default function CataloguePage() {
  const items = useContent('products')

  return (
    <>
      <section className="page-hero wrap">
        <CharCascade as="h1" className="mega">Catalogue</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap">
          <ol className="pl-grid">
            {items.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="meta">New arrivals</span></div>
          <div style={{ height: '600px', position: 'relative' }}>
            <CircularGallery
              items={railProducts().map((p) => ({
                image: productImg(p.slug),
                text: p.name.toUpperCase()
              }))}
              bend={1.5}
              textColor="#421520"
              borderRadius={0.05}
              scrollSpeed={0.3}
              scrollEase={0.08}
              fontUrl="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap"
              font="bold 15px Cinzel"
            />
          </div>
        </div>
      </section>
    </>
  )
}
