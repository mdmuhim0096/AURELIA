"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroMotion({ children }) {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const revealItems =
        heroRef.current.querySelectorAll("[data-hero-reveal]");

      const heroVisual =
        heroRef.current.querySelector(".hero-visual");

      const heroCard =
        heroRef.current.querySelector(".hero-card");

      const chipOne =
        heroRef.current.querySelector(".hero-chip.one");

      const chipTwo =
        heroRef.current.querySelector(".hero-chip.two");

      if (revealItems.length) {
        gsap.fromTo(
          revealItems,
          {
            y: 45,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }

      if (heroVisual) {
        gsap.fromTo(
          heroVisual,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }

      if (heroCard) {
        gsap.fromTo(
          heroCard,
          {
            scale: 0.86,
            rotation: 5,
            opacity: 0,
          },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 1.25,
            ease: "expo.out",
            clearProps: "transform,opacity",
          }
        );
      }

      if (chipOne) {
        gsap.to(chipOne, {
          y: -14,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (chipTwo) {
        gsap.to(chipTwo, {
          y: 14,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className="hero"
      style={{ display: "grid" }}
    >
      {children}
    </div>
  );
}