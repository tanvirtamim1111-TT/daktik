import { createContext, useContext } from "react";

export type Tab = "home" | "letters" | "postoffice" | "profile";

/** Screens that open on top of the tab bar. One screen = one purpose. */
export type Route =
  | { name: "reader"; id: string }
  | { name: "compose"; toPostalId?: string; subject?: string; draftId?: string }
  | { name: "delivery"; id: string; fresh?: boolean }
  | { name: "stamps"; mine?: boolean }
  | { name: "archive" }
  | { name: "envelopes" }
  | { name: "tickets" }
  | { name: "coins" }
  | { name: "adda" }
  | { name: "identity" }
  | { name: "settings" }
  | { name: "notifications" }
  | { name: "system" };

export interface Nav {
  tab: Tab;
  setTab(t: Tab): void;
  push(r: Route): void;
  pop(): void;
  /** Replace the top screen (e.g. compose → delivery status). */
  replace(r: Route): void;
  restartOnboarding(): void;
}

export const NavCtx = createContext<Nav | null>(null);

export const useNav = () => {
  const n = useContext(NavCtx);
  if (!n) throw new Error("useNav outside NavCtx");
  return n;
};
