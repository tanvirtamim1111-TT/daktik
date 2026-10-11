/**
 * Domain model for the new Daktik UI.
 *
 * These types are deliberately UI-shaped and small. The mapping from the
 * existing Firestore documents (users, letters, …) lives in the repository
 * adapter — see design/07-android-implementation.md.
 */

export type PostalId = string; // "343-1111"

export interface Person {
  id: string;
  name: string;
  postalId: PostalId;
  /** Optional photo. When missing, the Avatar renders initials on a tinted disc. */
  photo?: string;
  /** Hue used for the initials disc so every person is recognisable without a photo. */
  hue: number;
}

export type LetterFolder = "inbox" | "sent" | "drafts" | "archived";

export type DeliveryStage = "written" | "at-post-office" | "on-the-way" | "delivered";

export interface Letter {
  id: string;
  folder: LetterFolder;
  from: Person;
  to: Person;
  subject?: string;
  body: string;
  /** When the sender pressed send (ms). */
  sentAt: number;
  /** When the letter reaches the recipient (ms). */
  deliverAt: number;
  ticketId?: DeliveryTicket["id"];
  read: boolean;
  reaction?: "heart";
  envelopeId?: string;
  stampId?: string;
}

export interface DeliveryTicket {
  id: "standard" | "swift" | "express" | "priority";
  label: string;
  coins: number;
  hours: number;
}

export type StampCategory = "bangladesh" | "nature" | "heritage" | "special";

export interface Stamp {
  id: string;
  name: string;
  description: string;
  category: StampCategory;
  year: number;
  coins: number;
  /** Two-colour palette used by the generated stamp artwork. */
  palette: [string, string];
  motif: "river" | "sun" | "leaf" | "boat" | "tiger" | "mosque" | "flower" | "moon" | "rain" | "kite";
  collected: boolean;
}

export interface Envelope {
  id: string;
  name: string;
  coins: number;
  tone: string;
  owned: boolean;
}

export interface CoinTransaction {
  id: string;
  amount: number; // positive = earned, negative = spent
  reason: string;
  at: number;
}

export type AddaPostKind = "story" | "memory" | "question" | "photo" | "topic";

export interface AddaPost {
  id: string;
  author: Person;
  kind: AddaPostKind;
  at: number;
  text: string;
  photo?: { hueA: number; hueB: number; caption?: string };
  likes: number;
  liked: boolean;
  comments: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
  letterId?: string;
}

export interface Me extends Person {
  coins: number;
  joinedAt: number;
}

export type ThemePreference = "system" | "light" | "dark";
