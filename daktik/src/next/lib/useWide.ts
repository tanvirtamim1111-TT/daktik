import { useEffect, useState } from "react";

/** Desktop/website layout from 1024px: sidebar, split inbox, dialogs instead of full screens. */
export const WIDE_QUERY = "(min-width: 1024px)";

export function useWide() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}
