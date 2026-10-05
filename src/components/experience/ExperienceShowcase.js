"use client";

import Link from "next/link";

export default function ExperienceShowcase() {
  return (
    <section className="experience-showcase section-pad">
      <div className="container experience-grid">
        <div className="experience-copy">
          <span className="eyebrow">
            Designed around experience
          </span>

          <h2
            className="section-title"
            style={{ marginTop: 14 }}
          >
            Less friction.
            <br />
            More confidence.
          </h2>

          <p className="muted">
            Every interaction is designed to make
            discovering, evaluating and purchasing
            products feel clear and immediate.
          </p>

          <Link
            href="/shop"
            className="button dark"
          >
            Explore products
          </Link>
        </div>

        <div className="experience-panels">
          <div className="experience-panel">
            <span className="eyebrow">
              01 · Discovery
            </span>

            <h3>Find what matters faster.</h3>

            <p>
              Focused navigation and meaningful
              merchandising keep product discovery
              simple.
            </p>
          </div>

          <div className="experience-panel">
            <span className="eyebrow">
              02 · Confidence
            </span>

            <h3>Make informed decisions.</h3>

            <p>
              Clear product information, pricing and
              availability help customers purchase with
              confidence.
            </p>
          </div>

          <div className="experience-panel">
            <span className="eyebrow">
              03 · Checkout
            </span>

            <h3>Move from interest to ownership.</h3>

            <p>
              A streamlined checkout reduces unnecessary
              steps and keeps customers focused.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}