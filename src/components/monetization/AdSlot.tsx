"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Ad placeholder container.
 *
 * Renders a visible placeholder that reserves space for a future AdSense ad.
 * No ad scripts are loaded — the placeholder shows "ADVERTISEMENT" with a
 * brief explanatory note so visitors understand why the space exists.
 *
 * Props:
 *   slot  - Identifier used as data attribute. Use "mid-content" or "footer".
 *   lazy  - If true, the component renders only when it enters
 *            the viewport (IntersectionObserver). Ideal for below-
 *            the-fold placements to avoid reserving off-screen space.
 */
export default function AdSlot({ slot, lazy = false }: { slot: string; lazy?: boolean }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!lazy);

  const handleIntersect = useCallback(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!lazy || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleIntersect();
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [lazy, handleIntersect]);

  // Lazy: render a zero-height invisible sentinel until visible
  if (lazy && !visible) {
    return (
      <div
        ref={sentinelRef}
        data-ad-slot={slot}
        className="h-0 overflow-hidden"
        aria-hidden="true"
      />
    );
  }

  return (
    <div ref={sentinelRef} data-ad-slot={slot} className="mt-[50px]">
      <div
        className="mx-auto w-full max-w-4xl rounded-md border border-gray-200 bg-[#f8f8f8] px-6 py-5 text-center sm:px-8"
        role="complementary"
        aria-label="Advertisement placeholder"
      >
        <span className="block text-sm font-medium tracking-widest text-gray-400 uppercase">
          Advertisement
        </span>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          A discreet ad keeps these tools free. The tool above is fully usable without clicking
          anything.
        </p>
        {/* ADSENSE SLOT: {slot} */}
        {/* <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script> */}
      </div>
    </div>
  );
}