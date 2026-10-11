import type { AddaPost, AppNotification, CoinTransaction, DeliveryTicket, Envelope, Letter, Me, Person, Stamp } from "./types";

const H = 3_600_000;
const M = 60_000;

export const DELIVERY_TICKETS: DeliveryTicket[] = [
  { id: "standard", label: "সাধারণ", coins: 10, hours: 24 },
  { id: "swift", label: "দ্রুত", coins: 20, hours: 20 },
  { id: "express", label: "এক্সপ্রেস", coins: 30, hours: 15 },
  { id: "priority", label: "প্রায়োরিটি", coins: 35, hours: 10 },
];

export const LETTER_LIMIT = 1000;

export const createSeed = (now = Date.now()) => {
  const me: Me = { id: "me", name: "Tanvir", postalId: "343-1111", hue: 158, coins: 120, joinedAt: now - 92 * 24 * H };

  const people: Record<string, Person> = {
    mitu: { id: "mitu", name: "মিতু", postalId: "512-0427", hue: 18 },
    rafi: { id: "rafi", name: "রাফি আহমেদ", postalId: "208-7731", hue: 210 },
    nadia: { id: "nadia", name: "নাদিয়া", postalId: "419-3302", hue: 330 },
    ammu: { id: "ammu", name: "আম্মু", postalId: "100-2024", hue: 40 },
    shuvo: { id: "shuvo", name: "শুভ", postalId: "777-1203", hue: 265 },
    tanha: { id: "tanha", name: "তানহা", postalId: "630-5518", hue: 95 },
  };

  const letters: Letter[] = [
    {
      id: "l-arriving",
      folder: "inbox",
      from: people.mitu,
      to: me,
      subject: "অনেকদিন পর",
      body:
        "অনেকদিন পর তোমাকে লিখছি। জানো, আজ সকালে বারান্দায় বসে চা খাচ্ছিলাম আর হঠাৎ মনে হলো — শেষ কবে তোমার সঙ্গে ঠিকমতো কথা হয়েছে?\n\nফোনে কথা হয়, মেসেজ হয়, কিন্তু সেগুলো কেমন যেন তাড়াহুড়োর। তাই ভাবলাম, একটা চিঠি লিখি। ধীরে, সময় নিয়ে।\n\nএখানে এখন বৃষ্টির মৌসুম। জানালার কাচে ফোঁটাগুলো দেখলে ছোটবেলার কথা মনে পড়ে। তুমি কেমন আছো? কাজের চাপ কি একটু কমেছে?\n\nউত্তর দিও। তাড়া নেই — চিঠি তো অপেক্ষারই জিনিস।",
      sentAt: now - 18 * H,
      deliverAt: now + 6_000, // arrives a few seconds after launch to demo the arrival moment
      ticketId: "express",
      read: false,
      stampId: "s-rain",
    },
    {
      id: "l1",
      folder: "inbox",
      from: people.rafi,
      to: me,
      subject: "ঢাকায় ফিরছি",
      body:
        "দোস্ত, আগামী মাসে ঢাকায় ফিরছি। এবার আর অজুহাত চলবে না — পুরোনো সেই চায়ের দোকানে বসতেই হবে।\n\nতোর পাঠানো শেষ চিঠিটা এখনো ডেস্কে রাখা আছে। মাঝে মাঝে পড়ি।",
      sentAt: now - 26 * H,
      deliverAt: now - 2 * H,
      ticketId: "standard",
      read: false,
      stampId: "s-boat",
    },
    {
      id: "l2",
      folder: "inbox",
      from: people.nadia,
      to: me,
      subject: "একটা বইয়ের কথা",
      body: "তুমি যে বইটার কথা বলেছিলে, শেষ করলাম। শেষ অধ্যায়টা পড়ে অনেকক্ষণ চুপ করে বসে ছিলাম।",
      sentAt: now - 40 * H,
      deliverAt: now - 20 * H,
      read: true,
      stampId: "s-flower",
    },
    {
      id: "l3",
      folder: "inbox",
      from: people.ammu,
      to: me,
      body: "ঠিকমতো খাওয়াদাওয়া করিস। শীত আসছে, গরম কাপড় বের করে রাখিস। ঈদে বাড়ি আসবি তো?",
      sentAt: now - 4 * 24 * H,
      deliverAt: now - 3 * 24 * H,
      read: true,
    },
    {
      id: "l4",
      folder: "inbox",
      from: people.tanha,
      to: me,
      subject: "ধন্যবাদ",
      body: "তোমার স্ট্যাম্পটা পেয়ে খুব খুশি হয়েছি। আমার সংগ্রহে এটাই প্রথম 'বিশেষ' স্ট্যাম্প।",
      sentAt: now - 8 * 24 * H,
      deliverAt: now - 7 * 24 * H,
      read: true,
    },
    {
      id: "s1",
      folder: "sent",
      from: me,
      to: people.shuvo,
      subject: "জন্মদিনের শুভেচ্ছা",
      body: "শুভ জন্মদিন, শুভ! এই বছরটা তোর হোক। দেখা হলে মিষ্টি পাওনা রইল।",
      sentAt: now - 2 * H,
      deliverAt: now + 18 * H,
      ticketId: "standard",
      read: false,
      stampId: "s-kite",
    },
    {
      id: "s2",
      folder: "sent",
      from: me,
      to: people.nadia,
      subject: "বইটা পড়ে দেখো",
      body: "একটা বই পাঠানোর মতো করে এই চিঠিটা পাঠালাম — পড়ে জানিও কেমন লাগল।",
      sentAt: now - 3 * 24 * H,
      deliverAt: now - 2 * 24 * H,
      read: true,
    },
    {
      id: "d1",
      folder: "drafts",
      from: me,
      to: people.rafi,
      subject: "",
      body: "চায়ের দোকানটা এখনো আছে, কিন্তু মামা বদলে গেছে…",
      sentAt: now - 30 * M,
      deliverAt: now - 30 * M,
      read: true,
    },
  ];

  const stamps: Stamp[] = [
    { id: "s-river", name: "পদ্মা", description: "বিকেলের আলোয় পদ্মার বিস্তার। দেশের নদী সিরিজের প্রথম স্ট্যাম্প।", category: "bangladesh", year: 2026, coins: 15, palette: ["#2f6d8a", "#e9d9a8"], motif: "river", collected: true },
    { id: "s-boat", name: "পালতোলা নৌকা", description: "নদীমাতৃক দেশের চিরচেনা দৃশ্য, আধুনিক রেখায়।", category: "bangladesh", year: 2026, coins: 20, palette: ["#173f35", "#c8a24a"], motif: "boat", collected: true },
    { id: "s-tiger", name: "সুন্দরবনের বাঘ", description: "রয়েল বেঙ্গল টাইগার — সাহস আর বনের প্রতীক।", category: "nature", year: 2026, coins: 30, palette: ["#c46a2b", "#1f2a24"], motif: "tiger", collected: false },
    { id: "s-leaf", name: "চা বাগান", description: "সিলেটের পাহাড়ি ঢালে সবুজ চায়ের সারি।", category: "nature", year: 2025, coins: 15, palette: ["#4d8a68", "#eef2e6"], motif: "leaf", collected: true },
    { id: "s-flower", name: "শাপলা", description: "জাতীয় ফুল শাপলা, জলের ওপর নিঃশব্দে ফোটে।", category: "nature", year: 2025, coins: 10, palette: ["#d77a8c", "#f7efe9"], motif: "flower", collected: true },
    { id: "s-mosque", name: "ষাট গম্বুজ", description: "বাগেরহাটের ঐতিহাসিক স্থাপত্য, পনেরো শতকের নিদর্শন।", category: "heritage", year: 2024, coins: 25, palette: ["#8a5a3b", "#f3e7d3"], motif: "mosque", collected: false },
    { id: "s-sun", name: "নতুন সূর্য", description: "পহেলা বৈশাখের প্রথম ভোর।", category: "special", year: 2026, coins: 35, palette: ["#c8a24a", "#173f35"], motif: "sun", collected: false },
    { id: "s-rain", name: "বর্ষা", description: "আষাঢ়ের প্রথম বৃষ্টি — অপেক্ষার ঋতু।", category: "nature", year: 2026, coins: 20, palette: ["#5f7f9c", "#e7eef2"], motif: "rain", collected: true },
    { id: "s-moon", name: "চাঁদরাত", description: "উৎসবের আগের রাতের আকাশ।", category: "special", year: 2025, coins: 30, palette: ["#24324a", "#e9d9a8"], motif: "moon", collected: false },
    { id: "s-kite", name: "ঘুড়ি", description: "পুরান ঢাকার সাকরাইন উৎসবের রঙিন আকাশ।", category: "heritage", year: 2026, coins: 20, palette: ["#c94b4b", "#f7f5ef"], motif: "kite", collected: true },
  ];

  const envelopes: Envelope[] = [
    { id: "e-ivory", name: "আইভরি", coins: 0, tone: "#efe9db", owned: true },
    { id: "e-sage", name: "সেজ", coins: 15, tone: "#aab9a9", owned: true },
    { id: "e-green", name: "ডাক সবুজ", coins: 25, tone: "#173f35", owned: false },
    { id: "e-dusk", name: "গোধূলি", coins: 25, tone: "#d8a48f", owned: false },
    { id: "e-night", name: "রাত", coins: 30, tone: "#24324a", owned: false },
    { id: "e-gold", name: "সোনালি", coins: 40, tone: "#c8a24a", owned: false },
  ];

  const transactions: CoinTransaction[] = [
    { id: "t1", amount: -10, reason: "সাধারণ টিকিট · শুভকে চিঠি", at: now - 2 * H },
    { id: "t2", amount: -20, reason: "স্ট্যাম্প · ঘুড়ি", at: now - 26 * H },
    { id: "t3", amount: +50, reason: "বন্ধুকে আমন্ত্রণ", at: now - 3 * 24 * H },
    { id: "t4", amount: -30, reason: "এক্সপ্রেস টিকিট · নাদিয়াকে চিঠি", at: now - 3 * 24 * H },
    { id: "t5", amount: +100, reason: "স্বাগতম উপহার", at: now - 92 * 24 * H },
  ];

  const adda: AddaPost[] = [
    {
      id: "p1",
      author: people.nadia,
      kind: "memory",
      at: now - 50 * M,
      text: "নানুর আলমারিতে একটা টিনের বাক্স ছিল, ভর্তি চিঠি। আজ সেটা খুলে বসেছিলাম। হাতের লেখার মধ্যেও যে মানুষ থাকে, সেটা আবার টের পেলাম।",
      likes: 48,
      liked: false,
      comments: 12,
    },
    {
      id: "p2",
      author: people.rafi,
      kind: "question",
      at: now - 3 * H,
      text: "আপনার জীবনের সবচেয়ে অপেক্ষার চিঠি কোনটা ছিল?",
      likes: 31,
      liked: true,
      comments: 27,
    },
    {
      id: "p3",
      author: people.tanha,
      kind: "photo",
      at: now - 6 * H,
      text: "আজকের বিকেল। চিঠি লেখার মতো আলো।",
      photo: { hueA: 32, hueB: 160, caption: "ধানমন্ডি লেক" },
      likes: 92,
      liked: false,
      comments: 8,
    },
    {
      id: "p4",
      author: people.shuvo,
      kind: "story",
      at: now - 22 * H,
      text: "প্রথম Daktik চিঠিটা পেলাম ২০ ঘণ্টা পর। অপেক্ষাটাই যে চিঠির অর্ধেক, সেটা বুঝলাম। খুলতে গিয়ে হাত একটু কাঁপছিল — হাসবেন না।",
      likes: 64,
      liked: false,
      comments: 15,
    },
  ];

  const notifications: AppNotification[] = [
    { id: "n1", title: "চিঠি পৌঁছেছে", body: "রাফি আহমেদের চিঠি আপনার ডাকবাক্সে।", at: now - 2 * H, read: false, letterId: "l1" },
    { id: "n2", title: "শুভর কাছে যাচ্ছে", body: "আপনার চিঠি ডাকঘর ছেড়ে পথে রওনা হয়েছে।", at: now - 1 * H, read: true, letterId: "s1" },
    { id: "n3", title: "নতুন স্ট্যাম্প", body: "‘নতুন সূর্য’ এখন ডাকঘরে পাওয়া যাচ্ছে।", at: now - 30 * H, read: true },
  ];

  return { me, people, letters, stamps, envelopes, transactions, adda, notifications };
};

export type Seed = ReturnType<typeof createSeed>;
