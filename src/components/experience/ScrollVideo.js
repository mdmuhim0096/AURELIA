"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollVideo() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const src = process.env.NEXT_PUBLIC_SHOWCASE_VIDEO_URL;

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!src || !section || !video) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || window.innerWidth < 768) return;

    gsap.registerPlugin(ScrollTrigger);

    let trigger = null;

    const createTrigger = () => {
      if (trigger) trigger.kill();

      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate(self) {
          if (Number.isFinite(video.duration) && video.duration > 0) {
            const nextTime = self.progress * video.duration;
            if (Math.abs(video.currentTime - nextTime) > 0.03) {
              video.currentTime = nextTime;
            }
          }
        },
      });
    };

    const onLoadedMetadata = () => {
      createTrigger();
      window.setTimeout(() => ScrollTrigger.refresh(), 50);
    };

    if (Number.isFinite(video.duration) && video.duration > 0) {
      createTrigger();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      if (trigger) {
        trigger.kill();
        trigger = null;
      }
    };
  }, [src]);

  return (
    <section ref={sectionRef} className="video-scroll">
      <div className="video-scroll-sticky">
        {src ? (
          <video
            ref={videoRef}
            className="video-scroll-media"
            muted
            playsInline
            preload="metadata"
            src={src}
          />
        ) : null}

        <div className="video-copy">
          <span className="eyebrow">Scroll-controlled story</span>
          <h2>Designed around your movement.</h2>
          <p>
            {src
              ? "Scroll to control product film playback."
              : "Configure NEXT_PUBLIC_SHOWCASE_VIDEO_URL to enable the scroll-controlled showcase video."}
          </p>
        </div>
      </div>
    </section>
  );
}
