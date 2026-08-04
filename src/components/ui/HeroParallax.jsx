"use client";
import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { COLLECTIONS } from "../../data/site";
import { COLLECTION_IMGS } from "../../data/images";
import { Link } from "../../lib/router";
import { familySlug } from "../../pages/CollectionPage";
import "../../styles/mk2/hero-parallax.css";

gsap.registerPlugin(ScrollTrigger);

export function HeroParallax() {
  const containerRef = useRef(null);
  const rowsRef = useRef(null);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const row3Ref = useRef(null);

  const firstRow = COLLECTIONS.slice(0, 3);
  const secondRow = COLLECTIONS.slice(3, 6);
  const thirdRow = COLLECTIONS.slice(6, 9);

  useGSAP(() => {
    const st = {
      trigger: containerRef.current,
      start: "top top",
      end: "+=1200",
      scrub: 1.5,
      pin: true,
      anticipatePin: 1,
    };

    // 3D rotation & translateY — cards start tilted and far away
    gsap.fromTo(rowsRef.current,
      { rotationX: 15, rotationZ: 20, y: -700, opacity: 0.2 },
      {
        rotationX: 0, rotationZ: 0, y: 0, opacity: 1,
        ease: "none",
        scrollTrigger: st
      }
    );

    // For the rows, we don't want to pin 4 times, so we create a separate trigger without pin
    const stRows = {
      trigger: containerRef.current,
      start: "top top",
      end: "+=1200",
      scrub: 1.5,
    };

    // Row 1 slides from offset to centered
    gsap.fromTo(row1Ref.current,
      { x: 200 },
      { x: 0, ease: "none", scrollTrigger: stRows }
    );

    // Row 2 slides from opposite offset to centered
    gsap.fromTo(row2Ref.current,
      { x: -200 },
      { x: 0, ease: "none", scrollTrigger: stRows }
    );

    // Row 3 slides from offset to centered
    gsap.fromTo(row3Ref.current,
      { x: 200 },
      { x: 0, ease: "none", scrollTrigger: stRows }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="hp-container">
      <div className="hp-content-header">
        <h1 className="d1 hp-title">Browse our<br />collections</h1>
      </div>
      <div className="hp-perspective">
        <div ref={rowsRef} className="hp-rows">
          <div ref={row1Ref} className="hp-row">
            {firstRow.map((c) => (
              <CollectionCard key={c.no} collection={c} />
            ))}
          </div>
          <div ref={row2Ref} className="hp-row">
            {secondRow.map((c) => (
              <CollectionCard key={c.no} collection={c} />
            ))}
          </div>
          <div ref={row3Ref} className="hp-row">
            {thirdRow.map((c) => (
              <CollectionCard key={c.no} collection={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionCard({ collection }) {
  const img = COLLECTION_IMGS[collection.name];
  return (
    <div className="hp-card group">
      <Link
        to={`/collections/${familySlug(collection.name)}`}
        className="hp-card-link"
        data-cursor="OPEN"
      >
        <div className="hp-card-overlay" />
        {img ? (
          <img src={img.src} alt={collection.name} className="hp-card-img" loading="lazy" />
        ) : (
          <div className="hp-card-placeholder" />
        )}
        <div className="hp-card-info">
          <span className="hp-card-no">{collection.no}</span>
          <h2 className="hp-card-title">{collection.name}</h2>
        </div>
      </Link>
    </div>
  );
}
