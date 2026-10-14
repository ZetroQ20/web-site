"use client";

import { useEffect, useState } from "react";

/**
 * `?onizleme` in the URL shows sections that are waiting for real content (before/after
 * photos, customer reviews) with clearly labelled samples, so the design can be reviewed
 * on the live site. Regular visitors never see the samples.
 */
export function usePreviewMode() {
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    setPreview(new URLSearchParams(window.location.search).has("onizleme"));
  }, []);
  return preview;
}
