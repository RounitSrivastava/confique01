"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GoogleAnalytics({ gaId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gaId || !window.gtag) return;

    const url =
      pathname +
      (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // 🔴 THIS IS THE KEY LINE YOU WERE MISSING
    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams, gaId]);

  return null;
}
