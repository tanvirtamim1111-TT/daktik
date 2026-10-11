import type { DeliveryTicket, Envelope, Stamp } from "./types";

/** Product catalogue shared by the demo and Firebase stores. */

export const DELIVERY_TICKETS: DeliveryTicket[] = [
  { id: "standard", label: "সাধারণ", coins: 10, hours: 24 },
  { id: "swift", label: "দ্রুত", coins: 20, hours: 20 },
  { id: "express", label: "এক্সপ্রেস", coins: 30, hours: 15 },
  { id: "priority", label: "প্রায়োরিটি", coins: 35, hours: 10 },
];

export const LETTER_LIMIT = 1000;

/** Coins needed for the cheapest letter — used for “about N letters left”. */
export const CHEAPEST_TICKET = 10;

export const STAMP_CATALOG: Stamp[] = [
  {
    id: "s-river",
    name: "পদ্মা",
    description: "বিকেলের আলোয় পদ্মার বিস্তার। দেশের নদী সিরিজের প্রথম স্ট্যাম্প।",
    category: "bangladesh",
    year: 2026,
    coins: 15,
    palette: ["#2f6d8a", "#e9d9a8"],
    motif: "river",
    collected: false,
  },
  {
    id: "s-boat",
    name: "পালতোলা নৌকা",
    description: "নদীমাতৃক দেশের চিরচেনা দৃশ্য, আধুনিক রেখায়।",
    category: "bangladesh",
    year: 2026,
    coins: 20,
    palette: ["#173f35", "#c8a24a"],
    motif: "boat",
    collected: false,
  },
  {
    id: "s-tiger",
    name: "সুন্দরবনের বাঘ",
    description: "রয়েল বেঙ্গল টাইগার — সাহস আর বনের প্রতীক।",
    category: "nature",
    year: 2026,
    coins: 30,
    palette: ["#c46a2b", "#1f2a24"],
    motif: "tiger",
    collected: false,
  },
  {
    id: "s-leaf",
    name: "চা বাগান",
    description: "সিলেটের পাহাড়ি ঢালে সবুজ চায়ের সারি।",
    category: "nature",
    year: 2025,
    coins: 15,
    palette: ["#4d8a68", "#eef2e6"],
    motif: "leaf",
    collected: false,
  },
  {
    id: "s-flower",
    name: "শাপলা",
    description: "জাতীয় ফুল শাপলা, জলের ওপর নিঃশব্দে ফোটে।",
    category: "nature",
    year: 2025,
    coins: 10,
    palette: ["#d77a8c", "#f7efe9"],
    motif: "flower",
    collected: false,
  },
  {
    id: "s-mosque",
    name: "ষাট গম্বুজ",
    description: "বাগেরহাটের ঐতিহাসিক স্থাপত্য, পনেরো শতকের নিদর্শন।",
    category: "heritage",
    year: 2024,
    coins: 25,
    palette: ["#8a5a3b", "#f3e7d3"],
    motif: "mosque",
    collected: false,
  },
  { id: "s-sun", name: "নতুন সূর্য", description: "পহেলা বৈশাখের প্রথম ভোর।", category: "special", year: 2026, coins: 35, palette: ["#c8a24a", "#173f35"], motif: "sun", collected: false },
  { id: "s-rain", name: "বর্ষা", description: "আষাঢ়ের প্রথম বৃষ্টি — অপেক্ষার ঋতু।", category: "nature", year: 2026, coins: 20, palette: ["#5f7f9c", "#e7eef2"], motif: "rain", collected: false },
  { id: "s-moon", name: "চাঁদরাত", description: "উৎসবের আগের রাতের আকাশ।", category: "special", year: 2025, coins: 30, palette: ["#24324a", "#e9d9a8"], motif: "moon", collected: false },
  { id: "s-kite", name: "ঘুড়ি", description: "পুরান ঢাকার সাকরাইন উৎসবের রঙিন আকাশ।", category: "heritage", year: 2026, coins: 20, palette: ["#c94b4b", "#f7f5ef"], motif: "kite", collected: false },
];

export const ENVELOPE_CATALOG: Envelope[] = [
  { id: "e-ivory", name: "আইভরি", coins: 0, tone: "#efe9db", owned: false },
  { id: "e-sage", name: "সেজ", coins: 15, tone: "#aab9a9", owned: false },
  { id: "e-green", name: "ডাক সবুজ", coins: 25, tone: "#173f35", owned: false },
  { id: "e-dusk", name: "গোধূলি", coins: 25, tone: "#d8a48f", owned: false },
  { id: "e-night", name: "রাত", coins: 30, tone: "#24324a", owned: false },
  { id: "e-gold", name: "সোনালি", coins: 40, tone: "#c8a24a", owned: false },
];
