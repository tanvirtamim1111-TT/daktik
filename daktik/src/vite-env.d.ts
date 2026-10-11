/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DAKTIK_UI?: "next" | "legacy";
  /** "true" builds a demo-data-only preview (no Firebase). */
  readonly VITE_DAKTIK_PREVIEW?: "true";
}
