"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HorizontalShowcase() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!section || !track) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || window.innerWidth < 900) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const getDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(getDistance(), window.innerHeight)}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const cards = [
    {
      number: "01",
      title: "Material",
      description: "A quieter approach to premium materials.",
    },
    {
      number: "02",
      title: "Motion",
      description: "Interfaces that respond without getting in the way.",
    },
    {
      number: "03",
      title: "Detail",
      description: "Product information that rewards closer inspection.",
    },
    {
      number: "04",
      title: "Speed",
      description:
        "Server-first rendering and deliberately small client boundaries.",
    },
  ];

  return (
    <section ref={sectionRef} className="horizontal-showcase">
      <div className="horizontal-sticky">
        <div ref={trackRef} className="horizontal-track">
          <div className="horizontal-intro">
            <span className="eyebrow">Scroll showcase</span>
            <h2 className="section-title">
              Commerce,
              <br />
              in motion.
            </h2>
            <Link href="/shop" className="button light">
              Explore the catalog
            </Link>
          </div>

          {cards.map((card) => (
            <article className="horizontal-card" key={card.number}>
              <span className="eyebrow">{card.number}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
