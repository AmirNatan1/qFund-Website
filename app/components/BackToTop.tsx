"use client";

import type { MouseEvent } from "react";

export default function BackToTop() {
  const returnToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      return;
    }

    const origin = window.scrollY;
    const startedAt = window.performance.now();
    const duration = 650;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";

    const move = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      window.scrollTo(0, Math.round(origin * (1 - eased)));

      if (progress < 1) {
        window.requestAnimationFrame(move);
      } else {
        root.style.scrollBehavior = previousScrollBehavior;
      }
    };

    window.requestAnimationFrame(move);
  };

  return (
    <a className="footer-to-top" href="#top" aria-label="Back to the top" onClick={returnToTop} data-magnetic>
      <span aria-hidden="true">↑</span>
      <small>Back to top</small>
    </a>
  );
}
