import React, { useEffect, useState, useRef } from "react"
import "../../styles/ReviewStack.css"

export const InfiniteMovingCards = ({
  items,
  direction = "right",
  speed = "slow",
  pauseOnHover = true,
  className = "",
}) => {
  const containerRef = useRef(null)
  const scrollerRef = useRef(null)

  const [start, setStart] = useState(false)

  useEffect(() => {
    addAnimation()
  }, [])

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children)

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true)
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem)
        }
      })

      getDirection()
      getSpeed()
      setStart(true)
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        )
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        )
      }
    }
  }

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s")
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s")
      } else {
        containerRef.current.style.setProperty("--animation-duration", "55s")
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`scroller-container ${className}`}
    >
      <ul
        ref={scrollerRef}
        className={`scroller-list ${start ? "animate-scroll" : ""} ${
          pauseOnHover ? "pause-on-hover" : ""
        }`}
      >
        {items.map((item, idx) => (
          <li key={item.name + idx} className="infinite-card">
            <blockquote>
              <div className="infinite-card-accent" />
              <div className="infinite-card-stars">★★★★★</div>
              <span className="infinite-card-quote">
                "{item.quote}"
              </span>
              <div className="infinite-card-footer">
                <div className="infinite-card-avatar">
                  {item.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="infinite-card-meta">
                  <span className="infinite-card-author">{item.name}</span>
                  <span className="infinite-card-title">{item.title}</span>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  )
}
