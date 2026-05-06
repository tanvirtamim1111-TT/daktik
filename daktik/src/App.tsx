/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PushNotifications } from "@capacitor/push-notifications";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { createPortal } from "react-dom";

import { motion, AnimatePresence, useAnimation } from "motion/react";
import {
  Home,
  PenLine,
  Inbox,
  MapPin,
  Ticket,
  Settings,
  Mail,
  Coins,
  CloudSun,
  Menu,
  ArrowLeft,
  Send,
  User as UserIcon,
  BookOpen,
  Clock,
  CheckCircle2,
  Download,
  AlertCircle,
  Ban,
  ShieldBan,
  Settings2,
  Search,
  Plus,
  Stamp,
  LogIn,
  LogOut,
  Lock,
  AtSign,
  EyeOff,
  Type,
  Dot,
  Sparkles,
  Building2,
  Folder,
  Maximize2,
  Minimize2,
  RefreshCw,
  Bell,
  Flame,
  Volume2,
  VolumeX,
  Smartphone,
  Info,
  HelpCircle,
  ShieldCheck,
  ShoppingBag,
  FileText,
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  Wallet,
  ArrowRightLeft,
  Languages,
  MessageSquare,
  MessageCircle,
  History as HistoryIcon,
  Heart,
  Zap,
  Lock as LockIcon,
  Coffee,
  ChevronRight,
  Landmark,
  Flower2,
  Cat,
  Castle,
  Palette,
  Crown,
  X,
  CheckCheck,
  Gift,
  ArrowRight,
  Copy,
  Archive,
  Truck,
  Wifi,
  WifiOff,
  FolderOpen,
  Quote,
  Bike,
  ShieldAlert,
  Camera,
  Upload,
  MoreVertical,
  Eye,
  Trash2,
  Star,
  AlertTriangle,
  Save,
  Play,
  Library,
  Sparkle,
  MailX,
  LayoutDashboard,
} from "lucide-react";
import { vintageAudio, AudioSettings } from "./lib/audio";
import { auth, db, messaging, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  deleteUser,
  updateProfile as updateAuthProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  limit,
  getDocs,
  getDocFromServer,
  updateDoc,
  writeBatch,
  Timestamp,
  serverTimestamp,
  deleteDoc,
  increment,
} from "firebase/firestore";
import { getToken, onMessage } from "firebase/messaging";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { generatePostmanAdda, generatePostmanResponse, generatePeonExcuse, generateDailyNotice, PostmanDialogue } from "./services/geminiService";

const generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const DakthikLogo = ({ className = "w-12 h-12", id }: { className?: string, id?: string }) => (
  <img 
    id={id} 
    src="/DakthikLogo.png" 
    alt="Dakthik Logo" 
    className={`${className} object-contain`}
  />
);

const toEnglishDigits = (str: string) => {
  if (!str) return str;
  const bengaliToEnglish: { [key: string]: string } = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  };
  return str.replace(/[০-৯]/g, (match) => bengaliToEnglish[match]);
};

const toBengaliDigits = (str: string | number | undefined | null) => {
  if (str === null || str === undefined) return "";
  const englishToBengali: { [key: string]: string } = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };
  return str.toString().replace(/[0-9]/g, (match) => englishToBengali[match]);
};

const getDeliveryStatusLabel = (status: string, isSender: boolean = false) => {
  switch (status) {
    case "in-transit": return "পথে আছে";
    case "processing-at-head-office": return "হেড অফিসে বাছাইকরণ";
    case "processing-at-post-office": return "শাখা ডাকটিকে";
    case "with-mail-carrier": return isSender ? "পিয়ন প্রাপকের ঠিকানায় যাচ্ছে" : "পিয়ন আপনার ঠিকানায় আসছে";
    case "at-veranda": return isSender ? "প্রাপকের বারান্দায় আছে" : "বারান্দায় আছে";
    case "returned-to-post": return "পোস্ট অফিসে ফেরত";
    case "at-head-office": return "হেড অফিসে বাছাইকরণ";
    case "dead-letter": return "হারিয়ে গেছে (Dead Letter)";
    case "delivered": return "ডেলিভারি সম্পন্ন";
    default: return "পথে আছে";
  }
};

const getPostmanById = (id: string) => POSTMEN.find(p => p.id === id) || POSTMEN[0];

const formatDakthikId = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}`;
};

const RESERVED_IDS = [
  "111-1111",
  "222-2222",
  "333-3333",
  "444-4444",
  "555-5555",
  "666-6666",
  "777-7777",
  "888-8888",
  "999-9999",
  "123-4567",
  "987-6543",
  "000-0000",
];

const getDispatchTime = (nowMs = Date.now()) => {
  const date = new Date(nowMs);
  const hours = date.getHours();

  if (hours >= 9 && hours < 17) {
    return nowMs;
  }

  const dispatchDate = new Date(nowMs);
  if (hours >= 17) {
    dispatchDate.setDate(dispatchDate.getDate() + 1);
  }
  dispatchDate.setHours(9, 0, 0, 0);
  return dispatchDate.getTime();
};

// --- Error Handling ---
enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

const showToast = (
  message: string,
  type: "success" | "error" | "info" = "info",
) => {
  // Trigger haptic feedback for mobile
  if (type === "success") {
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
  } else if (type === "error") {
    Haptics.notification({ type: "error" as any }).catch(() => {});
  } else {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }

  window.dispatchEvent(
    new CustomEvent("show-toast", { detail: { message, type } }),
  );
};

const sendSystemNotification = (title: string, body: string, enabled: boolean = true) => {
  if (!enabled) return;
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification(title, { body });
    } catch (e) {
      console.warn("System notification failed:", e);
    }
  }
};

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));

  if (errInfo.error.includes("offline")) {
    console.warn("Client is offline. Some features may not work properly.");
    return; // Don't throw or alert for offline errors
  }

  showToast(
    `Firestore Error: ${errInfo.error}. Please check your connection or permissions.`,
    "error",
  );
  throw new Error(JSON.stringify(errInfo));
}

// --- Hooks ---
const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isLocked]);
};

const useDeliverySync = (user: any) => {
  useEffect(() => {
    if (!user) return;

    const processSync = async (snapshot: any) => {
      if (snapshot.empty) return;
      const now = Date.now();
      const batch = writeBatch(db);
      let hasUpdates = false;

      // Using for...of to allow await for AI excuse generation
      for (const docSnap of snapshot.docs) {
        const letter = docSnap.data() as Letter;
        if (letter.deliveryStatus === "delivered") continue;

        const letterRef = docSnap.ref;
        let updatedFields: Partial<Letter> = {};
        const deliveryDelay = letter.deliveryDelay || 60000;
        const arrivalTime = (letter.timestamp || now) + deliveryDelay;

        // Delivery Engine Logic
        if (
          letter.receiverUid === null &&
          letter.deliveryStatus !== "dead-letter"
        ) {
          if (now > arrivalTime) {
            updatedFields = {
              deliveryStatus: "dead-letter",
              status: "lost",
              deadLetterAt: arrivalTime,
            };
          }
        } else if (
          !letter.deliveryStatus ||
          letter.deliveryStatus === "in-transit"
        ) {
          // Changed delay windows to be more realistic: Head Office takes a significant portion of time
          if (now > (letter.timestamp || now) + deliveryDelay * 0.2) {
             updatedFields = { deliveryStatus: "processing-at-head-office" };
             if (letter.senderUid === user.uid) {
               sendSystemNotification(
                 "চিঠিটি হেড অফিসে পৌঁছেছে",
                 "আপনার পাঠানো চিঠিটি এখন হেড অফিসে বাছাই করা হচ্ছে।",
                 user?.notificationsEnabled !== false
               );
             }
          }
        } else if (letter.deliveryStatus === "processing-at-head-office") {
          if (now > (letter.timestamp || now) + deliveryDelay * 0.5) {
            updatedFields = { deliveryStatus: "processing-at-post-office" };
          }
        } else if (letter.deliveryStatus === "processing-at-post-office") {
          if (now > (letter.timestamp || now) + deliveryDelay * 0.75) {
            updatedFields = { deliveryStatus: "with-mail-carrier" };
          }
        } else if (letter.deliveryStatus === "with-mail-carrier") {
          if (now > arrivalTime) {
            if (letter.receiverUid) {
              updatedFields = {
                deliveryStatus: "at-veranda",
                lastAttemptAt: now, // Set to current time to ensure full 30 min window starts now
                attempts: 1,
              };
              if (letter.receiverUid === user.uid) {
                showToast("সাইকেলের ঘণ্টির শব্দ শুনিতেছেন? পিয়ন আপনার দুয়ারে দাঁড়াইয়াছে! 🛎️", "info");
                sendSystemNotification(
                  "দুয়ার পিয়ন আসিয়াছে! 🚲",
                  `একটি খাম আসিয়াছে। অভিলম্বে দুয়ার খুলিয়া পত্রটি গ্রহণ করিবার অনুরোধ করা হইল।`,
                  user?.notificationsEnabled !== false
                );
              }
            } else {
              updatedFields = {
                deliveryStatus: "dead-letter",
                status: "lost",
                deadLetterAt: arrivalTime,
              };
            }
          }
        } else if (
          letter.deliveryStatus === "at-veranda" &&
          letter.attempts === 1
        ) {
          if (now > (letter.lastAttemptAt || 0) + VERANDA_WINDOW) {
            updatedFields = {
              deliveryStatus: "returned-to-post",
              nextAttemptAt: now + RETURN_WAIT,
            };
            if (letter.receiverUid === user.uid) {
              showToast("আফসোস! আপনি উপস্থিত না থাকায় পিয়ন বিফল মনোরথে ফিরিয়া গিয়াছে। 🚲", "info");
              sendSystemNotification(
                "পিয়ন ফিরিয়া গিয়াছে! 📮",
                "আপনি উপস্থিত ছিলেন না বলিয়া পিয়ন পত্রটি বিলি করিতে পারে নাই। কিছুক্ষণ পরে সে পুনরায় আসিবে।",
                user?.notificationsEnabled !== false
              );
            }
          }
        } else if (letter.deliveryStatus === "returned-to-post") {
          if (now > (letter.nextAttemptAt || 0)) {
            updatedFields = {
              deliveryStatus: "at-veranda",
              lastAttemptAt: now, // Ensure full window for 2nd attempt too
              attempts: 2,
            };
            if (letter.receiverUid === user.uid) {
              showToast("পিয়ন শেষবারের মতো আসিয়া আপনার দুয়ারে কড়া নাড়িতেছে! 🚲", "info");
              sendSystemNotification(
                "পিয়ন পুনরায় আসিয়াছে! 🛎️",
                "ইহা শেষ সুযোগ। আপনি পত্রটি গ্রহণ না করিলে পিয়ন উহা হেড অফিসে ফেরত পাঠাইতে বাধ্য হইবে।",
                user?.notificationsEnabled !== false
              );
            }
          }
        } else if (
          letter.deliveryStatus === "at-veranda" &&
          letter.attempts === 2
        ) {
          if (now > (letter.lastAttemptAt || 0) + VERANDA_WINDOW) {
            updatedFields = {
              deliveryStatus: "at-head-office",
              nextAttemptAt: now + 24 * 60 * 60 * 1000,
              excuseMessage: "বারবার আসিয়াও আপনার দেখা না পাওয়ায় চিঠিটি এখন হেড অফিসে গচ্ছিত রাখা হইয়াছে।",
            };
            // Notify sender that the letter is now at head office
            if (letter.senderUid === user.uid) {
              showToast(
                `প্রেরিত পত্রটি বিলি করা সম্ভব হয় নাই, পিয়ন উহা হেড অফিসে জমা দিয়াছে। 📮`,
                "error",
              );
            }
            // Create a formal notification record for the sender
            const notifRef = doc(collection(db, "notifications"));
            batch.set(notifRef, {
              userId: letter.senderUid,
              title: "পত্রটি বিলি করা সম্ভব হয় নাই! 📮",
              body: `আপনার প্রেরিত পত্রটি (পোস্টকোড: ${toBengaliDigits(letter.receiverPostcode)}) দুইবার চেষ্টাতেও বিলি করা সম্ভব হয় নাই। পিয়ন উহা বিফল মনোরথে হেড অফিসে জমা দিয়াছে।`,
              type: "system",
              isRead: false,
              createdAt: serverTimestamp(),
            });
          }
        } else if (letter.deliveryStatus === "at-head-office") {
          if (now > (letter.nextAttemptAt || 0)) {
            updatedFields = {
              deliveryStatus: "dead-letter",
              status: "lost",
              deadLetterAt: now,
            };
          }
        }

        // --- AI Powered Postman Excuses ---
        const isStatusChange = !!updatedFields.deliveryStatus && updatedFields.deliveryStatus !== letter.deliveryStatus;
        const isDelayingStatus = ["processing-at-head-office", "in-transit", "with-mail-carrier"].includes(updatedFields.deliveryStatus || letter.deliveryStatus || "");
        
        // Only trigger if it's been at least 3 hours since the last message or a significant "slow" status change
        const hoursPassed = (now - (letter.lastExcuseAt || 0)) / (1000 * 60 * 60);
        const timeForPeriodicExcuse = hoursPassed > 6; // Increased from 4 to 6 hours for less annoyance
        
        // Count active excuses to throttle
        const activeExcusesCount = snapshot.docs.filter(d => {
          const data = d.data();
          return data.excuseMessage && data.deliveryStatus !== "delivered" && data.senderUid === letter.senderUid;
        }).length;

        // CRITICAL: Only send excuse if letter is ACTIVE (sent and not yet arrived at veranda)
        const isActuallyOnTheWay = letter.status === "sent" && !["at-veranda", "delivered", "returned-to-post", "at-head-office"].includes(letter.deliveryStatus || "");

        if ((isStatusChange || timeForPeriodicExcuse) && isActuallyOnTheWay && isDelayingStatus) {
          const postman = POSTMEN.find(p => p.id === letter.postmanId) || POSTMEN[0];
          
          // Probability calculation based on cost and frequency
          let prob = postman.excuseRate ?? (postman.cost <= 5 ? 0.18 : (postman.cost <= 15 ? 0.07 : 0.02));
          
          if (activeExcusesCount >= 1) prob *= 0.3;
          if (activeExcusesCount >= 2) prob = 0; // Hard limit

          if (Math.random() < prob) {
            try {
              const excuse = await generatePeonExcuse({
                postmanName: postman.name,
                cost: postman.cost,
                location: updatedFields.deliveryStatus || letter.deliveryStatus || "পথে",
              });
              
              if (excuse) {
                updatedFields.excuseMessage = excuse;
                updatedFields.lastExcuseAt = now;
                // Add a realistic delay (5-25 mins) to make the excuse feel "real"
                const extraDelay = Math.floor(Math.random() * 20 * 60 * 1000) + (5 * 60 * 1000);
                updatedFields.deliveryDelay = (letter.deliveryDelay || 0) + extraDelay;

                // Notify both sender and receiver if applicable
                const excuseTitle = `পিয়ন ${postman.name} এর বার্তা`;
                if (letter.senderUid) {
                  await addNotification(letter.senderUid, excuseTitle, excuse, "letter", {
                    letterId: docSnap.id,
                    postmanId: postman.id,
                    location: updatedFields.deliveryStatus || letter.deliveryStatus
                  });
                }
                if (letter.receiverUid && letter.receiverUid !== letter.senderUid) {
                  await addNotification(letter.receiverUid, excuseTitle, excuse, "letter", {
                    letterId: docSnap.id,
                    postmanId: postman.id,
                    location: updatedFields.deliveryStatus || letter.deliveryStatus
                  });
                }
              }
            } catch (err) {
              console.error("Failed to generate AI excuse:", err);
            }
          }
        }

        // --- Status Change Notifications (Non-Excuse) ---
        if (isStatusChange && !updatedFields.excuseMessage) {
           const postman = POSTMEN.find(p => p.id === letter.postmanId) || POSTMEN[0];
           const title = "চিঠির আপডেট";
           
           if (letter.senderUid) {
             const statusLabel = getDeliveryStatusLabel(updatedFields.deliveryStatus || "", true);
             const body = `চিঠিটি এখন: ${statusLabel}`;
             await addNotification(letter.senderUid, title, body, "letter", {
               letterId: docSnap.id,
               postmanId: postman.id,
               location: updatedFields.deliveryStatus,
               isSender: true
             });
           }
           if (letter.receiverUid && letter.receiverUid !== letter.senderUid) {
             const statusLabel = getDeliveryStatusLabel(updatedFields.deliveryStatus || "", false);
             const body = `চিঠিটি এখন: ${statusLabel}`;
             await addNotification(letter.receiverUid, title, body, "letter", {
               letterId: docSnap.id,
               postmanId: postman.id,
               location: updatedFields.deliveryStatus,
               isSender: false
             });
           }
        }

        if (Object.keys(updatedFields).length > 0) {
          batch.update(letterRef, updatedFields);
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        await batch.commit().catch((e) => {
          if (!e.message.includes("permission-denied")) {
            console.error("Sync commit error:", e);
          }
        });
      }
    };

    // Subscriptions for both incoming and outgoing
    const qIncoming = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      where("deliveryStatus", "not-in", ["delivered", "dead-letter"]),
    );
    const qOutgoing = query(
      collection(db, "letters"),
      where("senderUid", "==", user.uid),
      where("deliveryStatus", "not-in", ["delivered", "dead-letter"]),
    );

    const unsubIncoming = onSnapshot(qIncoming, processSync);
    const unsubOutgoing = onSnapshot(qOutgoing, processSync);

    const timer = setInterval(() => {
      getDocs(qIncoming).then(processSync);
      getDocs(qOutgoing).then(processSync);
    }, 15000);

    return () => {
      unsubIncoming();
      unsubOutgoing();
      clearInterval(timer);
    };
  }, [user]);
};

// --- Types ---
type Screen =
  | "splash"
  | "onboarding"
  | "home"
  | "write"
  | "send"
  | "inbox"
  | "track"
  | "postmen"
  | "postman-record"
  | "stamps"
  | "dead-letter"
  | "settings"
  | "settings-themes"
  | "settings-profile"
  | "settings-notifications"
  | "settings-sounds"
  | "settings-privacy"
  | "settings-help"
  | "money-order"
  | "savings"
  | "profile"
  | "archives"
  | "sent-letters"
  | "friends"
  | "baranda"
  | "head-office"
  | "dakthik-sodoyaloy"
  | "adda-room"
  | "sodapati"
  | "profile-edit"
  | "privacy-policy"
  | "admin"
  | "support"
  | "about"
  | "notifications"
  | "notification-detail"
  | "referral";

const VERANDA_WINDOW = 30 * 60 * 1000; // 30 minutes
const RETURN_WAIT = 2 * 60 * 60 * 1000; // 2 hours
const HEAD_OFFICE_WAIT = 5 * 60 * 60 * 1000; // 5 hours
const RECOVERY_FEE = 20; // 20 coins

interface Postman {
  id: string;
  name: string;
  speed: number; // multiplier for delivery time
  cost: number;
  description: string;
  bio?: string;
  avatar: string;
  language?: string;
  catchphrase?: string;
  specialty?: string;
  experience?: string;
  joiningDate?: string;
  serviceId?: string;
  rating?: number;
  favoriteFood?: string;
  hobby?: string;
  fear?: string;
  specialTalent?: string;
  fatherName?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  education?: string;
  fileNo?: string;
  excuseRate?: number;
}

const POSTMEN: Postman[] = [
  {
    id: "pm1",
    name: "করিম চাচা",
    speed: 1,
    cost: 5,
    description: "পুরানো পিয়ন, ধীরস্থির কিন্তু নির্ভরযোগ্য।",
    avatar: "/করিম চাচা.png",
    language: "আঞ্চলিক",
    bio: 'করিম চাচা এই ডাকটিকের সবচেয়ে পুরনো পিয়ন। তিনি বলেন, "চিঠি শুধু কাগজ নয়, মানুষের দীর্ঘশ্বাস।" তার ঝোলায় সবসময় কিছু লজেন্স থাকে বাচ্চাদের জন্য।',
    catchphrase: "“চিঠি মানেই আবেগ, বাবা। তাড়াহুড়ো করলে চলে না।”",
    specialty: "গলি চেনা",
    experience: "৩০ বছর",
    joiningDate: "১২ জুলাই, ১৯৯৪",
    serviceId: "DHK-94-001",
    rating: 5,
    favoriteFood: "দুধ-ভাত আর গুড়",
    hobby: "পুরানো রেডিও শোনা",
    fear: "কুকুর (বিশেষ করে লাল রঙের)",
    specialTalent: "গন্ধ শুঁকে চিঠির বিষয়বস্তু বোঝা",
    fatherName: "মরহুম আব্দুল জব্বার",
    permanentAddress: "গ্রাম: উত্তরপাড়া, ডাকটিক: সদরঘাট, জেলা: ঢাকা",
    bloodGroup: "O+",
    emergencyContact: "০১৭XXXXXXXX (বড় ছেলে)",
    education: "অষ্টম শ্রেণী (১৯৭২)",
    fileNo: "রেজি-৯৪/০১",
  },
  {
    id: "pm2",
    name: "রহমত আলী",
    speed: 0.5,
    cost: 15,
    description: "সাইকেলে করে দ্রুত চিঠি পৌঁছে দেন।",
    avatar: "/রহমত আলী~2.png",
    language: "প্রমিত",
    bio: "রহমত মিয়ার সাইকেলের বেল শুনলেই পাড়ার মানুষ বোঝে চিঠি এসেছে। তিনি খুব সময়নিষ্ঠ এবং তার সাইকেলটি তিনি নিজের সন্তানের মতো যত্ন করেন।",
    catchphrase: "“বৃষ্টি হোক আর রোদ, রহমত আলী ঠিক সময়ে হাজির!”",
    specialty: "সময়ানুবর্তিতা",
    experience: "১২ বছর",
    joiningDate: "০৫ মার্চ, ২০১২",
    serviceId: "DHK-12-042",
    rating: 4,
    favoriteFood: "গরুর কালা ভুনা",
    hobby: "সাইকেলের টায়ার পালিশ করা",
    fear: "পাংচার হওয়া",
    specialTalent: "এক হাতে সাইকেল চালিয়ে অন্য হাতে চিঠি পড়া",
    fatherName: "আলী হোসেন",
    permanentAddress: "গ্রাম: চরপাড়া, ডাকটিক: মোহাম্মদপুর, জেলা: ঢাকা",
    bloodGroup: "B+",
    emergencyContact: "০১৮XXXXXXXX (স্ত্রী)",
    education: "এসএসসি (২০০৫)",
    fileNo: "রেজি-১২/৪২",
  },
  {
    id: "pm3",
    name: "তরুণ রফিক",
    speed: 0.2,
    cost: 30,
    description: "সবচেয়ে দ্রুত, আধুনিক পিয়ন।",
    avatar: "/তরুন রফিক.png",
    language: "প্রমিত",
    bio: "রফিক নতুন প্রজন্মের পিয়ন। সে জিপিএস ব্যবহার করে এবং খুব দ্রুত চিঠি পৌঁছে দেয়। তবে সে করিম চাচার গল্প শুনতে খুব ভালোবাসে।",
    catchphrase: "“গতিই জীবন, আর চিঠি হলো গতির বাহন।”",
    specialty: "দ্রুত ডেলিভারি",
    experience: "২ বছর",
    joiningDate: "১৮ আগস্ট, ২০২২",
    serviceId: "DHK-22-109",
    rating: 4,
    favoriteFood: "চিকেন বার্গার",
    hobby: "মোবাইল গেমিং",
    fear: "ইন্টারনেট না থাকা",
    specialTalent: "অন্ধকারেও জিপিএস ছাড়া পথ চেনা",
    fatherName: "শফিকুল ইসলাম",
    permanentAddress: "গ্রাম: নতুন বাজার, ডাকটিক: গুলশান, জেলা: ঢাকা",
    bloodGroup: "A-",
    emergencyContact: "০১৯XXXXXXXX (বাবা)",
    education: "এইচএসসি (২০২০)",
    fileNo: "রেজি-২২/১০৯",
  },
  {
    id: "pm4",
    name: "বজলু মিয়া",
    speed: 1.25,
    cost: 0,
    description: "সম্পুর্ন ফ্রি কিন্তু অলস পিয়ন।",
    avatar: "https://i.ibb.co/d00NxDWb/1777507482527.jpg",
    language: "আঞ্চলিক",
    bio: "বজলু মিয়া ডাকটিকের সবচেয়ে অলস পিয়ন। তিনি বলেন, 'চিঠি যাবেই, আজ না হলে কাল।' ফ্রি ডেলিভারি হওয়ায় সবাই তাকেই ডাকে, কিন্তু তার অজুহাতের কোনো শেষ নেই। কেউ কেউ বলে তিনি চিঠির ঝোলা কোলবালিশ হিসেবে ব্যবহার করে ঘুমিয়ে থাকেন।",
    catchphrase: "“আরে ভাই ব্যস্ত কিয়ের? চিঠি তো আর ভাইগা যাইবো না!”",
    specialty: "ঘুমিয়ে থাকা",
    experience: "৫ বছর",
    joiningDate: "০১ জানুয়ারি, ২০১৯",
    serviceId: "DHK-19-088",
    rating: 2,
    favoriteFood: "পান-সুপারি আর চা",
    hobby: "গাছের নিচে ঘুমানো",
    fear: "বেশি কাজ করা",
    specialTalent: "যেকোনো পরিস্থিতিতে অজুহাত দাঁড় করানো",
    fatherName: "বশির হোসেন",
    permanentAddress: "গ্রাম: শান্তিনগর, ডাকটিক: সদরঘাট, জেলা: ঢাকা",
    bloodGroup: "AB+",
    emergencyContact: "০১৬XXXXXXXX (ছোট ভাই)",
    education: "অষ্টম শ্রেনী",
    fileNo: "রেজি-১৯/৮৮",
    excuseRate: 0.4,
  },
];

const POSTMAN_EXCUSES = [
  {
    message: "বৃষ্টির কারণে রাস্তায় অনেক কাদা, পৌঁছাতে ১৫ মিনিট দেরি হবে।",
    delay: 15 * 60000,
  },
  {
    message: "রাস্তায় কাদা জমে আছে, ১০ মিনিট সময় বেশি লাগবে।",
    delay: 10 * 60000,
  },
  {
    message: "বৃষ্টির জন্য রাস্তা পিচ্ছিল, ৫ মিনিট দেরি হতে পারে।",
    delay: 5 * 60000,
  },
  {
    message:
      "ভুল ঠিকানায় চলে গিয়েছিলাম, সঠিক পথ খুঁজে পেতে ১০ মিনিট সময় লাগবে।",
    delay: 10 * 60000,
  },
  {
    message: "রাস্তায় মারামারি হচ্ছে, ঝগড়া মিটলে আসছি। ৩০ মিনিট দেরি হবে।",
    delay: 30 * 60000,
  },
  {
    message: "রাস্তায় জটলা পেকেছে, গোলমাল শেষ হতে ১৫ মিনিট লাগবে।",
    delay: 15 * 60000,
  },
  {
    message: "রাস্তায় একটা ঝামেলা দেখছি, ১০ মিনিট অপেক্ষা করতে হবে।",
    delay: 10 * 60000,
  },
];

const PostmanAvatar = ({
  avatar,
  className = "",
  postmanId,
  name,
}: {
  avatar?: string;
  className?: string;
  postmanId?: string;
  name?: string;
}) => {
  const normId = postmanId?.toLowerCase().replace("pm", "p");

  const fallbackImages: Record<string, string> = {
    "p1": "/করিম চাচা.png",
    "p2": "/রহমত আলী~2.png",
    "p3": "/তরুন রফিক.png",
    "p4": "https://i.ibb.co/d00NxDWb/1777507482527.jpg"
  };

  const nameToImage: Record<string, string> = {
    "করিম চাচা": "/করিম চাচা.png",
    "রহমত আলী": "/রহমত আলী~2.png",
    "তরুণ রফিক": "/তরুন রফিক.png",
    "তরুন রফিক": "/তরুন রফিক.png",
    "বজলু মিয়া": "https://i.ibb.co/d00NxDWb/1777507482527.jpg"
  };

  let finalSrc = avatar || "";
  if (normId && fallbackImages[normId]) {
    finalSrc = fallbackImages[normId];
  } else if (name && nameToImage[name]) {
    finalSrc = nameToImage[name];
  }
  
  if (!finalSrc) return null;

  const isUrl = finalSrc.startsWith("/") || finalSrc.startsWith("http");

  if (isUrl) {
    return (
      <img
        src={finalSrc}
        alt={name || "Postman"}
        className={`w-full h-full object-cover rounded-full ${className}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          if (!isUrl) {
            (e.target as any).style.display = 'none';
            const parent = (e.target as any).parentElement;
            if (parent) {
              const span = document.createElement('span');
              span.className = className;
              span.innerText = finalSrc;
              parent.appendChild(span);
            }
          }
        }}
      />
    );
  }
  return <span className={className}>{finalSrc}</span>;
};

const StampVisual = ({
  item,
  className = "w-20 h-24",
}: {
  item: any;
  className?: string;
}) => {
  const isUrl =
    item.image && (item.image.startsWith("http") || item.image.startsWith("/"));

  if (isUrl) {
    return (
      <div
        className={`${className} relative p-1 bg-white shadow-sm border-[6px] border-white overflow-hidden`}
        style={{
          clipPath:
            "polygon(0% 5%, 5% 5%, 5% 0%, 10% 0%, 10% 5%, 15% 5%, 15% 0%, 20% 0%, 20% 5%, 25% 5%, 25% 0%, 30% 0%, 30% 5%, 35% 5%, 35% 0%, 40% 0%, 40% 5%, 45% 5%, 45% 0%, 50% 0%, 50% 5%, 55% 5%, 55% 0%, 60% 0%, 60% 5%, 65% 5%, 65% 0%, 70% 0%, 70% 5%, 75% 5%, 75% 0%, 80% 0%, 80% 5%, 85% 5%, 85% 0%, 90% 0%, 90% 5%, 95% 5%, 95% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} relative flex flex-col items-center justify-center shadow-md overflow-hidden ${item.color || "bg-white"} ${item.border || "border-white"}`}
      style={{
        clipPath:
          "polygon(0% 5%, 5% 5%, 5% 0%, 10% 0%, 10% 5%, 15% 5%, 15% 0%, 20% 0%, 20% 5%, 25% 5%, 25% 0%, 30% 0%, 30% 5%, 35% 5%, 35% 0%, 40% 0%, 40% 5%, 45% 5%, 45% 0%, 50% 0%, 50% 5%, 55% 5%, 55% 0%, 60% 0%, 60% 5%, 65% 5%, 65% 0%, 70% 0%, 70% 5%, 75% 5%, 75% 0%, 80% 0%, 80% 5%, 85% 5%, 85% 0%, 90% 0%, 90% 5%, 95% 5%, 95% 0%, 100% 0%, 100% 5%, 95% 5%, 95% 10%, 100% 10%, 100% 15%, 95% 15%, 95% 20%, 100% 20%, 100% 25%, 95% 25%, 95% 30%, 100% 30%, 100% 35%, 95% 35%, 95% 40%, 100% 40%, 100% 45%, 95% 45%, 95% 50%, 100% 50%, 100% 55%, 95% 55%, 95% 60%, 100% 60%, 100% 65%, 95% 65%, 95% 70%, 100% 70%, 100% 75%, 95% 75%, 95% 80%, 100% 80%, 100% 85%, 95% 85%, 95% 90%, 100% 90%, 100% 95%, 95% 95%, 95% 100%, 90% 100%, 90% 95%, 85% 95%, 85% 100%, 80% 100%, 80% 95%, 75% 95%, 75% 100%, 70% 100%, 70% 95%, 65% 95%, 65% 100%, 60% 100%, 60% 95%, 55% 95%, 55% 100%, 50% 100%, 50% 95%, 45% 95%, 45% 100%, 40% 100%, 40% 95%, 35% 95%, 35% 100%, 30% 100%, 30% 95%, 25% 95%, 25% 100%, 20% 100%, 20% 95%, 15% 95%, 15% 100%, 10% 100%, 10% 95%, 5% 95%, 5% 100%, 0% 100%, 0% 95%, 5% 95%, 5% 90%, 0% 90%, 0% 85%, 5% 85%, 5% 80%, 0% 80%, 0% 75%, 5% 75%, 5% 70%, 0% 70%, 0% 65%, 5% 65%, 5% 60%, 0% 60%, 0% 55%, 5% 55%, 5% 50%, 0% 50%, 0% 45%, 5% 45%, 5% 40%, 0% 40%, 0% 35%, 5% 35%, 5% 30%, 0% 30%, 0% 25%, 5% 25%, 5% 20%, 0% 20%, 0% 15%, 5% 15%, 5% 10%, 0% 10%, 0% 5%)",
      }}
    >
      <div className="absolute inset-1 border border-black/10 flex flex-col items-center justify-center p-1">
        <div className="text-[8px] font-bold opacity-50 uppercase mb-0.5">
          Bangladesh
        </div>
        <div className="flex-1 flex items-center justify-center">
          {item.icon ? (
            <item.icon
              className={`w-6 h-6 ${item.textWhite ? "text-white" : "text-primary"}`}
            />
          ) : (
            <span className="text-lg">{item.symbol || "✉️"}</span>
          )}
        </div>
        <div className="text-[8px] font-bold mt-0.5">{item.price} TK</div>
      </div>
    </div>
  );
};

const EnvelopeVisual = ({
  item,
  className = "w-16 h-10",
  stamp,
  seal,
}: {
  item: any;
  className?: string;
  stamp?: any;
  seal?: any;
}) => {
  return (
    <div
      className={`${className} rounded-sm shadow-md relative overflow-hidden ${item.color || "bg-white"} ${item.border || "border-gray-200"} ${item.gradient ? `bg-gradient-to-br ${item.gradient}` : ""}`}
    >
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
        }}
      />
      
      {/* Flap lines */}
      <div className="absolute top-0 left-0 w-full h-full border-t-[20px] border-t-transparent border-l-[32px] border-l-black/5 border-r-[32px] border-r-black/5" />
      
      {item.pattern === "dots" && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "4px 4px",
          }}
        />
      )}

      {/* Stamp position */}
      {stamp && (
        <div className="absolute top-1 right-1 scale-[0.4] origin-top-right">
          <StampVisual item={stamp} className="w-18 h-22" />
        </div>
      )}

      {/* Seal position (at the bottom-center or center of flap) */}
      {seal && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 scale-[0.3]">
          <SealVisual item={seal} className="w-12 h-12" />
        </div>
      )}
    </div>
  );
};

const RealisticInboxEnvelope = ({
  mail,
  onClick,
}: {
  mail: any;
  onClick: () => void;
}) => {
  const envelopeStyles: Record<string, any> = {
    classic: {
      bg: "bg-[#fdfdfd]",
      border: "border-gray-200",
      text: "text-gray-800",
    },
    vintage: {
      bg: "bg-[#e8d5b5]",
      border: "border-[#d4c3a3]",
      text: "text-[#5d4037]",
    },
    royal: {
      bg: "bg-[#8d1c1c]",
      border: "border-[#6b1515]",
      text: "text-white",
    },
    airmail: {
      bg: "bg-white",
      border: "border-blue-500",
      text: "text-blue-900",
      airmail: true,
    },
    love: {
      bg: "bg-pink-50",
      border: "border-pink-200",
      text: "text-pink-900",
    },
  };

  const style = envelopeStyles[mail.envelopeStyle] || envelopeStyles.classic;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full aspect-[1.6/1] rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer overflow-hidden border-2 ${style.bg} ${style.border} group ${mail.isBurnt ? "grayscale-[0.8] sepia-[0.5] brightness-75 burn-filter" : ""}`}
    >
      {/* Vintage Paper Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none paper-texture" />

      {/* Drawer Shadow Effect */}
      <div className="absolute inset-x-0 bottom-0 h-4 bg-black/20 blur-md pointer-events-none" />

      {/* Filing Tab */}
      <div className="absolute top-0 left-4 w-12 h-4 bg-inherit border-x-2 border-t-2 border-inherit -translate-y-2 rounded-t-sm z-0 opacity-40 group-hover:opacity-100 transition-opacity" />

      {/* Burnt Edges Overlay */}
      {mail.isBurnt && (
        <div
          className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-md"
          style={{
            opacity: mail.burntAt ? Math.max(0.6, 1 - (Date.now() - mail.burntAt) / (3 * 24 * 60 * 60 * 1000)) : 1,
            filter: `blur(${mail.burntAt ? Math.min(1, ((Date.now() - mail.burntAt) / (3 * 24 * 60 * 60 * 1000)) * 1.5) : 0}px)`,
          }}
        >
          {/* Jagged Burnt Edge Effect using SVG Filter */}
          <div className="absolute inset-0 charred-edge mix-blend-multiply burn-filter" />
          <div className="absolute inset-0 ash-texture opacity-80" />
          
          {/* Animated Embers on the edges */}
          <div className="absolute inset-0 border-[12px] border-transparent animate-ember opacity-40 shadow-[inset_0_0_20px_#ff4500]" />

          {/* Realistic Burn Holes with Jagged Borders */}
          <div 
             className="absolute top-4 left-10 bg-black/95 rounded-full blur-[0.5px] shadow-[0_0_15px_#ff4500] burn-filter overflow-hidden" 
             style={{ 
               width: '35px', 
               height: '24px',
               clipPath: 'polygon(15% 10%, 45% 5%, 85% 20%, 95% 60%, 75% 85%, 35% 90%, 5% 55%)'
             }} 
          >
             <div className="absolute inset-0 border-2 border-orange-500/50 animate-pulse" />
          </div>
          
          <div 
             className="absolute bottom-8 right-16 bg-black/95 rounded-full blur-[0.5px] shadow-[0_0_12px_#ff6600] burn-filter" 
             style={{ 
               width: '45px', 
               height: '28px',
               clipPath: 'polygon(5% 45%, 15% 15%, 55% 5%, 90% 35%, 85% 75%, 45% 95%, 15% 85%)'
             }} 
          >
             <div className="absolute inset-0 border-2 border-red-500/50 animate-pulse" />
          </div>
          
          {/* Smaller floating embers within the card */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="ember-particle"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animation: `float-ember ${2 + Math.random() * 3}s infinite ease-out`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `scale(${0.5 + Math.random()})`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Airmail Border */}
      {style.airmail && (
        <div
          className="absolute inset-0 pointer-events-none border-[8px] border-transparent"
          style={{
            borderImageSource:
              "repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, transparent 10px, transparent 20px, #3b82f6 20px, #3b82f6 30px, transparent 30px, transparent 40px)",
            borderImageSlice: 8,
          }}
        />
      )}

      {/* Envelope Flap Shadow */}
      <div className="absolute top-0 left-0 w-full h-full border-t-[40%] border-t-black/5 border-l-[50%] border-l-transparent border-r-[50%] border-r-transparent pointer-events-none" />

      {/* Content Layout */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        {/* Top Section: Stamp and Postmark */}
        <div className="flex justify-end items-start relative">
          {/* Stamp */}
          <div className="relative z-10 rotate-3 shadow-md">
            <StampVisual
              item={
                (mail.stampId
                  ? SHOP_ITEMS.find((i) => i.id === mail.stampId) ||
                    STAMPS.find((i) => i.id === mail.stampId)
                  : null) || {
                  category: "stamp",
                  color: "bg-white",
                  price: 10,
                  symbol: "🏛️",
                }
              }
              className="w-14 h-16"
            />
          </div>

          {/* Postmark (Circular Stamp) */}
          <div className="absolute top-4 right-4 w-24 h-24 border-2 border-black/20 rounded-full flex items-center justify-center -rotate-12 z-20 pointer-events-none">
            <div className="text-center opacity-30">
              <p className="text-[8px] font-black uppercase leading-tight">
                ডাকটিক
                <br />
                বাংলাদেশ
              </p>
              <p className="text-[6px] font-bold mt-1">
                {new Date(mail.timestamp).toLocaleDateString("bn-BD")}
              </p>
            </div>
            {/* Wavy lines of postmark */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-12 h-8 opacity-20">
              <svg
                viewBox="0 0 100 40"
                className="w-full h-full stroke-black fill-none stroke-[4]"
              >
                <path d="M0 10 Q 25 0, 50 10 T 100 10" />
                <path d="M0 20 Q 25 10, 50 20 T 100 20" />
                <path d="M0 30 Q 25 20, 50 30 T 100 30" />
              </svg>
            </div>
          </div>
        </div>

        {/* Middle Section: Sender Info */}
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-1">
          <div className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-black/5 shadow-sm">
            <p
              className={`text-[10px] uppercase tracking-widest opacity-60 font-bold ${style.text}`}
            >
              প্রেরক
            </p>
            <h4 className={`text-xl font-bold font-serif ${style.text}`}>
              {mail.senderName}
            </h4>
            <p className={`text-xs opacity-80 ${style.text} inline-flex gap-1`}>
              পোস্টকোড: <span className="bn-number">{toBengaliDigits(mail.senderPostcode)}</span>
            </p>
          </div>
        </div>

        {/* Bottom Section: Status and Indicators */}
        <div className="flex justify-between items-end">
          <div className="flex gap-2 items-center">
            {!mail.isRead && !mail.isBurnt && (
              <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded shadow-lg transform -rotate-12 border-2 border-white/20 uppercase tracking-tighter">
                নতুন
              </div>
            )}
            {mail.isSaved && (
              <Folder className="w-5 h-5 text-green-600 opacity-50" />
            )}
            {mail.sealId && (
              <div className="scale-75 -ml-2">
                <SealVisual
                  item={
                    SHOP_ITEMS.find((i) => i.id === mail.sealId) || {
                      color: "bg-red-700",
                    }
                  }
                  className="w-10 h-10"
                />
              </div>
            )}
          </div>
          <div className="opacity-20">
            <Mail className={`w-8 h-8 ${style.text}`} />
          </div>
        </div>
      </div>

      {/* Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply paper-texture" />

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
    </motion.div>
  );
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "হ্যাঁ",
  cancelText = "না",
  type = "danger",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info" | "success";
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center space-y-6"
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            type === "danger"
              ? "bg-red-50 text-red-500"
              : type === "success"
                ? "bg-green-50 text-green-500"
                : "bg-blue-50 text-blue-500"
          }`}
        >
          {type === "danger" ? (
            <AlertCircle className="w-8 h-8" />
          ) : type === "success" ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <Info className="w-8 h-8" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 font-serif">
            {title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
              type === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const LetterPreview = ({ letter }: { letter: Letter }) => {
  const getPaperStyles = (type: PaperType) => {
    switch (type) {
      case "ruled":
        return {
          bg: "bg-[#fdfbf7]",
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 27px, #e5e7eb 28px)",
          border: "border-gray-200",
          texture: true,
        };
      case "white":
        return { bg: "bg-white", border: "border-gray-200" };
      case "yellow":
        return { bg: "bg-yellow-50", border: "border-yellow-100" };
      case "royal":
        return {
          bg: "bg-white",
          border: "border-red-800 shadow-[0_0_0_10px_#8d1c1c]",
        };
      case "old":
        return {
          bg: "bg-[#e8d5b5]",
          border: "border-[#d4c3a3]",
          texture: true,
          sepia: true,
        };
      case "scented":
        return {
          bg: "bg-pink-50",
          border: "border-pink-100",
          pattern: "flower",
        };
      case "postcard":
        return {
          bg: "bg-[#f4f1ea]",
          border: "border-[#e0dbcd]",
          layout: "postcard",
        };
      case "inland":
        return {
          bg: "bg-[#e2edf7]",
          border: "border-[#c4d7e8]",
          layout: "inland",
        };
      default:
        return { bg: "bg-white", border: "border-gray-200" };
    }
  };

  const getFontFamily = (font: HandwritingFont) => {
    switch (font) {
      case "serif":
        return "font-serif";
      case "sans":
        return "font-sans";
      case "handwriting":
        return "font-handwriting";
      case "fancy":
        return "'Fancy Handwriting', cursive";
      case "poushali":
        return "'Imam Poushali Unicode', sans-serif";
      case "poushali-italic":
        return "'Imam Poushali Unicode Italic', sans-serif";
      case "priyotoma":
        return "'FN Hasan Priyotoma Unicode', sans-serif";
      case "priyotoma-italic":
        return "'FN Hasan Priyotoma Unicode Italic', sans-serif";
      case "himu":
        return "'FN Himu Regular', sans-serif";
      case "himu-italic":
        return "'FN Himu Italic', sans-serif";
      case "bijoy2003":
        return "'Imam Poushali Bijoy 2003', sans-serif";
      case "bijoy2003-italic":
        return "'Imam Poushali Bijoy 2003 Italic', sans-serif";
      case "bijoy52":
        return "'Imam Poushali Bijoy52', sans-serif";
      case "bijoy52-italic":
        return "'Imam Poushali Bijoy52 Italic', sans-serif";
      default:
        return "font-serif";
    }
  };

  const paper = getPaperStyles(letter.paperType);
  const font = getFontFamily(letter.fontFamily);

  return (
    <div className="relative w-full max-w-2xl mx-auto perspective-1000">
      <motion.div
        initial={{ rotateX: 10, y: 20, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        className={`relative p-8 md:p-12 min-h-[500px] shadow-2xl border-4 ${paper.bg} ${paper.border} ${paper.texture ? "paper-texture" : ""} overflow-hidden group`}
        style={{
          backgroundImage: paper.backgroundImage,
        }}
      >
        {/* Decorative Scent Particles */}
        {letter.paperType === "scented" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-10, -100],
                  x: [0, Math.sin(i) * 20],
                  opacity: [0, 0.4, 0],
                  scale: [0.5, 1.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.7,
                }}
                className="absolute text-pink-400/20"
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: "10%",
                }}
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Postcard Divider */}
        {letter.paperType === "postcard" && (
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black/10 hidden md:block" />
        )}

        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 paper-texture mix-blend-multiply" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">
              তারিখ ও স্থান
            </p>
            <p
              className={`text-sm md:text-base ${font}`}
              style={{ color: letter.inkColor }}
            >
              {letter.datePlace ||
                new Date(letter.timestamp).toLocaleDateString("bn-BD")}
            </p>
          </div>

          {(letter.stampId || letter.paperType === "postcard") && (
            <div className="flex flex-col items-end gap-2">
              <div className="rotate-3 shadow-sm hover:rotate-0 transition-transform cursor-help">
                <StampVisual
                  item={
                    letter.stampId
                      ? STAMPS.find((s) => s.id === letter.stampId) ||
                        SHOP_ITEMS.find((s) => s.id === letter.stampId)
                      : {
                          symbol: "🏛️",
                          color: "bg-white",
                          border: "border-red-900",
                          price: 10,
                        }
                  }
                  className="w-14 h-16 md:w-16 md:h-20"
                />
              </div>
              <div className="w-20 h-20 border-2 border-black/10 rounded-full flex items-center justify-center -rotate-12 opacity-30 select-none">
                <div className="text-[8px] font-black uppercase tracking-tighter text-center">
                  বাংলাদেশ
                  <br />
                  ডাকটিক
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Letter Body */}
        <div className="space-y-6 relative z-10">
          {letter.greeting && (
            <h2
              className={`text-xl md:text-2xl ${font} font-bold`}
              style={{ color: letter.inkColor }}
            >
              {letter.greeting}
            </h2>
          )}

          <div
            className={`text-base md:text-lg leading-loose whitespace-pre-wrap ${font}`}
            style={{
              color: letter.inkColor,
              minHeight: "200px",
            }}
          >
            {letter.content}
          </div>

          {letter.closing && (
            <div className="pt-8 text-right max-w-[200px] ml-auto space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold text-center">
                ইতি
              </p>
              <p
                className={`text-lg md:text-xl font-bold ${font}`}
                style={{ color: letter.inkColor }}
              >
                {letter.closing}
              </p>
              <div
                className="w-full h-0.5 mt-1"
                style={{ backgroundColor: `${letter.inkColor}33` }}
              />
              <p
                className={`text-sm ${font}`}
                style={{ color: letter.inkColor }}
              >
                {letter.senderName}
              </p>
            </div>
          )}
        </div>

        {/* Gift indicator at bottom */}
        {letter.gift && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-black/5 shadow-sm"
          >
            <span className="text-xl">
              {GIFTS.find((g) => g.id === letter.gift)?.icon || "🎁"}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60 tracking-widest">
              সাথেই আছে...
            </span>
          </motion.div>
        )}

        {/* Coffee Stains for 'old' paper */}
        {letter.paperType === "old" && (
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            <div className="absolute top-1/4 -left-10 w-32 h-32 bg-[#8d6e63] rounded-full blur-2xl" />
            <div className="absolute bottom-12 -right-12 w-48 h-48 bg-[#6d4c41] rounded-full blur-3xl opacity-50" />
          </div>
        )}
      </motion.div>
    </div>
  );
};

const RealisticLetterOpener = ({
  mail,
  onBack,
  onUpdateState,
  showActions = true,
  allShopItems = [],
}: {
  mail: any;
  onBack: () => void;
  onUpdateState?: (updates: any) => Promise<void>;
  showActions?: boolean;
  allShopItems?: any[];
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [showConfirmBurn, setShowConfirmBurn] = useState(false);

  const envelopeStyles: Record<string, any> = {
    classic: {
      bg: "bg-[#fdfdfd]",
      border: "border-gray-200",
      text: "text-gray-800",
    },
    vintage: {
      bg: "bg-[#e8d5b5]",
      border: "border-[#d4c3a3]",
      text: "text-[#5d4037]",
    },
    royal: {
      bg: "bg-[#8d1c1c]",
      border: "border-[#6b1515]",
      text: "text-white",
    },
    airmail: {
      bg: "bg-white",
      border: "border-blue-500",
      text: "text-blue-900",
      airmail: true,
    },
    love: {
      bg: "bg-pink-50",
      border: "border-pink-200",
      text: "text-pink-900",
    },
  };

  const style = envelopeStyles[mail.envelopeStyle] || envelopeStyles.classic;

  const handleBurn = async () => {
    if (!onUpdateState) return;
    setIsBurning(true);
    // Wait for animation
    setTimeout(async () => {
      try {
        await onUpdateState({ isBurnt: true, burntAt: Date.now() });
        setIsDestroyed(true);
        showToast("চিঠিটি পুড়িয়ে ফেলা হয়েছে! 🔥", "success");
        setTimeout(onBack, 1000);
      } catch (error) {
        setIsBurning(false);
        handleFirestoreError(error, OperationType.UPDATE, `letters/${mail.id}`);
      }
    }, 3000);
  };

  if (isDestroyed) return null;

  const getFontFamily = (fontId: string) => {
    switch (fontId) {
      case "handwriting":
        return "Atma";
      case "serif":
        return "Noto Serif Bengali";
      case "sans":
        return "Hind Siliguri";
      case "fancy":
        return "Fancy Handwriting";
      case "poushali":
        return "Imam Poushali Unicode";
      case "poushali-italic":
        return "Imam Poushali Unicode Italic";
      case "priyotoma":
        return "FN Hasan Priyotoma Unicode";
      case "priyotoma-italic":
        return "FN Hasan Priyotoma Unicode Italic";
      case "himu":
        return "FN Himu Regular";
      case "himu-italic":
        return "FN Himu Italic";
      case "bijoy2003":
        return "Imam Poushali Bijoy 2003";
      case "bijoy2003-italic":
        return "Imam Poushali Bijoy 2003 Italic";
      case "bijoy52":
        return "Imam Poushali Bijoy52";
      case "bijoy52-italic":
        return "Imam Poushali Bijoy52 Italic";
      default:
        return "Noto Serif Bengali";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-hidden"
    >
      {/* Close Button */}
      {!isBurning && (
        <button
          onClick={onBack}
          className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[110]"
        >
          <Plus className="w-6 h-6 rotate-45 text-white" />
        </button>
      )}

      <div className="relative w-full max-w-lg perspective-1000">
        <AnimatePresence mode="wait">
          {!showLetter ? (
            <motion.div
              key="envelope"
              initial={{ y: 100, rotateX: 45, opacity: 0 }}
              animate={{ y: 0, rotateX: 0, opacity: 1 }}
              exit={{ y: -500, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full aspect-[1.6/1] mx-auto"
            >
              {/* The Envelope Body */}
              <div
                className={`relative w-full h-full rounded-sm shadow-2xl overflow-hidden border ${style.bg} ${style.border}`}
              >
                {/* Airmail Border */}
                {style.airmail && (
                  <div
                    className="absolute inset-0 pointer-events-none border-[8px] border-transparent"
                    style={{
                      borderImageSource:
                        "repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, transparent 10px, transparent 20px, #3b82f6 20px, #3b82f6 30px, transparent 30px, transparent 40px)",
                      borderImageSlice: 8,
                    }}
                  />
                )}

                {/* Sender Info */}
                <div className="absolute top-6 left-6 max-w-[200px] z-10">
                  <div className="flex gap-2 items-center mb-1">
                    <p className={`text-[9px] uppercase tracking-[0.2em] opacity-50 font-black ${style.text}`}>
                      প্রেরক
                    </p>
                    <div className={`h-px flex-1 bg-current opacity-20 ${style.text}`} />
                  </div>
                  <h4 className={`text-lg font-black font-serif ${style.text} leading-tight`}>
                    {mail.senderName}
                  </h4>
                  <p className={`text-xs opacity-70 ${style.text} mt-1 font-mono tracking-wider`}>
                    <span className="opacity-50">পোস্টকোড:</span> <span className="font-bold">{toBengaliDigits(mail.senderPostcode)}</span>
                  </p>
                </div>

                {/* Receiver Info */}
                <div className="absolute bottom-8 right-12 max-w-[200px] text-right z-10">
                  <div className="flex gap-2 items-center justify-end mb-1">
                    <div className={`h-px flex-1 bg-current opacity-20 ${style.text}`} />
                    <p className={`text-[9px] uppercase tracking-[0.2em] opacity-50 font-black ${style.text}`}>
                      প্রাপক
                    </p>
                  </div>
                  <h4 className={`text-xl font-black font-serif ${style.text} leading-tight`}>
                    {mail.receiverName || "মাননীয় প্রাপক"}
                  </h4>
                  <p className={`text-sm opacity-70 ${style.text} mt-1 font-mono tracking-wider`}>
                    <span className="opacity-50">পোস্টকোড:</span> <span className="font-bold">{toBengaliDigits(mail.receiverPostcode || mail.recipientPostcode || "---")}</span>
                  </p>
                </div>

                {/* Stamp & Postmark */}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                  <div className="rotate-3 shadow-md">
                    <StampVisual
                      item={
                        (mail.stampId
                          ? allShopItems.find((i) => i.id === mail.stampId) ||
                            STAMPS.find((i) => i.id === mail.stampId)
                          : null) || {
                          category: "stamp",
                          color: "bg-white",
                          price: 10,
                          symbol: "🏛️",
                        }
                      }
                      className="w-16 h-20"
                    />
                  </div>
                </div>

                {/* Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply paper-texture" />
              </div>

              {/* The Flap */}
              <motion.div
                initial={false}
                animate={{ rotateX: isOpened ? -180 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ transformOrigin: "top", zIndex: isOpened ? 0 : 20 }}
                className={`absolute top-0 left-0 w-full h-1/2 border-t-[60px] border-t-transparent border-l-[250px] border-l-transparent border-r-[250px] border-r-transparent pointer-events-none`}
              >
                <div
                  className={`absolute inset-0 ${style.bg} shadow-md`}
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                />
              </motion.div>

              {/* Open Button */}
              {!isOpened && (
                <button
                  onClick={() => {
                    setIsOpened(true);
                    setTimeout(() => setShowLetter(true), 1000);
                  }}
                  className="absolute inset-0 z-30 flex items-center justify-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span>চিঠি খুলুন</span>
                  </motion.div>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ y: 500, scale: 0.5, opacity: 0 }}
              animate={{
                y: 0,
                scale: 1,
                opacity: 1,
                rotate: isBurning ? [0, -1, 1, -1, 0] : 0,
                filter: isBurning
                  ? "sepia(1) brightness(0.5) contrast(1.2)"
                  : "none",
              }}
              transition={{
                y: { type: "spring", damping: 20 },
                rotate: { duration: 0.1, repeat: Infinity },
              }}
              className="w-full max-w-4xl max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col gap-8 items-center"
            >
              {/* Burning Effect Overlay */}
              {isBurning && (
                <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-lg burning-mask" style={{ maskImage: 'linear-gradient(to top, transparent 45%, black 55%)', maskSize: '100% 300%' }}>
                  <div className="absolute inset-0 bg-black/80 ash-texture" />
                  
                  {/* Moving Fire Line across the letter */}
                  <motion.div 
                    initial={{ bottom: '-10%' }}
                    animate={{ bottom: '110%' }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="absolute left-0 right-0 h-10 fire-edge-glow z-10"
                    style={{ 
                      background: 'linear-gradient(to top, transparent, #ff4500, #ffff00, #ff4500, transparent)',
                      width: '100%',
                      height: '15px'
                    }}
                  >
                     {/* Intense embers spewing from the fire line */}
                     {[...Array(30)].map((_, i) => (
                       <motion.div
                         key={i}
                         initial={{ opacity: 0, scale: 0, y: 0 }}
                         animate={{
                           opacity: [0, 1, 0],
                           y: [-50, -400],
                           x: (Math.random() - 0.5) * 300,
                           scale: [0.5, 1.5, 0]
                         }}
                         transition={{
                           duration: 1 + Math.random() * 2,
                           repeat: Infinity,
                           delay: Math.random() * 2
                         }}
                         className="ember-particle"
                         style={{ left: `${Math.random() * 100}%`, bottom: '0' }}
                       />
                     ))}
                  </motion.div>

                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={`ash-${i}`}
                      initial={{ opacity: 0, y: 100 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [100, 600],
                        x: (Math.random() - 0.5) * 200,
                        rotate: 360
                      }}
                      transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 3
                      }}
                      className="ash-particle"
                      style={{ left: `${Math.random() * 100}%`, top: '0' }}
                    />
                  ))}
                </div>
              )}

              {(
                mail.bodyPages || mail.content.split("\n\n---PAGE_BREAK---\n\n")
              ).map((pageText: string, idx: number, pages: string[]) => {
                const paperColor =
                  mail.paperType === "ruled"
                    ? "bg-white"
                    : mail.paperType === "white"
                      ? "bg-white"
                      : mail.paperType === "yellow"
                        ? "bg-[#fff9c4]"
                        : mail.paperType === "royal"
                          ? "bg-[#f4ecd8]"
                          : mail.paperType === "old"
                            ? "bg-[#e0d5b8]"
                            : mail.paperType === "scented"
                              ? "bg-[#fff5f5]"
                              : mail.paperType === "postcard"
                                ? "bg-[#fff9f0]"
                                : mail.paperType === "inland"
                                  ? "bg-[#f0f7ff]"
                                  : "bg-white";

                const paperBorder =
                  mail.paperType === "royal"
                    ? "border-8 border-[#d4af37]/20"
                    : "";

                return (
                  <div
                    key={idx}
                    className={`relative p-0 overflow-hidden shadow-2xl transition-all duration-500 flex flex-col mx-auto w-full max-w-[800px] aspect-[210/297] rounded-md shrink-0 ${paperColor} ${paperBorder}`}
                  >
                    {/* Paper Texture */}
                    {(mail.paperType === "old" ||
                      mail.paperType === "royal") && (
                      <div className="absolute inset-0 pointer-events-none opacity-15 paper-texture z-0" />
                    )}

                    {/* Paper Lines */}
                    {(mail.paperType === "ruled" ||
                      mail.paperType === "old" ||
                      mail.paperType === "royal") && (
                      <div
                        className={`absolute inset-0 pointer-events-none z-0 ${mail.paperType === "ruled" ? "opacity-40" : "opacity-20"}`}
                        style={{
                          backgroundImage: `linear-gradient(${mail.paperType === "ruled" ? "#4a90e2" : "rgba(0,0,0,0.2)"} 1px, transparent 1px)`,
                          backgroundSize: "100% 1.5rem",
                          marginTop: "4rem",
                        }}
                      />
                    )}

                    {/* Subtle Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] rotate-[-30deg] z-0">
                      <div className="border-8 border-black rounded-full p-8 flex flex-col items-center justify-center">
                        <p className="text-4xl md:text-6xl font-black uppercase tracking-widest">
                          ডাকটিক
                        </p>
                        <p className="text-xl md:text-2xl font-bold uppercase tracking-widest mt-2">
                          বাংলাদেশ
                        </p>
                      </div>
                    </div>

                    {mail.scent && (
                      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                        {/* Fragrance Mist Animation */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: [0, 0.4, 0.4, 0],
                            scale: [0.8, 1.2],
                            y: [0, -50]
                          }}
                          transition={{ 
                            duration: 8, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className={`absolute inset-0 bg-gradient-to-t ${
                            mail.scent === 'rose' ? 'from-red-200/40' : 
                            mail.scent === 'attar' ? 'from-green-200/40' : 
                            mail.scent === 'jasmine' ? 'from-yellow-100/40' :
                            mail.scent === 'rain' ? 'from-blue-200/40' :
                            'from-purple-200/40'
                          } via-transparent to-transparent blur-3xl`}
                        />
                        
                        {/* Floating Particles */}
                        {[...Array(15)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ 
                              opacity: 0, 
                              x: `${Math.random() * 100}%`, 
                              y: '110%',
                              scale: 0 
                            }}
                            animate={{ 
                              opacity: [0, 1, 1, 0],
                              y: [`${110 - Math.random() * 20}%`, `${-10 + Math.random() * 20}%`],
                              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                              scale: [0, 1, 0.5, 0],
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              duration: 5 + Math.random() * 5, 
                              repeat: Infinity,
                              delay: Math.random() * 5,
                              ease: "linear"
                            }}
                            className={`absolute w-1 h-1 rounded-full blur-[1px] ${
                              mail.scent === 'rose' ? 'bg-red-300' : 
                              mail.scent === 'attar' ? 'bg-green-300' : 
                              mail.scent === 'jasmine' ? 'bg-yellow-200' :
                              mail.scent === 'rain' ? 'bg-blue-300' :
                              'bg-purple-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <div
                      className={`absolute inset-0 z-30 flex flex-col px-[10%] py-[12%] text-[14px] leading-[1.5rem]`}
                      style={{
                        color: mail.inkColor,
                        fontWeight: mail.penSize === 1 ? 300 : mail.penSize === 2 ? 400 : mail.penSize === 3 ? 600 : mail.penSize === 4 ? 700 : 900,
                        fontSize: `${14 + ((mail.penSize || 2) - 2) * 2}px`,
                        lineHeight: `${1.5 + ((mail.penSize || 2) - 2) * 0.2}rem`,
                        fontFamily: getFontFamily(mail.fontFamily),
                      }}
                    >
                      {mail.bodyPages ? (
                        <>
                          {idx === 0 && (
                            <>
                              {mail.datePlace && (
                                <p className="whitespace-pre-wrap text-right mb-4 md:mb-6">
                                  {mail.datePlace}
                                </p>
                              )}
                              {mail.greeting && (
                                <p className="whitespace-pre-wrap mb-4 md:mb-6">
                                  {mail.greeting}
                                </p>
                              )}
                            </>
                          )}

                          <p className="whitespace-pre-wrap flex-1">
                            {pageText}
                          </p>

                          {idx === pages.length - 1 && mail.closing && (
                            <p className="whitespace-pre-wrap text-right mt-6 md:mt-8">
                              {mail.closing}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap flex-1">{pageText}</p>
                      )}

                      {idx === pages.length - 1 && (
                        <div className="pt-8 mt-auto border-t-2 border-black/5 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {mail.scent && (
                              <motion.span 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border ${
                                  mail.scent === 'rose' ? 'bg-red-50 text-red-600 border-red-100' : 
                                  mail.scent === 'attar' ? 'bg-green-50 text-green-700 border-green-100' : 
                                  mail.scent === 'jasmine' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                  mail.scent === 'rain' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                  'bg-purple-50 text-purple-700 border-purple-100'
                                }`}
                              >
                                <Sparkles className="w-3 h-3 animate-pulse" />
                                <span>{SCENTS.find(s => s.id === mail.scent)?.label || "সুগন্ধি"}</span>
                              </motion.span>
                            )}
                            {mail.gift && (
                              <span className="text-[10px] bg-amber-50 text-amber-700 px-4 py-2 rounded-full font-black uppercase tracking-wider shadow-lg border border-amber-100 flex items-center gap-2">
                                <span>🎁</span>
                                <span>{GIFTS.find((g) => g.id === mail.gift)?.label || "উপহার"}</span>
                              </span>
                            )}
                          </div>
                          {mail.sealId && (
                            <div className="opacity-80 rotate-[-10deg]">
                              <SealVisual
                                item={
                                  SHOP_ITEMS.find(
                                    (i) => i.id === mail.sealId,
                                  ) || { color: "bg-red-700" }
                                }
                                className="w-12 h-12"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Action Buttons */}
              {!isBurning && showActions && (
                <div className="grid grid-cols-2 gap-4 w-full max-w-[800px] mx-auto pb-12">
                  <button
                    onClick={async () => {
                      if (!onUpdateState) return;
                      await onUpdateState({ isSaved: !mail.isSaved });
                      showToast(
                        mail.isSaved
                          ? "সংরক্ষণ থেকে সরানো হয়েছে"
                          : "চিঠিটি সংরক্ষিত করা হয়েছে! 📁",
                        "success",
                      );
                      onBack();
                    }}
                    className={`py-4 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${mail.isSaved ? "bg-green-100 text-green-700 border border-green-200" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"}`}
                  >
                    <Folder className="w-5 h-5" />
                    <span>{mail.isSaved ? "সরান" : "সংরক্ষণ"}</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!onUpdateState) return;
                      await onUpdateState({ isHidden: !mail.isHidden });
                      showToast(
                        mail.isHidden
                          ? "চিঠিটি সামনে আনা হয়েছে"
                          : "চিঠিটি লোকানো হয়েছে! 🔐",
                        "success",
                      );
                      onBack();
                    }}
                    className={`py-4 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${mail.isHidden ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"}`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>{mail.isHidden ? "সামনে আনুন" : "লুকান"}</span>
                  </button>
                  <button
                    onClick={() => setShowConfirmBurn(true)}
                    className="col-span-2 py-5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl text-base font-bold shadow-xl hover:shadow-red-500/20 transition-all flex items-center justify-center gap-3"
                  >
                    <Flame className="w-6 h-6 animate-pulse" />
                    <span>চিঠি পুড়িয়ে ফেলুন (নষ্ট করুন)</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmationModal
          isOpen={showConfirmBurn}
          onClose={() => setShowConfirmBurn(false)}
          onConfirm={handleBurn}
          title="চিঠি পুড়িয়ে ফেলুন"
          message="আপনি কি নিশ্চিতভাবে এই চিঠিটি পুড়িয়ে ফেলতে চান? এটি চিরতরে নষ্ট হয়ে যাবে এবং আর কখনো ফিরে পাওয়া যাবে না।"
          confirmText="হ্যাঁ, পুড়িয়ে ফেলুন"
          cancelText="না, থাক"
          type="danger"
        />
      </div>
    </motion.div>
  );
};

const PageVisual = ({
  item,
  className = "w-12 h-16",
}: {
  item: any;
  className?: string;
}) => {
  if (item.image) {
    return (
      <div
        className={`${className} rounded-sm shadow-sm border-2 transition-all relative overflow-hidden border-gray-200`}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-sm shadow-sm border-2 transition-all relative overflow-hidden ${item.color?.startsWith("bg-") ? item.color : ""} ${item.border || "border-gray-200"}`}
      style={!item.color?.startsWith("bg-") && !item.image ? { backgroundColor: item.color || "#ffffff" } : {}}
    >
      {(item.texture === "parchment" || item.id === "old" || item.id === "royal") && (
        <div className="absolute inset-0 opacity-20 paper-texture" />
      )}
      {(item.id === "ruled" || item.lines) && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(#4a90e2 1px, transparent 1px)",
            backgroundSize: "100% 4px",
            marginTop: "4px",
          }}
        />
      )}
      <div className="absolute top-2 left-2 right-2 h-px bg-black/5" />
      <div className="absolute top-4 left-2 right-4 h-px bg-black/5" />
      <div className="absolute top-6 left-2 right-3 h-px bg-black/5" />
    </div>
  );
};

const SealVisual = ({
  item,
  className = "w-12 h-12",
}: {
  item: any;
  className?: string;
}) => {
  return (
    <div
      className={`${className} rounded-full shadow-lg border-2 flex items-center justify-center relative overflow-hidden ${item.color || "bg-red-700"} ${item.border || "border-red-900"} ${item.gradient ? `bg-gradient-to-br ${item.gradient}` : ""}`}
    >
      <div className="absolute inset-1 rounded-full border border-white/20" />
      {item.icon ? (
        <item.icon
          className={`w-6 h-6 ${item.textWhite ? "text-white" : "text-red-200"}`}
        />
      ) : (
        <Stamp className="w-6 h-6 text-red-200" />
      )}
    </div>
  );
};

const ENVELOPES: any[] = [
  {
    id: "classic",
    name: "সাধারণ সাদা",
    price: 0,
    color: "bg-white",
    border: "border-gray-200",
    category: "envelope",
  },
  {
    id: "vintage",
    name: "পুরানো বাদামী",
    price: 10,
    color: "bg-orange-50",
    border: "border-orange-200",
    category: "envelope",
  },
  {
    id: "royal",
    name: "রাজকীয় লাল",
    price: 50,
    color: "bg-red-700",
    border: "border-red-900",
    textWhite: true,
    category: "envelope",
  },
  {
    id: "airmail",
    name: "এয়ারমেইল",
    price: 15,
    color: "bg-white",
    border: "border-4 border-double border-blue-500",
    category: "envelope",
  },
  {
    id: "love",
    name: "গোলাপী ভালোবাসা",
    price: 25,
    color: "bg-pink-100",
    border: "border-pink-300",
    category: "envelope",
  },
];

const STAMPS: any[] = [
  {
    id: "s0",
    name: "সাধারণ টিকিট",
    price: 0,
    category: "stamp",
    color: "bg-gray-50",
    border: "border-gray-200",
    icon: Mail,
  },
  {
    id: "s1",
    name: "নৌকা ডাক - ৫২",
    price: 10,
    image: "https://i.ibb.co/dwyST6C1/15906-removebg-preview.png",
    category: "stamp",
    color: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    id: "s2",
    name: "লাল গাড়ি - ৭১",
    price: 20,
    image: "/Screenshot_20260408-130722.png",
    category: "stamp",
    color: "bg-pink-50",
    border: "border-pink-200",
  },
  {
    id: "s3",
    name: "ট্রেন ডাক - ৯০",
    price: 30,
    image: "/Screenshot_20260408-130919.png",
    category: "stamp",
    color: "bg-slate-50",
    border: "border-slate-200",
  },
  {
    id: "s4",
    name: "রয়েল বেঙ্গল টাইগার",
    price: 35,
    image: "/Screenshot_20260408-131105.png",
    category: "stamp",
    color: "bg-orange-50",
    border: "border-orange-300",
  },
];

const getDeliveryHours = (price: number) => {
  if (price >= 35) return 10;
  if (price >= 30) return 15;
  if (price >= 20) return 20;
  return 24;
};

const SHOP_ITEMS = [
  ...STAMPS,
  ...ENVELOPES,
  // Papers
  { id: "white", name: "সাদা কাগজ", price: 5, category: "page", color: "bg-white", symbol: "📄" },
  { id: "ruled", name: "রোল টানা", price: 10, category: "page", color: "bg-blue-50", symbol: "📝" },
  { id: "yellow", name: "হলুদ কাগজ", price: 15, category: "page", color: "bg-yellow-50", symbol: "🗒️" },
  {
    id: "pg2",
    name: "ভিক্টোরিয়ান পার্চমেন্ট",
    price: 50,
    category: "page",
    premium: true,
    color: "bg-orange-50",
    border: "border-orange-200",
    texture: "parchment",
  },
  {
    id: "pg3",
    name: "গোলাপী সুগন্ধি কাগজ",
    price: 75,
    category: "page",
    premium: true,
    color: "bg-pink-50",
    border: "border-pink-200",
  },
  {
    id: "pg4",
    name: "নকশি কাগজ (নীল)",
    price: 40,
    category: "page",
    color: "bg-blue-50",
    border: "border-blue-200",
    pattern: "dots",
  },
  {
    id: "pg5",
    name: "অ্যান্টিভ ফিনিশ",
    price: 60,
    category: "page",
    premium: true,
    color: "bg-slate-100",
    border: "border-slate-300",
  },
  // Seals
  {
    id: "seal-gov",
    name: "সরকারি সিল",
    price: 30,
    category: "seal",
    color: "bg-red-700",
    symbol: "🏛️",
    icon: ShieldCheck,
  },
  {
    id: "seal-heart",
    name: "ভালোবাসার সিল",
    price: 25,
    category: "seal",
    color: "bg-pink-500",
    symbol: "❤️",
    icon: Heart,
  },
  {
    id: "seal-star",
    name: "তারকা সিল",
    price: 45,
    category: "seal",
    color: "bg-yellow-400",
    symbol: "⭐",
    icon: Star,
  },
  {
    id: "sl2",
    name: "নিজের সিল (কাস্টম)",
    price: 300,
    category: "seal",
    premium: true,
    custom: true,
    color: "bg-amber-600",
    border: "border-amber-800",
    icon: Palette,
  },
  {
    id: "seal-royal",
    name: "রাজকীয় সিল",
    price: 500,
    category: "seal",
    premium: true,
    color: "bg-yellow-500",
    symbol: "👑",
    icon: Crown,
  },
];

const THEMES: Record<string, any> = {
  yellow: {
    name: "ডাকটিক (ডিফল্ট)",
    description: "হলুদ খাম, ডাকবাক্স এবং ডাকপিয়নের সবুজ সাইকেল",
    primary: "#d97706", // Amber 600 (Yellow Envelope)
    primaryContainer: "#f59e0b",
    secondary: "#991b1b", // Red 800 (Postbox Red Accent)
    secondaryContainer: "#fef3c7",
    tertiary: "#115e59", // Teal 800 (Vintage Postal Green)
    background: "#fffbeb",
    surface: "#fffbeb",
    surfaceContainer: "#fde68a",
    surfaceContainerLow: "#fef3c7",
    surfaceContainerHigh: "#fcd34d",
    surfaceContainerHighest: "#fbbf24",
    onSurface: "#451a03",
    vintage: true
  },
  sepia: {
    name: "সেপিয়া মেমোরি",
    description: "নস্টালজিক বাদামী, নীল রঙের কালি এবং পুরনো কাগজ",
    primary: "#78350f", // Amber 900 (Deep sepia brown)
    primaryContainer: "#a1887f",
    secondary: "#1e3a8a", // Blue 900 (Fountain pen blue)
    secondaryContainer: "#d7ccc8",
    tertiary: "#ea580c", // Orange 600 (Faded rusty orange)
    background: "#f5f5dc",
    surface: "#f5f5dc",
    surfaceContainer: "#e8e8d0",
    surfaceContainerLow: "#f0f0d8",
    surfaceContainerHigh: "#e0e0c8",
    surfaceContainerHighest: "#d8d8c0",
    onSurface: "#3e2723",
    vintage: true
  },
  orange: {
    name: "কমলা আকাশ",
    description: "গোধূলির আকাশ, গাঢ় কালো ছায়া এবং হালকা মেজেন্টা",
    primary: "#ea580c", // Orange-600
    primaryContainer: "#f97316", // Orange-500
    secondary: "#4c1d95", // Violet 900 (Deep twilight purple)
    secondaryContainer: "#ffedd5", 
    tertiary: "#be123c", // Rose 700 (Sunset magenta/red)
    background: "#fff7ed", 
    surface: "#fff7ed",
    surfaceContainer: "#fed7aa", 
    surfaceContainerLow: "#ffedd5", 
    surfaceContainerHigh: "#fdc57b", 
    surfaceContainerHighest: "#fb923c", 
    onSurface: "#431407",
    vintage: true
  },
  brown: {
    name: "মাটির ডাকটিক",
    description: "গ্রামের সোঁদা মাটি, কচি পাতা এবং পোড়ামাটির ছাঁচ",
    primary: "#854d0e", // Deep Earth Brown
    primaryContainer: "#a16207", 
    secondary: "#166534", // Green 800 (Leaf Green)
    secondaryContainer: "#fef08a", 
    tertiary: "#9a3412", // Orange 800 (Terracotta)
    background: "#fefce8", 
    surface: "#fefce8",
    surfaceContainer: "#fde047", 
    surfaceContainerLow: "#fef08a", 
    surfaceContainerHigh: "#facc15", 
    surfaceContainerHighest: "#eab308", 
    onSurface: "#3f2c06",
    vintage: true
  },
  vintage_blue: {
    name: "নীল খাম",
    description: "ইনল্যান্ড লেটার, সোনার মোহর এবং গাঢ় কালির ছাপ",
    primary: "#2563eb", // Royal Blue
    primaryContainer: "#3b82f6", 
    secondary: "#ca8a04", // Yellow 600 (Gold/Brass)
    secondaryContainer: "#dbeafe", 
    tertiary: "#0f172a", // Slate 900 (Dark Ink)
    background: "#eff6ff", 
    surface: "#eff6ff",
    surfaceContainer: "#bfdbfe", 
    surfaceContainerLow: "#dbeafe", 
    surfaceContainerHigh: "#93c5fd", 
    surfaceContainerHighest: "#60a5fa", 
    onSurface: "#172554",
    vintage: true
  },
  forest_green: {
    name: "অরণ্য ছায়া",
    description: "স্নিগ্ধ সবুজ অরণ্য, হলুদ ফুল এবং কাঠের গুঁড়ি",
    primary: "#16a34a", // Forest Green
    primaryContainer: "#22c55e", 
    secondary: "#b45309", // Amber 700 (Wood brown)
    secondaryContainer: "#dcfce7", 
    tertiary: "#f59e0b", // Amber 500 (Sunlight yellow)
    background: "#f0fdf4", 
    surface: "#f0fdf4",
    surfaceContainer: "#bbf7d0", 
    surfaceContainerLow: "#dcfce7", 
    surfaceContainerHigh: "#86efac", 
    surfaceContainerHighest: "#4ade80", 
    onSurface: "#052e16",
    vintage: true
  },
  sunset_red: {
    name: "গোধূলি লাল",
    description: "লাল সন্ধ্যা, ময়ূরকণ্ঠী নীল এবং গাঢ় কমলা",
    primary: "#dc2626", // Red 600
    primaryContainer: "#ef4444", 
    secondary: "#0369a1", // Sky 700 (Deep Dusk Blue)
    secondaryContainer: "#fee2e2", 
    tertiary: "#ea580c", // Orange 600
    background: "#fef2f2", 
    surface: "#fef2f2",
    surfaceContainer: "#fecaca", 
    surfaceContainerLow: "#fee2e2", 
    surfaceContainerHigh: "#fca5a5", 
    surfaceContainerHighest: "#f87171", 
    onSurface: "#450a0a",
    vintage: true
  },
  royal_purple: {
    name: "রাজকীয় বেগুনি",
    description: "ঐতিহ্যবাহী বেগুনি, সোনালি সুতো এবং পান্না সবুজ",
    primary: "#7e22ce", // Purple-700
    primaryContainer: "#a855f7", 
    secondary: "#d97706", // Amber 600 (Gold)
    secondaryContainer: "#f3e8ff", 
    tertiary: "#047857", // Emerald 700 (Gem Green)
    background: "#faf5ff", 
    surface: "#faf5ff",
    surfaceContainer: "#e9d5ff", 
    surfaceContainerLow: "#f3e8ff", 
    surfaceContainerHigh: "#d8b4fe", 
    surfaceContainerHighest: "#c084fc", 
    onSurface: "#3b0764",
    vintage: true
  }
};
type PaperType =
  | "ruled"
  | "white"
  | "yellow"
  | "royal"
  | "old"
  | "scented"
  | "postcard"
  | "inland";
type InkColor = string;
type HandwritingFont =
  | "serif"
  | "sans"
  | "handwriting"
  | "fancy"
  | "poushali"
  | "poushali-italic"
  | "priyotoma"
  | "priyotoma-italic"
  | "himu"
  | "himu-italic"
  | "bijoy2003"
  | "bijoy2003-italic"
  | "bijoy52"
  | "bijoy52-italic";
type EnvelopeStyle = "classic" | "vintage" | "royal" | "airmail" | "love";

const SCENTS = [
  { 
    id: "rose", 
    label: "গোলাপজল", 
    icon: "🌹", 
    color: "bg-red-50", 
    particleColor: "#fecaca",
    mist: "pink",
    description: "স্নিগ্ধ প্রেমের সুবাস"
  },
  { 
    id: "attar", 
    label: "আতর", 
    icon: "🌿", 
    color: "bg-green-50", 
    particleColor: "#bbf7d0",
    mist: "green",
    description: "গভীর নস্টালজিক পারফিউম"
  },
  { 
    id: "jasmine", 
    label: "বেলি ফুল", 
    icon: "🌼", 
    color: "bg-yellow-50", 
    particleColor: "#fef08a",
    mist: "yellow",
    description: "সাদা ফুলের মিষ্টি সুগন্ধ"
  },
  { 
    id: "rain", 
    label: "বৃষ্টির কণা", 
    icon: "💧", 
    color: "bg-blue-50", 
    particleColor: "#bfdbfe",
    mist: "blue",
    description: "মাটির সোঁদা গন্ধ"
  },
  { 
    id: "lavender", 
    label: "ল্যাভেন্ডার", 
    icon: "💜", 
    color: "bg-purple-50", 
    particleColor: "#e9d5ff",
    mist: "purple",
    description: "শান্তিদায়ক স্নিগ্ধ ভাব"
  }
];

const GIFTS = [
  {
    id: "rose",
    label: "শুকনা গোলাপ",
    icon: "🌹",
    description: "ভালোবাসার প্রতীক",
  },
  {
    id: "chocolate",
    label: "চকলেট",
    icon: "🍫",
    description: "মিষ্টি সম্পর্কের জন্য",
  },
  {
    id: "sticker",
    label: "রঙিন স্টিকার",
    icon: "🎨",
    description: "স্মৃতি ধরে রাখতে",
  },
  { id: "coin", label: "ছোট কয়েন", icon: "🪙", description: "সৌভাগ্যের জন্য" },
  {
    id: "feather",
    label: "ময়ূরের পালক",
    icon: "🪶",
    description: "সৌন্দর্যের ছোঁয়া",
  },
  {
    id: "jasmine",
    label: "বেলি ফুল",
    icon: "🌼",
    description: "পবিত্র সুগন্ধ",
  },
];

interface Letter {
  id: string;
  content: string;
  datePlace?: string;
  greeting?: string;
  bodyPages?: string[];
  closing?: string;
  paperType: PaperType;
  inkColor: InkColor;
  penSize?: number;
  fontFamily: HandwritingFont;
  scent?: string;
  envelopeStyle?: EnvelopeStyle;
  senderUid: string;
  senderName: string;
  senderPostcode: string;
  receiverUid: string | null;
  receiverPostcode: string;
  status: "sent" | "delivered" | "lost";
  deliveryStatus?:
    | "in-transit"
    | "processing-at-head-office"
    | "processing-at-post-office"
    | "with-mail-carrier"
    | "at-veranda"
    | "returned-to-post"
    | "at-head-office"
    | "delivered"
    | "dead-letter";
  deadLetterAt?: number;
  attempts?: number;
  lastAttemptAt?: number;
  nextAttemptAt?: number;
  recoveryWaitUntil?: number;
  isPaid?: boolean;
  isBurnt?: boolean;
  burntAt?: number;
  isSaved?: boolean;
  isHidden?: boolean;
  isRead?: boolean;
  excuseMessage?: string;
  lastExcuseAt?: number;
  timestamp: number;
  deliveryDelay: number;
  postmanId: string;
  sealId?: string | null;
  stampId?: string | null;
  addedDelay?: number;
  gift?: string | null;
}

const OnboardingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Background Particle System
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 10 + 5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  const slides = [
    {
      title: "আবেগের ডাকটিক",
      description: "যান্ত্রিক এই সময়ে চিঠির মাধ্যমে পুরনো আবেগ ফিরে আসুক। ডাকটিক অ্যাপে আপনি পাবেন হাতে লেখা চিঠির সেই চিরচেনা আমেজ।",
      icon: Mail,
      theme: "rgba(59, 130, 246, 0.1)",
      image: (
        <div className="relative w-72 h-72 flex items-center justify-center">
            <motion.div 
               animate={{ 
                 y: [0, -15, 0], 
                 rotate: [0, 5, 0],
                 scale: [1, 1.02, 1]
               }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="w-56 h-40 bg-white border-b-4 border-stone-300 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] rounded-sm p-6 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-primary/40" />
                {/* Envelope detailing */}
                <div className="absolute top-4 right-4 w-12 h-14 bg-orange-50 border-2 border-orange-100 rounded-sm flex flex-col items-center justify-center shadow-sm">
                    <div className="w-full h-4 bg-orange-400/20" />
                    <Heart className="w-6 h-6 text-orange-500 mt-1 fill-orange-500/10" />
                </div>
                <div className="mt-8 space-y-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: "90%" }} transition={{ delay: 0.5, duration: 1 }} className="h-2 bg-gray-100 rounded-full" />
                    <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ delay: 0.7, duration: 1 }} className="h-2 bg-gray-100 rounded-full" />
                    <motion.div initial={{ width: 0 }} animate={{ width: "50%" }} transition={{ delay: 0.9, duration: 1 }} className="h-2 bg-gray-100 rounded-full" />
                </div>
                {/* Decorative Pattern */}
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-50 rounded-full opacity-50" />
            </motion.div>
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-10 w-48 h-8 bg-black/10 blur-2xl rounded-full" 
            />
        </div>
      )
    },
    {
      title: "স্মৃতি সিন্দুকে জমা",
      description: "আপনার প্রিয় রঙিন চিঠি আর গোপন কথাগুলো থাকুক আমাদের নিরাপদ সিন্দুকে। যা কেবল আপনিই খুলতে পারবেন।",
      icon: Lock,
      theme: "rgba(168, 85, 247, 0.1)",
      image: (
        <div className="relative w-72 h-72 flex items-center justify-center">
            <motion.div 
                animate={{ 
                  scale: [1, 1.03, 1],
                  rotateZ: [0, 1, 0]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-48 h-48 bg-stone-900 rounded-[3rem] border-[6px] border-stone-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-800 to-transparent opacity-50" />
                <div className="w-24 h-24 rounded-full border-2 border-stone-700/50 flex items-center justify-center relative">
                    <motion.div 
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-t-4 border-primary/60 rounded-full" 
                    />
                    <motion.div 
                      animate={{ rotate: [0, 45, 0, -45, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-2 h-14 bg-gradient-to-b from-stone-500 to-stone-700 rounded-full z-10" 
                    />
                    <div className="w-4 h-4 bg-stone-600 rounded-full z-20 shadow-inner" />
                </div>
                {/* Security dots */}
                <div className="absolute bottom-6 flex gap-2">
                   {[1,2,3].map(i => (
                     <motion.div 
                       key={i}
                       animate={{ opacity: [0.3, 1, 0.3] }}
                       transition={{ duration: 1.5, repeat: Infinity, delay: i*0.5 }}
                       className="w-1.5 h-1.5 rounded-full bg-primary" 
                     />
                   ))}
                </div>
            </motion.div>
            <div className="absolute bottom-8 w-44 h-10 bg-black/15 blur-3xl rounded-full" />
        </div>
      )
    },
    {
      title: "প্রাণোচ্ছল ডাকপিয়ন",
      description: "করিম চাচা কিংবা রফিক—আমাদের পিয়নরা কেবল বার্তা বাহক নয়, তারা আপনার সুখ-দুঃখের গল্পের একনিষ্ঠ ভাগিদার।",
      icon: UserIcon,
      theme: "rgba(249, 115, 22, 0.1)",
      image: (
        <div className="relative w-72 h-72 flex items-center justify-center">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-48 h-48 bg-orange-100/30 rounded-full flex items-center justify-center relative shadow-inner border-2 border-white"
            >
                <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                >
                    <UserIcon className="w-28 h-28 text-orange-600 drop-shadow-2xl" />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -left-2 w-10 h-10 bg-orange-600 rounded-xl border-4 border-white flex items-center justify-center shadow-xl rotate-12"
                    >
                       <Mail className="w-5 h-5 text-white" />
                    </motion.div>
                </motion.div>
                {/* Floating messages */}
                {[1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: -60, opacity: [0, 1, 0], x: i === 1 ? -40 : 40 }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 1.5 }}
                    className="absolute bg-white p-2 rounded-lg shadow-md border border-orange-100"
                  >
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                  </motion.div>
                ))}
            </motion.div>
            <div className="absolute bottom-6 w-40 h-8 bg-black/5 blur-2xl rounded-full" />
        </div>
      )
    },
    {
      title: "সুগন্ধি চিঠি ও সীলমোহর",
      description: "প্রতিটি চিঠিতে যোগ করুন প্রিয় সুগন্ধি আর আভিজাত্যপূর্ণ সীলমোহর। আপনার ব্যক্তিত্ব ফুটে উঠুক প্রতিটি ভাজে।",
      icon: Flower2,
      theme: "rgba(220, 38, 38, 0.1)",
      image: (
         <div className="relative w-72 h-72 flex items-center justify-center">
            <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-40 h-40 bg-red-900 rounded-full border-[8px] border-red-800 shadow-[0_30px_70px_rgba(153,27,27,0.5)] flex items-center justify-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/20" />
                <div style={{ backfaceVisibility: 'hidden' }} className="flex items-center justify-center">
                   <Flower2 className="w-20 h-20 text-white/90 drop-shadow-lg" />
                </div>
                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 flex items-center justify-center bg-red-800">
                    <span className="text-white font-serif font-black text-5xl drop-shadow-xl">ডাক</span>
                </div>
            </motion.div>
            {/* Animated Petals */}
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ 
                  y: [20, -100], 
                  x: [0, Math.sin(i) * 50],
                  rotate: [0, 360],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i }}
                className="absolute text-red-500/40"
              >
                <Flower2 className="w-6 h-6" />
              </motion.div>
            ))}
            <div className="absolute bottom-10 w-40 h-10 bg-black/10 blur-3xl rounded-full" />
        </div>
      )
    }
  ];

  const handleNext = () => {
    vintageAudio.playClick();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("dakthik_onboarding_seen", "true");
      onFinish();
    }
  };

  const handleSkip = () => {
    vintageAudio.playStamp();
    localStorage.setItem("dakthik_onboarding_seen", "true");
    onFinish();
  };

  return (
    <div className="fixed inset-0 bg-[#fffdf0] z-[100] flex flex-col overflow-hidden onboarding-vibe">
      {/* Dynamic Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ y: "110%", x: `${p.x}%` }}
            animate={{ 
              y: "-10%",
              x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 20}%`, `${p.x}%`],
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              delay: p.delay,
              ease: "linear"
            }}
            className="absolute rounded-full bg-primary/5 blur-[2px]"
            style={{ width: p.size, height: p.size }}
          />
        ))}
      </div>

      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none paper-texture" />
      <motion.div 
        animate={{ backgroundColor: slides[currentSlide].theme }}
        className="absolute inset-0 transition-colors duration-1000 pointer-events-none" 
      />

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-8 flex justify-between items-center relative z-10"
      >
        <div className="flex items-center gap-3">
           <motion.div 
             animate={{ rotate: [0, 10, -10, 0] }}
             transition={{ duration: 5, repeat: Infinity }}
             className="w-12 h-12 flex items-center justify-center"
           >
              <DakthikLogo className="w-full h-full" />
           </motion.div>
           <span className="font-serif font-black text-primary text-2xl tracking-tighter">ডাকটিক</span>
        </div>
        <button 
          onClick={handleSkip}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-all px-6 py-3 rounded-full hover:bg-primary/5"
        >
          এড়িয়ে যান
        </button>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center text-center space-y-12 w-full max-w-sm"
          >
            {/* Visual Component */}
            <div className="relative group">
               {slides[currentSlide].image}
            </div>

            {/* Text Components with Staggered Intro */}
            <div className="space-y-6">
              <motion.h2 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-serif font-black text-primary tracking-tight"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-gray-600 font-medium leading-[2] text-[15px] px-8"
              >
                {slides[currentSlide].description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Area */}
      <div className="p-10 pb-16 flex flex-col items-center gap-12 relative z-10">
        {/* Indicators */}
        <div className="flex gap-4">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ 
                width: currentSlide === i ? 40 : 10,
                opacity: currentSlide === i ? 1 : 0.2
              }}
              className="h-2 rounded-full bg-primary transition-all duration-700"
            />
          ))}
        </div>

        {/* Action Button - High End Design */}
        <button
          onClick={handleNext}
          className="w-full bg-primary text-white py-6 rounded-3xl font-serif font-black text-xl shadow-[0_25px_60px_-10px_rgba(var(--theme-primary-rgb),0.4)] hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
        >
          {/* Shimmer Effect */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          />
          
          <span className="relative z-10">
            {currentSlide === slides.length - 1 ? "ডাকটিক ওপেন করুন" : "পরবর্তী ধাপ"}
          </span>
          <ChevronRight className={`w-7 h-7 relative z-10 transition-transform duration-300 ${currentSlide === slides.length - 1 ? 'translate-x-1' : 'group-hover:translate-x-2'}`} />
        </button>
      </div>

      {/* Decorative Postal Strip at bottom */}
      <div className="h-3 w-full postal-stripes opacity-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" />
    </div>
  );
};

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#fffdd0] flex flex-col items-center justify-center z-50 overflow-hidden"
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none paper-texture" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* Retro 2D Red Postbox */}
        <div className="relative mb-12 flex flex-col items-center">
          {/* Post Box Body */}
          <div className="w-28 h-44 bg-[#b91c1c] rounded-t-[3.5rem] relative flex flex-col items-center shadow-2xl border-x-[8px] border-t-[8px] border-[#7f1d1d] overflow-hidden">
            {/* The Slot */}
            <div className="w-16 h-2.5 bg-[#450a0a] mt-10 rounded-full shadow-inner z-20" />
            
            {/* Letter Entry Animation */}
            <motion.div
              initial={{ y: -60, opacity: 0, scale: 0.8 }}
              animate={{ 
                y: [40, 50, 60], 
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1, 0.5] 
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                times: [0, 0.4, 1]
              }}
              className="absolute top-0 w-10 h-7 bg-white rounded-sm shadow-md flex items-center justify-center border border-gray-200 z-10"
            >
              <div className="w-6 h-[1px] bg-gray-200" />
            </motion.div>

            {/* Bottom detail */}
            <div className="absolute bottom-4 w-full h-1 bg-black/10" />
          </div>
          
          {/* Postbox Stand (Centered) */}
          <div className="w-32 h-6 bg-[#1f2937] rounded-lg -mt-2 shadow-lg border-b-4 border-[#111827] z-30" />
          <div className="w-40 h-2 bg-black/5 rounded-full mt-3 blur-sm" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-7xl font-black text-primary font-serif tracking-tighter flex items-center justify-center gap-3">
            ডাকটিক
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-primary/20" />
            <p className="text-primary/60 text-lg font-bold tracking-[0.2em] font-serif uppercase">
              চিঠির হারানো জগৎ
            </p>
            <div className="h-[1px] w-8 bg-primary/20" />
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <div className="absolute bottom-24 w-48 h-1 bg-primary/5 rounded-full overflow-hidden border border-primary/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="h-full bg-primary"
        />
      </div>
      
      <p className="absolute bottom-16 text-[10px] font-bold text-primary/30 uppercase tracking-[0.4em] animate-pulse">
          লোড হচ্ছে...
      </p>

      {/* Retro Stripes at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-2 postal-stripes opacity-10" />
    </motion.div>
  );
};

const LivePostOfficeScene = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#e6e2d6] flex items-center justify-center">
      <img 
         src="https://i.ibb.co/1YNXxMdh/Dakthik-pic-1.png" 
         alt="Post Office"
         className="w-full h-full object-cover object-center"
      />
      {/* Overlay for Warmth */}
      <div className="absolute inset-0 bg-primary/5 pointer-events-none mix-blend-multiply" />
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.1)] pointer-events-none" />
    </div>
  );
};

const Countdown = ({
  targetTime,
  onEnd,
}: {
  targetTime: number;
  onEnd?: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        if (onEnd) onEnd();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime, onEnd]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <span className="font-mono font-bold text-primary">
      {minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </span>
  );
};

const BarandaScreen = ({ onBack, user }: { onBack: () => void; user: any }) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      where("deliveryStatus", "in", ["at-veranda", "returned-to-post"]),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setLetters(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Letter),
        );
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );
    return unsub;
  }, [user]);

  const handleReceive = async (letterId: string) => {
    try {
      await updateDoc(doc(db, "letters", letterId), {
        deliveryStatus: "delivered",
        status: "delivered",
      });
      showToast("চিঠিটি গ্রহণ করা হয়েছে! এটি এখন আপনার ইনবক্সে। 📬", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "letters");
    }
  };

  const handleComeLater = async (letterId: string) => {
    try {
      await updateDoc(doc(db, "letters", letterId), {
        deliveryStatus: "returned-to-post",
        nextAttemptAt: Date.now() + RETURN_WAIT,
      });
      showToast("পিয়নকে পরে আসতে বলা হয়েছে।", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "letters");
    }
  };

  return (
    <div className="bg-[#fdfaf3] min-h-screen pb-24 paper-texture">
      <header className="p-6 flex items-center space-x-4 border-b border-primary/10 bg-white shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/5 rounded-full transition-colors"
        >
          <ArrowLeft className="text-primary w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-primary font-serif">
            বারান্দা (The Veranda)
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            ডেলিভারি ট্র্যাকিং
          </p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">খোঁজা হচ্ছে...</div>
        ) : letters.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Home className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 font-medium font-serif italic">
              বারান্দায় এখন কেউ নেই...
            </p>
          </div>
        ) : (
          letters.map((l) => {
            const postman =
              POSTMEN.find((p) => p.id === l.postmanId) || POSTMEN[0];
            const isMissed = l.deliveryStatus === "returned-to-post";
            const expiry = isMissed
              ? l.nextAttemptAt || 0
              : (l.lastAttemptAt || 0) + VERANDA_WINDOW;

            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white p-6 rounded-2xl shadow-lg border ${isMissed ? "border-red-100" : "border-primary/5"} relative overflow-hidden`}
              >
                {/* Step Image */}
                <div className="w-full h-48 bg-stone-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden border border-stone-200">
                  <img 
                    src="https://i.ibb.co/kspnQWgd/1777359515653.png"
                    alt={isMissed ? "Missed Delivery" : "Peon Waiting"}
                    className={`w-full h-full object-cover transition-all duration-700 ${isMissed ? "grayscale sepia opacity-80" : ""}`}
                    referrerPolicy="no-referrer"
                  />
                  {isMissed && (
                    <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center">
                      <div className="bg-white/90 px-4 py-1.5 rounded-full border border-red-100 shadow-sm flex items-center gap-2">
                        <LockIcon className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Missed Visit</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="text-4xl w-12 h-12">
                    {isMissed ? (
                      "🚪"
                    ) : (
                      <PostmanAvatar avatar={postman.avatar} />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="font-serif font-bold text-lg text-primary">
                      {isMissed
                        ? "চিঠি ফেরত গেছে!"
                        : `${postman.name} আপনার দরজায়`}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed italic">
                      {isMissed
                        ? "আপনি ৩০ মিনিটে চিঠিটি নেননি। পিয়ন আবার আসবে।"
                        : `"${postman.catchphrase || "কড়া নাড়ছে! করিম চাচা বারান্দায়।"}"`}
                    </p>

                    <div
                      className={`${isMissed ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary"} p-3 rounded-xl flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {isMissed ? "লক সময় বাকি:" : "সময় বাকি:"}
                        </span>
                      </div>
                      <Countdown targetTime={expiry} />
                    </div>

                    {!isMissed && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            handleReceive(l.id);
                          }}
                          className="bg-primary text-white py-3 rounded-xl font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          চিঠি নিন
                        </button>
                        <button
                          onClick={() => handleComeLater(l.id)}
                          className="bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          পরে আসুক
                        </button>
                      </div>
                    )}

                    {isMissed && (
                      <div className="bg-red-50/50 p-2 rounded-lg border border-red-100 text-center">
                        <p className="text-[10px] text-red-400 font-bold">
                          ২ ঘণ্টা লক
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

const HeadPostOfficeScreen = ({
  onBack,
  user,
  onUpdateCoins,
  allPostmen,
  onTriggerAdda,
}: {
  onBack: () => void;
  user: any;
  onUpdateCoins: (amount: number) => Promise<void>;
  allPostmen: any[];
  onTriggerAdda: () => Promise<void>;
}) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [allActiveLetters, setAllActiveLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeRoom, setActiveRoom] = useState<"main" | "records" | "dispatch" | "complaint" | "adda" | "telegram" | "library">(
    "main",
  );
  const [isSearching, setIsSearching] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [dailyNotice, setDailyNotice] = useState<{ memoNo: string; title: string; body: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchNotice = async () => {
      const today = new Date().toISOString().split('T')[0];
      // Use user-specific notice path
      const noticeRef = doc(db, "users", user.uid, "daily_notices", `notice_${today}`);
      
      try {
        const snap = await getDoc(noticeRef);
        if (snap.exists()) {
          setDailyNotice(snap.data() as any);
        } else {
          // Generate new one via AI based on current user stats
          const activeLettersCount = letters.filter(l => l.deliveryStatus !== "delivered" && l.deliveryStatus !== "at-head-office").length;
          const missedLettersCount = letters.filter(l => l.deliveryStatus === "at-head-office").length;

          const newDoc = await generateDailyNotice({ 
            date: today,
            userName: user.displayName || "গ্রাহক",
            stats: {
              activeLetters: activeLettersCount,
              missedLetters: missedLettersCount,
              coins: user.coins || 0
            }
          });

          await setDoc(noticeRef, {
            ...newDoc,
            createdAt: serverTimestamp()
          });
          setDailyNotice(newDoc);
        }
      } catch (err) {
        console.error("Notice fetch error:", err);
      }
    };
    fetchNotice();
  }, [user, letters.length]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeRoom]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch user's support tickets
    const qTickets = query(
      collection(db, "supportTickets"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubTickets = onSnapshot(
      qTickets,
      (snapshot) => {
        setUserTickets(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "supportTickets"),
    );

    // User's letters at head office
    const q = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      where("deliveryStatus", "==", "at-head-office"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setLetters(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Letter),
        );
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    // All active letters for this user to determine postmen status
    const qActiveReceiver = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      where("deliveryStatus", "in", [
        "in-transit",
        "processing-at-post-office",
        "with-mail-carrier",
        "at-veranda",
      ]),
    );
    const qActiveSender = query(
      collection(db, "letters"),
      where("senderUid", "==", user.uid),
      where("deliveryStatus", "in", [
        "in-transit",
        "processing-at-post-office",
        "with-mail-carrier",
        "at-veranda",
      ]),
    );

    let receiverDocs: Letter[] = [];
    let senderDocs: Letter[] = [];

    const updateActiveLetters = () => {
      const allDocs = [...receiverDocs, ...senderDocs];
      // Remove duplicates if user sent to themselves (though not allowed, just in case)
      const uniqueDocs = Array.from(
        new Map(allDocs.map((item) => [item.id, item])).values(),
      );
      setAllActiveLetters(uniqueDocs);
    };

    const unsubActiveReceiver = onSnapshot(
      qActiveReceiver,
      (snapshot) => {
        receiverDocs = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id }) as Letter,
        );
        updateActiveLetters();
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    const unsubActiveSender = onSnapshot(
      qActiveSender,
      (snapshot) => {
        senderDocs = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id }) as Letter,
        );
        updateActiveLetters();
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    return () => {
      unsub();
      unsubActiveReceiver();
      unsubActiveSender();
      unsubTickets();
    };
  }, [user]);

  // Reset scroll when activeRoom changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeRoom]);

  const getOfficeStatus = () => {
    const hour = currentTime.getHours();
    if (hour < 9 || hour >= 17)
      return {
        label: "বন্ধ (Closed)",
        color: "text-red-500",
        icon: <LockIcon className="w-4 h-4" />,
      };
    if (hour >= 13 && hour < 14)
      return {
        label: "টিফিন সময় (Lunch)",
        color: "text-orange-500",
        icon: <Coffee className="w-4 h-4" />,
      };
    return {
      label: "খোলা (Open)",
      color: "text-green-500",
      icon: <CheckCircle2 className="w-4 h-4" />,
    };
  };

  const officeStatus = getOfficeStatus();

  const getPostmanStatus = (postmanId: string) => {
    const isBusy = allActiveLetters.some((l) => l.postmanId === postmanId);
    if (isBusy)
      return {
        label: "ডেলিভারিতে আছেন",
        color: "text-orange-500",
        status: "busy",
      };

    const hour = currentTime.getHours();
    if (hour < 9 || hour >= 17) {
      return { label: "বাড়িতে আছেন", color: "text-gray-500", status: "home" };
    }

    // Randomly assign "Adda" or "In Office" for flavor
    const isAdda =
      (parseInt(postmanId.slice(1)) + currentTime.getMinutes()) % 3 === 0;
    if (isAdda)
      return { label: "আড্ডায় মত্ত", color: "text-blue-500", status: "adda" };
    return { label: "অফিসে আছেন", color: "text-green-500", status: "present" };
  };

  const handleBribe = async (letterId: string) => {
    if (user.coins < RECOVERY_FEE) {
      showToast("আপনার পর্যাপ্ত কয়েন নেই! 🪙", "error");
      return;
    }

    try {
      await updateDoc(doc(db, "letters", letterId), {
        deliveryStatus: "delivered",
        status: "delivered",
        isPaid: true,
      });
      await onUpdateCoins(-RECOVERY_FEE);
      showToast("মিষ্টি খাওয়ানো সফল! চিঠিটি এখন আপনার ইনবক্সে। 📬", "success");
      setSelectedLetter(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "letters");
    }
  };

  const handleWait = async (letterId: string) => {
    try {
      await updateDoc(doc(db, "letters", letterId), {
        recoveryWaitUntil: Date.now() + HEAD_OFFICE_WAIT,
      });
      showToast("৫ ঘণ্টা অপেক্ষা শুরু হলো।", "info");
      setSelectedLetter(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "letters");
    }
  };

  const handleClaimAfterWait = async (letterId: string) => {
    try {
      await updateDoc(doc(db, "letters", letterId), {
        deliveryStatus: "delivered",
        status: "delivered",
      });
      showToast("অপেক্ষা শেষ! চিঠিটি এখন আপনার ইনবক্সে। 📬", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "letters");
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setSubmittingTicket(true);
    try {
      await addDoc(collection(db, "supportTickets"), {
        uid: user.uid,
        userEmail: user.email,
        subject: ticketSubject || "সাধারণ অভিযোগ",
        message: ticketMessage,
        status: "open",
        createdAt: new Date().toISOString(),
      });
      setTicketSubject("");
      setTicketMessage("");
      showToast("অভিযোগ জমা দেওয়া হয়েছে। বড় বাবু শীঘ্রই দেখবেন।", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "supportTickets");
    } finally {
      setSubmittingTicket(false);
    }
  };

  if (selectedLetter) {
    const isWaiting =
      selectedLetter.recoveryWaitUntil &&
      selectedLetter.recoveryWaitUntil > Date.now();
    const waitFinished =
      selectedLetter.recoveryWaitUntil &&
      selectedLetter.recoveryWaitUntil <= Date.now();

    return (
      <div className="bg-[#f4f1ea] min-h-screen pb-24 paper-texture">
        <header className="p-6 flex items-center justify-between border-b-2 border-primary/10 bg-white shadow-sm sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedLetter(null)}
              className="p-3 hover:bg-primary/5 rounded-2xl transition-all active:scale-90"
            >
              <ArrowLeft className="text-primary w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-primary font-serif">
                বড় বাবুর খাস কামরা
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                প্রধান কার্যালয় • কক্ষ নং: ০০১
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 shadow-sm ${officeStatus.color}`}
          >
            {officeStatus.icon}
            <span className="text-[11px] font-black uppercase tracking-tighter">
              {officeStatus.label}
            </span>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-6 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden"
          >
            {/* Boro Babu Visual */}
            <div className="relative h-80 bg-[#e8e4d8] flex items-center justify-center overflow-hidden">
                <img 
                   src="https://i.ibb.co/0jCbnQDJ/dakghor-boro-babu-1.png" 
                   alt="Boro Babu Office" 
                   className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-10 text-white space-y-1">
                    <div className="flex items-center gap-2 text-amber-400">
                        <Sparkle size={14} className="animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">অফিসিয়াল কক্ষ</p>
                    </div>
                    <h3 className="text-3xl font-black font-serif tracking-tight">বড় বাবুর খাস কামরা</h3>
                    <p className="text-xs text-white/60 font-medium font-serif italic">"কাজের চাপে জান যায়, একটু চা না খেলে কি হয়?"</p>
                </div>
                
                {/* Vintage ID Badge Floating */}
                <div className="absolute top-6 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                        <img 
                            src="https://i.ibb.co/HDjcNwYX/1777429270616.jpg" 
                            alt="Boro Babu ID" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="h-1 w-8 bg-white/20 rounded-full" />
                        <div className="h-1 w-6 bg-white/10 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Boro Babu's Desk Assets */}
              <div className="grid grid-cols-3 gap-4">
                  {[
                      { label: "লেজার রেজিস্টার", icon: <BookOpen size={18} />, color: "bg-blue-50 text-blue-500" },
                      { label: "কালির দোয়াত", icon: <PenLine size={18} />, color: "bg-indigo-50 text-indigo-500" },
                      { label: "গরম চা", icon: <Coffee size={18} />, color: "bg-amber-50 text-amber-500" },
                  ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-gray-50/50 border border-transparent hover:border-primary/10 transition-all group">
                          <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                              {item.icon}
                          </div>
                          <span className="text-[9px] font-black uppercase text-gray-400 text-center tracking-tighter">{item.label}</span>
                      </div>
                  ))}
              </div>

              {officeStatus.label.includes("খোলা") ? (
                <>
                  <div className="relative">
                    <div className="absolute -top-4 -left-2 text-primary opacity-20">
                        <MessageSquare size={48} fill="currentColor" />
                    </div>
                    <div className="bg-primary/5 p-6 rounded-[2rem] border-l-8 border-primary relative z-10">
                        <p className="text-gray-800 font-serif italic text-lg leading-relaxed">
                            "আরে ভাই বুঝেনই তো, কত নথিপত্র! আপনার ওই আইডির চিঠিটা তো মনে হয় কোন এক ফাইলের নিচে চাপা পড়ে আছে। খুঁজে পেতে তো সময় লাগবে... নাকি অন্য কোনো উপায় দেখবেন?"
                        </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    {isWaiting ? (
                      <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-gray-100 text-center space-y-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                           <Clock className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">বড় বাবু ফাইল খুঁজছেন</p>
                           <div className="text-4xl font-serif font-black text-primary">
                             <Countdown targetTime={selectedLetter.recoveryWaitUntil!} />
                           </div>
                        </div>
                        <p className="text-xs text-gray-500 italic">"একটু ধৈর্য ধরেন মিয়া, চা টা খেয়ে আসি আগে..."</p>
                      </div>
                    ) : waitFinished ? (
                      <button
                        onClick={() => handleClaimAfterWait(selectedLetter.id)}
                        className="w-full py-6 bg-green-600 text-white rounded-[2rem] font-black text-xl shadow-xl hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                        চিঠি বুঝে নিন <ArrowRight size={24} />
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        <button
                          onClick={() => handleBribe(selectedLetter.id)}
                          className="group relative w-full p-6 bg-amber-500 text-white rounded-[2rem] font-black shadow-xl hover:bg-amber-600 transition-all active:scale-95 overflow-hidden"
                        >
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Coffee size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg">মিষ্টি খাওয়ান</h4>
                                    <p className="text-[10px] uppercase opacity-70">তাৎক্ষণিক উদ্ধারের জন্য</p>
                                </div>
                            </div>
                            <span className="text-2xl font-serif">{RECOVERY_FEE} 🪙</span>
                          </div>
                          <div className="absolute right-0 top-0 h-full w-24 bg-white/5 skew-x-12 translate-x-12" />
                        </button>
                        
                        <button
                          onClick={() => handleWait(selectedLetter.id)}
                          className="w-full p-6 bg-white text-gray-600 border-4 border-gray-100 rounded-[2rem] font-black hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                        >
                          <HistoryIcon className="w-6 h-6 text-gray-300 group-hover:rotate-180 transition-transform duration-700" />
                          ৫ ঘণ্টা অপেক্ষা করুন
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-red-50 p-10 rounded-[3rem] border-4 border-red-100 text-center space-y-6">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-red-500 shadow-xl">
                    <LockIcon size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-red-900 font-serif">অফিস এখন বন্ধ!</h4>
                    <p className="text-red-700/60 font-bold uppercase tracking-widest text-[11px]">আগামীকাল সকাল ৯টায় আসুন</p>
                  </div>
                  <p className="text-sm italic text-red-800/70 pt-4 border-t border-red-200">
                    "বড় বাবু এখন তার বাড়িতে আরাম করছেন। সরকারী অফিস তো আর সারাদিন খোলা থাকে না!"
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            ডাকটিক অফিশিয়াল • হেড অফিস ঢাকা
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f5f0] min-h-screen pb-24 paper-texture">
      <AnimatePresence mode="popLayout">
        {activeRoom === "main" ? (
          <motion.header
            key="main-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-primary/10 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm"
          >
            <div className="flex items-center space-x-6">
              <button
                onClick={onBack}
                className="p-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl transition-all active:scale-90"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-primary font-serif tracking-tight">
                    বড় ডাকটিক
                  </h2>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold border border-primary/20">
                    HEAD OFFICE
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> স্থাপিত: ১৮৫৪ • প্রধান কার্যালয়,
                  বাংলাদেশ
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm transition-all ${officeStatus.color} bg-white/50 backdrop-blur-sm`}
            >
              <div className="relative">
                {officeStatus.icon}
                {officeStatus.label === "খোলা" && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500 rounded-full"
                  />
                )}
              </div>
              <span className="text-xs font-black uppercase tracking-tighter">
                {officeStatus.label}
              </span>
            </div>
          </motion.header>
        ) : (
          <motion.header
            key="room-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="p-4 md:p-6 flex items-center justify-between border-b-2 border-primary/10 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveRoom("main")}
                className="p-2.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl transition-all active:scale-90"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl md:text-2xl font-black text-primary font-serif tracking-tight">
                {activeRoom === "records" && "বড় বাবুর খাস কামরা (কক্ষ ০০১)"}
                {activeRoom === "dispatch" && "৪১২ নং ডাক বাছাই এলাকা"}
                {activeRoom === "complaint" && "৫০২ নং অভিযোগ কেন্দ্র"}
                {activeRoom === "adda" && "৬০৯ নং আড্ডা ঘর"}
                {activeRoom === "telegram" && "২০৪ নং টেলিগ্রাম কেন্দ্র"}
                {activeRoom === "library" && "৩০৫ নং ডাক পাঠাগার"}
              </h2>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-8">
        <AnimatePresence mode="wait">
          {activeRoom === "telegram" && (
            <motion.div
              key="telegram-room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-primary/5 text-center space-y-4">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <Send size={40} />
                </div>
                <h3 className="text-2xl font-black text-primary font-serif">টেলিগ্রাম কেন্দ্র</h3>
                <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">তাত্ক্ষণিক বার্তা আদান-প্রদানের আধুনিক ব্যবস্থা। এই শাখাটি শীঘ্রই উন্মোচন করা হবে।</p>
                <div className="pt-4 flex justify-center gap-4">
                    <div className="bg-amber-100 text-amber-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-amber-200">কামিং সুন</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeRoom === "library" && (
            <motion.div
              key="library-room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-primary/5 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <Library size={40} />
                </div>
                <h3 className="text-2xl font-black text-primary font-serif">ডাক পাঠাগার</h3>
                <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">ডাক ইতিহাসের বিশাল সংগ্রহের এই বিশেষ শাখাটি শীঘ্রই পাঠকদের জন্য উন্মুক্ত করে দেওয়া হবে।</p>
                <div className="pt-4 flex justify-center gap-4">
                    <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-200">পড়া হবে শীঘ্রই</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeRoom === "adda" && (
            <motion.div
              key="adda-room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PostmanAdda
                user={user}
                allPostmen={allPostmen}
                allActiveLetters={allActiveLetters}
                onTrigger={onTriggerAdda}
              />
            </motion.div>
          )}

          {activeRoom === "main" && (
            <motion.div
              key="main-room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
                {/* Left Column: Boro Babu's Special Section */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6 flex flex-col h-full">
                    <button
                        onClick={() => {
                            vintageAudio.playClick();
                            setActiveRoom("records");
                        }}
                        className="text-left bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-stone-100 relative overflow-hidden group transition-all hover:border-primary/20 hover:shadow-primary/5 active:scale-[0.98]"
                    >
                        <div className="absolute -top-12 -right-12 w-80 h-80 opacity-10 group-hover:opacity-20 transition-all duration-1000 pointer-events-none">
                            <div className="w-full h-full [mask-image:radial-gradient(circle_at_center,black_30%,transparent_70%)]">
                                <img 
                                    src="https://i.ibb.co/Z6znmpbm/1777434184311.jpg" 
                                    alt="Boro Babu Shadow" 
                                    className="w-full h-full object-cover grayscale brightness-125 contrast-75 mix-blend-multiply" 
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center overflow-hidden border border-stone-100 shadow-inner group-hover:scale-110 transition-transform">
                                    <img 
                                        src="https://i.ibb.co/HDjcNwYX/1777429270616.jpg" 
                                        alt="Boro Babu" 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                {letters.length > 0 && (
                                    <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                        <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">{letters.length} Missed</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-800 font-serif leading-tight tracking-tight">বড় বাবুর খাস কামরা</h3>
                                <p className="text-xs text-gray-400 leading-relaxed italic">"{officeStatus.label === "খোল (OPEN)" ? "বড় বাবু এখন টেবিলে আছেন।" : "বড় বাবু এখন আড্ডা ঘরে আছেন।"}"</p>
                            </div>
                            
                            <div className="pt-2 flex items-center justify-between border-t border-stone-50">
                                <div className={`text-[9px] font-black uppercase tracking-widest ${officeStatus.color}`}>
                                    {officeStatus.label}
                                </div>
                                <div className="flex items-center gap-2 text-primary font-bold text-[10px] group-hover:translate-x-1 transition-all py-1 px-3 bg-stone-50 rounded-lg">
                                    পরামর্শ নিন <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Nostalgic 90s Notice Board - Realistic Cork Board */}
                    <div className="flex-1 bg-[#5d4037] p-1 rounded-[1.5rem] shadow-2xl relative overflow-hidden border-[12px] border-[#3e2723] shadow-inner luxury-shadow">
                        {/* Realistic Cork Texture Overlay */}
                        <div className="absolute inset-0 opacity-40 pointer-events-none" 
                             style={{ 
                               backgroundImage: 'url("https://www.transparenttextures.com/patterns/cork-board.png")',
                               backgroundColor: '#8d6e63'
                             }} />
                        
                        {/* Board "Depth" Shadow */}
                        <div className="absolute inset-0 shadow-[inset_0_10px_30px_rgba(0,0,0,0.4)] pointer-events-none z-10" />

                        {/* Background Paper Fragments & Clippings - More Realistic */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                             {/* Old Newspaper Clipping 1 - Torn Edge */}
                             <div className="absolute top-8 -left-8 w-44 h-56 bg-[#e0d6c0] rotate-[-12deg] shadow-lg border-l border-stone-400 p-4 flex flex-col gap-2 opacity-90"
                                  style={{ clipPath: 'polygon(5% 0%, 95% 2%, 100% 98%, 0% 100%, 2% 50%)' }}>
                                <div className="h-6 border-b-2 border-stone-400/30 w-full mb-1 flex items-center">
                                    <div className="h-2 bg-stone-500/20 w-1/2" />
                                </div>
                                <div className="space-y-1">
                                    <div className="h-[2px] bg-stone-500/20 w-full" />
                                    <div className="h-[2px] bg-stone-500/20 w-full" />
                                    <div className="h-[2px] bg-stone-500/20 w-[94%]" />
                                    <div className="h-[2px] bg-stone-500/20 w-[96%]" />
                                </div>
                                <div className="mt-2 h-20 bg-stone-600/10 w-full rounded-sm border border-stone-500/5" />
                                <div className="absolute top-2 right-4 w-3 h-3 bg-blue-600 rounded-full shadow-md border border-blue-800" />
                             </div>
                             
                             {/* Bureaucratic Memo Fragment */}
                             <div className="absolute bottom-6 -right-4 w-32 h-36 bg-[#fff9c4] rotate-[8deg] shadow-xl border-dashed border border-yellow-600/20 p-4 opacity-80"
                                  style={{ clipPath: 'polygon(0% 5%, 100% 0%, 98% 95%, 5% 100%)' }}>
                                <div className="w-4 h-4 bg-red-600 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-lg border border-red-800">
                                    <div className="w-1 h-1 bg-white/40 rounded-full m-0.5" />
                                </div>
                                <div className="mt-4 space-y-1.5">
                                    <div className="h-[3px] bg-stone-400/20 w-full" />
                                    <div className="h-[3px] bg-stone-400/20 w-[90%]" />
                                    <div className="h-[3px] bg-stone-400/20 w-[95%]" />
                                    <div className="h-[3px] bg-stone-400/20 w-full" />
                                </div>
                             </div>

                             {/* Pinned Circular Background */}
                             <div className="absolute top-2 right-12 w-32 h-40 bg-stone-100/20 rotate-[3deg] shadow-md border-t border-white/10" />
                        </div>

                        <div className="relative z-20 h-full flex flex-col p-4">
                            <div className="flex items-center justify-center mb-8">
                                <div className="bg-[#fcf5e5] text-[#4e342e] px-8 py-2 rounded-sm shadow-[0_5px_15px_rgba(0,0,0,0.3)] border-b-4 border-stone-300/50 rotate-[-1deg] flex items-center gap-3 border-stone-200">
                                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm" />
                                    <span className="text-[12px] font-black uppercase tracking-[.3em] font-serif">জরুরী বিজ্ঞপ্তি (Official Notice)</span>
                                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm" />
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center px-4">
                                <motion.div 
                                    initial={{ rotate: 1 }}
                                    animate={{ rotate: [-0.6, 0.6, -0.6] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="bg-[#faf9f6] p-8 shadow-[10px_20px_40px_rgba(0,0,0,0.3)] border border-stone-200 relative luxury-card-shadow"
                                    style={{ 
                                        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.5) 2px, transparent 2px)',
                                        backgroundSize: '100px 100px',
                                        clipPath: 'polygon(0.5% 0%, 99.5% 0.5%, 100% 99%, 0% 100%)' 
                                    }}
                                >
                                    {/* Realistic Push Pin - Main Sheet */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-600 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.5)] border-2 border-red-700 active:scale-95 transition-transform flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full -mt-1 -ml-1" />
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-2 bg-stone-400/50" />
                                    </div>
                                    
                                    <div className="space-y-6 text-stone-800 font-serif">
                                        <div className="pb-3 border-b-2 border-stone-100 flex justify-between items-center opacity-40">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black tracking-widest uppercase">গণপ্রজাতন্ত্রী ডাকটিক</span>
                                                <span className="text-[8px] font-bold tracking-tight">স্মারক নং: {dailyNotice?.memoNo || "০১৪৪/শাখা-১০/২৪"}</span>
                                            </div>
                                            <span className="text-[9px] font-bold tracking-widest uppercase">তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-4 top-0 w-1 h-full bg-primary/10 rounded-full" />
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-black text-stone-900 underline decoration-stone-200 underline-offset-4">{dailyNotice?.title || "জরুরী বার্তা"}</h5>
                                                <p className="text-xl font-medium leading-relaxed italic text-stone-700 pl-4 border-l border-stone-200">
                                                    "{dailyNotice?.body || "হেড অফিসের প্রতিটি শাখা সুশৃঙ্খলভাবে সাজানো হয়েছে ডাকসেবাকে আরও আধুনিক ও নির্ভরযোগ্য করতে।"}"
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-stone-50 text-right">
                                            <div className="inline-block border-b border-stone-300 pb-1 mb-1">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-stone-500">বড় পিয়ন</p>
                                            </div>
                                            <p className="text-[8px] font-bold text-stone-400">প্রধান ডাক কার্যালয়, বাংলাদেশ</p>
                                        </div>
                                    </div>

                                    {/* Watermark */}
                                    <div className="absolute bottom-4 left-4 opacity-[0.03] rotate-[-20deg] pointer-events-none">
                                        <Truck size={80} />
                                    </div>
                                </motion.div>
                            </div>

                            <div className="mt-6 flex justify-between px-6 pt-4 border-t border-black/10">
                                <div className="w-4 h-4 bg-black/20 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                                <div className="w-4 h-4 bg-black/20 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Departmental Grid */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-8 h-full">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em]">বিভাগসমূহ (Departments)</h3>
                        <div className="h-[2px] flex-1 bg-gray-100 ml-6 rounded-full opacity-50" />
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { id: "records", label: "১০১ নং রেকর্ড রুম", icon: Archive, desc: "নিখোঁজ চিঠিপত্র", color: "text-blue-500", bg: "bg-blue-50" },
                            { id: "telegram", label: "২০৪ নং টেলিগ্রাম", icon: Send, desc: "জরুরী বার্তা কেন্দ্র", color: "text-amber-500", bg: "bg-amber-50" },
                            { id: "library", label: "৩০৫ নং ডাক পাঠাগার", icon: Library, desc: "ইতিহাস ও জ্ঞান", color: "text-emerald-500", bg: "bg-emerald-50" },
                            { id: "dispatch", label: "৪১২ নং ডাক বাছাই", icon: Truck, desc: "চিঠি ডিস্ট্রিবিউশন", color: "text-rose-500", bg: "bg-rose-50" },
                            { id: "adda", label: "৬০৯ নং আড্ডা ঘর", icon: Users, desc: "পিয়ন কমিউনিটি", color: "text-indigo-500", bg: "bg-indigo-50" },
                            { id: "complaint", label: "৫০২ নং অভিযোগ কেন্দ্র", icon: MessageSquare, desc: "হেল্প ও সাপোর্ট", color: "text-violet-500", bg: "bg-violet-50" },
                        ].map((dept) => (
                            <motion.button
                                key={dept.id}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    vintageAudio.playClick();
                                    setActiveRoom(dept.id as any);
                                }}
                                className="bg-white p-8 rounded-[3rem] shadow-xl border border-primary/5 text-left group transition-all hover:border-primary/20 hover:shadow-2xl relative overflow-hidden h-full flex flex-col"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05]">
                                    <dept.icon size={80} />
                                </div>
                                <div className={`w-16 h-16 ${dept.bg} ${dept.color} rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                                    <dept.icon size={32} />
                                </div>
                                <h4 className="text-lg font-black text-gray-800 tracking-tight leading-tight flex-grow">{dept.label}</h4>
                                <p className="text-[11px] text-gray-400 font-bold uppercase mt-3 opacity-80 tracking-wide">{dept.desc}</p>
                            </motion.button>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div className="bg-white/50 p-6 rounded-[2rem] border border-primary/5 mt-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-tighter">সুরক্ষিত কার্যালয়</h5>
                                <p className="text-[9px] text-gray-400 uppercase font-bold opacity-60">ডাকটিক নিরাপত্তা দ্বারা নিয়ন্ত্রিত</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">v1.2.0 • Head Office Official</p>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeRoom === "records" && (
            <motion.div
              key="records-room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Boro Babu's Office Hero */}
              <div className="relative h-64 md:h-80 bg-[#e8e4d8] rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl">
                  <img 
                    src="https://i.ibb.co/0jCbnQDJ/dakghor-boro-babu-1.png" 
                    alt="Boro Babu Office" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-8 text-white space-y-1">
                      <div className="flex items-center gap-2 text-amber-400">
                          <Sparkle size={14} className="animate-pulse" />
                          <p className="text-[9px] font-black uppercase tracking-[0.3em]">প্রধান ডাকটিক কার্যালয়</p>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black font-serif tracking-tight">বড় বাবুর খাস কামরা</h3>
                      <p className="text-xs text-white/70 italic">"এখানে আপনার সকল সমস্যার সমাধান (গোপনে) করা হয়।"</p>
                  </div>
              </div>

              {/* Boro Babu's Desk Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                      { label: "আজকের নথি", value: "১২৪", icon: <FileText size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "চা বিরতি", value: "৩", icon: <Coffee size={18} />, color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "সিল মারা", value: "৮৯", icon: <CheckCircle2 size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "মেড ফাইল", value: "৪৫", icon: <Archive size={18} />, color: "text-purple-600", bg: "bg-purple-50" },
                  ].map((stat, i) => (
                      <div key={i} className="bg-white p-4 rounded-[2rem] border border-primary/5 shadow-sm flex items-center gap-3">
                          <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                              {stat.icon}
                          </div>
                          <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{stat.label}</p>
                              <p className="text-sm font-black text-gray-800">{stat.value}</p>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-primary/5 space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-sm font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-orange-500" /> আপনার নামে জমা নথি (Letters)
                  </h4>
                  <span className="text-[10px] font-black text-gray-400 uppercase">{letters.length} টি ফাইল পাওয়া গেছে</span>
                </div>

                  {loading ? (
                    <div className="text-center py-20 animate-pulse">
                      <RefreshCw className="w-10 h-10 text-gray-200 mx-auto animate-spin mb-4" />
                      <p className="text-xs text-gray-400 font-bold uppercase">নথি তল্লাশি করা হচ্ছে...</p>
                    </div>
                  ) : letters.length === 0 ? (
                    <div className="text-center py-20 space-y-6 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Archive className="w-10 h-10 text-gray-100" />
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-lg font-bold text-gray-400">কোন রেকর্ড পাওয়া যায়নি</h5>
                        <p className="text-xs text-gray-500 italic">এখানে আপনার আপাতত কোনো চিঠি আটকে নেই...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {letters.map((l) => (
                        <motion.div
                          key={l.id}
                          whileHover={{ y: -5 }}
                          className="bg-white p-6 rounded-[2rem] shadow-lg border border-primary/5 hover:border-primary/20 transition-all cursor-pointer group"
                          onClick={() => setSelectedLetter(l)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <AlertCircle size={24} />
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">ID: {l.id.slice(0, 8)}</p>
                              <div className="mt-1 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">মিস ডেলিভারি</div>
                            </div>
                          </div>
                          <h4 className="text-sm font-black text-gray-800 mb-2">ডাকটিক উদ্ধার প্রয়োজন</h4>
                          <p className="text-[11px] text-gray-500 leading-relaxed mb-6">চিঠিটি ২ বার ডেলিভারি ব্যর্থ হয়ে এখানে জমা হয়েছে। বড় বাবুর সাথে কথা বলে উদ্ধার করুন।</p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                              বিস্তারিত দেখুন <ChevronRight size={12} />
                            </span>
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Record Room Tips */}
                <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 flex items-center gap-6">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <Coffee size={24} />
                    </div>
                    <div className="space-y-1">
                        <h5 className="text-xs font-black text-amber-800 uppercase tracking-tight">রেকর্ড রুমের নিয়ম</h5>
                        <p className="text-[11px] text-amber-700/70 leading-relaxed italic">"এখানে ধৈর্য ও বিনয় কাজ দেয়। বড় বাবুকে চা-মিষ্টি খাওয়ালে নথিপত্র দ্রুত পাওয়া যায়।"</p>
                    </div>
                </div>
            </motion.div>
          )}

          {activeRoom === "dispatch" && (
            <motion.div
              key="dispatch-room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[500px] flex items-center justify-center p-4 md:p-8"
            >
              {/* Vintage Wooden Notice Board */}
              <div className="relative w-full max-w-4xl bg-[#3d251e] rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.6),inset_0_0_50px_rgba(0,0,0,0.5)] border-[16px] border-[#2c1a16] p-4 flex items-center justify-center overflow-hidden min-h-[550px]">
                {/* Enhanced Wood Texture */}
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.2) 42px, transparent 44px), repeating-linear-gradient(0deg, transparent, transparent 100px, rgba(255,255,255,0.05) 101px, transparent 102px)" }} />
                
                {/* The Paper - Pinned to the board */}
                <motion.div 
                  initial={{ rotate: -0.5, y: 10 }}
                  animate={{ rotate: 0, y: 0 }}
                  className="relative w-[90%] md:w-[85%] bg-[#f2e2ba] shadow-[4px_10px_30px_rgba(0,0,0,0.3)] p-8 md:p-16 flex flex-col items-center justify-center text-center space-y-10 border-b-2 border-r-2 border-black/5"
                >
                  {/* High Quality Paper Texture */}
                  <div className="absolute inset-0 opacity-60 paper-texture pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />
                  
                  {/* Subtle Coffee Stains / Aged Effect */}
                  <div className="absolute top-10 left-10 w-24 h-24 bg-[#8b4513]/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#8b4513]/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Thumbtacks - More realistic */}
                  <div className="absolute -top-2 left-1/4 -translate-x-1/2 w-6 h-6 bg-[#b91c1c] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)] border-b-4 border-black/20 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white/30 rounded-full" />
                  </div>
                  <div className="absolute -top-2 right-1/4 translate-x-1/2 w-6 h-6 bg-[#b91c1c] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)] border-b-4 border-black/20 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white/30 rounded-full" />
                  </div>
                  
                  {/* Content Container with overflow guard */}
                  <div className="relative z-10 w-full max-w-2xl overflow-visible">
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-4 text-red-900/40">
                          <div className="h-[2px] w-8 bg-current" />
                          <span className="text-[11px] font-black uppercase tracking-[0.5em]">
                            বিশেষ বিজ্ঞপ্তি
                          </span>
                          <div className="h-[2px] w-8 bg-current" />
                        </div>
                        <h3 className="text-4xl md:text-6xl font-black text-[#1a0f0d] font-serif leading-tight">
                          ডাকটিক
                        </h3>
                        <div className="flex justify-center">
                          <div className="h-1 w-24 bg-[#1a0f0d]/10 rounded-full" />
                        </div>
                      </div>
                      
                      <div className="space-y-8">
                        <p className="text-xl md:text-2xl text-[#2d1b18] font-bold leading-[1.6] italic tracking-tight px-2">
                          "এই ডিসপ্যাচ বিভাগের সংস্কার কাজ চলিতেছে। খুব শীঘ্রই ইহা সর্বসাধারণের ব্যবহারের জন্য উন্মুক্ত করা হইবে।"
                        </p>
                        
                        <div className="flex flex-col items-center pt-8 space-y-2 border-t border-[#1a0f0d]/5 w-48 mx-auto">
                          <p className="text-[11px] font-black text-[#1a0f0d]/50 uppercase tracking-[0.2em]">
                            আদেশক্রমে,
                          </p>
                          <div className="space-y-0.5">
                            <p className="text-lg font-black text-[#1a0f0d] uppercase tracking-widest font-serif">
                              বড় বাবু
                            </p>
                            <p className="text-[9px] font-bold text-[#1a0f0d]/40 uppercase tracking-tighter">
                              প্রধান ডাকটিক কার্যালয়
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Red Wax Seal - Positioned better */}
                  <div className="absolute -bottom-6 -right-6 md:bottom-8 md:right-8 transform rotate-12 filter drop-shadow-lg opacity-80 hover:opacity-100 transition-opacity">
                    <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-md">
                      <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 2" />
                      <text x="50" y="55" fontSize="12" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontWeight="bold" fontFamily="serif">OFFICIAL</text>
                      <path d="M30 50 Q50 20 70 50 Q50 80 30 50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    </svg>
                  </div>
                </motion.div>

                {/* Glassy Dust Overlay for realism */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          )}

          {activeRoom === "complaint" && (
            <motion.div
              key="complaint-room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-2 border-primary/5 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                      <MessageSquare className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-primary font-serif tracking-tight">
                        অভিযোগ কেন্দ্র
                      </h3>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                        আপনার সমস্যার কথা জানান
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitTicket} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                          অভিযোগের বিষয়
                        </label>
                        <input
                          type="text"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="সংক্ষেপে বলুন..."
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                          আপনার ইমেইল
                        </label>
                        <input
                          type="text"
                          disabled
                          value={user.email}
                          className="w-full bg-gray-100 border-2 border-transparent rounded-2xl p-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                        আপনার বিস্তারিত কথা
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="আপনার সমস্যাটি বিস্তারিত লিখুন যাতে বড় বাবু আপনাকে সাহায্য করতে পারেন..."
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-3xl p-6 text-sm font-bold transition-all outline-none resize-none"
                      />
                    </div>
                    <button
                      disabled={submittingTicket}
                      type="submit"
                      className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {submittingTicket ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      অভিযোগ জমা দিন
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-2 border-primary/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-primary font-serif flex items-center gap-3">
                      <HistoryIcon className="w-5 h-5" /> পূর্ববর্তী অভিযোগ
                    </h3>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {userTickets.length === 0 ? (
                      <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                          <HelpCircle className="w-8 h-8 text-gray-100" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          আপনার কোনো অভিযোগ নেই
                        </p>
                      </div>
                    ) : (
                      userTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border ${
                                ticket.status === "open"
                                  ? "bg-blue-100 text-blue-600 border-blue-200"
                                  : "bg-green-100 text-green-600 border-green-200"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-gray-800">
                              {ticket.subject}
                            </h4>
                            <p className="text-[10px] text-gray-400 line-clamp-2">
                              {ticket.message}
                            </p>
                          </div>
                          {ticket.adminReply && (
                            <div className="bg-primary/5 p-3 rounded-xl border-l-2 border-primary">
                              <p className="text-[9px] font-bold text-primary italic">
                                বড় বাবুর রিপ্লাই: "{ticket.adminReply}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const LedgerIconSVG = ({
  type,
  colorClass,
  highlight,
}: {
  type: string;
  colorClass?: string;
  highlight?: boolean;
}) => {
  const color = "currentColor";

  const icons: Record<string, React.ReactNode> = {
    inbox: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect
          x="10"
          y="30"
          width="80"
          height="50"
          rx="4"
          fill={color}
          opacity="0.2"
        />
        <path
          d="M10 35 L50 65 L90 35"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect
          x="10"
          y="30"
          width="80"
          height="50"
          rx="4"
          fill="none"
          stroke={color}
          strokeWidth="4"
        />
        <path
          d="M40 80 L60 80"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    ),
    baranda: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M20 90 V40 L50 20 L80 40 V90"
          fill="none"
          stroke={color}
          strokeWidth="4"
        />
        <rect
          x="40"
          y="55"
          width="20"
          height="35"
          fill="none"
          stroke={color}
          strokeWidth="3"
        />
        <circle cx="55" cy="72" r="2" fill={color} />
        <path d="M10 90 H90" stroke={color} strokeWidth="4" />
        <path d="M30 50 H70" stroke={color} strokeWidth="2" opacity="0.5" />
      </svg>
    ),
    "head-office": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M10 90 H90 V40 H75 V20 H25 V40 H10 Z"
          fill="none"
          stroke={color}
          strokeWidth="4"
        />
        <rect
          x="40"
          y="25"
          width="20"
          height="10"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <rect
          x="20"
          y="50"
          width="15"
          height="15"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <rect
          x="65"
          y="50"
          width="15"
          height="15"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <path
          d="M40 90 V70 H60 V90"
          fill="none"
          stroke={color}
          strokeWidth="3"
        />
      </svg>
    ),
    tracking: (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* Map outline */}
        <polygon points="15,25 40,15 60,25 85,15 85,75 60,85 40,75 15,85" />
        <path d="M40 15 V75" />
        <path d="M60 25 V85" />
        {/* Tracking path */ }
        <path d="M25 50 Q 50 30 75 55" strokeDasharray="4 6" strokeWidth="4" />
        <circle cx="75" cy="55" r="4" fill={color} />
        <circle cx="25" cy="50" r="4" fill={color} />
      </svg>
    ),
    stamps: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M20 20 H80 V80 H20 Z"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="4 4"
        />
        <rect x="30" y="30" width="40" height="40" fill={color} opacity="0.1" />
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <path d="M35 35 L45 45 M65 65 L55 55" stroke={color} strokeWidth="2" />
      </svg>
    ),
    "dead-letter": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect
          x="15"
          y="30"
          width="70"
          height="45"
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth="4"
        />
        <path
          d="M15 35 L50 60 L85 35"
          fill="none"
          stroke={color}
          strokeWidth="4"
        />
        <text
          x="50"
          y="85"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill={color}
        >
          ?
        </text>
      </svg>
    ),
  };

  return (
    <div
      className={`w-full h-full p-2 transition-transform duration-300 group-hover:scale-110`}
    >
      {icons[type] || icons["inbox"]}
    </div>
  );
};

const Dashboard = ({
  onNavigate,
  coins,
  user,
  inventory,
  officeStatus,
  allPostmen,
}: {
  onNavigate: (s: Screen) => void;
  coins: number;
  user: any;
  inventory: any[];
  officeStatus: any;
  allPostmen: any[];
}) => {
  const [stats, setStats] = useState({
    inbox: 0,
    tracking: 0,
    stamps: 0,
    dead: 0,
    baranda: 0,
    headOffice: 0,
    dakbarta: 0,
  });

  const [lastSeenDead, setLastSeenDead] = useState(() => {
    return parseInt(localStorage.getItem(`lastSeenDead_${user?.uid}`) || "0", 10);
  });

  useEffect(() => {
    if (!user) return;

    // Update stamps count from inventory
    const stampsCount = inventory.filter(
      (item) => item.category === "stamp",
    ).length;
    setStats((prev) => ({ ...prev, stamps: stampsCount }));

    // Notifications count (unread)
    const qNotif = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("isRead", "==", false),
    );
    const unsubNotif = onSnapshot(
      qNotif,
      (snapshot) => {
        setStats((prev) => ({ ...prev, dakbarta: snapshot.docs.length }));
      },
      (error) =>
        handleFirestoreError(error, OperationType.LIST, "notifications"),
    );

    // Inbox count (only delivered)
    const qInbox = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      where("deliveryStatus", "==", "delivered"),
    );
    const unsubInbox = onSnapshot(
      qInbox,
      (snapshot) => {
        setStats((prev) => ({ ...prev, inbox: snapshot.docs.length }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    // Baranda count
    const qBaranda = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      where("deliveryStatus", "==", "at-veranda"),
    );
    const unsubBaranda = onSnapshot(
      qBaranda,
      (snapshot) => {
        setStats((prev) => ({ ...prev, baranda: snapshot.docs.length }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    // Head Office count
    const qHeadOffice = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      where("deliveryStatus", "==", "at-head-office"),
    );
    const unsubHeadOffice = onSnapshot(
      qHeadOffice,
      (snapshot) => {
        setStats((prev) => ({ ...prev, headOffice: snapshot.docs.length }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    // Tracking count
    const qTrack = query(
      collection(db, "letters"),
      where("senderUid", "==", user.uid),
    );
    const unsubTrack = onSnapshot(
      qTrack,
      (snapshot) => {
        const inTransit = snapshot.docs.filter((doc) => {
          const data = doc.data();
          return (
            data.deliveryStatus !== "delivered" &&
            data.deliveryStatus !== "dead-letter" &&
            data.status === "sent"
          );
        });
        setStats((prev) => ({ ...prev, tracking: inTransit.length }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    // Dead count
    const qDead = query(
      collection(db, "letters"),
      where("senderUid", "==", user.uid),
      where("deliveryStatus", "==", "dead-letter"),
    );
    const unsubDead = onSnapshot(
      qDead,
      (snapshot) => {
        setStats((prev) => ({ ...prev, dead: snapshot.docs.length }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    return () => {
      unsubNotif();
      unsubInbox();
      unsubBaranda();
      unsubHeadOffice();
      unsubTrack();
      unsubDead();
    };
  }, [user]);

  return (
    <div className="bg-background text-on-surface min-h-screen pb-32 paper-texture">
      {/* TopAppBar - Head Office Style */}
      <header className="bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 border-b border-primary/10 shadow-sm">
        <div className="absolute bottom-0 left-0 w-full h-1 postal-stripes opacity-30" />
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate("profile")}
            className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-lg cursor-pointer"
          >
            {user?.photoURL ? (
              <img
                className="w-full h-full object-cover"
                src={user.photoURL}
                alt="User"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                <UserIcon className="text-primary w-6 h-6" />
              </div>
            )}
          </motion.button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-serif text-primary text-xl font-black tracking-tight leading-none">
                ডাকটিক
              </h1>
              <p className="text-[9px] text-gray-400 mt-1 font-black uppercase tracking-[0.2em] inline-flex items-center gap-1">
                {user?.village || "অজানা গ্রাম"} •{" "}
                <span className="bn-number">{user?.postcode ? toBengaliDigits(user.postcode) : "----"}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded-lg border border-primary/5 shadow-sm">
             <div className={`w-1.5 h-1.5 rounded-full ${officeStatus.label.includes("খোলা") ? "bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" : "bg-red-500"}`} />
             <span className={`text-[8px] font-black uppercase tracking-widest ${officeStatus.label.includes("খোলা") ? "text-green-700" : "text-red-700"}`}>
               {officeStatus.label.split(" (")[0]}
             </span>
          </div>

          <button
            onClick={() => {
              vintageAudio.playClick();
              onNavigate("notifications");
            }}
            className="relative p-1.5 bg-white rounded-xl border border-primary/10 shadow-sm hover:scale-105 transition-all active:scale-95"
          >
            <Bell className="w-4 h-4 text-primary" />
            {stats.dakbarta > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                {stats.dakbarta > 9
                  ? "9+"
                  : toBengaliDigits(stats.dakbarta)}
              </span>
            )}
          </button>
          <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-xl border border-primary/10 shadow-sm">
            <Coins className="text-primary w-3 h-3" />
            <span className="text-primary font-black text-[10px] bn-number">
              ৳ {toBengaliDigits(coins)}
            </span>
          </div>
        </div>
      </header>

      <main className="mt-2 space-y-8">
        
        {/* Hero Section - Immersive Dakthik View */}
        <section className="relative h-[260px] w-full px-4">
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
            <div className="absolute inset-0">
              <LivePostOfficeScene />
            </div>
          </div>
        </section>

        {/* Daily Ledger - Bento Style */}
        <section className="px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-primary font-serif tracking-tight">
                দৈনিক খতিয়ান
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                আপনার ডাকটিকের বর্তমান অবস্থা
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                id: "inbox",
                label: "আপনার ইনবক্স",
                value: stats.inbox,
                bgClass: "bg-primary",
                onClick: () => onNavigate("inbox"),
                bentoClass: "col-span-2 md:col-span-4 h-32 md:h-40",
                pattern: "postal-stripes opacity-20",
              },
              {
                id: "baranda",
                label: "বারান্দায়",
                value: stats.baranda,
                bgClass: "bg-secondary",
                onClick: () => onNavigate("baranda"),
                highlight: stats.baranda > 0,
                bentoClass: "col-span-1 aspect-square md:aspect-auto md:h-32",
              },
              {
                id: "head-office",
                label: "হেড অফিস",
                value: stats.headOffice,
                bgClass: "bg-tertiary",
                onClick: () => onNavigate("head-office"),
                highlight: stats.headOffice > 0,
                bentoClass: "col-span-1 aspect-square md:aspect-auto md:h-32",
              },
              {
                id: "track",
                label: "খোঁজখবর",
                value: stats.tracking,
                bgClass: "bg-amber-600",
                onClick: () => onNavigate("track"),
                bentoClass: "col-span-1 aspect-square md:aspect-auto md:h-32",
              },
              {
                id: "dead-letter",
                label: "ডেড লেটার",
                value: stats.dead,
                bgClass: "bg-red-800",
                onClick: () => {
                  localStorage.setItem(`lastSeenDead_${user?.uid}`, stats.dead.toString());
                  setLastSeenDead(stats.dead);
                  onNavigate("dead-letter");
                },
                bentoClass: "col-span-1 aspect-square md:aspect-auto md:h-32",
                highlight: stats.dead > lastSeenDead,
              },
            ].map((stat) => (
              <motion.div
                key={stat.id}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={stat.onClick}
                className={`group ${stat.bgClass} ${stat.bentoClass} rounded-[1.5rem] p-4 text-white relative overflow-hidden shadow-md cursor-pointer flex flex-col gap-3 items-center justify-center text-center transition-all retro-bevel`}
              >
                {stat.pattern && (
                  <div className={`absolute inset-0 ${stat.pattern}`} />
                )}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform blur-lg" />

                <div
                  className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-[0.8rem] bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:scale-110 transition-transform relative z-10 ${stat.highlight ? 'animate-bounce shadow-lg shadow-white/30 text-yellow-200' : ''}`}
                >
                  <LedgerIconSVG
                    type={stat.id}
                  />
                </div>

                <div className="space-y-0.5 relative z-10 w-full shrink-0">
                  <span
                    className={`text-2xl md:text-3xl font-serif font-black block leading-none bn-number text-white`}
                  >
                    {toBengaliDigits(stat.value.toString().padStart(2, "0"))}
                  </span>
                  <span className={`text-[9px] md:text-[10px] font-black text-white/90 uppercase tracking-widest block pt-0.5`}>
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Services Section - Bento Grid */}
        <section className="px-6 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-secondary rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-secondary/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-secondary font-serif tracking-tight">
                সেবাসমূহ
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                আমাদের বিশেষ সুবিধাসমূহ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Sent Letters - Large Card */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("sent-letters")}
              className="col-span-2 bg-primary p-5 rounded-[1.2rem] shadow-xl flex flex-col items-start justify-between text-left group relative overflow-hidden h-36 retro-bevel cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-full h-2 postal-stripes opacity-20" />
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
              <div className="absolute -bottom-6 -right-6 text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-700">
                  <Send size={150} />
              </div>
              <div className="absolute top-4 right-4 opacity-10">
                 <Sparkle size={40} className="animate-pulse" />
              </div>

              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-[0.8rem] flex items-center justify-center text-white border border-white/30">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white font-serif">
                  পাঠানো চিঠি
                </h4>
                <p className="text-white/70 text-[9px] font-bold mt-0.5">
                  আপনার পাঠানো সব চিঠির ইতিহাস দেখুন
                </p>
              </div>
            </motion.div>

            {/* Tracking - Square Card */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("track")}
              className="col-span-1 bg-secondary p-4 rounded-[1.2rem] shadow-md hover:shadow-lg flex flex-col items-start justify-between text-left group h-36 relative overflow-hidden cursor-pointer"
            >
               <div className="absolute -top-2 -right-2 text-white/5 opacity-40 group-hover:rotate-12 transition-transform duration-500">
                  <MapPin size={80} />
               </div>
               <div className="absolute bottom-2 left-2 opacity-10">
                 <Sparkle size={16} />
               </div>
               <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-[0.7rem] border border-white/30 flex items-center justify-center text-white">
                  <MapPin className="w-4 h-4" />
               </div>
               <div>
                   <h4 className="text-sm font-black text-white font-serif">ট্র্যাকিং</h4>
                   <p className="text-white/70 text-[8px] uppercase font-black tracking-widest mt-0.5">চিঠির অবস্থান</p>
               </div>
            </motion.div>

            {/* My Basket - Square Card */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("sodapati")}
              className="col-span-1 bg-tertiary p-4 rounded-[1.2rem] shadow-md hover:shadow-lg flex flex-col items-start justify-between text-left group h-36 relative overflow-hidden cursor-pointer"
            >
               <div className="absolute -bottom-4 -right-4 text-black/5 group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag size={80} />
               </div>
               <div className="absolute top-2 left-2 opacity-10">
                 <Sparkle size={16} />
               </div>
               <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-[0.7rem] border border-white/30 flex items-center justify-center text-white">
                  <ShoppingBag className="w-4 h-4" />
               </div>
               <div>
                   <h4 className="text-sm font-black text-white font-serif leading-tight">আমার ঝুলি</h4>
                   <p className="text-white/70 text-[8px] uppercase font-black tracking-widest mt-0.5">ব্যবহারযোগ্য সামগ্রী</p>
               </div>
            </motion.div>

            {/* Money Order - Wide Card */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("money-order")}
              className="col-span-2 bg-primary/90 p-4 rounded-[1.2rem] shadow-md flex items-center justify-between group h-20 relative overflow-hidden cursor-pointer"
            >
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10" />
               <div className="absolute -right-8 -top-8 text-white/5 opacity-30 rotate-12">
                   <Coins size={100} />
               </div>
               <div className="flex items-center gap-4 relative z-10">
                   <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-[0.8rem] border border-white/20 flex items-center justify-center text-white">
                      <Coins className="w-5 h-5" />
                   </div>
                   <div className="text-left">
                      <h4 className="text-sm font-black text-white font-serif">মানি অর্ডার</h4>
                      <p className="text-[8px] text-white/50 font-black uppercase tracking-widest mt-0.5">টাকা পাঠানো ও গ্রহণ</p>
                   </div>
               </div>
               <ArrowRight className="w-4 h-4 text-white/50 group-hover:translate-x-2 transition-transform relative z-10" />
            </motion.div>

            {/* Savings - Wide Card */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("savings")}
              className="col-span-2 bg-secondary p-4 rounded-[1.2rem] shadow-md flex items-center justify-between group h-20 relative overflow-hidden retro-bevel cursor-pointer"
            >
              <div className="absolute top-0 left-0 w-full h-1 postal-stripes opacity-20 z-0" />
              <div className="absolute -left-10 -bottom-10 text-white/5 rotate-45">
                  <Wallet size={100} />
              </div>
              <div className="absolute top-2 right-4 opacity-10">
                 <Sparkle size={12} />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-[0.8rem] flex items-center justify-center text-white shadow-inner">
                    <Wallet className="w-5 h-5" />
                 </div>
                 <div className="text-left">
                    <h4 className="text-sm font-black text-white font-serif">সেভিংস অ্যাকাউন্ট</h4>
                    <p className="text-[8px] text-white/50 font-black uppercase tracking-widest mt-0.5">আপনার সঞ্চয় ও লাভ</p>
                 </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/50 group-hover:translate-x-2 transition-transform relative z-10" />
            </motion.div>
          </div>
        </section>

        {/* Footer Spacer */}
        <div className="h-12"></div>
      </main>
    </div>
  );
};

const WriteLetter = ({
  onBack,
  onNext,
  inventory,
  user,
  allPostmen,
  globalConfig,
}: {
  onBack: () => void;
  onNext: (letter: Partial<Letter>) => void;
  inventory: any[];
  user: any;
  allPostmen: any[];
  globalConfig?: any;
}) => {
  const draftKey = `letter_draft_${user?.uid || "guest"}`;

  const [inkColor, setInkColor] = useState<InkColor>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.inkColor || "#2563eb";
      } catch (e) {
        return "#2563eb";
      }
    }
    return "#2563eb";
  });
  const [paperType, setPaperType] = useState<PaperType>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.paperType || "old";
      } catch (e) {
        return "old";
      }
    }
    return "old";
  });
  const [fontFamily, setFontFamily] = useState<HandwritingFont>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.fontFamily || "serif";
      } catch (e) {
        return "serif";
      }
    }
    return "serif";
  });

  // 4 distinct letter parts
  const [datePlace, setDatePlace] = useState(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.datePlace || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });
  const [greeting, setGreeting] = useState(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.greeting || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });
  const [bodyPages, setBodyPages] = useState<string[]>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.bodyPages) return parsed.bodyPages;
        if (parsed.body) return [parsed.body];
        return [""];
      } catch (e) {
        return [""];
      }
    }
    return [""];
  });
  const [closing, setClosing] = useState(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.closing || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  });

  const [scent, setScent] = useState<string | null>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.scent || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [gift, setGift] = useState<string | null>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.gift || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [penSize, setPenSize] = useState<number>(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.penSize || 2;
      } catch (e) {
        return 2;
      }
    }
    return 2;
  });
  const [activeTab, setActiveTab] = useState<
    "paper" | "ink" | "font" | "scent" | "gift"
  >("paper");
  const [isZoomed, setIsZoomed] = useState(false);
  const [showAuthenticityNudge, setShowAuthenticityNudge] = useState(false);

  const handlePaste = (e: React.ClipboardEvent) => {
    // Detect paste and show nudge
    setShowAuthenticityNudge(true);
    setTimeout(() => setShowAuthenticityNudge(false), 5000);
  };

  const purchasedPages = inventory.filter((item) => item.category === "page");
  
  const basePapers = [
    { id: "old", label: "পুরানো কাগজ", color: "#e0d5b8" },
    { id: "postcard", label: "পোস্টকার্ড", color: "#fff9f0" },
    { id: "inland", label: "ইনল্যান্ড", color: "#f0f7ff" },
  ];
  let customPapersArr = [...basePapers];
  if (globalConfig?.customPapers?.length) {
    customPapersArr = [...customPapersArr, ...globalConfig.customPapers];
  }
  const papers = customPapersArr.filter(p => !globalConfig?.disabledItems?.includes(p.id));

  const allPapers = [
    ...papers,
    ...purchasedPages.map((p) => ({
      ...p,
      id: p.id,
      label: p.name,
      color: p.color || "#ffffff",
      premium: true,
    })),
  ].filter(p => !globalConfig?.disabledItems?.includes(p.id));

  useLockBodyScroll(isZoomed);

  // Save draft on change
  useEffect(() => {
    const draft = {
      datePlace,
      greeting,
      bodyPages,
      closing,
      paperType,
      inkColor,
      fontFamily,
      penSize,
      scent,
      gift,
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [
    datePlace,
    greeting,
    bodyPages,
    closing,
    paperType,
    inkColor,
    fontFamily,
    penSize,
    scent,
    gift,
    draftKey,
  ]);

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handlePageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    const text = e.target.value;
    const target = e.target;

    // Check if content overflows the visible area within the fixed-height A4 page
    if (target.scrollHeight > target.clientHeight + 2) {
      const words = text.split(/(\s+)/);
      let keepText = "";
      let moveText = "";

      // Find the split point where it no longer overflows
      const originalValue = target.value;
      let i = words.length;
      while (i > 0) {
        const test = words.slice(0, i).join("");
        target.value = test;
        if (target.scrollHeight <= target.clientHeight + 2) {
          keepText = test;
          moveText = words.slice(i).join("");
          break;
        }
        i--;
      }
      
      // If no valid split point found (a single very long word?), just use original char-based limit as fallback
      if (i === 0) {
        target.value = originalValue;
        const fallbackLimit = index === 0 ? 1200 : 1800;
        keepText = text.substring(0, fallbackLimit);
        moveText = text.substring(fallbackLimit);
      }

      const newPages = [...bodyPages];
      newPages[index] = keepText.trimEnd();
      
      if (newPages[index + 1] !== undefined) {
        newPages[index + 1] = moveText.trimStart() + (moveText && newPages[index + 1] ? " " : "") + newPages[index + 1];
      } else {
        newPages.push(moveText.trimStart());
      }
      
      setBodyPages(newPages);

      // Focus on the next page
      setTimeout(() => {
        const nextInput = document.getElementById(`page-${index + 1}`) as HTMLTextAreaElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(0, 0);
        }
      }, 0);
      return;
    }

    const newPages = [...bodyPages];
    newPages[index] = text;
    setBodyPages(newPages);
  };

  const rules = [
    {
      id: "date",
      label: "স্থান ও তারিখ লিখুন",
      check: () => datePlace.trim().length > 0,
    },
    {
      id: "greeting",
      label: "সম্বোধন লিখুন (যেমন: প্রিয় বন্ধু,)",
      check: () => greeting.trim().length > 0,
    },
    {
      id: "body",
      label: "মূল বক্তব্য লিখুন (অন্তত ২০ অক্ষর)",
      check: () => bodyPages.join("").trim().length >= 20,
    },
    {
      id: "closing",
      label: "বিদায়/ইতি লিখুন",
      check: () => closing.trim().length > 0,
    },
  ];

  const isValid = rules.every((r) => r.check());

  const baseFonts = [
    { id: "serif", label: "ডাকটিক ১", family: "Noto Serif Bengali" },
    { id: "sans", label: "ডাকটিক ২", family: "Hind Siliguri" },
    { id: "handwriting", label: "ডাকটিক ৩", family: "Atma" },
    { id: "fancy", label: "ডাকটিক ৪", family: "Fancy Handwriting" },
    {
      id: "poushali",
      label: "ডাকটিক ৫",
      family: "Imam Poushali Unicode",
    },
    {
      id: "poushali-italic",
      label: "ডাকটিক ৬",
      family: "Imam Poushali Unicode Italic",
    },
    {
      id: "priyotoma",
      label: "ডাকটিক ৭",
      family: "FN Hasan Priyotoma Unicode",
    },
    {
      id: "priyotoma-italic",
      label: "ডাকটিক ৮",
      family: "FN Hasan Priyotoma Unicode Italic",
    },
    { id: "himu", label: "ডাকটিক ৯", family: "FN Himu Regular" },
    { id: "himu-italic", label: "ডাকটিক ১০", family: "FN Himu Italic" },
  ];
  let customFontsArr = [...baseFonts];
  if (globalConfig?.customFonts?.length) {
    customFontsArr = [...customFontsArr, ...globalConfig.customFonts];
  }
  const fonts = customFontsArr.filter(f => !globalConfig?.disabledItems?.includes(f.id));

  let availableScents = [...SCENTS];
  if (globalConfig?.customScents?.length) {
      availableScents = [...availableScents, ...globalConfig.customScents];
  }
  availableScents = availableScents.filter(s => !globalConfig?.disabledItems?.includes(s.id));

  let availableGifts = [...GIFTS];
  if (globalConfig?.customGifts?.length) {
      availableGifts = [...availableGifts, ...globalConfig.customGifts];
  }
  availableGifts = availableGifts.filter(g => !globalConfig?.disabledItems?.includes(g.id));

  const renderPaperContent = (zoomed = false) => {
    const selectedPaper = (allPapers.find((p) => p.id === paperType) ||
      allPapers[0]) as any;

    return (
      <div className="flex flex-col gap-8 w-full">
        {bodyPages.map((pageText, index) => (
          <div
            key={index}
            className={`relative p-0 overflow-hidden shadow-xl transition-all duration-500 flex flex-col mx-auto ${zoomed ? "w-full max-w-[800px] aspect-[210/297] rounded-md" : "w-full max-w-[210mm] aspect-[210/297] rounded-sm"} ${
              selectedPaper.color?.startsWith("bg-") ? selectedPaper.color : ""
            } ${selectedPaper.border || ""}`}
            style={
              !selectedPaper.color?.startsWith("bg-") && !selectedPaper.image
                ? { backgroundColor: selectedPaper.color }
                : {}
            }
          >
            {/* Paper Image Background */}
            {selectedPaper.image && (
              <img
                src={selectedPaper.image}
                alt="Paper Background"
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Paper Texture */}
            {(selectedPaper.texture === "parchment" ||
              selectedPaper.id === "old" ||
              selectedPaper.id === "royal") && (
              <div className="absolute inset-0 pointer-events-none opacity-15 paper-texture z-0" />
            )}

            {/* Delete Page Button */}
            {index > 0 && (
              <button
                onClick={() => {
                  const newPages = [...bodyPages];
                  newPages.splice(index, 1);
                  setBodyPages(newPages);
                }}
                className="absolute top-4 right-4 p-2 bg-red-50/80 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors z-50 opacity-50 hover:opacity-100 backdrop-blur-sm"
                title="পৃষ্ঠা মুছুন"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Paper Lines */}
            {(paperType === "ruled" || selectedPaper.lines) && (
              <div
                className={`absolute inset-0 pointer-events-none z-0 opacity-20`}
                style={{
                  backgroundImage: `linear-gradient(#4a90e2 1px, transparent 1px)`,
                  backgroundSize: `100% ${zoomed ? "1.5rem" : "1.25rem"}`,
                  marginTop: zoomed ? "4rem" : "3rem",
                }}
              />
            )}

            {/* Dot Pattern */}
            {selectedPaper.pattern === "dots" && (
              <div
                className="absolute inset-0 pointer-events-none z-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                  backgroundSize: zoomed ? "24px 24px" : "20px 20px",
                  marginTop: zoomed ? "4rem" : "3rem",
                }}
              />
            )}

            {((paperType as string) === "royal" ||
              (paperType as string) === "pg2" ||
              (paperType as string) === "pg3" ||
              (paperType as string) === "old") && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.15] z-0" 
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
              />
            )}

            {/* Subtle Watermark and Creases */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] rotate-[-20deg]">
                <div className="border-[12px] border-amber-900 rounded-full p-8 md:p-12 flex flex-col items-center justify-center">
                  <p className="text-5xl md:text-7xl font-serif font-black uppercase tracking-widest text-amber-900">
                    ডাকটিক
                  </p>
                  <p className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-widest mt-2 text-amber-900">
                    বাংলাদেশ
                  </p>
                </div>
              </div>
            </div>

            {scent && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.3, 0.3, 0],
                    scale: [1, 1.1],
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`absolute inset-0 bg-gradient-to-br ${
                    scent === 'rose' ? 'from-red-200/30' : 
                    scent === 'attar' ? 'from-green-200/30' : 
                    scent === 'jasmine' ? 'from-yellow-100/30' :
                    scent === 'rain' ? 'from-blue-200/30' :
                    'from-purple-200/30'
                  } via-transparent to-transparent blur-2xl`}
                />
                
                {/* Subtle floating particles in preview */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      x: `${Math.random() * 100}%`, 
                      y: '100%' 
                    }}
                    animate={{ 
                      opacity: [0, 0.6, 0],
                      y: ['100%', '20%'],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 4 + Math.random() * 2, 
                      repeat: Infinity,
                      delay: Math.random() * 4,
                    }}
                    className={`absolute w-1 h-1 rounded-full ${
                      scent === 'rose' ? 'bg-red-300/40' : 
                      scent === 'attar' ? 'bg-green-300/40' : 
                      scent === 'jasmine' ? 'bg-yellow-200/40' :
                      scent === 'rain' ? 'bg-blue-300/40' :
                      'bg-purple-300/40'
                    }`}
                  />
                ))}
              </div>
            )}

            <div
              className={`absolute inset-0 z-30 flex flex-col ${zoomed ? "px-[10%] py-[12%] text-[14px] leading-[1.5rem]" : "px-[8%] py-[10%] text-[clamp(10px,2.5vw,14px)] leading-[1.25rem]"}`}
              style={{
                color: inkColor,
                fontWeight: penSize === 1 ? 300 : penSize === 2 ? 400 : penSize === 3 ? 600 : penSize === 4 ? 700 : 900,
                fontSize: zoomed 
                  ? `${14 + (penSize - 2) * 2}px` 
                  : `clamp(${8 + (penSize - 2)}px, ${2.5 + (penSize - 2) * 0.5}vw, ${16 + (penSize - 2) * 2}px)`,
                lineHeight: zoomed
                  ? `${1.5 + (penSize - 2) * 0.2}rem`
                  : `${1.25 + (penSize - 2) * 0.15}rem`,
                fontFamily:
                  fontFamily === "handwriting"
                    ? "Atma"
                    : fontFamily === "serif"
                      ? "Noto Serif Bengali"
                      : fontFamily === "sans"
                        ? "Hind Siliguri"
                        : fontFamily === "fancy"
                          ? "Fancy Handwriting"
                          : fontFamily === "poushali"
                            ? "Imam Poushali Unicode"
                            : fontFamily === "poushali-italic"
                              ? "Imam Poushali Unicode Italic"
                              : fontFamily === "priyotoma"
                                ? "FN Hasan Priyotoma Unicode"
                                : fontFamily === "priyotoma-italic"
                                  ? "FN Hasan Priyotoma Unicode Italic"
                                  : fontFamily === "himu"
                                    ? "FN Himu Regular"
                                    : fontFamily === "himu-italic"
                                      ? "FN Himu Italic"
                                      : fontFamily === "bijoy2003"
                                        ? "Imam Poushali Bijoy 2003"
                                        : fontFamily === "bijoy2003-italic"
                                          ? "Imam Poushali Bijoy 2003 Italic"
                                          : fontFamily === "bijoy52"
                                            ? "Imam Poushali Bijoy52"
                                            : fontFamily === "bijoy52-italic"
                                              ? "Imam Poushali Bijoy52 Italic"
                                              : "Noto Serif Bengali",
              }}
            >
              {index === 0 && (
                <>
                  <textarea
                    value={datePlace || ""}
                    onPaste={handlePaste}
                    onChange={(e) => {
                      setDatePlace(e.target.value);
                      handleAutoResize(e);
                    }}
                    placeholder="১২ জুন ১৯৯৬&#10;ঢাকা"
                    className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none p-0 overflow-hidden text-right shadow-none ring-0 appearance-none"
                    rows={2}
                  />

                  <textarea
                    value={greeting || ""}
                    onPaste={handlePaste}
                    onChange={(e) => {
                      setGreeting(e.target.value);
                      handleAutoResize(e);
                    }}
                    placeholder="প্রিয় বন্ধু,"
                    className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none p-0 overflow-hidden mt-4 md:mt-6 shadow-none ring-0 appearance-none"
                    rows={1}
                  />
                </>
              )}

              <textarea
                id={`page-${index}`}
                onPaste={handlePaste}
                value={pageText || ""}
                onChange={(e) => handlePageChange(e, index)}
                placeholder={
                  index === 0
                    ? "আমি আশা করি তুমি ভালো আছো..."
                    : "পরবর্তী পৃষ্ঠা..."
                }
                className="w-full flex-1 bg-transparent border-none focus:ring-0 outline-none resize-none p-0 mt-2 md:mt-4 overflow-hidden no-scrollbar shadow-none ring-0 appearance-none"
              />

              {index === bodyPages.length - 1 && (
                  <textarea
                    value={closing || ""}
                    onPaste={handlePaste}
                    onChange={(e) => {
                      setClosing(e.target.value);
                      handleAutoResize(e);
                    }}
                    placeholder="তোমার বন্ধু,&#10;তামিম"
                    className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none p-0 overflow-hidden mt-6 md:mt-8 text-right shadow-none ring-0 appearance-none"
                    rows={2}
                  />
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-center gap-4 mt-2 mb-8">
          {bodyPages.length > 1 && (
            <button
              onClick={() => setBodyPages(bodyPages.slice(0, -1))}
              className="flex items-center gap-2 px-6 py-3 bg-red-50/80 backdrop-blur-sm text-red-600 rounded-full font-bold shadow-md hover:bg-red-100 transition-all border border-red-100"
            >
              <X className="w-5 h-5" />
              <span>শেষ পৃষ্ঠা মুছুন</span>
            </button>
          )}
          <button
            onClick={() => setBodyPages([...bodyPages, ""])}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-primary rounded-full font-bold shadow-md hover:bg-white transition-all border border-primary/10"
          >
            <Plus className="w-5 h-5" />
            <span>নতুন পৃষ্ঠা যোগ করুন</span>
          </button>
        </div>

        {!zoomed && (
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 p-2 md:p-3 bg-black/5 hover:bg-black/10 rounded-full transition-all z-50 group"
          >
            <Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#f8f5ee] min-h-screen pb-24 relative selection:bg-amber-900/20">
      {/* Premium Vintage Background Texture */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-amber-900/5 to-transparent" />

      {/* Header */}
      <div className="p-4 md:p-5 flex items-center justify-between bg-[#fcf9f2] border-b border-[#e6decf] relative z-50 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)]">
        <button
          onClick={onBack}
          className="p-2.5 bg-white border border-[#e6decf] hover:bg-amber-50 text-amber-900 rounded-full transition-all active:scale-90 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-amber-950 tracking-tight">
            চিঠি লিখুন
          </h2>
          <span className="text-[10px] md:text-xs text-amber-900/60 font-medium uppercase tracking-widest mt-0.5">A4 সাইজ</span>
        </div>
        <div className="w-10 md:w-11" />
      </div>

      {/* Tabs */}
      <div className="bg-[#fcf9f2]/90 backdrop-blur-md flex overflow-x-auto no-scrollbar relative z-50 px-3 md:px-6 py-3 border-b border-[#e6decf] gap-2 md:gap-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.02)]">
        {[
          { id: "paper", icon: <Ticket className="w-4 h-4 md:w-5 md:h-5" />, label: "কাগজ" },
          { id: "ink", icon: <PenLine className="w-4 h-4 md:w-5 md:h-5" />, label: "কালি" },
          { id: "font", icon: <Type className="w-4 h-4 md:w-5 md:h-5" />, label: "ফন্ট" },
          {
            id: "scent",
            icon: <Sparkles className="w-4 h-4 md:w-5 md:h-5" />,
            label: "সুগন্ধি",
          },
          { id: "gift", icon: <Gift className="w-4 h-4 md:w-5 md:h-5" />, label: "উপহার" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[72px] md:min-w-[90px] flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all relative ${
              activeTab === tab.id 
                ? "bg-amber-100/50 text-amber-950 shadow-sm border border-amber-200/50" 
                : "text-amber-900/50 hover:bg-[#f3ead7] hover:text-amber-900/80"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] md:text-xs font-bold tracking-wider">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content (Selection Area) */}
      <div className="bg-[#fcf9f2]/80 backdrop-blur-md p-4 md:p-6 min-h-[140px] md:min-h-[160px] flex items-center border-b border-[#e6decf] relative z-50 shadow-inner">
        <AnimatePresence mode="wait">
          {activeTab === "paper" && (
            <motion.div
              key="paper"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex gap-6 overflow-x-auto no-scrollbar w-full py-2 px-2"
            >
              {allPapers.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setPaperType(p.id as PaperType)}
                  className="flex-shrink-0 flex flex-col items-center gap-3 group"
                >
                  <div
                    className={`transition-all ${paperType === p.id ? "scale-110 ring-4 ring-primary/10" : "opacity-70 grayscale-[0.3]"}`}
                  >
                    <PageVisual item={p} className="w-20 h-24" />
                  </div>
                  <span
                    className={`text-[11px] font-bold tracking-wide ${paperType === p.id ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    {p.label}
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === "ink" && (
            <motion.div
              key="ink"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full space-y-8"
            >
              {/* Color Grid */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center px-4">
                  কালি নির্বাচন করুন
                </span>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-2">
                  {[
                    "#000000", // Black
                    "#2563eb", // Royal Blue
                    "#dc2626", // Red
                    "#16a34a", // Green
                    "#ffffff", // White
                    "#facc15", // Bright Yellow
                    "#f472b6", // Bright Pink
                    "#22d3ee", // Cyan
                    "#fb923c", // Orange
                    "#a855f7", // Purple
                    "#1b4332", // Forest
                    "#8d1c1c", // Maroon
                    "#1e3a8a", // Midnight
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setInkColor(color)}
                      className={`w-10 h-10 rounded-full shrink-0 border-2 transition-all active:scale-90 ${
                        inkColor === color 
                          ? "border-primary scale-110 shadow-lg ring-4 ring-primary/10" 
                          : "border-gray-100 opacity-80"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Pen Size Selection */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center px-4">
                  কলমের সাইজ (নিব)
                </span>
                <div className="flex justify-center items-center gap-6 px-4">
                  {[1, 2, 3, 4, 5].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPenSize(size)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div 
                        className={`transition-all rounded-full flex items-center justify-center ${
                          penSize === size 
                            ? "bg-primary text-white scale-110 shadow-md ring-4 ring-primary/5" 
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                        style={{ 
                          width: `${24 + size * 4}px`, 
                          height: `${24 + size * 4}px` 
                        }}
                      >
                        <Dot 
                          className="shrink-0" 
                          style={{ 
                            width: `${8 + size * 3}px`, 
                            height: `${8 + size * 3}px` 
                          }} 
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${penSize === size ? "text-primary" : "text-gray-400"}`}>
                        {size === 1 ? "চিকন" : size === 5 ? "মোটা" : `লেভেল ${size}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "font" && (
            <motion.div
              key="font"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-5 overflow-x-auto no-scrollbar w-full py-2 px-2"
            >
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id as HandwritingFont)}
                  className={`flex-shrink-0 px-6 h-16 rounded-2xl border-2 transition-all flex items-center justify-center bg-white/50 ${fontFamily === f.id ? "border-primary bg-white shadow-xl scale-110 ring-4 ring-primary/5" : "border-transparent opacity-60"}`}
                >
                  <span
                    className="text-base font-bold text-on-surface"
                    style={{ fontFamily: f.family }}
                  >
                    {f.label}
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === "scent" && (
            <motion.div
              key="scent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex gap-4 overflow-x-auto no-scrollbar w-full py-2 px-2"
            >
              <button
                onClick={() => setScent(null)}
                className={`flex-shrink-0 px-6 h-24 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!scent ? "bg-gray-100 text-gray-300 pointer-events-none" : "bg-white/50 text-primary border-2 border-transparent hover:border-primary/20"}`}
              >
                মুছুন
              </button>
              {SCENTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setScent(s.id);
                    // Add a mist effect trigger here if needed
                  }}
                  className={`flex-shrink-0 w-36 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2 relative overflow-hidden ${scent === s.id ? `border-primary shadow-xl scale-105 ${s.color}` : "bg-white/50 border-transparent opacity-70 hover:opacity-100"}`}
                >
                  {scent === s.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 2, opacity: [0, 0.2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full ${s.id === 'rose' ? 'bg-red-400/20' : s.id === 'attar' ? 'bg-green-400/20' : 'bg-primary/20'}`}
                    />
                  )}
                  <span className="text-2xl z-10">{s.icon}</span>
                  <span className="text-[11px] font-bold z-10">{s.label}</span>
                  <span className="text-[8px] opacity-50 z-10 px-2 text-center leading-tight">{s.description}</span>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === "gift" && (
            <motion.div
              key="gift"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-3 overflow-x-auto no-scrollbar w-full px-2 py-2"
            >
              <button
                onClick={() => setGift(null)}
                className={`flex-shrink-0 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!gift ? "bg-outline-variant/20 text-on-surface-variant/30" : "bg-white/50 text-primary hover:bg-primary/5"}`}
              >
                কিছু না
              </button>
              {GIFTS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGift(g.id)}
                  className={`flex-shrink-0 px-4 py-3 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all border-2 ${gift === g.id ? "border-primary/30 bg-primary/5 text-primary shadow-xl scale-105" : "bg-white/50 text-on-surface-variant border-transparent"}`}
                >
                  <span className="text-xl">{g.icon}</span>
                  <span className="text-[9px] whitespace-nowrap">
                    {g.label}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Writing Area */}
      <div className="pt-2 pb-40 px-4 md:px-10 mx-auto relative z-10 max-w-2xl">
        {/* Authenticity Nudge Overlay */}
        <AnimatePresence>
          {showAuthenticityNudge && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-white/95 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[90vw] w-[400px]"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-primary fill-primary/20 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">
                  নিজের মনের কথা লিখুন...
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  আপনার নিজের অনুভূতির মিশেল অন্য কারো কাছে হাজারো কৃত্রিম বার্তার চেয়ে অনেক বেশি দামী।
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Soft Encouragement Message */}
        <div className="text-center mb-6">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            className="text-[11px] font-bold text-amber-900/60 uppercase tracking-[0.25em] bg-[#fcf9f2]/50 backdrop-blur-sm inline-block px-5 py-1.5 rounded-full border border-amber-900/10 shadow-[0_2px_10px_rgba(120,60,20,0.05)]"
          >
            আপনার লেখনীতেই মিশে থাক আন্তরিকতা
          </motion.p>
        </div>

        <div className="relative w-full flex justify-center px-4 md:px-0">
          {/* Decorative elements for rural post office feel - Brass corners */}
          <div className="absolute top-0 left-0 md:-top-2 md:-left-2 w-10 h-10 md:w-16 md:h-16 border-t-4 border-l-4 border-amber-900/10 rounded-tl-xl md:rounded-tl-2xl z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-0 md:-bottom-2 md:-right-2 w-10 h-10 md:w-16 md:h-16 border-b-4 border-r-4 border-amber-900/10 rounded-br-xl md:rounded-br-2xl z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 md:-top-2 md:-right-2 w-10 h-10 md:w-16 md:h-16 border-t-4 border-r-4 border-amber-900/10 rounded-tr-xl md:rounded-tr-2xl z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 md:-bottom-2 md:-left-2 w-10 h-10 md:w-16 md:h-16 border-b-4 border-l-4 border-amber-900/10 rounded-bl-xl md:rounded-bl-2xl z-10 pointer-events-none" />

          <div className="paper-shadow overflow-visible w-full rounded-sm max-w-[210mm] relative z-20 transition-all">
            {renderPaperContent(false)}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[110]">
              <button
                onClick={() => setIsZoomed(false)}
                className="p-3 md:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-md shadow-lg"
              >
                <Minimize2 className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            <div className="min-h-full w-full flex flex-col items-center py-20 px-0 md:px-8">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-4xl"
              >
                <div className="w-full paper-shadow rounded-none md:rounded-md overflow-hidden">
                  {renderPaperContent(true)}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Helper & Action */}
      <div className="p-4 space-y-4 max-w-lg mx-auto relative z-10">
        {!isValid && (
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-primary/10 shadow-lg">
            <p className="text-[10px] font-bold text-primary uppercase mb-2">
              চিঠি লিখার নিয়মাবলী:
            </p>
            <ul className="space-y-1">
              {rules.map((r) => (
                <li
                  key={r.id}
                  className={`text-xs flex items-center gap-2 ${r.check() ? "text-secondary font-bold" : "text-gray-400"}`}
                >
                  {r.check() ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-300" />
                  )}
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-5 rounded-3xl font-bold text-primary bg-white shadow-xl border-b-4 border-gray-200 hover:bg-gray-50 transition-all"
          >
            পরে লিখব (ড্রাফট)
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const combinedContent = `${datePlace}\n\n${greeting}\n\n${bodyPages.join("\n\n---PAGE_BREAK---\n\n")}\n\n${closing}`;
              onNext({
                content: combinedContent,
                datePlace,
                greeting,
                bodyPages,
                closing,
                paperType,
                inkColor,
                penSize,
                fontFamily,
                scent: scent || null,
                gift: gift || null,
              });
            }}
            disabled={!isValid}
            className="flex-1 bg-primary text-white py-5 rounded-3xl font-bold text-xl shadow-2xl disabled:opacity-50 flex items-center justify-center space-x-3 border-b-4 border-primary-container"
          >
            <span>চিঠি ভাজ করুন</span>
            <Send className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

const SendProcess = ({
  letter,
  onBack,
  onComplete,
  coins,
  user,
  inventory,
  allPostmen,
  globalConfig,
}: {
  letter: Partial<Letter>;
  onBack: () => void;
  onComplete: (
    address: string,
    postmanId: string,
    stampPrice: number,
    envelopeStyle: EnvelopeStyle,
    sealId?: string,
    stampId?: string,
  ) => void;
  coins: number;
  user: any;
  inventory: any[];
  allPostmen: any[];
  globalConfig?: any;
}) => {
  const [step, setStep] = useState<
    "envelope" | "address" | "stamp" | "seal" | "postman" | "postbox"
  >("envelope");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [receiverInfo, setReceiverInfo] = useState<{
    name: string;
    address: string;
  } | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<any | null>(null);
  const [selectedPostman, setSelectedPostman] = useState<string>("pm1");
  const [selectedEnvelope, setSelectedEnvelope] =
    useState<EnvelopeStyle>("classic");
  const [selectedSeal, setSelectedSeal] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "letters"),
      where("senderUid", "==", user.uid),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const active = snapshot.docs
        .map((doc) => doc.data())
        .filter(
          (l) =>
            l.deliveryStatus !== "delivered" &&
            l.deliveryStatus !== "dead-letter",
        );
      setActiveDeliveries(active);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const isCurrentBusy = activeDeliveries.some(
      (l) => l.postmanId === selectedPostman,
    );
    if (isCurrentBusy) {
      const availablePostman = allPostmen.find(
        (p) => !activeDeliveries.some((l) => l.postmanId === p.id),
      );
      if (availablePostman) {
        setSelectedPostman(availablePostman.id);
      }
    }
  }, [activeDeliveries, selectedPostman, allPostmen]);

  const purchasedEnvelopes = inventory.filter(
    (item) => item.category === "envelope",
  );
  const purchasedStamps = inventory.filter((item) => item.category === "stamp");
  const purchasedSeals = inventory.filter((item) => item.category === "seal");

  const allEnvelopes = [
    ...ENVELOPES.filter(e => !e.price || e.price === 0),
    ...purchasedEnvelopes.map((e) => ({
      id: e.id as EnvelopeStyle,
      name: e.name,
      color: e.color?.startsWith("bg-") ? e.color : `bg-[${e.color}]`,
      customColor: e.color,
      premium: true,
    })),
  ];

  useLockBodyScroll(showFriends);

  const userPostmen = [...(user?.postmen || []), ...allPostmen].filter((v: any, i: number, a: any[]) => a.findIndex(v2 => (v2.id === v.id || v2.name === v.name)) === i).map((p: any) => {
    const defaultP = POSTMEN.find(dp => dp.id === p.id);
    return defaultP ? { ...p, cost: defaultP.cost } : p;
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "friends"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setFriends(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      },
      (error) =>
        handleFirestoreError(
          error,
          OperationType.LIST,
          `users/${user.uid}/friends`,
        ),
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (postcode.length === 8) {
      if (postcode === user?.postcode) {
        setReceiverInfo(null);
        setAddress(
          `প্রাপক: আপনি নিজে (নিজেকে চিঠি পাঠানো যাবে না)\nপোস্টকোড: ${toBengaliDigits(postcode)}`,
        );
        return;
      }
      setSearching(true);
      const q = query(
        collection(db, "users"),
        where("postcode", "==", postcode),
        limit(1),
      );
      getDocs(q)
        .then((snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setReceiverInfo({
              name: data.displayName,
              address: `গ্রাম: ${data.village || "অজানা"}, ডাকটিক: ${data.postOffice || "অজানা"}`,
            });
            setAddress(
              `প্রাপক: ${data.displayName}\nগ্রাম: ${data.village || "অজানা"}\nডাকটিক: ${data.postOffice || "অজানা"}\nপোস্টকোড: ${toBengaliDigits(postcode)}`,
            );
          } else {
            setReceiverInfo(null);
            setAddress(`প্রাপক: অজানা\nপোস্টকোড: ${toBengaliDigits(postcode)}`);
          }
          setSearching(false);
        })
        .catch((error) =>
          handleFirestoreError(error, OperationType.LIST, "users"),
        );
    }
  }, [postcode, user?.postcode]);

  return (
    <div className="p-4 space-y-6 pb-24 bg-background min-h-screen">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="text-primary w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold text-primary font-serif">
          পাঠানোর প্রস্তুতি
        </h2>
      </div>

      <div className="flex flex-col items-center space-y-8">
        {/* Visual Progress */}
        <div className="flex justify-between w-full px-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />
          {["খাম", "ঠিকানা", "টিকিট", "সিল", "পিয়ন", "বাক্স"].map((s, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full z-10 flex items-center justify-center text-[10px] font-bold ${i <= ["envelope", "address", "stamp", "seal", "postman", "postbox"].indexOf(step) ? "bg-primary text-white" : "bg-white text-gray-400"}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === "envelope" && (
            <motion.div
              key="env"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center space-y-6 w-full"
            >
              <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex space-x-4 px-4 min-w-max">
                  {allEnvelopes.map((env: any) => (
                    <button
                      key={env.id}
                      onClick={() => setSelectedEnvelope(env.id)}
                      className={`flex flex-col items-center space-y-2 p-2 rounded-xl transition-all ${selectedEnvelope === env.id ? "bg-primary/10 scale-110" : "opacity-70 hover:opacity-100"}`}
                    >
                      <div
                        className={`w-16 h-10 rounded-sm shadow-md relative overflow-hidden ${env.color} ${env.border || ""} ${env.gradient ? `bg-gradient-to-br ${env.gradient}` : ""}`}
                      >
                        <div className="absolute top-0 left-0 w-full h-full border-t-[20px] border-t-transparent border-l-[32px] border-l-black/5 border-r-[32px] border-r-black/5" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">
                        {env.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                key={selectedEnvelope}
                className="relative w-64 h-40 mt-32 mb-8"
                style={{ perspective: "1000px" }}
              >
                {/* Back */}
                <div
                  className={`absolute inset-0 rounded-md shadow-inner ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.color} brightness-90 ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient ? `bg-gradient-to-br ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient}` : ""}`}
                />

                {/* Border Overlay (for airmail etc) */}
                {(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)
                  ?.border && (
                  <div
                    className={`absolute inset-0 z-40 pointer-events-none border-4 ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.border} rounded-md`}
                  />
                )}

                {/* Letter */}
                <motion.div
                  initial={{ y: -120, opacity: 0, scale: 0.9 }}
                  animate={{ y: 10, opacity: 1, scale: 0.8 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  className="absolute left-4 right-4 h-36 bg-white shadow-md rounded-sm z-10 flex flex-col p-4 border border-gray-100"
                >
                  <div className="w-1/3 h-2 bg-gray-200 rounded mb-4" />
                  <div className="w-full h-2 bg-gray-100 rounded mb-2" />
                  <div className="w-full h-2 bg-gray-100 rounded mb-2" />
                  <div className="w-5/6 h-2 bg-gray-100 rounded mb-2" />
                  <div className="w-3/4 h-2 bg-gray-100 rounded" />
                </motion.div>

                {/* Left flap */}
                <div
                  className={`absolute inset-0 z-20 ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.color} brightness-95 ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient ? `bg-gradient-to-br ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient}` : ""}`}
                  style={{
                    clipPath: "polygon(0 0, 52% 50%, 0 100%)",
                  }}
                />

                {/* Right flap */}
                <div
                  className={`absolute inset-0 z-20 ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.color} brightness-95 ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient ? `bg-gradient-to-br ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient}` : ""}`}
                  style={{
                    clipPath: "polygon(100% 0, 48% 50%, 100% 100%)",
                  }}
                />

                {/* Bottom flap */}
                <div
                  className={`absolute inset-0 z-20 ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.color} brightness-100 drop-shadow-sm ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient ? `bg-gradient-to-br ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient}` : ""}`}
                  style={{
                    clipPath: "polygon(0 100%, 50% 48%, 100% 100%)",
                  }}
                />

                {/* Top flap (Animated) */}
                <motion.div
                  initial={{ rotateX: 180, zIndex: 5 }}
                  animate={{ rotateX: 0, zIndex: 30 }}
                  transition={{ duration: 0.8, delay: 1.5, ease: "easeInOut" }}
                  style={{
                    transformOrigin: "top",
                    transformStyle: "preserve-3d",
                  }}
                  className="absolute inset-0"
                >
                  <div
                    className={`w-full h-full ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.color} brightness-105 ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient ? `bg-gradient-to-br ${(allEnvelopes.find((e) => e.id === selectedEnvelope) as any)?.gradient}` : ""}`}
                    style={{
                      clipPath: "polygon(0 0, 50% 55%, 100% 0)",
                    }}
                  />
                </motion.div>

                {/* Wax Seal / Stamp */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 2.3,
                    type: "spring",
                    bounce: 0.5,
                  }}
                  className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                >
                  <SealVisual
                    item={
                      purchasedSeals.find((s) => s.id === selectedSeal) || {
                        color: "bg-red-700",
                        border: "border-red-800",
                      }
                    }
                    className="w-12 h-12"
                  />
                </motion.div>
              </div>
              <motion.p
                key={`text-${selectedEnvelope}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8 }}
                className="text-center text-gray-600 font-medium"
              >
                চিঠিটি খামে ভরা হয়েছে!
              </motion.p>
              <motion.button
                key={`btn-${selectedEnvelope}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3 }}
                onClick={() => setStep("address")}
                className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary-container transition-colors"
              >
                পরবর্তী ধাপ
              </motion.button>
            </motion.div>
          )}

          {step === "address" && (
            <motion.div
              key="addr"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                    প্রাপকের পোস্টকোড দিন
                  </label>
                  <button
                    onClick={() => setShowFriends(true)}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full hover:bg-primary/10 transition-colors"
                  >
                    <Users className="w-3 h-3" />
                    <span>বন্ধুদের তালিকা</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={8}
                    value={toBengaliDigits(postcode || "")}
                    onChange={(e) =>
                      setPostcode(
                        formatDakthikId(toEnglishDigits(e.target.value)),
                      )
                    }
                    className="w-full p-4 bg-white rounded-2xl border-2 border-primary/10 focus:border-primary focus:ring-0 text-2xl font-mono tracking-[0.5rem] text-center"
                    placeholder="XXX-XXXX"
                  />
                  {searching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full h-48 bg-orange-100 rounded-xl p-6 shadow-lg border-2 border-orange-200 relative">
                <label className="text-[10px] font-bold text-orange-400 uppercase">
                  ঠিকানা
                </label>
                <textarea
                  value={address || ""}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-32 bg-transparent border-none focus:ring-0 text-lg font-serif placeholder:text-orange-200"
                  readOnly={!!receiverInfo}
                />
              </div>

              {receiverInfo && (
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3">
                  <CheckCircle2 className="text-green-500 w-5 h-5" />
                  <p className="text-xs font-bold text-green-700">
                    প্রাপক খুঁজে পাওয়া গেছে: {receiverInfo.name}
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep("stamp")}
                disabled={postcode.length < 8 || postcode === user?.postcode}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold disabled:opacity-50"
              >
                ডাকটিকিট ও সিল লাগান
              </button>
            </motion.div>
          )}

          {step === "stamp" && (
            <motion.div
              key="stamp"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full space-y-6"
            >
              <div
                className={`w-full min-h-[14rem] rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col ${ENVELOPES.find((e) => e.id === selectedEnvelope)?.color} ${ENVELOPES.find((e) => e.id === selectedEnvelope)?.border || "border border-black/10"}`}
              >
                {/* Background Texture */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
                  }}
                />

                <div className="flex justify-between items-start relative z-10">
                  <div className="max-w-[50%]">
                    {/* Sender Info */}
                    <p className="text-[9px] text-gray-600 font-serif leading-tight opacity-80">
                      <span className="font-bold">প্রেরক:</span>
                      <br />
                      {user?.displayName}
                      <br />
                      পোস্টকোড: {toBengaliDigits(user?.postcode)}
                    </p>
                  </div>
                  <div className="text-right">
                    {selectedStamp ? (
                      <motion.div
                        initial={{ scale: 2, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: -5 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <StampVisual
                          item={selectedStamp}
                          className="w-14 h-16"
                        />
                      </motion.div>
                    ) : (
                      <div className="inline-block w-14 h-16 border-2 border-dashed border-black/20 rounded-sm flex items-center justify-center">
                        <span className="text-[8px] text-black/30 font-bold text-center">
                          টিকিট
                          <br />
                          লাগান
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-6 pl-12 relative z-10">
                  <p className="font-serif text-gray-900 whitespace-pre-wrap text-sm leading-relaxed break-words">
                    {address}
                  </p>
                  {/* Decorative lines under address */}
                  <div className="w-3/4 h-px bg-black/10 mt-1" />
                  <div className="w-2/3 h-px bg-black/10 mt-2" />
                </div>
              </div>

              {!selectedStamp ? (
                <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2">
                  {/* Default Stamps (Only Free) */}
                  {STAMPS.filter(s => !s.price || s.price === 0).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStamp(s)}
                      className={`p-4 rounded-2xl shadow-sm border-2 flex flex-col items-center gap-2 transition-all bg-white border-gray-100 opacity-70 hover:opacity-100`}
                    >
                      <StampVisual item={s} className="w-18 h-22" />
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold">ফ্রি</span>
                        <span className="text-[9px] text-gray-500">
                          পৌঁছাবে {toBengaliDigits(getDeliveryHours(s.price))}{" "}
                          ঘণ্টায়
                        </span>
                      </div>
                    </button>
                  ))}
                  {/* Purchased Stamps */}
                  {purchasedStamps.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStamp(s)}
                      className="bg-white p-4 rounded-2xl shadow-sm border-2 border-primary/20 flex flex-col items-center gap-2"
                    >
                      <StampVisual item={s} className="w-18 h-22" />
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-primary">
                          সংগৃহীত
                        </span>
                        <span className="text-[9px] text-gray-500">
                          পৌঁছাবে{" "}
                          {toBengaliDigits(getDeliveryHours(s.price || 10))}{" "}
                          ঘণ্টায়
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setStep("seal")}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold"
                >
                  সিল বাছাই করুন
                </button>
              )}
            </motion.div>
          )}

          {step === "seal" && (
            <motion.div
              key="seal"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full space-y-6"
            >
              <p className="text-center text-gray-500 font-bold text-sm">
                আপনার ব্যক্তিগত সিল ব্যবহার করবেন?
              </p>

              <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2">
                <button
                  onClick={() => {
                    setSelectedSeal(null);
                    setStep("postman");
                  }}
                  className={`bg-white p-4 rounded-2xl shadow-sm border-2 flex flex-col items-center gap-2 ${selectedSeal === null ? "border-primary" : "border-gray-100"}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Stamp className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-[10px] font-bold">সাধারণ সিল</span>
                </button>

                {purchasedSeals.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSeal(s.id);
                      setStep("postman");
                    }}
                    className={`p-4 rounded-2xl shadow-sm border-2 flex flex-col items-center gap-2 transition-all ${selectedSeal === s.id ? "border-primary scale-105" : "border-gray-100 bg-white"}`}
                  >
                    <SealVisual item={s} className="w-12 h-12" />
                    <span className="text-[10px] font-bold">{s.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep("postman")}
                className="w-full bg-primary/10 text-primary py-4 rounded-2xl font-bold"
              >
                সিল ছাড়াই পাঠান
              </button>
            </motion.div>
          )}

          {step === "postman" && (
            <motion.div
              key="postman"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full space-y-4"
            >
              <p className="text-center text-gray-500 font-bold text-sm">
                কে আপনার চিঠি নিয়ে যাবে?
              </p>
              <div className="space-y-3">
                {userPostmen.map((p: any) => {
                  const isBusy = activeDeliveries.some(
                    (l) => l.postmanId === p.id,
                  );
                  return (
                    <button
                      key={p.id}
                      onClick={() => !isBusy && setSelectedPostman(p.id)}
                      disabled={isBusy}
                      className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${isBusy ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" : selectedPostman === p.id ? "bg-primary/5 border-primary shadow-md" : "bg-white border-gray-100 opacity-70 hover:opacity-100"}`}
                    >
                      <div className="text-3xl w-12 h-12 relative">
                        <PostmanAvatar avatar={p.avatar} postmanId={p.id} name={p.name} />
                        {isBusy && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-primary text-sm flex items-center gap-2">
                          {p.name}
                          {isBusy && (
                            <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              কাজে ব্যস্ত
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isBusy
                            ? "বর্তমানে অন্য একটি ডেলিভারিতে আছেন"
                            : p.bio || p.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-bold ${isBusy ? "text-gray-400" : "text-orange-500"}`}
                        >
                          {POSTMEN.find(dp => dp.id === p.id)?.cost ?? (p.cost || 5)} 🪙
                        </p>
                        {user.email === "tanvirtamim1111@gmail.com" &&
                          !isBusy && (
                            <p className="text-[8px] text-green-600 font-bold">
                              ইন্সট্যান্ট
                            </p>
                          )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {activeDeliveries.some((l) => l.postmanId === selectedPostman) ? (
                <div className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold mt-4 text-center text-sm">
                  সব পিয়ন কাজে ব্যস্ত! দয়া করে অপেক্ষা করুন।
                </div>
              ) : (
                <button
                  onClick={() => setStep("postbox")}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-4"
                >
                  চিঠি বাক্সে ফেলুন
                </button>
              )}
            </motion.div>
          )}

          {step === "postbox" && (
            <motion.div
              key="box"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center space-y-8"
            >
              <div className="relative">
                {/* Improved Red Postbox with Animation */}
                <div className="w-40 h-64 bg-[#b22222] rounded-t-full relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center border-b-8 border-[#8b0000]">
                  {/* Mail Slot */}
                  <div className="w-24 h-4 bg-black/40 mt-16 rounded-full shadow-inner relative z-20">
                    <div className="absolute inset-0 bg-black/20 blur-[1px]" />
                  </div>
                  
                  {/* Letter Animation - Entering the slot */}
                  <motion.div
                    initial={{ y: -200, rotateX: 0, scale: 1, opacity: 0 }}
                    animate={{ 
                      y: [-200, -20, 20, 100], 
                      rotateX: [0, 0, 60, 90],
                      scale: [1, 1, 0.7, 0.4],
                      opacity: [0, 1, 1, 0] 
                    }}
                    transition={{ 
                      delay: 0.8, 
                      duration: 3,
                      times: [0, 0.4, 0.7, 1],
                      ease: "easeInOut"
                    }}
                    className="absolute z-10 w-24 h-16 shadow-2xl flex items-center justify-center rounded-sm overflow-hidden"
                  >
                    <EnvelopeVisual 
                      item={ENVELOPES.find(e => e.id === selectedEnvelope) || ENVELOPES[0]} 
                      className="w-full h-full"
                      stamp={selectedStamp}
                      seal={purchasedSeals.find(s => s.id === selectedSeal) || SHOP_ITEMS.find(i => i.id === selectedSeal)}
                    />
                  </motion.div>
                  
                  {/* Box Label */}
                  <div className="mt-auto mb-12 flex flex-col items-center gap-1 opacity-40">
                    <Mail className="w-8 h-8 text-white" />
                    <span className="text-[10px] text-white font-serif uppercase tracking-tighter">Dakthik</span>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2.8 }}
                  className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full shadow-xl z-30"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-gray-700 text-lg">
                  চিঠিটি সফলভাবে বাক্সে ফেলা হয়েছে!
                </p>
                {user.email === "tanvirtamim1111@gmail.com" ? (
                  <p className="text-xs text-green-600 font-bold flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" /> এডমিন প্রিভিলেজ: ইন্সট্যান্ট
                    ডেলিভারি সক্রিয়!
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    {POSTMEN.find((p) => p.id === selectedPostman)?.name} আপনার
                    চিঠি নিয়ে রওনা হবেন।
                  </p>
                )}
              </div>
              <button
                onClick={async () => {
                  if (isSending) return;
                  setIsSending(true);
                  // Ensure data is plain for Firestore
                  const sanitizedLetter = JSON.parse(JSON.stringify(letter));
                  await onComplete(
                    address,
                    selectedPostman,
                    selectedStamp?.price || 0,
                    selectedEnvelope,
                    selectedSeal || undefined,
                    selectedStamp?.id,
                  );
                }}
                disabled={isSending}
                className="bg-primary text-white px-12 py-5 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSending ? "পাঠানো হচ্ছে..." : "ড্যাশবোর্ডে ফিরুন"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Friends Picker Modal */}
      <AnimatePresence>
        {showFriends && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowFriends(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-t-[3rem] p-8 space-y-6 shadow-2xl border-t border-primary/10"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary font-serif">
                  বন্ধুদের তালিকা
                </h3>
                <button
                  onClick={() => setShowFriends(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Minimize2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-3 no-scrollbar">
                {friends.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 italic">
                    আপনার কোনো বন্ধু নেই।
                  </div>
                ) : (
                  friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => {
                        setPostcode(friend.postcode);
                        setShowFriends(false);
                      }}
                      className="w-full p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center">
                          <UserIcon className="text-primary w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">
                            {friend.displayName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            পোস্টকোড: {toBengaliDigits(friend.postcode)}
                          </p>
                        </div>
                      </div>
                      <Send className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={() => setShowFriends(false)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InboxScreen = ({
  onBack,
  user,
  onUpdateCoins,
  allPostmen,
  allShopItems,
}: {
  onBack: () => void;
  user: any;
  onUpdateCoins: (amount: number) => Promise<void>;
  allPostmen: any[];
  allShopItems: any[];
}) => {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "new" | "read" | "saved" | "hidden" | "burnt"
  >("new");
  const [burningId, setBurningId] = useState<string | null>(null);

  useLockBodyScroll(!!selectedLetter);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // Auto-delete burnt letters older than 3 days
        const now = Date.now();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        
        for (const d of docs) {
          const letterData = d as any;
          if (letterData.isBurnt && letterData.burntAt && (now - letterData.burntAt > threeDaysMs)) {
            try {
              await deleteDoc(doc(db, "letters", d.id));
            } catch (err) {
              console.error("Failed to auto-delete old burnt letter:", d.id);
            }
          }
        }

        const delivered = docs.filter(
          (d: any) => d.deliveryStatus === "delivered",
        );

        try {
          const lettersWithSenders = await Promise.all(
            delivered.map(async (l: any) => {
              try {
                const senderDoc = await getDoc(doc(db, "users", l.senderUid));
                return {
                  ...l,
                  senderName: senderDoc.exists()
                    ? senderDoc.data().displayName
                    : "অজানা প্রেরক",
                };
              } catch (err) {
                handleFirestoreError(
                  err,
                  OperationType.GET,
                  `users/${l.senderUid}`,
                );
                return { ...l, senderName: "অজানা প্রেরক" };
              }
            }),
          );
          setLetters(lettersWithSenders);
        } catch (error) {
          console.error("Error processing letters:", error);
        }

        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    return () => unsubscribe();
  }, [user]);

  const updateLetterState = async (letterId: string, updates: any) => {
    try {
      await setDoc(doc(db, "letters", letterId), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `letters/${letterId}`);
    }
  };

  const handleReadLetter = async (letter: any) => {
    if (letter.isBurnt) {
      showToast("এই চিঠিটি পুড়িয়ে ফেলা হয়েছে, আর পড়া যাবে না।", "error");
      return;
    }
    if (!letter.isRead) {
      await updateLetterState(letter.id, { isRead: true });
      await onUpdateCoins(2);
      showToast("চিঠিটি পড়ার জন্য আপনি ২ 🪙 পেয়েছেন! 📖", "success");
    }
    setSelectedLetter(letter);
  };

  const handleDeleteLetter = async (letterId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি এই চিঠিটি পুড়িয়ে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।")) return;
    
    try {
      setBurningId(letterId);
      vintageAudio.playBurn();
      
      // Wait for 2.5 seconds to show the burning animation
      setTimeout(async () => {
        try {
          await updateLetterState(letterId, { isBurnt: true, burntAt: Date.now() });
          setBurningId(null);
          showToast("চিঠিটি পুড়িয়ে ফেলা হয়েছে! 🔥", "success");
        } catch (error) {
          console.error("Delayed update error:", error);
          setBurningId(null);
        }
      }, 2500);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `letters/${letterId}`);
      setBurningId(null);
    }
  };

  const filteredLetters = letters.filter((l) => {
    if (activeTab === "new")
      return !l.isRead && !l.isSaved && !l.isHidden && !l.isBurnt;
    if (activeTab === "read")
      return l.isRead && !l.isSaved && !l.isHidden && !l.isBurnt;
    if (activeTab === "saved") return l.isSaved && !l.isBurnt;
    if (activeTab === "hidden") return l.isHidden && !l.isBurnt;
    if (activeTab === "burnt") return l.isBurnt;
    return false;
  });

  const tabs = [
    { id: "new", label: "নতুন", icon: Mail, color: "bg-red-500" },
    { id: "read", label: "পড়া", icon: CheckCircle2, color: "bg-blue-500" },
    { id: "saved", label: "সংরক্ষিত", icon: Folder, color: "bg-green-600" },
    { id: "hidden", label: "লোকানো", icon: Sparkles, color: "bg-purple-600" },
    { id: "burnt", label: "নষ্ট করা", icon: AlertCircle, color: "bg-gray-600" },
  ];

  return (
    <div className="bg-[#fcfaf2] min-h-screen pb-32">
      {/* Header - Head Office Style */}
      <header className="bg-white/70 backdrop-blur-xl flex items-center gap-6 px-8 py-6 w-full sticky top-0 z-50 border-b border-primary/5 shadow-sm">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-12 h-12 bg-white rounded-[1.2rem] border-2 border-primary/5 shadow-lg flex items-center justify-center text-primary"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h2 className="text-2xl font-black text-primary font-serif tracking-tight">
            নিজস্ব সিন্দুক
          </h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            আপনার সকল চিঠির সংগ্রহশালা
          </p>
        </div>
      </header>

      <main className="px-6 mt-8 space-y-8">
        {/* Tabs - Bento Style */}
        <div className="grid grid-cols-5 gap-3">
          {tabs.map((tab) => {
            const count = letters.filter((l) => {
              if (tab.id === "new")
                return !l.isRead && !l.isSaved && !l.isHidden && !l.isBurnt;
              if (tab.id === "read")
                return l.isRead && !l.isSaved && !l.isHidden && !l.isBurnt;
              if (tab.id === "saved") return l.isSaved && !l.isBurnt;
              if (tab.id === "hidden") return l.isHidden && !l.isBurnt;
              if (tab.id === "burnt") return l.isBurnt;
              return false;
            }).length;

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all relative ${
                  activeTab === tab.id
                    ? "bg-primary border-primary shadow-xl shadow-primary/20 text-white"
                    : "bg-white border-primary/5 text-gray-400 shadow-md"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 mb-1 ${activeTab === tab.id ? "text-white" : "text-primary/40"}`}
                />
                <span className="text-[8px] font-black uppercase tracking-tighter">
                  {tab.label}
                </span>
                {count > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border-2 ${
                      activeTab === tab.id
                        ? "bg-white text-primary border-primary"
                        : "bg-red-500 text-white border-white"
                    }`}
                  >
                    {toBengaliDigits(count)}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                চিঠি খোঁজা হচ্ছে...
              </p>
            </div>
          ) : filteredLetters.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-primary/10">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                <Mail className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-gray-800 font-serif">
                  কোনো চিঠি নেই
                </h4>
                <p className="text-xs text-gray-400 font-bold">
                  এই বিভাগে বর্তমানে কোনো চিঠি পাওয়া যায়নি।
                </p>
              </div>
            </div>
          ) : (
            <div className="relative bg-[#e6c280] rounded-r-3xl rounded-bl-3xl p-6 md:p-10 shadow-2xl border border-[#d4b06e] mt-12">
              {/* Folder Tab */}
              <div className="absolute -top-10 left-0 w-48 h-10 bg-[#e6c280] rounded-t-2xl border-t border-l border-r border-[#d4b06e] flex items-center px-6">
                <span className="text-sm font-black text-[#8c6b36] uppercase tracking-widest">
                  {tabs.find(t => t.id === activeTab)?.label} ফাইল
                </span>
              </div>
              
              {/* Folder Inner Shadow/Depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent rounded-r-3xl rounded-bl-3xl pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {filteredLetters.map((l, i) => {
                  const envelope = ENVELOPES.find(e => e.id === l.envelopeStyle) || ENVELOPES[0];
                  const isAirmail = envelope.id === 'airmail';
                  const textColor = envelope.textWhite ? 'text-white' : 'text-gray-800';
                  const mutedTextColor = envelope.textWhite ? 'text-white/70' : 'text-gray-500';
                  const borderColor = envelope.textWhite ? 'border-white/30' : 'border-gray-300/50';

                  return (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5, rotate: Math.random() * 2 - 1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReadLetter(l)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleReadLetter(l);
                        }
                      }}
                      className={`relative w-full aspect-[16/9] ${envelope.color} ${envelope.border} rounded-md shadow-md cursor-pointer group overflow-hidden flex flex-col justify-between p-5 text-left ${l.isBurnt ? 'grayscale-[0.8] sepia-[0.5] brightness-75 burn-filter' : ''}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
                        filter: burningId === l.id ? 'url(#ash-distortion)' : 'none'
                      }}
                    >
                      {/* Active Burning Animation Layer */}
                      {burningId === l.id && (
                        <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden burning-mask">
                           <div className="absolute inset-0 bg-black/90 ash-texture" />
                           
                           {/* The Fire Line */}
                           <motion.div 
                              initial={{ left: '-10%' }}
                              animate={{ left: '100%' }}
                              transition={{ duration: 2.5, ease: "linear" }}
                              className="absolute top-0 bottom-0 fire-edge-glow z-10"
                              style={{ transform: 'rotate(2deg)' }}
                           >
                              {/* Particles spewing from the fire line */}
                              {[...Array(20)].map((_, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ 
                                    opacity: [0, 1, 0],
                                    x: [0, (Math.random() - 1) * 100],
                                    y: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 200],
                                    scale: [0, 1.5, 0]
                                  }}
                                  transition={{ 
                                    duration: 0.8 + Math.random(), 
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                  }}
                                  className="ember-particle"
                                  style={{ top: `${Math.random() * 100}%`, left: '50%' }}
                                />
                              ))}
                           </motion.div>
                           
                           {/* Crumbling Ash Particles */}
                           {[...Array(15)].map((_, idx) => (
                             <motion.div 
                               key={`ash-${idx}`}
                               initial={{ opacity: 0, x: 0, y: 0 }}
                               animate={{ 
                                 opacity: [0, 0.8, 0],
                                 x: [Math.random() * 100, Math.random() * -150],
                                 y: [Math.random() * 100, 200],
                                 rotate: [0, 180]
                               }}
                               transition={{ 
                                 duration: 1.5 + Math.random(),
                                 repeat: Infinity,
                                 delay: Math.random() * 2.5
                               }}
                               className="ash-particle"
                               style={{ top: `${Math.random() * 80}%`, left: '50%' }}
                             />
                           ))}
                        </div>
                      )}
                      {/* Airmail Border */}
                      {isAirmail && (
                        <div className="absolute top-0 left-0 w-full h-1.5 flex z-0">
                          {Array.from({ length: 20 }).map((_, j) => (
                            <div key={j} className={`flex-1 h-full ${j % 2 === 0 ? 'bg-red-500' : 'bg-blue-500'}`} />
                          ))}
                        </div>
                      )}

                      {/* Stamp */}
                      <div className={`absolute top-5 right-4 w-10 h-12 border-2 border-[#e8e3d3] p-1 flex items-center justify-center bg-white/80 rotate-3 overflow-hidden z-10 ${l.isBurnt ? 'opacity-40 grayscale sepia' : ''}`}>
                        <div className={`w-full h-full border border-dashed border-[#d0c8b0] flex items-center justify-center bg-red-50 relative`}>
                          <Mail className="w-4 h-4 text-red-400" />
                          {l.isRead && (
                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                              <div className="w-[150%] h-1.5 bg-[#fdfbf7] -rotate-45 shadow-[0_0_3px_rgba(0,0,0,0.3)]" style={{ clipPath: 'polygon(0 20%, 10% 0, 20% 20%, 30% 0, 40% 20%, 50% 0, 60% 20%, 70% 0, 80% 20%, 90% 0, 100% 20%, 100% 80%, 90% 100%, 80% 80%, 70% 100%, 60% 80%, 50% 100%, 40% 80%, 30% 100%, 20% 80%, 10% 100%, 0 80%)' }} />
                            </div>
                          )}
                        </div>
                        {/* Postmark */}
                        <div className="absolute -left-6 -bottom-2 w-14 h-14 border-2 border-gray-800/30 rounded-full flex items-center justify-center -rotate-12 pointer-events-none">
                          <div className="w-12 h-12 border border-gray-800/30 rounded-full flex items-center justify-center">
                            <span className="text-[5px] text-gray-800/50 font-bold uppercase tracking-widest text-center leading-tight">
                              POST<br/>OFFICE
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLetter(l.id);
                        }}
                        className="absolute top-2 left-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 z-30 border border-gray-100 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Sender Address */}
                      <div className="space-y-1 w-2/3 mt-2 relative z-10">
                        <p className={`text-[8px] ${mutedTextColor} font-serif italic uppercase tracking-widest`}>প্রেরক</p>
                        <h4 className={`text-sm font-black ${textColor} font-serif border-b ${borderColor} pb-1 inline-block`}>{l.senderName}</h4>
                        <p className={`text-[9px] ${mutedTextColor} font-serif mt-1`}>
                          পোস্ট কোড: {toBengaliDigits(l.senderPostcode)}
                        </p>
                      </div>

                      {/* Receiver Address */}
                      <div className="self-end text-right w-2/3 mt-4 space-y-1 relative z-10">
                        <p className={`text-[8px] ${mutedTextColor} font-serif italic uppercase tracking-widest`}>প্রাপক</p>
                        <h4 className={`text-sm font-black ${textColor} font-serif border-b ${borderColor} pb-1 inline-block`}>{user?.displayName || "অজ্ঞাত প্রাপক"}</h4>
                        <p className={`text-[9px] ${mutedTextColor} font-serif mt-1`}>
                          পোস্ট কোড: {toBengaliDigits(l.receiverPostcode)}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                        {!l.isRead && l.timestamp + (l.deliveryDelay || 0) <= Date.now() && (
                          <div className="flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-red-100">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">নতুন চিঠি</span>
                          </div>
                        )}
                      </div>

                      {/* Realistic Burnt Effect */}
                      {l.isBurnt && (
                        <div 
                          className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-md"
                          style={{
                            opacity: l.burntAt ? Math.max(0.6, 1 - (Date.now() - l.burntAt) / (3 * 24 * 60 * 60 * 1000)) : 1,
                            filter: `blur(${l.burntAt ? Math.min(2, ((Date.now() - l.burntAt) / (3 * 24 * 60 * 60 * 1000)) * 2) : 0}px)`,
                            transition: 'all 1s ease'
                          }}
                        >
                          {/* Carbonization and soot */}
                          <div className="absolute inset-0 charred-edge mix-blend-multiply transition-opacity duration-1000" />
                          <div className="absolute inset-0 ash-texture" />
                          
                          {/* Animated Embers on the edges */}
                          <div className="absolute inset-0 border-[10px] border-transparent animate-ember opacity-30" 
                               style={{ boxShadow: 'inset 0 0 15px #ff4500' }} />

                          {/* Main Burn Hole - Centerish */}
                          <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 rounded-full blur-[1px] shadow-[0_0_15px_rgba(255,69,0,0.5)] flex items-center justify-center transition-all duration-1000" 
                            style={{ 
                              width: `${20 + (l.burntAt ? Math.min(100, ((Date.now() - l.burntAt) / (3 * 24 * 60 * 60 * 1000)) * 120) : 0)}px`,
                              height: `${20 + (l.burntAt ? Math.min(60, ((Date.now() - l.burntAt) / (3 * 24 * 60 * 60 * 1000)) * 80) : 0)}px`,
                              clipPath: 'polygon(10% 25%, 35% 10%, 70% 20%, 90% 45%, 85% 80%, 50% 95%, 15% 85%, 5% 55%)',
                              transform: `translate(-50%, -50%) rotate(${l.burntAt ? (l.burntAt % 360) : 0}deg)`
                            }}
                          >
                             {/* Glowing inner edge */}
                             <div className="absolute inset-0 border-2 border-orange-500 blur-[2px] animate-pulse opacity-60" />
                          </div>

                          {/* Random smaller burnt spots */}
                          {[1, 2, 3].map((i) => (
                            <div 
                               key={i}
                               className="absolute bg-black/80 rounded-full blur-[2px] animate-pulse"
                               style={{
                                 top: `${20 + (i * 25)}%`,
                                 left: `${15 + (i * 20)}%`,
                                 width: `${10 + (i * 5)}px`,
                                 height: `${6 + (i * 4)}px`,
                                 opacity: 0.8,
                                 boxShadow: '0 0 8px #ff4500',
                                 animationDelay: `${i * 0.5}s`
                               }}
                            />
                          ))}

                          {/* Curling edge effect (Visual only) */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-black/60 to-transparent rotate-45 translate-x-12 -translate-y-12" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Letter View Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <RealisticLetterOpener
            mail={selectedLetter}
            onBack={() => setSelectedLetter(null)}
            onUpdateState={(updates) => updateLetterState(selectedLetter.id, updates)}
            showActions={true}
            allShopItems={allShopItems}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SentLettersScreen = ({
  onBack,
  user,
  allPostmen,
  allShopItems,
}: {
  onBack: () => void;
  user: any;
  allPostmen: any[];
  allShopItems: any[];
}) => {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [burningId, setBurningId] = useState<string | null>(null);

  useLockBodyScroll(!!selectedLetter);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "letters"),
      where("senderUid", "==", user.uid),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        try {
          const lettersWithReceivers = await Promise.all(
            docs.map(async (l: any) => {
              if (l.receiverUid) {
                try {
                  const receiverDoc = await getDoc(
                    doc(db, "users", l.receiverUid),
                  );
                  return {
                    ...l,
                    receiverName: receiverDoc.exists()
                      ? receiverDoc.data().displayName
                      : "অজানা প্রাপক",
                  };
                } catch (err) {
                  console.warn("Could not fetch receiver info:", err);
                  return { ...l, receiverName: "অজানা প্রাপক" };
                }
              }
              return { ...l, receiverName: "অজানা গন্তব্য" };
            }),
          );
          setLetters(lettersWithReceivers);
        } catch (error) {
          console.error("Error processing sent letters:", error);
        }

        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    return () => unsubscribe();
  }, [user]);

  const handleDeleteLetter = async (letterId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি এই চিঠিটি পুড়িয়ে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।")) return;
    
    try {
      setBurningId(letterId);
      vintageAudio.playBurn();
      
      setTimeout(async () => {
        try {
          await setDoc(doc(db, "letters", letterId), { isBurnt: true, burntAt: Date.now() }, { merge: true });
          setBurningId(null);
          showToast("চিঠিটি পুড়িয়ে ফেলা হয়েছে! 🔥", "success");
        } catch (error) {
          console.error("Delayed delete error:", error);
          setBurningId(null);
        }
      }, 2500);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `letters/${letterId}`);
      setBurningId(null);
    }
  };

  return (
    <div className="bg-[#fcfaf2] min-h-screen pb-32">
      {/* Header - Head Office Style */}
      <header className="bg-white/70 backdrop-blur-xl flex items-center gap-6 px-8 py-6 w-full sticky top-0 z-50 border-b border-primary/5 shadow-sm">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-12 h-12 bg-white rounded-[1.2rem] border-2 border-primary/5 shadow-lg flex items-center justify-center text-primary"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h2 className="text-2xl font-black text-primary font-serif tracking-tight">
            পাঠানো চিঠি
          </h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            আপনার পাঠানো চিঠির খতিয়ান
          </p>
        </div>
      </header>

      <main className="px-6 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              চিঠি খোঁজা হচ্ছে...
            </p>
          </div>
        ) : letters.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-primary/10">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
              <Send className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-gray-800 font-serif">
                কোনো চিঠি পাঠানো হয়নি
              </h4>
              <p className="text-xs text-gray-400 font-bold">
                আপনি এখনো কাউকে কোনো চিঠি পাঠাননি।
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {letters.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedLetter(l);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedLetter(l);
                  }
                }}
                className={`bg-white p-8 rounded-[2.5rem] border-2 border-primary/5 shadow-xl group cursor-pointer relative overflow-hidden w-full text-left ${l.isBurnt ? 'grayscale-[0.8] sepia-[0.5] brightness-75 burn-filter' : ''}`}
                style={{
                  filter: burningId === l.id ? 'url(#ash-distortion)' : 'none'
                }}
              >
                {/* Active Burning Animation Layer */}
                {burningId === l.id && (
                  <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden burning-mask">
                     <div className="absolute inset-0 bg-black/90 ash-texture" />
                     
                     <motion.div 
                        initial={{ left: '-10%' }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 2.5, ease: "linear" }}
                        className="absolute top-0 bottom-0 fire-edge-glow z-10"
                        style={{ transform: 'rotate(2deg)' }}
                     >
                        {[...Array(20)].map((_, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], x: [0, (Math.random() - 1) * 100], y: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 200], scale: [0, 1.5, 0] }}
                            transition={{ duration: 0.8 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                            className="ember-particle"
                            style={{ top: `${Math.random() * 100}%`, left: '50%' }}
                          />
                        ))}
                     </motion.div>
                     
                     {[...Array(15)].map((_, idx) => (
                       <motion.div 
                         key={`ash-${idx}`}
                         initial={{ opacity: 0, x: 0, y: 0 }}
                         animate={{ opacity: [0, 0.8, 0], x: [Math.random() * 100, Math.random() * -150], y: [Math.random() * 100, 200], rotate: [0, 180] }}
                         transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2.5 }}
                         className="ash-particle"
                         style={{ top: `${Math.random() * 80}%`, left: '50%' }}
                       />
                     ))}
                  </div>
                )}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/5 rounded-[1.2rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <UserIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-800 font-serif">
                        {l.receiverName}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        প্রাপক
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLetter(l.id);
                    }}
                    className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="text-right">
                    <p className="text-xs font-black text-primary">
                      {toBengaliDigits(
                        new Date(l.timestamp).toLocaleDateString("bn-BD"),
                      )}
                    </p>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                      তারিখ
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-[1.5rem] border border-primary/5">
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 italic font-serif">
                    "{l.content.slice(0, 100)}..."
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        l.timestamp + (l.deliveryDelay || 0) <= Date.now()
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {l.timestamp + (l.deliveryDelay || 0) <= Date.now()
                        ? "পৌঁছেছে"
                        : "পথে আছে"}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      আইডি: {l.id.slice(0, 8)}
                    </span>
                  </div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest"
                  >
                    চিঠি দেখুন <ArrowRight className="w-3 h-3" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Letter View Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <RealisticLetterOpener
            mail={selectedLetter}
            onBack={() => setSelectedLetter(null)}
            allShopItems={allShopItems}
            onUpdateState={async (updates) => {
              try {
                await setDoc(doc(db, "letters", selectedLetter.id), updates, { merge: true });
              } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, `letters/${selectedLetter.id}`);
              }
            }}
            showActions={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const Tracking = ({ onBack, user, allPostmen }: { onBack: () => void; user: any; allPostmen: any[] }) => {
  const [sentLetters, setSentLetters] = useState<any[]>([]);
  const [incomingLetters, setIncomingLetters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"sent" | "incoming">("sent");
  const [now, setNow] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredSent = sentLetters.filter(
    (l) =>
      l.deliveryStatus !== "delivered" && l.deliveryStatus !== "dead-letter",
  );
  const filteredIncoming = incomingLetters.filter(
    (l) =>
      l.deliveryStatus !== "delivered" && l.deliveryStatus !== "dead-letter",
  );

  // Update "now" every second for live tracking
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Nudge logic: if a letter is at 0:00 but status hasn't updated, push it
  useEffect(() => {
    if (!user || (sentLetters.length === 0 && incomingLetters.length === 0))
      return;

    const nudgeStuckLetters = async () => {
      const now = Date.now();
      const batch = writeBatch(db);
      let hasNudges = false;

      [...sentLetters, ...incomingLetters].forEach((l) => {
        const targetTime =
          (l.dispatchTime || l.timestamp) + (l.deliveryDelay || 60000);
        if (now > targetTime && l.deliveryStatus === "with-mail-carrier") {
          const letterRef = doc(db, "letters", l.id);
          if (l.receiverUid) {
            batch.update(letterRef, {
              deliveryStatus: "at-veranda",
              lastAttemptAt: now,
              attempts: 1,
            });
          } else {
            batch.update(letterRef, {
              deliveryStatus: "dead-letter",
              status: "lost",
              deadLetterAt: now,
            });
          }
          hasNudges = true;
        }
      });

      if (hasNudges) {
        try {
          await batch.commit();
        } catch (err) {
          console.error("Nudge failed:", err);
        }
      }
    };

    const nudgeTimer = setInterval(nudgeStuckLetters, 2000);
    return () => clearInterval(nudgeTimer);
  }, [user, sentLetters, incomingLetters]);

  useEffect(() => {
    if (!user) return;

    // Sent letters
    const qSent = query(
      collection(db, "letters"),
      where("senderUid", "==", user.uid),
      orderBy("timestamp", "desc"),
    );

    const unsubSent = onSnapshot(
      qSent,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setSentLetters(docs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    // Incoming letters
    const qIncoming = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid),
      orderBy("timestamp", "desc"),
    );

    const unsubIncoming = onSnapshot(
      qIncoming,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setIncomingLetters(docs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );

    return () => {
      unsubSent();
      unsubIncoming();
    };
  }, [user]);

  // Listener for Postman/Letter status updates to trigger notifications
  useEffect(() => {
    if (!user) return;
    
    // Listen for incoming letters to notify user about excuses or arrival at veranda
    const q = query(
      collection(db, "letters"),
      where("receiverUid", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const letter = change.doc.data();
          // docChanges doesn't directly provide old state easily in v9 without extra steps or mapping
          // but we can check the status against some logic.
          
          if (letter.deliveryStatus === "at-veranda" && !letter.isRead) {
            addNotification(
              user.uid,
              "পিয়ন দরজায়!",
              "আপনার ঠিকানায় পিয়ন পৌঁছেছে! তাড়াতাড়ি দরজা খুলুন বা বারান্দায় যান।",
              "letter",
              { postmanId: letter.postmanId }
            );
          }

          if (letter.excuseMessage) {
            addNotification(
              user.uid,
              "পিয়নের বার্তা",
              `চিঠি বিলিতে দেরি হচ্ছে: ${letter.excuseMessage}`,
              "letter",
              { postmanId: letter.postmanId }
            );
          }
        }
      });
    });

    return () => unsub();
  }, [user]);

  const renderTrackingCard = (l: any, type: "sent" | "incoming") => {
    const isDelivered = l.deliveryStatus === "delivered";
    const isDeadLetter = l.deliveryStatus === "dead-letter";

    // Skip if delivered or dead-letter
    if (isDelivered || isDeadLetter) return null;

    const postman = allPostmen.find((p) => p.id === l.postmanId) || allPostmen[0];

    if (l.deliveryStatus === "at-head-office") {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/50 p-8 rounded-[2.5rem] shadow-xl border-2 border-amber-200/50 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/10 rounded-bl-[4rem] -mr-8 -mt-8" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-amber-100 rounded-[1.5rem] flex items-center justify-center text-3xl border-2 border-white shadow-lg">
              <Building2 className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h4 className="text-lg font-black text-amber-900 font-serif">
                হেড অফিস নোটিশ
              </h4>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                চিঠিটি অফিসে গচ্ছিত আছে
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-amber-200/30 space-y-3 relative z-10">
            <div className="flex justify-between items-center text-[10px] font-black text-amber-800/60 uppercase tracking-tighter">
              <span>ট্র্যাকিং নম্বর</span>
              <span>প্রাপক পোস্টকোড</span>
            </div>
            <div className="flex justify-between items-center font-serif">
              <span className="text-lg font-bold text-amber-900 font-mono tracking-tighter">
                #{l.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-sm font-bold text-amber-900">
                {toBengaliDigits(l.receiverPostcode)}
              </span>
            </div>
            <div className="h-px bg-amber-100/50 w-full" />
            <p className="text-xs text-amber-800 leading-relaxed italic">
              {type === "incoming" 
                ? "প্রাপক অনুপস্থিত থাকায় চিঠিটি হেড অফিসে জমা রাখা হয়েছে। এটি পেতে অফিসে যোগাযোগ করুন।"
                : "প্রাপক অনুপস্থিত থাকায় পিয়ন চিঠিটি হেড অফিসে জমা দিয়ে ফিরে এসেছে। প্রাপক সংগ্রহ করলে পিয়ন আবার আপনাকে জানাবে।"}
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest relative z-10">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            অফিস ক্লিয়ারেন্সের অপেক্ষায়
          </div>
        </motion.div>
      );
    }

    let statusText = "পথে আছে";
    let subText = "পিয়ন সাইকেল চালিয়ে আসছে...";
    let progress = 0;
    let showTimer = true;
    
    const sentAt = l.dispatchTime || l.timestamp;
    const deliveryAt = sentAt + (l.deliveryDelay || 60000);
    const totalDelay = l.deliveryDelay || 60000;
    const elapsed = now - sentAt;
    const continuousProgress = Math.min(99, Math.max(0, (elapsed / totalDelay) * 100));
    let targetTime = deliveryAt;

    if (l.dispatchTime && now < l.dispatchTime) {
      statusText = "অফিস বন্ধ";
      const dispatchDate = new Date(l.dispatchTime);
      const isToday = dispatchDate.getDate() === new Date(now).getDate();
      subText = `হেড অফিস বন্ধ রয়েছে। ${isToday ? "আজ" : "আগামীকাল"} সকাল ৯টায় পিয়ন যাত্রা শুরু করবে।`;
      progress = 0;
      targetTime = l.dispatchTime;
    } else if (l.deliveryStatus === "at-veranda") {
      statusText = "বারান্দায় আছে";
      subText =
        type === "incoming"
          ? `${postman.name} আপনার দরজায় কড়া নাড়ছে!`
          : `${postman.name} প্রাপকের দরজায় কড়া নাড়ছে!`;
      progress = 100;
      targetTime = (l.lastAttemptAt || 0) + VERANDA_WINDOW;
    } else if (l.deliveryStatus === "returned-to-post") {
      statusText = "পোস্ট অফিসে ফেরত";
      subText =
        type === "incoming"
          ? "আপনি বারান্দায় ছিলেন না, পিয়ন আবার আসবে।"
          : "প্রাপক বারান্দায় ছিলেন না, পিয়ন আবার আসবে।";
      progress = 50;
      targetTime = l.nextAttemptAt || 0;
    } else {
      // Automatic status based on progress for smooth animation
      progress = continuousProgress;
      targetTime = deliveryAt;

      if (progress < 20) {
        statusText = "হেড অফিসের পথে";
        subText = "চিঠিটি রানার নিয়ে হেড অফিসের দিকে ছুটছে...";
      } else if (progress < 50) {
        statusText = "হেড অফিসে বাছাইকরণ";
        subText = "চিঠিটি আপনার জেলার প্রধান ডাকটিকে পৌঁছেছে, সেখানে এখন বাছাই চলছে...";
      } else if (progress < 75) {
        statusText = "শাখা ডাকটিকে";
        subText = "চিঠিটি আপনার স্থানীয় শাখা ডাকটিকে পৌঁছেছে এবং পিয়নের ব্যাগে তোলা হচ্ছে...";
      } else {
        statusText = type === "incoming" ? "পিয়ন আপনার ঠিকানায় আসছে" : "পিয়ন প্রাপকের ঠিকানায় যাচ্ছে";
        subText = type === "incoming" 
          ? `${postman.name} সাইকেল নিয়ে আপনার বাড়ির পথে রওনা দিয়েছে...`
          : `${postman.name} দ্রুত গতিতে প্রাপকের ঠিকানার দিকে যাচ্ছে...`;
      }
    }

    const timeLeft = Math.max(0, targetTime - now);
    const hoursLeft = Math.floor(timeLeft / 3600000);
    const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);
    const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
    const timeDisplay = `${hoursLeft.toString().padStart(2, "0")}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-primary/5 space-y-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />

        {/* Postman Animation/Icon */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-3xl overflow-hidden border-2 border-white shadow-lg">
              <PostmanAvatar avatar={postman.avatar} />
            </div>
            <div>
              <h4 className="text-lg font-black text-primary font-serif">
                {postman.name}
              </h4>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {statusText}
              </p>
            </div>
          </div>
          {showTimer && (
            <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                সময় বাকি
              </p>
              <p className="text-lg font-black text-primary font-mono">
                {toBengaliDigits(timeDisplay)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-start px-1 gap-4">
            <div className="flex-1">
              <p
                className={`text-xs font-medium italic ${l.excuseMessage ? "text-blue-600 bg-blue-50/50 p-2 rounded-xl border border-blue-100/50" : "text-gray-500"}`}
              >
                {l.excuseMessage ? (
                  <span className="flex items-start gap-2">
                    <Quote className="w-3 h-3 mt-0.5 opacity-30 shrink-0" />
                    {l.excuseMessage}
                  </span>
                ) : (
                  `"${subText}"`
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pt-1">
              <span className="text-[10px] font-bold text-primary">
                {toBengaliDigits(Math.round(progress))}%
              </span>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                সম্পন্ন
              </span>
            </div>
          </div>

          <div className="relative pt-6 pb-2">
            <div className="h-1.5 bg-gray-100 rounded-full relative">
              {/* Progress Line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={`h-full rounded-full ${l.deliveryStatus === "at-head-office" ? "bg-error" : "bg-primary"} shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]`}
              />

              {/* Cycling Animation */}
              <motion.div
                animate={{ left: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
              >
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="bg-white p-1.5 rounded-full shadow-lg border border-gray-100"
                  >
                    <Bike className="w-4 h-4 text-primary" />
                  </motion.div>
                  {/* Dash in the middle */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-3 bg-primary/30 mt-1" />
                </div>
              </motion.div>

              {/* Start and End Markers */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full" />
            </div>

            <div className="flex justify-between mt-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="flex flex-col">
                <span>যাত্রা শুরু</span>
                <span className="text-gray-300">০%</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <span className="text-primary">
                  গন্তব্যে পৌঁছাতে প্রায়{" "}
                  {toBengaliDigits(Math.ceil(timeLeft / 60000))} মিনিট
                </span>
                <div className="w-12 h-0.5 bg-gray-100 mt-1" />
              </div>
              <div className="flex flex-col items-end">
                <span>গন্তব্য</span>
                <span className="text-gray-300">১০০%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 relative z-10">
          <div className="flex items-center space-x-2">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-gray-600">
              {type === "sent"
                ? `গন্তব্য: ${toBengaliDigits(l.receiverPostcode)}`
                : `প্রেরক: ${toBengaliDigits(l.senderPostcode)}`}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-bold text-orange-500">
              লাইভ ট্র্যাকিং
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const currentLetters = activeTab === "sent" ? sentLetters : incomingLetters;
  const inTransitLetters = currentLetters.filter(
    (l) =>
      l.deliveryStatus !== "delivered" && l.deliveryStatus !== "dead-letter",
  );

  return (
    <div className="bg-[#fcfaf2] min-h-screen pb-32">
      {/* Header - Head Office Style */}
      <header className="bg-white/70 backdrop-blur-xl flex items-center gap-6 px-8 py-6 w-full sticky top-0 z-50 border-b border-primary/5 shadow-sm">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-12 h-12 bg-white rounded-[1.2rem] border-2 border-primary/5 shadow-lg flex items-center justify-center text-primary"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h2 className="text-2xl font-black text-primary font-serif tracking-tight">
            চিঠি ট্র্যাকিং
          </h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            চিঠির বর্তমান অবস্থান জানুন
          </p>
        </div>
      </header>

      <main className="px-6 mt-8 space-y-8">
        {/* Tabs - Bento Style */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("sent")}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 ${
              activeTab === "sent"
                ? "bg-primary border-primary shadow-xl shadow-primary/20 text-white"
                : "bg-white border-primary/5 text-gray-400 shadow-md"
            }`}
          >
            <Send
              className={`w-6 h-6 ${activeTab === "sent" ? "text-white" : "text-primary/40"}`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest">
              পাঠানো চিঠি
            </span>
            {filteredSent.length > 0 && (
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black ${activeTab === "sent" ? "bg-white text-primary" : "bg-primary/10 text-primary"}`}
              >
                {toBengaliDigits(filteredSent.length)}টি
              </span>
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("incoming")}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 ${
              activeTab === "incoming"
                ? "bg-primary border-primary shadow-xl shadow-primary/20 text-white"
                : "bg-white border-primary/5 text-gray-400 shadow-md"
            }`}
          >
            <Inbox
              className={`w-6 h-6 ${activeTab === "incoming" ? "text-white" : "text-primary/40"}`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest">
              আগত চিঠি
            </span>
            {filteredIncoming.length > 0 && (
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black ${activeTab === "incoming" ? "bg-white text-primary" : "bg-primary/10 text-primary"}`}
              >
                {toBengaliDigits(filteredIncoming.length)}টি
              </span>
            )}
          </motion.button>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {inTransitLetters.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[3rem] p-16 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-primary/10"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                  <Mail className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-gray-800 font-serif">
                    কোনো চিঠি ট্র্যাকিং নেই
                  </h4>
                  <p className="text-xs text-gray-400 font-bold">
                    বর্তমানে কোনো চিঠি পথে নেই।
                  </p>
                </div>
              </motion.div>
            ) : (
              inTransitLetters.map((l) => (
                <div key={l.id}>{renderTrackingCard(l, activeTab)}</div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const PostmanRecordScreen = ({ 
  postman, 
  onBack,
  user,
  allPostmen,
  onUpdateProfile
}: { 
  postman: any; 
  onBack: () => void;
  user: any;
  allPostmen: any[];
  onUpdateProfile: (data: any) => Promise<void>;
}) => {
  const [cvScale, setCvScale] = useState(1);
  const [editingPostman, setEditingPostman] = useState<any | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const userPostmen = [...(user?.postmen || []), ...allPostmen].filter((v: any, i: number, a: any[]) => a.findIndex(v2 => (v2.id === v.id || v2.name === v.name)) === i).map((p: any) => {
    const defaultP = POSTMEN.find(dp => dp.id === p.id);
    return defaultP ? { ...p, cost: defaultP.cost } : p;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPostman) return;
    const originalPostman = userPostmen.find((p: any) => p.id === editingPostman.id);
    if (!originalPostman) return;
    const isDefault = POSTMEN.some((p: any) => p.id === editingPostman.id);
    let editableFields = [
      'name', 'fileNo', 'serviceId', 'joiningDate', 'experience', 
      'education', 'specialty', 'cost', 'bio', 'specialTalent', 'catchphrase'
    ];
    
    if (isDefault) {
      editableFields = editableFields.filter(f => f !== 'cost');
      // Revert cost if manipulated
      editingPostman.cost = originalPostman.cost;
    }

    let changedCount = 0;
    for (const field of editableFields) {
      if (editingPostman[field] !== originalPostman[field]) {
        changedCount++;
      }
    }
    if (changedCount === 0) {
      setEditingPostman(null);
      return;
    }
    const totalCost = changedCount * 5;
    if (user.coins < totalCost) {
      showToast(`আপনার পর্যাপ্ত কয়েন নেই! ${changedCount}টি অংশ পরিবর্তনের জন্য ${totalCost} কয়েন প্রয়োজন।`, "error");
      return;
    }
    const newPostmen = userPostmen.map((p: any) => p.id === editingPostman.id ? editingPostman : p);
    await onUpdateProfile({ postmen: newPostmen, coins: user.coins - totalCost });
    vintageAudio.playStamp();
    setEditingPostman(null);
    showToast(`পিয়নের তথ্য আপডেট করা হয়েছে! ${totalCost} কয়েন কাটা হয়েছে। ✅`, "success");
  };

  useEffect(() => {
    const updateScale = () => {
      const padding = window.innerWidth < 640 ? 32 : 64;
      const baseWidth = 842;
      const scale = (window.innerWidth - padding) / baseWidth;
      setCvScale(scale > 1 ? 1 : scale);
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[110] bg-[#f0ede4] overflow-y-auto flex flex-col items-center paper-texture"
    >
      <div className="w-full max-w-[842px] px-4 sm:px-8 pt-8 pb-40 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8 shrink-0 z-50">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 font-black uppercase tracking-widest text-xs hover:bg-black/5 p-3 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            সূচিপত্রে ফিরে যান
          </button>
          <button
            onClick={() => { vintageAudio.playClick(); setEditingPostman(postman); }}
            className="p-3 bg-white shadow-md rounded-full text-primary hover:bg-primary hover:text-white transition-all border border-gray-200"
          >
            <PenLine className="w-5 h-5" />
          </button>
        </div>

        <div 
          style={{ 
            width: `${842 * cvScale}px`, 
            height: `${(1191 * 2 + 32) * cvScale}px` 
          }}
          className="relative shrink-0"
        >
          <div 
            className="absolute top-0 left-0 flex flex-col gap-8 origin-top-left"
            style={{ 
              transform: `scale(${cvScale})`,
              width: '842px'
            }}
          >
            {/* PAGE 1 */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-[#f4f1ea] rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-gray-400 relative w-[842px] h-[1191px] flex flex-col overflow-hidden shrink-0 p-6 sm:p-8"
              style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
            >
              <div className="absolute inset-6 sm:inset-8 border-2 border-[#0a192f] pointer-events-none z-20" />
              <div className="absolute inset-[1.75rem] sm:inset-[2.25rem] border border-[#0a192f] pointer-events-none z-20" />

              <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 text-[#0a192f]">
                <div className="flex justify-between items-start border-b-2 border-[#0a192f] pb-4 mb-6">
                  <div className="w-32">
                    <div className="border-2 border-[#0a192f] p-2 text-center">
                      <p className="text-[9px] font-mono font-bold uppercase">Form No.</p>
                      <p className="text-xs font-serif font-bold">BPO-PR-42A</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 bg-transparent border-2 border-[#0a192f] rounded-full flex items-center justify-center mb-2">
                      <DakthikLogo className="text-[#0a192f] w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif font-black tracking-widest uppercase leading-tight">ডাকটিক</h2>
                    <p className="text-[9px] font-mono uppercase tracking-[0.3em] mt-1">Dakthik Digital Services</p>
                    <div className="mt-2 inline-block bg-[#0a192f] text-[#f4f1ea] px-4 py-1 text-center">
                      <h4 className="text-sm font-serif font-bold tracking-widest">ব্যক্তিগত নথি / PERSONNEL RECORD</h4>
                    </div>
                  </div>

                  <div className="w-32 text-right flex justify-end">
                    <div className="opacity-90 rotate-[15deg] translate-y-2 translate-x-2 inline-block">
                      <div className="border-4 border-red-700 px-2 py-1 text-red-700 font-black text-base uppercase tracking-widest" style={{ fontFamily: 'serif' }}>
                        গোপনীয়
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex gap-6">
                    <div className="w-[35%] flex flex-col gap-4">
                      <div className="border-2 border-[#0a192f] p-2 flex flex-col items-center justify-center aspect-square bg-[#e8e4d9]">
                        <div className="w-full h-full border border-[#0a192f] rounded-full overflow-hidden grayscale contrast-125 sepia-[.2] relative">
                          <PostmanAvatar avatar={postman.avatar} postmanId={postman.id} name={postman.name} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border-2 border-[#0a192f] p-2 text-center bg-[#e8e4d9]">
                          <p className="text-[9px] font-bold uppercase mb-1">File No.</p>
                          <p className="text-base font-serif font-bold">{postman.fileNo || 'N/A'}</p>
                        </div>
                        <div className="border-2 border-[#0a192f] p-2 text-center bg-[#e8e4d9]">
                          <p className="text-[9px] font-bold uppercase mb-1">Service ID</p>
                          <p className="text-base font-mono font-bold">{postman.serviceId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-[65%] border-2 border-[#0a192f] flex flex-col">
                      <div className="bg-[#0a192f] text-[#f4f1ea] px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 border-[#0a192f]">
                        পেশাগত তথ্য / PROFESSIONAL INFO
                      </div>
                      <div className="grid grid-cols-2 flex-1 divide-x-2 divide-[#0a192f]">
                        <div className="flex flex-col divide-y-2 divide-[#0a192f]">
                          <div className="p-3 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">যোগদানের তারিখ</p>
                            <p className="text-base font-serif font-bold">{postman.joiningDate || 'N/A'}</p>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">অভিজ্ঞতা</p>
                            <p className="text-base font-serif font-bold">{postman.experience || 'N/A'}</p>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">শিক্ষাগত যোগ্যতা</p>
                            <p className="text-base font-serif font-bold">{postman.education || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col divide-y-2 divide-[#0a192f]">
                          <div className="p-3 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">বিভাগ / বিশেষত্ব</p>
                            <p className="text-base font-serif font-bold">{postman.specialty || 'N/A'}</p>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">মাসিক চার্জ</p>
                            <p className="text-base font-serif font-bold">{POSTMEN.find(dp => dp.id === postman.id)?.cost ?? postman.cost} 🪙</p>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-center">
                            <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">কর্মক্ষমতা রেটিং</p>
                            <p className="text-base font-serif font-bold">N/A</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-[#0a192f] flex flex-col mt-auto">
                    <div className="bg-[#0a192f] text-[#f4f1ea] px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 border-[#0a192f]">
                      প্রাথমিক বিবরণ / BASIC DETAILS
                    </div>
                    <div className="grid grid-cols-2 divide-x-2 divide-[#0a192f]">
                      <div className="p-4 flex flex-col justify-center">
                        <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">নাম (বাংলায়)</p>
                        <p className="text-xl font-serif font-bold">{postman.name}</p>
                      </div>
                      <div className="p-4 flex flex-col justify-center">
                        <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">Name (English)</p>
                        <p className="text-lg font-mono font-bold uppercase">{postman.id.toUpperCase()}_POSTMAN</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* PAGE 2 */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#f4f1ea] rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-gray-400 relative w-[842px] h-[1191px] flex flex-col overflow-hidden shrink-0 p-6 sm:p-8"
              style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
            >
              <div className="absolute inset-6 sm:inset-8 border-2 border-[#0a192f] pointer-events-none z-20" />
              <div className="absolute inset-[1.75rem] sm:inset-[2.25rem] border border-[#0a192f] pointer-events-none z-20" />

              <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 text-[#0a192f]">
                <div className="flex justify-between items-center border-b-2 border-[#0a192f] pb-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-transparent border-2 border-[#0a192f] rounded-full flex items-center justify-center">
                      <DakthikLogo className="text-[#0a192f] w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-serif font-bold uppercase tracking-widest">ডাকটিক</p>
                      <p className="text-[7px] font-mono uppercase tracking-[0.2em]">Dakthik Digital Services</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono font-bold uppercase">File No: {postman.fileNo || 'N/A'}</p>
                    <p className="text-[8px] font-mono uppercase mt-1">Page 2 of 2</p>
                  </div>
                </div>

                <div className="border-2 border-[#0a192f] flex flex-col flex-1">
                  <div className="bg-[#0a192f] text-[#f4f1ea] px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 border-[#0a192f]">
                    ব্যক্তিগত বৈশিষ্ট্য ও মন্তব্য / PERSONAL TRAITS & REMARKS
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col h-full gap-4 sm:gap-6">
                    <div className="flex-1 flex flex-col">
                      <p className="text-[9px] font-bold uppercase text-gray-600 mb-2">জীবনবৃত্তান্ত (Bio):</p>
                      <div className="border-2 border-[#0a192f] p-4 sm:p-6 flex-1 bg-[#e8e4d9] relative">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0a192f 1px, transparent 1px)', backgroundSize: '100% 2rem', backgroundPosition: '0 1rem' }} />
                        <p className="text-xl font-serif text-[#0a192f] leading-[2rem] relative z-10 text-justify">{postman.bio}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div className="border-2 border-[#0a192f] p-3 sm:p-4 bg-[#e8e4d9]">
                        <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">বিশেষ গুণ (Special Talent):</p>
                        <p className="text-lg font-serif font-bold text-[#0a192f]">{postman.specialTalent || 'N/A'}</p>
                      </div>
                      <div className="border-2 border-[#0a192f] p-3 sm:p-4 bg-[#e8e4d9]">
                        <p className="text-[9px] font-bold uppercase text-gray-600 mb-1">তকমা (Catchphrase):</p>
                        <p className="text-lg font-serif italic text-[#0a192f]">"{postman.catchphrase}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 sm:pt-12 flex justify-between items-end relative mt-auto">
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-0 opacity-10 pointer-events-none">
                    <Stamp className="w-24 h-24 rotate-12" />
                  </div>

                  <div className="w-40 text-center space-y-2">
                    <p className="font-handwriting text-2xl text-[#0a192f] -rotate-2 select-none" style={{ fontFamily: 'Dancing Script, cursive' }}>এ. কে. Azad</p>
                    <div className="w-full h-[2px] bg-[#0a192f]" />
                    <p className="text-[8px] font-bold uppercase">বিভাগীয় প্রধানের স্বাক্ষর ও সিল</p>
                    <p className="text-[7px] font-mono">Head of Department</p>
                  </div>

                  <div className="w-40 text-center space-y-2 relative">
                    <p className={`font-handwriting text-3xl text-[#0a192f] -rotate-2 select-none ${postman.id === 'pm1' ? 'opacity-90 blur-[0.4px] scale-90 tracking-tighter' : ''}`} 
                       style={{ 
                         fontFamily: postman.id === 'pm1' ? 'Atma' : 'Dancing Script, cursive',
                         fontWeight: postman.id === 'pm1' ? '900' : 'normal',
                         textDecoration: postman.id === 'pm1' ? 'underline' : 'none'
                       }}>
                      {postman.name}
                    </p>
                    {postman.id === 'pm1' && (
                      <div className="absolute -top-8 -right-4 opacity-40 rotate-12">
                        <div className="w-8 h-12 bg-[#0a192f] rounded-[40%_50%_45%_40%] flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 1px, #fff 2px)', backgroundSize: '3px 3px' }} />
                        </div>
                        <p className="text-[5px] font-mono text-[#0a192f] mt-1">L.T.I.</p>
                      </div>
                    )}
                    <div className="w-full h-[2px] bg-[#0a192f]" />
                    <p className="text-[8px] font-bold uppercase">কর্মীর স্বাক্ষর / টিপসই</p>
                    <p className="text-[7px] font-mono">Signature / L.T.I</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingPostman && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div 
              className="absolute inset-0"
              onClick={() => {
                vintageAudio.playClick();
                setEditingPostman(null);
              }}
            />
            
            <div
              className="bg-[#fdfaf3] paper-texture w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl relative z-10 custom-scrollbar shadow-2xl"
            >
              <div className="sticky top-0 bg-[#fdfaf3]/90 backdrop-blur-sm p-4 border-b-2 border-primary/20 z-20 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                    <PenLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-xl text-primary leading-none">
                      নথি সংশোধন
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mt-1">
                      Editing Record
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    vintageAudio.playClick();
                    setEditingPostman(null);
                  }}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors group"
                >
                  <Minimize2 className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                </button>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleSave} className="space-y-8 relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#fffbeb] border-2 border-dashed border-[#d97706]/30 p-6 rounded-sm mb-8 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Coins className="w-12 h-12 text-[#d97706]" />
                    </div>
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="bg-[#d97706]/10 p-2 rounded-full shrink-0">
                        <AlertCircle className="w-5 h-5 text-[#d97706]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-[#92400e] font-serif">সংশোধনী সংক্রান্ত বিশেষ বিজ্ঞপ্তি</h4>
                        <p className="text-xs text-[#92400e]/80 leading-relaxed font-serif">
                          শ্রদ্ধেয় ব্যবহারকারী, পিয়ন রেজিস্ট্রি বা নথি সংশোধনের ক্ষেত্রে প্রতিবার তথ্য পরিবর্তনের জন্য আপনার তবিল হতে <span className="font-black">৫টি স্বর্ণমুদ্রা (কয়েন)</span> ফি হিসেবে কর্তন করা হবে। অনুগ্রহপূর্বক সঠিক তথ্য প্রদান নিশ্চিত করুন।
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        কর্মীর নাম (Name)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.name || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, name: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        ফাইল নং (File No)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.fileNo || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, fileNo: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        সার্ভিস আইডি (Service ID)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.serviceId || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, serviceId: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        যোগদানের তারিখ (Joining Date)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.joiningDate || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, joiningDate: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        অভিজ্ঞতা (Experience)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.experience || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, experience: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        শিক্ষাগত যোগ্যতা (Education)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.education || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, education: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        বিভাগ / বিশেষত্ব (Specialty)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.specialty || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, specialty: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        মাসিক চার্জ (Cost)
                      </label>
                      <input
                        type="number"
                        value={POSTMEN.find(p => p.id === editingPostman.id)?.cost ?? (editingPostman.cost || 0)}
                        onChange={(e) => setEditingPostman({ ...editingPostman, cost: parseInt(e.target.value) || 0 })}
                        disabled={POSTMEN.some(p => p.id === editingPostman.id)}
                        className={`w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 outline-none text-lg font-serif ${POSTMEN.some(p => p.id === editingPostman.id) ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary'}`}
                      />
                      {POSTMEN.some(p => p.id === editingPostman.id) && (
                        <p className="text-[10px] text-red-500 font-serif">ডিফল্ট পিয়নের সার্ভিস চার্জ পরিবর্তনযোগ্য নয়।</p>
                      )}
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        তকমা (Catchphrase)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.catchphrase || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, catchphrase: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        বিশেষ গুণ (Special Talent)
                      </label>
                      <input
                        type="text"
                        value={editingPostman.specialTalent || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, specialTalent: e.target.value })}
                        className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/30 rounded-full" />
                        জীবনবৃত্তান্ত (Bio)
                      </label>
                      <textarea
                        value={editingPostman.bio || editingPostman.description || ""}
                        onChange={(e) => setEditingPostman({ ...editingPostman, bio: e.target.value })}
                        className="w-full p-5 bg-white/50 rounded-none border-2 border-dashed border-primary/10 focus:border-primary/30 outline-none text-base min-h-[160px] leading-relaxed font-serif italic text-gray-700 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-black/5 flex justify-end gap-3 sticky bottom-0 bg-[#fdfaf3]/95 backdrop-blur-md p-4 -mx-8 -mb-8">
                    <button
                      type="button"
                      onClick={() => {
                        vintageAudio.playClick();
                        setEditingPostman(null);
                      }}
                      className="px-6 py-4 rounded-none font-bold uppercase tracking-widest text-xs hover:bg-black/5 transition-colors"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-4 bg-primary text-white rounded-none shadow-md hover:bg-black transition-all font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                    >
                      সংশোধন সংরক্ষণ করুন
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AddaRoomScreen = ({ onBack, user, allPostmen, onSendMessage, onTriggerAdda }: { onBack: () => void; user: any; allPostmen: any[]; onSendMessage: (msg: string) => Promise<void>; onTriggerAdda: (isBackground?: boolean) => Promise<void> }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [localActiveLetters, setLocalActiveLetters] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typingPostman, setTypingPostman] = useState<string | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "adda_messages"),
      orderBy("timestamp", "desc"),
      limit(100)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(fetched.reverse());
    });

    const qLetters = query(
      collection(db, "letters"),
      where("deliveryStatus", "in", ["in-transit", "processing-at-post-office", "with-mail-carrier", "at-veranda"])
    );
    const unsubLetters = onSnapshot(qLetters, (snapshot) => {
      setLocalActiveLetters(snapshot.docs.map(doc => doc.data()));
    });

    return () => {
      unsub();
      unsubLetters();
    };
  }, [user]);

  // Periodic Background Chat
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // If idle for 45 seconds, trigger some background gossip
      if (now - lastActivityRef.current > 45000 && !sending && !typingPostman) {
        onTriggerAdda(true);
        lastActivityRef.current = now;
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [onTriggerAdda, sending, typingPostman]);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      if (isFirstLoad.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "auto"
        });
        isFirstLoad.current = false;
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      if (isAtBottom) {
        // Only auto scroll if already at bottom
        scrollRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth"
        });
      } else {
        setHasNewMessages(true);
      }
    }
  }, [messages, typingPostman]);

  const handleScroll = () => {
    if (scrollRef.current) {
       const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
       const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
       if (isAtBottom && hasNewMessages) {
         setHasNewMessages(false);
       }
    }
  };

  const scrollToBottom = () => {
     if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth"
        });
        setHasNewMessages(false);
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    lastActivityRef.current = Date.now();
    const currentInput = input;
    setInput("");
    setSending(true);
    try {
      // Fire and forget mechanism for the backend logic if needed, but since it's a promise:
      // Wait, if it awaits onSendMessage(currentInput), sending will remain true. So user can't type more while it's generating.
      // The instruction says "ইউজারের টাইপিং অন: ... পাল্লা দিয়ে যেকোনো সময় মেসেজ পাঠাতে পারবেন।"
      // So sending should be false IMMEDIATELY.
      onSendMessage(currentInput); 
    } finally {
      setSending(false);
    }
  };

  const sendTeaBreak = async () => {
     if (sending) return;
     lastActivityRef.current = Date.now();
     setSending(true);
     try {
       onSendMessage("☕ সবাই মিলে চা বিরতি নিই!");
     } finally {
       setSending(false);
     }
  };

  // Listening for typing indicator events (conceptual, we will set this in handleUserAddaMessage)
  useEffect(() => {
    const handleTyping = (e: any) => setTypingPostman(e.detail);
    window.addEventListener('postman-typing', handleTyping);
    return () => window.removeEventListener('postman-typing', handleTyping);
  }, []);

  return (
    <div className="bg-[#fcf8f1] min-h-screen flex flex-col fixed inset-0 z-[60] overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")` }} />
       
       <header className="p-4 md:p-6 bg-[#fffcf5] border-b-2 border-[#e8dfc7] flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-primary/5 rounded-xl text-primary hover:bg-primary/10 transition-all active:scale-95"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex items-center gap-3">
               <div className="relative">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg overflow-hidden">
                    <PostmanAvatar avatar="/করিম চাচা.png" className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
               </div>
               <div>
                 <h2 className="text-lg md:text-xl font-black text-[#4a3728] font-serif leading-none tracking-tight flex items-center gap-2">
                    রুম ৬০৯
                    <span className="text-[10px] md:text-xs font-mono font-normal opacity-40 px-2 py-0.5 border border-[#4a3728]/10 rounded-full">ডাকটিক আড্ডাখানা</span>
                  </h2>
                  {(()=>{
                     const busyIds = new Set(localActiveLetters.map((l: any) => l.postmanId));
                     const idlePostmenCount = allPostmen.filter(p => !busyIds.has(p.id)).length;
                     return (
                       <p className="text-[9px] text-green-600 uppercase tracking-widest font-black opacity-80 mt-1 flex items-center gap-1">
                         <Dot className="w-4 h-4 animate-pulse fill-green-500" /> {idlePostmenCount > 0 ? `${idlePostmenCount} জন আড্ডায় আছে` : "কেউ আড্ডায় নেই"}
                       </p>
                     );
                  })()}
               </div>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <div className="hidden md:flex -space-x-3 items-center mr-2">
               {(()=>{
                 const busyIds = new Set(localActiveLetters.map((l: any) => l.postmanId));
                 const idlePostmen = allPostmen.filter(p => !busyIds.has(p.id));
                 return idlePostmen.map(p => (
                   <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                      <img src={p.avatar} className="w-full h-full object-cover" />
                   </div>
                 ));
               })()}
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
               <Coffee className="w-5 h-5" />
            </div>
         </div>
       </header>

       <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth relative">
         <div className="flex flex-col items-center mb-8 space-y-3 opacity-50">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b4513]">আড্ডা শুরু হয়েছে</p>
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#8b4513]/20 to-transparent" />
         </div>

         {messages.map((m, i) => {
           const isSystem = m.type === "system";
           const isUser = m.type === "user";
           const postman = allPostmen.find(p => p.id === m.postmanId || p.name === m.postmanName);
           const isRight = isUser;

           if (isSystem) {
             return (
               <div key={m.id} className="flex justify-center py-4">
                 <div className="bg-primary/5 px-5 py-2 rounded-full border border-primary/10">
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{m.message}</p>
                 </div>
               </div>
             );
           }

           return (
             <motion.div
               key={m.id}
               initial={{ opacity: 0, scale: 0.9, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className={`flex gap-3 md:gap-4 ${isRight ? "flex-row-reverse" : "flex-row"}`}
             >
                {!isRight && (
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-white shadow-lg border-2 border-white flex-shrink-0">
                    <img src={postman?.avatar || "/করিম চাচা.png"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
               
               <div className={`space-y-1.5 max-w-[85%] md:max-w-[75%] flex flex-col ${isRight ? "items-end" : "items-start"}`}>
                  <span className="text-[9px] font-black text-[#8b4513] uppercase tracking-widest opacity-40 px-1">
                    {isUser ? user.displayName : m.postmanName}
                  </span>
                  <div className={`group px-5 py-4 rounded-[1.5rem] shadow-sm text-[14px] md:text-[15px] font-serif leading-relaxed tracking-tight relative transition-all ${
                    isUser 
                      ? "bg-[#2d4059] text-white rounded-tr-none"
                      : "bg-white text-[#4a3728] rounded-tl-none border border-[#e8dfc7]"
                  }`}>
                    <div>{m.message}</div>
                    
                    {/* Timestamp hint */}
                    <p className={`text-[8px] mt-1 opacity-40 font-sans ${isUser ? "text-right" : "text-left"}`}>
                       {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[1.5rem]" 
                         style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/handmade-paper.png")` }} />
                  </div>
               </div>
             </motion.div>
           );
         })}

         {typingPostman && (
           <motion.div
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex gap-3 items-center ml-1"
           >
             <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-md border border-gray-100 p-0.5">
                <img src={allPostmen.find(p => p.name === typingPostman)?.avatar || "/করিম চাচা.png"} className="w-full h-full object-cover" />
             </div>
             <div className="bg-white/80 backdrop-blur px-4 py-2.5 rounded-full border border-gray-100 flex gap-1 items-center shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 font-serif mr-1">{typingPostman} লিখছেন</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" />
             </div>
           </motion.div>
         )}

         {/* Show New Messages Indicator */}
         {hasNewMessages && (
           <div className="sticky bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20">
             <button
               onClick={scrollToBottom}
               className="pointer-events-auto flex items-center gap-2 bg-[#8b4513] text-white px-5 py-2.5 rounded-full shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all text-xs font-black font-serif"
             >
               <span className="animate-bounce">↓</span> নতুন মেসেজ
             </button>
           </div>
         )}
       </div>

       {/* Messaging Bar */}
       <div className="p-4 md:p-6 bg-white/95 backdrop-blur-xl border-t-2 border-[#e8dfc7] shrink-0">
         <div className="max-w-2xl mx-auto space-y-4">
           {/* Quick Suggestion Pills */}
           <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2 shrink-0">
              <button 
                onClick={sendTeaBreak}
                disabled={sending}
                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#fcf8f1] border border-[#e8dfc7] rounded-full text-[10px] font-black text-[#8b4513] hover:bg-[#8b4513] hover:text-white transition-all disabled:opacity-50"
              >
                ☕ চা বিরতি
              </button>
              <button 
                onClick={() => setInput("বাটপাড়ি করবেন না!")}
                disabled={sending}
                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#fcf8f1] border border-[#e8dfc7] rounded-full text-[10px] font-black text-[#8b4513] hover:bg-[#8b4513] hover:text-white transition-all disabled:opacity-50"
              >
                😡 অভিযোগ
              </button>
              <button 
                onClick={() => setInput("কেমন আছেন সবাই?")}
                disabled={sending}
                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#fcf8f1] border border-[#e8dfc7] rounded-full text-[10px] font-black text-[#8b4513] hover:bg-[#8b4513] hover:text-white transition-all disabled:opacity-50"
              >
                👋 কুশল বিনিময়
              </button>
           </div>

           <form onSubmit={handleSubmit} className="flex gap-3 items-center">
             <div className="flex-1 relative group">
                <input
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    lastActivityRef.current = Date.now();
                  }}
                  disabled={sending}
                  placeholder="পিয়নদের কিছু বলুন..."
                  className="w-full pl-6 pr-12 py-4 bg-[#fcf8f1] border-2 border-[#e8dfc7] rounded-[2rem] text-sm focus:outline-none focus:border-[#8b4513] transition-all font-serif placeholder:text-[#8b4513]/30 shadow-inner disabled:opacity-50"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Type className="w-5 h-5 text-[#8b4513]/20" />
                </div>
             </div>
             <button
               type="submit"
               disabled={!input.trim() || sending}
               className="p-4 bg-[#8b4513] text-white rounded-full shadow-lg shadow-[#8b4513]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
             >
               <Send className="w-5 h-5" />
             </button>
           </form>
         </div>
       </div>
    </div>
  );
};

const PostmanAdda = ({ user, allPostmen, allActiveLetters, onTrigger }: { user: any; allPostmen: any[]; allActiveLetters: any[]; onTrigger: () => void }) => {
  const [dialogue, setDialogue] = useState<PostmanDialogue[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(0);

  const getPostmanStatus = (postmanId: string) => {
    const isBusy = allActiveLetters.some(l => l.postmanId === postmanId);
    const currentHour = new Date().getHours();
    const isOffDuty = currentHour >= 22 || currentHour < 6;

    if (isBusy) return { label: "কাজে আছে", color: "text-amber-600", dot: "bg-amber-500", icon: "📦" };
    if (isOffDuty) return { label: "বাসায় আছে", color: "text-gray-500", dot: "bg-gray-400", icon: "🏠" };
    return { label: "আড্ডায় আছে", color: "text-green-600", dot: "bg-green-500", icon: "☕" };
  };

  const fetchAdda = useCallback(async () => {
    if (loading) return;
    
    // Throttle generation to every 1 minute
    if (Date.now() - lastGenerated < 60000 && dialogue.length > 0) return;

    setLoading(true);
    try {
      // Find busy postmen IDs
      const busyPostmenIds = new Set(allActiveLetters.map(l => l.postmanId));
      
      // Filter for idle postmen
      const idlePostmen = [...(user?.postmen || []), ...allPostmen]
        .filter((v: any, i: number, a: any[]) => a.findIndex(v2 => (v2.id === v.id || v2.name === v.name)) === i)
        .filter((p: any) => !busyPostmenIds.has(p.id));
      const names = idlePostmen.map((p: any) => p.name);
      
      if (names.length < 2) {
        setDialogue([
          { speaker: "সিস্টেম", message: "বেশিভাগ পিয়ন এখন চিঠিপত্র বিলি করতে বাহিরে আছে। আড্ডা জমানোর মতো পিয়ন এখন নেই।" }
        ]);
        setLoading(false);
        return;
      }

      const result = await generatePostmanAdda({
        villageName: user.village || "সোনারগাঁও",
        deadLettersCount: Math.floor(Math.random() * 10), 
        activeLettersCount: allActiveLetters.length,
        postmenNames: names.slice(0, 5),
      });
      setDialogue(result);
      setLastGenerated(Date.now());
    } catch (e) {
      console.error("AI Adda generation failed:", e);
    } finally {
      setLoading(false);
    }
  }, [user, allPostmen, allActiveLetters, loading, lastGenerated, dialogue.length]);

  useEffect(() => {
    fetchAdda();
  }, [fetchAdda]);

  return (
    <div className="bg-white/90 p-10 rounded-[3rem] border-2 border-primary/10 shadow-2xl relative overflow-hidden group max-w-2xl mx-auto text-center space-y-8">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/5 shadow-inner">
          <Coffee className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h4 className="font-serif font-black text-primary text-2xl tracking-tight">বড় ডাকটিকের আড্ডা ঘর</h4>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black opacity-60">
            গল্পগুজবে যোগ দিতে বাটনে ক্লিক করুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onTrigger}
          disabled={loading}
          className="flex-1 py-5 bg-white hover:bg-primary/5 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest transition-all border-2 border-primary/10 flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
          নতুন আড্ডা জমাও
        </button>
        <button 
          className="flex-1 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95"
          onClick={() => (window as any).postmanNavigate("adda-room")}
        >
          <LogIn className="w-4 h-4" />
          আড্ডায় যোগ দিন
        </button>
      </div>

      {/* Postmen Live Status Board */}
      <div className="mt-8 pt-8 border-t border-primary/5">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-4 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          পিয়নদের বর্তমান অবস্থা (রুম ৬০৯)
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {allPostmen.map(p => {
            const status = getPostmanStatus(p.id);
            return (
              <div key={p.id} className="flex items-center gap-2 bg-gray-50/50 p-1.5 pr-3 rounded-full border border-gray-100/50">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-white">
                    <img src={p.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${status.dot} border border-white rounded-full`} />
                </div>
                <div className="flex flex-col items-start translate-y-[1px]">
                  <span className="text-[9px] font-bold text-[#4a3728] leading-none mb-0.5">{p.name}</span>
                  <span className="text-[7px] leading-tight font-black uppercase text-gray-400">{status.icon} {status.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 italic">"এখানে করিম চাচা আর রফিক পিয়ন বসে পাড়ার গপসপ করে"</p>
    </div>
  );
};

const PostmenScreen = ({
  onBack,
  user,
  onUpdateProfile,
  allPostmen,
  onOpenRecord,
  initialEditingPostman,
  clearInitialEditingPostman
}: {
  onBack: () => void;
  user: any;
  onUpdateProfile: (data: any) => Promise<void>;
  allPostmen: any[];
  onOpenRecord: (postman: any) => void;
  initialEditingPostman?: any;
  clearInitialEditingPostman?: () => void;
}) => {
  const [editingPostman, setEditingPostman] = useState<any | null>(null);

  useEffect(() => {
    if (initialEditingPostman) {
      setEditingPostman({ ...initialEditingPostman });
    }
  }, [initialEditingPostman]);

  const userPostmen = [...(user?.postmen || []), ...allPostmen].filter((v: any, i: number, a: any[]) => a.findIndex(v2 => (v2.id === v.id || v2.name === v.name)) === i).map((p: any) => {
    const defaultP = POSTMEN.find(dp => dp.id === p.id);
    return defaultP ? { ...p, cost: defaultP.cost } : p;
  });

  useLockBodyScroll(!!editingPostman);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPostman) return;

    const originalPostman = userPostmen.find((p: any) => p.id === editingPostman.id);
    if (!originalPostman) return;

    const isDefault = POSTMEN.some((p: any) => p.id === editingPostman.id);
    let editableFields = [
      'name', 'fileNo', 'serviceId', 'joiningDate', 'experience', 
      'education', 'specialty', 'cost', 'bio', 'specialTalent', 'catchphrase'
    ];

    if (isDefault) {
      editableFields = editableFields.filter(f => f !== 'cost');
      // Revert cost if manipulated
      editingPostman.cost = originalPostman.cost;
    }

    let changedCount = 0;
    for (const field of editableFields) {
      if (editingPostman[field] !== originalPostman[field]) {
        changedCount++;
      }
    }

    if (changedCount === 0) {
      setEditingPostman(null);
      return;
    }

    const totalCost = changedCount * 5;

    if (user.coins < totalCost) {
      showToast(`আপনার পর্যাপ্ত কয়েন নেই! ${changedCount}টি অংশ পরিবর্তনের জন্য ${totalCost} কয়েন প্রয়োজন।`, "error");
      return;
    }

    const newPostmen = userPostmen.map((p: any) =>
      p.id === editingPostman.id ? editingPostman : p,
    );
    
    await onUpdateProfile({ 
      postmen: newPostmen,
      coins: user.coins - totalCost
    });
    
    vintageAudio.playStamp();
    setEditingPostman(null);
    clearInitialEditingPostman?.();
    showToast(`পিয়নের তথ্য আপডেট করা হয়েছে! ${totalCost} কয়েন কাটা হয়েছে। ✅`, "success");
  };

  return (
    <div className="p-0 pb-24 paper-texture min-h-screen bg-[#fdfaf3]">
      {/* Header */}
      <div className="bg-[#8d1c1c] p-8 shadow-2xl border-b-8 border-[#5d1212] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white/20 m-4" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-white/20 m-4" />
        <div className="flex items-center space-x-6 relative z-10">
          <button
            onClick={() => {
              vintageAudio.playClick();
              onBack();
            }}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20 shadow-inner"
          >
            <ArrowLeft className="text-white w-7 h-7" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-white font-serif tracking-widest uppercase">
              ডাকপিয়ন রেজিস্ট্রি
            </h2>
            <p className="text-xs text-white/70 font-mono uppercase tracking-[0.3em] mt-1">
              সক্রিয় ডাককর্মী তালিকা • ২০২৪
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-12 mt-8">
        {/* Index Page Style - Grid Layout for Folder feel */}
        <div className="bg-[#fcf9f0] p-8 sm:p-12 rounded-sm shadow-2xl border border-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 paper-texture pointer-events-none" />
          
          <div className="relative z-10 space-y-12">
            <div className="text-center space-y-3 border-b-2 border-primary/10 pb-10">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/10">
                <FolderOpen className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-4xl font-serif font-black text-primary tracking-widest uppercase">
                ব্যক্তিগত নথি সূচি
              </h3>
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.5em]">
                ব্যক্তিগত তথ্য নথি
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {userPostmen.map((p: any, idx: number) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    onOpenRecord(p);
                  }}
                  className="relative group cursor-pointer w-full text-left"
                >
                  {/* Folder Tab Style */}
                  <div className="absolute -top-3 left-4 px-4 py-1 bg-[#e8e0cc] rounded-t-lg border-t border-x border-gray-300 text-[8px] font-mono text-gray-500 uppercase tracking-widest z-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    নথি নং: {p.id.toUpperCase()}
                  </div>
                  
                  <div className="bg-[#fdfaf3] p-6 rounded-lg rounded-tl-none border border-gray-300 shadow-md group-hover:shadow-xl group-hover:border-primary/30 transition-all relative z-10 flex items-center gap-4 overflow-hidden">
                    <div className="absolute inset-0 opacity-20 paper-texture pointer-events-none" />
                    <div className="w-16 h-16 text-5xl flex-shrink-0 drop-shadow-md group-hover:scale-110 transition-transform">
                      <PostmanAvatar avatar={p.avatar} postmanId={p.id} name={p.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl font-serif font-black text-gray-800 truncate group-hover:text-primary transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest truncate">
                        {p.serviceId || `DHK-${p.id.toUpperCase()}`}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/20 w-full" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-primary/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="pt-8 flex justify-center opacity-10">
              <div className="w-32 h-32 border-4 border-dashed border-black rounded-full flex items-center justify-center rotate-12">
                <Stamp className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {editingPostman && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[120] bg-[#fdfaf3] overflow-y-auto paper-texture"
            >
              <div className="max-w-2xl mx-auto p-4 py-12 space-y-8">
                <motion.div
                  className="bg-[#fcf9f0] p-10 rounded-sm shadow-[20px_20px_60px_rgba(0,0,0,0.1)] border-l-[12px] border-primary/30 border-y border-r border-gray-200 space-y-8 relative overflow-hidden"
                >
                  {/* Paper texture overlay */}
                  <div className="absolute inset-0 opacity-40 pointer-events-none paper-texture" />
                  
                  {/* Ledger lines background */}
                  <div className="absolute left-16 top-0 bottom-0 w-px bg-red-200/50" />
                  <div className="absolute left-[4.25rem] top-0 bottom-0 w-px bg-red-200/50" />

                  <div className="absolute top-6 right-6 text-primary/5">
                    <Stamp className="w-32 h-32" />
                  </div>

                  <div className="flex items-center justify-between border-b-2 border-primary/10 pb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <PenLine className="text-primary w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black text-primary font-serif">
                        নথি সংশোধন
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        vintageAudio.playClick();
                        setEditingPostman(null);
                        clearInitialEditingPostman?.();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Minimize2 className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-8 relative z-10">
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#fffbeb] border-2 border-dashed border-[#d97706]/30 p-6 rounded-sm mb-8 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Coins className="w-12 h-12 text-[#d97706]" />
                      </div>
                      <div className="flex gap-4 items-start relative z-10">
                        <div className="bg-[#d97706]/10 p-2 rounded-full shrink-0">
                          <AlertCircle className="w-5 h-5 text-[#d97706]" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-[#92400e] font-serif">সংশোধনী সংক্রান্ত বিশেষ বিজ্ঞপ্তি</h4>
                          <p className="text-xs text-[#92400e]/80 leading-relaxed font-serif">
                            শ্রদ্ধেয় ব্যবহারকারী, পিয়ন রেজিস্ট্রি বা নথি সংশোধনের ক্ষেত্রে প্রতিবার তথ্য পরিবর্তনের জন্য আপনার তবিল হতে <span className="font-black">৫টি স্বর্ণমুদ্রা (কয়েন)</span> ফি হিসেবে কর্তন করা হবে। অনুগ্রহপূর্বক সঠিক তথ্য প্রদান নিশ্চিত করুন।
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          কর্মীর নাম (Name)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.name || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, name: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          ফাইল নং (File No)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.fileNo || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, fileNo: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          সার্ভিস আইডি (Service ID)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.serviceId || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, serviceId: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          যোগদানের তারিখ (Joining Date)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.joiningDate || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, joiningDate: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          অভিজ্ঞতা (Experience)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.experience || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, experience: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          শিক্ষাগত যোগ্যতা (Education)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.education || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, education: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          বিভাগ / বিশেষত্ব (Specialty)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.specialty || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, specialty: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          মাসিক চার্জ (Cost)
                        </label>
                        <input
                          type="number"
                          value={POSTMEN.find(p => p.id === editingPostman.id)?.cost ?? (editingPostman.cost || 0)}
                          onChange={(e) => setEditingPostman({ ...editingPostman, cost: parseInt(e.target.value) || 0 })}
                          disabled={POSTMEN.some(p => p.id === editingPostman.id)}
                          className={`w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 outline-none text-lg font-serif ${POSTMEN.some(p => p.id === editingPostman.id) ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary'}`}
                        />
                        {POSTMEN.some(p => p.id === editingPostman.id) && (
                          <p className="text-[10px] text-red-500 font-serif mt-1">ডিফল্ট পিয়নের সার্ভিস চার্জ পরিবর্তনযোগ্য নয়।</p>
                        )}
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          বিশেষ গুণ (Special Talent)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.specialTalent || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, specialTalent: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          তকমা (Catchphrase)
                        </label>
                        <input
                          type="text"
                          value={editingPostman.catchphrase || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, catchphrase: e.target.value })}
                          className="w-full p-4 bg-transparent rounded-none border-b-2 border-primary/20 focus:border-primary outline-none text-lg font-serif"
                        />
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary/30 rounded-full" />
                          জীবনবৃত্তান্ত (Bio)
                        </label>
                        <textarea
                          value={editingPostman.bio || editingPostman.description || ""}
                          onChange={(e) => setEditingPostman({ ...editingPostman, bio: e.target.value })}
                          className="w-full p-5 bg-white/50 rounded-none border-2 border-dashed border-primary/10 focus:border-primary/30 outline-none text-base min-h-[160px] leading-relaxed font-serif italic text-gray-700 shadow-inner"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-6 rounded-none font-black shadow-[0_10px_30px_rgba(141,28,28,0.3)] hover:bg-[#5d1212] hover:-translate-y-1 transition-all uppercase tracking-[0.2em] text-sm active:scale-95"
                    >
                      রেজিস্ট্রি আপডেট করুন
                    </button>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Decoration */}
        <div className="py-12 flex flex-col items-center justify-center space-y-4 opacity-30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-gray-400" />
            <Stamp className="w-6 h-6" />
            <div className="w-12 h-px bg-gray-400" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em]">
            ডাকটিক • ২০২৬
          </p>
        </div>
      </div>
    </div>
  );
};

const DakthikSodoyaloy = ({
  onBack,
  coins,
  onBuy,
  user,
  allShopItems,
}: {
  onBack: () => void;
  coins: number;
  onBuy: (item: any) => void;
  user: any;
  allShopItems: any[];
}) => {
  const [activeTab, setActiveTab] = useState("stamp");

  const categories = [
    { id: "stamp", name: "ডাকটিকিট", icon: <Stamp className="w-4 h-4" /> },
    { id: "envelope", name: "খাম", icon: <Mail className="w-4 h-4" /> },
    { id: "page", name: "কাগজ", icon: <FileText className="w-4 h-4" /> },
    { id: "seal", name: "সিল", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const filteredItems = allShopItems
    .filter((item) => item.category === activeTab)
    .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);

  return (
    <div className="p-4 space-y-6 pb-24 paper-texture min-h-screen bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft className="text-primary w-7 h-7" />
          </button>
          <h2 className="text-2xl font-bold text-primary font-serif">
            ডাকটিক সওদালয়
          </h2>
        </div>
        <div className="flex items-center bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <Coins className="text-primary w-4 h-4 mr-2" />
          <span className="text-sm font-bold text-primary">{coins}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all ${
              activeTab === cat.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl space-y-6 border border-gray-50">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 relative overflow-hidden transition-all ${
                (item as any).premium
                  ? "border-tertiary/30 bg-tertiary/5 shadow-lg shadow-tertiary/5"
                  : "border-primary/10 bg-white"
              }`}
            >
              {(item as any).premium && (
                <div className="absolute top-0 right-0 bg-tertiary text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                  PREMIUM
                </div>
              )}

              <div className="h-24 w-full flex items-center justify-center relative">
                {/* Visual Background for the item */}
                <div
                  className={`absolute inset-2 rounded-xl opacity-20 blur-sm ${(item as any).color || "bg-gray-100"}`}
                />

                <div className="relative z-10 transition-transform hover:scale-110">
                  {item.category === "stamp" && <StampVisual item={item} />}
                  {item.category === "envelope" && (
                    <EnvelopeVisual item={item} />
                  )}
                  {item.category === "page" && <PageVisual item={item} />}
                  {item.category === "seal" && <SealVisual item={item} />}
                </div>
              </div>

              <div className="text-center w-full">
                <p className="text-[11px] font-bold text-on-surface leading-tight h-8 flex items-center justify-center px-1">
                  {item.name}
                </p>
                {item.category === "stamp" && (
                  <p className="text-[9px] text-gray-500 mt-0.5">
                    পৌঁছাবে {toBengaliDigits(getDeliveryHours(item.price))}{" "}
                    ঘণ্টায়
                  </p>
                )}
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Coins className="w-3 h-3 text-primary" />
                  <p className="text-[10px] text-primary font-bold">
                    {item.price}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onBuy(item)}
                disabled={coins < item.price}
                className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all ${
                  coins >= item.price
                    ? "bg-primary text-white hover:bg-primary-container"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                কিনুন
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Sodapati = ({ onBack, user, onNavigate }: { onBack: () => void; user: any; onNavigate?: (screen: string) => void }) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "inventory"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setInventory(items);
        setLoading(false);
      },
      (error) =>
        handleFirestoreError(
          error,
          OperationType.LIST,
          `users/${user.uid}/inventory`,
        ),
    );
    return unsub;
  }, [user]);

  const groupedInventory = inventory.reduce((acc: any, item: any) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryNames: Record<string, string> = {
    stamp: "ডাকটিকিট",
    envelope: "খাম",
    page: "কাগজ",
    seal: "সিল",
  };

  return (
    <div className="p-4 space-y-6 pb-24 paper-texture min-h-screen bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft className="text-primary w-7 h-7" />
          </button>
          <h2 className="text-2xl font-bold text-primary font-serif">আমার ঝুলি</h2>
        </div>
        {onNavigate && (
          <button 
            onClick={() => onNavigate("dakthik-sodoyaloy")}
            className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
          >
            সওদালয়
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl space-y-8 border border-gray-50">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-on-surface">আপনার ঝুলি</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              মোট {inventory.length}টি সওদা
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="text-primary w-6 h-6" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 italic">
            ঝুলি খোলা হচ্ছে...
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-gray-200">
              <ShoppingBag className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 text-xs italic">
              আপনার ঝুলি এখন খালি। ডাকটিক সওদালয় থেকে কিছু কিনুন!
            </p>
            {onNavigate && (
              <button 
                onClick={() => onNavigate("dakthik-sodoyaloy")}
                className="mx-auto mt-4 py-3 px-8 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                সওদা করুন
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedInventory).map(
            ([cat, items]: [string, any]) => (
              <div key={cat} className="space-y-4">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-l-2 border-primary pl-3">
                  {categoryNames[cat] || cat}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 relative overflow-hidden ${
                        item.premium
                          ? "border-tertiary/20 bg-tertiary/5"
                          : "border-primary/5 bg-white"
                      }`}
                    >
                      <div className="h-12 w-full flex items-center justify-center relative">
                        <div className="relative z-10">
                          {item.category === "stamp" && (
                            <StampVisual item={item} className="w-18 h-22" />
                          )}
                          {item.category === "envelope" && (
                            <EnvelopeVisual item={item} className="w-14 h-9" />
                          )}
                          {item.category === "page" && (
                            <PageVisual item={item} className="w-10 h-14" />
                          )}
                          {item.category === "seal" && (
                            <SealVisual item={item} className="w-10 h-10" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-on-surface leading-tight line-clamp-2 h-6 flex items-center justify-center">
                          {item.name}
                        </p>
                        <div className="bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                          <p className="text-[8px] text-primary font-black">
                            {item.quantity}টি
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
};

const DeadLetterOffice = ({
  onBack,
  user,
  allPostmen,
}: {
  onBack: () => void;
  user: any;
  allPostmen: any[];
}) => {
  const [letters, setLetters] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "letters"),
      where("senderUid", "==", user.uid),
      where("deliveryStatus", "==", "dead-letter"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setLetters(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "letters"),
    );
    return () => unsub();
  }, [user]);

  const handleDeleteLetter = async (letterId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি এই চিঠিটি স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।")) return;
    try {
      await deleteDoc(doc(db, "letters", letterId));
      showToast("চিঠিটি স্থায়ীভাবে মুছে ফেলা হয়েছে! 🗑️", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `letters/${letterId}`);
    }
  };

  const getDecayEffect = (deadLetterAt: number) => {
    const ageInHours =
      (Date.now() - (deadLetterAt || Date.now())) / (1000 * 60 * 60);
    const dustLevel = Math.min(ageInHours / 24, 1); // Max dust after 24 hours
    const damageLevel = Math.min(ageInHours / 72, 1); // Max damage after 72 hours

    return {
      filter: `sepia(${dustLevel * 50}%) grayscale(${dustLevel * 20}%) contrast(${100 - dustLevel * 20}%)`,
      opacity: 1 - damageLevel * 0.3,
      transform: `rotate(${(Math.sin(deadLetterAt || 0) * 2).toFixed(1)}deg) scale(${1 - damageLevel * 0.05})`,
      boxShadow: `inset 0 0 ${dustLevel * 30}px rgba(101, 67, 33, ${dustLevel * 0.4})`,
    };
  };

  return (
    <div className="p-4 space-y-6 pb-24 paper-texture min-h-screen bg-background">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="text-primary w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold text-primary font-serif">
          অজানা চিঠি
        </h2>
      </div>

      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 mb-6">
        <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">
          "এখানে সেইসব চিঠি জমা হয় যা গন্তব্যে পৌঁছাতে পারেনি। সময় যত যাবে,
          ধুলোবালিতে এই চিঠিগুলো মলিন হয়ে যাবে এবং একসময় নষ্ট হয়ে যাবে।"
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {letters.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <Mail className="w-full h-full text-gray-200" />
              <Search className="absolute bottom-0 right-0 w-8 h-8 text-gray-300 animate-pulse" />
            </div>
            <p className="text-gray-400 font-medium">এখানে কোনো চিঠি নেই</p>
          </div>
        ) : (
          letters.map((l, i) => {
            const decay = getDecayEffect(l.deadLetterAt);
            const ageInHours =
              (Date.now() - (l.deadLetterAt || l.timestamp)) / (1000 * 60 * 60);
            const dust = ageInHours * 5;
            const showSpiderWeb = ageInHours > 48;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={decay}
                className="relative bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-hidden group"
              >
                {/* Delete Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLetter(l.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-gray-50 hover:bg-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20 border border-gray-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Dust Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/dust.png")`,
                    filter: "contrast(150%) brightness(50%)",
                  }}
                />

                {/* Spider Web for very old letters */}
                {showSpiderWeb && (
                  <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-30 rotate-90">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full text-gray-400"
                    >
                      <path
                        d="M0,0 L100,100 M20,0 L100,80 M40,0 L100,60 M60,0 L100,40 M80,0 L100,20 M0,20 L80,100 M0,40 L60,100 M0,60 L40,100 M0,80 L20,100"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                        বিতরণ ব্যর্থ
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-gray-400">
                        {new Date(
                          l.deadLetterAt || l.timestamp,
                        ).toLocaleDateString("bn-BD")}
                      </span>
                      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {dust > 60
                          ? "অত্যধিক পুরাতন"
                          : dust > 30
                            ? "পুরাতন"
                            : "সাম্প্রতিক"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs font-bold">
                        {l.receiverUid === null
                          ? `ভুল পোস্টকোড: ${toBengaliDigits(l.receiverPostcode)}`
                          : `প্রাপক অনুপস্থিত (পোস্টকোড: ${toBengaliDigits(l.receiverPostcode)})`}
                      </span>
                    </div>

                    <div className="h-[1px] bg-gray-100 w-full" />

                    <p className="text-sm text-gray-400 italic line-clamp-2 font-serif">
                      {l.content}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                      onClick={() =>
                        showToast("এই চিঠিটি আর উদ্ধার করা সম্ভব নয়।", "info")
                      }
                    >
                      বিস্তারিত দেখুন <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Cobweb decoration for very old letters */}
                {dust > 50 && (
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full text-gray-600"
                    >
                      <path
                        d="M0 0 L100 100 M20 0 L100 80 M40 0 L100 60 M60 0 L100 40 M80 0 L100 20"
                        stroke="currentColor"
                        strokeWidth="0.5"
                      />
                      <path
                        d="M100 0 L0 100 M100 20 L20 100 M100 40 L40 100 M100 60 L60 100 M100 80 L80 100"
                        stroke="currentColor"
                        strokeWidth="0.5"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

const FriendProfileModal = ({
  friend,
  user,
  onClose,
  onUnfriend,
}: {
  friend: any;
  user: any;
  onClose: () => void;
  onUnfriend?: (friendId: string) => void;
}) => {
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [confirmUnfriend, setConfirmUnfriend] = useState<string | null>(null);

  useEffect(() => {
    const uid = friend?.uid || friend?.id;
    if (!uid || !user) return;

    const fetchProfileData = async () => {
      try {
        // Fetch full profile
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setFullProfile(userDoc.data());
        } else {
          setFullProfile(friend); // Fallback
        }

        // Fetch friend count
        const q = query(collection(db, "users", uid, "friends"));
        const snapshot = await getDocs(q);
        setFriendCount(snapshot.size);

        // Check if is friend
        const friendDoc = await getDoc(doc(db, "users", user.uid, "friends", uid));
        setIsFriend(friendDoc.exists());
      } catch (error) {
        console.error("Error fetching friend profile:", error);
        setFriendCount(0);
        setFullProfile(friend);
      }
    };
    fetchProfileData();
  }, [friend, user]);

  if (!friend) return null;

  const displayData = fullProfile || friend;
  const friendId = friend.uid || friend.id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="relative h-32 bg-primary/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-6 pb-8 pt-0 relative">
          <div className="flex justify-center -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-primary/5 rounded-full flex items-center justify-center overflow-hidden">
                {displayData.photoURL ? (
                  <img
                    src={displayData.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="text-primary w-14 h-14" />
                )}
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 font-serif">
              {displayData.displayName || "অজানা বন্ধু"}
            </h3>
            <p className="text-sm text-gray-500 font-mono mt-1">
              পোস্টকোড: {toBengaliDigits(displayData.postcode)}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">মোট বন্ধু</p>
                  <p className="text-lg font-bold text-gray-800">
                    {friendCount === null ? "..." : `${friendCount} জন`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    গ্রাম/মহল্লা
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {displayData.village || "দেওয়া নেই"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400 opacity-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    ডাকটিক
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {displayData.postOffice || "দেওয়া নেই"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400 opacity-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    থানা/উপজেলা
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {displayData.thana || "দেওয়া নেই"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400 opacity-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    জেলা
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {displayData.district || "দেওয়া নেই"}
                  </p>
                </div>
              </div>
            </div>

            {isFriend && onUnfriend && (
              <button
                onClick={() => {
                  setConfirmUnfriend(friendId);
                }}
                className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-100"
              >
                <UserMinus className="w-5 h-5" />
                বন্ধুর তালিকা থেকে বাদ দিন
              </button>
            )}

            {confirmUnfriend && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <UserMinus className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">আপনি কি নিশ্চিত?</h4>
                <p className="text-sm text-gray-500 mb-6 font-medium">আপনি কি নিশ্চিত যে আপনি {displayData.displayName || "এই বন্ধুকে"} আপনার তালিকা থেকে মুছে ফেলতে চান?</p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setConfirmUnfriend(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm"
                  >
                    না, থাক
                  </button>
                  <button
                    onClick={() => {
                      onUnfriend?.(confirmUnfriend);
                      setConfirmUnfriend(null);
                      onClose();
                    }}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200"
                  >
                    হ্যাঁ, মুছে দিন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const FriendsScreen = ({ onBack, user }: { onBack: () => void; user: any }) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [searchPostcode, setSearchPostcode] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "requests" | "search">(
    "list",
  );
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [confirmUnfriendId, setConfirmUnfriendId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for friends
    const friendsQuery = query(collection(db, "users", user.uid, "friends"));
    const unsubFriends = onSnapshot(
      friendsQuery,
      (snapshot) => {
        setFriends(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      },
      (error) =>
        handleFirestoreError(
          error,
          OperationType.LIST,
          `users/${user.uid}/friends`,
        ),
    );

    // Listen for incoming requests
    const requestsQuery = query(
      collection(db, "friendRequests"),
      where("receiverUid", "==", user.uid),
      where("status", "==", "pending"),
    );
    const unsubRequests = onSnapshot(
      requestsQuery,
      (snapshot) => {
        setRequests(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
        );
      },
      (error) =>
        handleFirestoreError(error, OperationType.LIST, "friendRequests"),
    );

    // Listen for outgoing requests
    const sentRequestsQuery = query(
      collection(db, "friendRequests"),
      where("senderUid", "==", user.uid),
      where("status", "==", "pending"),
    );
    const unsubSentRequests = onSnapshot(
      sentRequestsQuery,
      (snapshot) => {
        setSentRequests(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
        );
      },
      (error) =>
        handleFirestoreError(error, OperationType.LIST, "friendRequests"),
    );

    return () => {
      unsubFriends();
      unsubRequests();
      unsubSentRequests();
    };
  }, [user]);

  const handleSearch = async () => {
    const cleanPostcode = toEnglishDigits(searchPostcode);
    if (cleanPostcode.length < 4) {
      showToast("অনুগ্রহ করে অন্তত ৪টি সংখ্যা দিন।", "error");
      return;
    }

    setSearching(true);
    try {
      // Try exact match first
      let q = query(
        collection(db, "users"),
        where("postcode", "==", searchPostcode),
        limit(1),
      );
      let snapshot = await getDocs(q);

      // If not found, try without hyphen (in case some users have it saved differently)
      if (snapshot.empty) {
        const noHyphen = searchPostcode.replace("-", "");
        q = query(
          collection(db, "users"),
          where("postcode", "==", noHyphen),
          limit(1),
        );
        snapshot = await getDocs(q);
      }

      // If still not found, try prefix search
      if (snapshot.empty) {
        q = query(
          collection(db, "users"),
          where("postcode", ">=", searchPostcode),
          where("postcode", "<=", searchPostcode + "\uf8ff"),
          limit(1),
        );
        snapshot = await getDocs(q);
      }

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        if (data.uid === user.uid) {
          showToast("এটি আপনার নিজের পোস্টকোড!", "error");
          setSearchResult(null);
        } else {
          setSearchResult(data);
        }
      } else {
        setSearchResult(null);
        showToast("এই পোস্টকোডে কোনো ব্যবহারকারী পাওয়া যায়নি।", "error");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "users");
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (receiver: any) => {
    try {
      // Check if already friends
      const friendDoc = await getDoc(
        doc(db, "users", user.uid, "friends", receiver.uid),
      );
      if (friendDoc.exists()) {
        showToast("আপনারা ইতিমধ্যে বন্ধু!", "info");
        return;
      }

      // Check if request already sent
      const q = query(
        collection(db, "friendRequests"),
        where("senderUid", "==", user.uid),
        where("receiverUid", "==", receiver.uid),
        where("status", "==", "pending"),
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        showToast("অনুরোধ ইতিমধ্যে পাঠানো হয়েছে।", "info");
        return;
      }

      await addDoc(collection(db, "friendRequests"), {
        senderUid: user.uid,
        senderName: user.displayName,
        senderPostcode: user.postcode,
        receiverUid: receiver.uid,
        receiverName: receiver.displayName,
        receiverPostcode: receiver.postcode,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Add notification for receiver
      addNotification(
        receiver.uid,
        "নতুন ফ্রেন্ড রিকোয়েস্ট!",
        `${user.displayName || "একজন ব্যবহারকারী"} আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন।`,
        "friend_request",
      );
      showToast("বন্ধুত্বের অনুরোধ পাঠানো হয়েছে! 🤝", "success");
      setSearchResult(null);
      setSearchPostcode("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "friendRequests");
    }
  };

  const acceptRequest = async (request: any) => {
    try {
      // Add to both users' friends list
      await setDoc(doc(db, "users", user.uid, "friends", request.senderUid), {
        uid: request.senderUid,
        displayName: request.senderName,
        postcode: request.senderPostcode,
        addedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, "users", request.senderUid, "friends", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        postcode: user.postcode,
        addedAt: new Date().toISOString(),
      });

      // Update request status
      await setDoc(
        doc(db, "friendRequests", request.id),
        { status: "accepted" },
        { merge: true },
      );
      showToast("অনুরোধ গ্রহণ করা হয়েছে! এখন আপনারা বন্ধু। 🎉", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "friendRequests");
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await setDoc(
        doc(db, "friendRequests", requestId),
        { status: "rejected" },
        { merge: true },
      );
      showToast("অনুরোধ প্রত্যাখ্যান করা হয়েছে।", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "friendRequests");
    }
  };

  const cancelSentRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "friendRequests", requestId));
      showToast("অনুরোধটি বাতিল করা হয়েছে।", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "friendRequests");
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    try {
      // Remove from current user's friends list
      await deleteDoc(doc(db, "users", user.uid, "friends", friendId));
      // Remove from the other user's friends list
      await deleteDoc(doc(db, "users", friendId, "friends", user.uid));
      showToast("বন্ধুর তালিকা থেকে মুছে ফেলা হয়েছে।", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/friends/${friendId}`);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 paper-texture min-h-screen bg-background">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="text-primary w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold text-primary font-serif">বন্ধুরা</h2>
      </div>

      <div className="flex bg-white/50 p-1 rounded-2xl border border-primary/5">
        {(["list", "requests", "search"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-white/50"}`}
          >
            {tab === "list"
              ? "বন্ধু তালিকা"
              : tab === "requests"
                ? `অনুরোধ (${requests.length + sentRequests.length})`
                : "খুঁজুন"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {friends.length === 0 ? (
              <div className="text-center py-12 bg-white/30 rounded-[2rem] border-2 border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">
                  আপনার কোনো বন্ধু নেই।
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="text-primary font-bold text-sm mt-2"
                >
                  বন্ধু খুঁজুন
                </button>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedFriend(friend)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                      {friend.photoURL ? (
                        <img
                          src={friend.photoURL}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <UserIcon className="text-primary w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {friend.displayName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        পোস্টকোড: {toBengaliDigits(friend.postcode)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmUnfriendId(friend.id);
                      }}
                      className="p-2 bg-red-50 rounded-lg text-red-400 hover:text-red-500 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "requests" && (
          <motion.div
            key="req"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Incoming Requests */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">প্রাপ্ত অনুরোধ ({requests.length})</h3>
              {requests.length === 0 ? (
                <div className="text-center py-6 text-gray-400 bg-white/30 rounded-2xl border border-dashed border-gray-200 text-xs">
                  কোনো পেন্ডিং অনুরোধ নেই।
                </div>
              ) : (
                requests.map((req, idx) => (
                  <div
                    key={`${req.id}-${idx}`}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                        <UserPlus className="text-orange-500 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {req.senderName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          পোস্টকোড: {toBengaliDigits(req.senderPostcode)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button
                        onClick={() => rejectRequest(req.id)}
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[10px] font-bold"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => acceptRequest(req)}
                        className="bg-primary text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-sm"
                      >
                        গ্রহণ
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Sent Requests */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">পাঠানো অনুরোধ ({sentRequests.length})</h3>
              {sentRequests.length === 0 ? (
                <div className="text-center py-6 text-gray-400 bg-white/30 rounded-2xl border border-dashed border-gray-200 text-xs">
                  আপনি কোনো অনুরোধ পাঠাননি।
                </div>
              ) : (
                sentRequests.map((req, idx) => (
                  <div
                    key={`${req.id}-${idx}`}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between opacity-80"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                        <Send className="text-gray-400 w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {req.receiverName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          পোস্টকোড: {toBengaliDigits(req.receiverPostcode)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelSentRequest(req.id)}
                      className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                পোস্টকোড দিয়ে খুঁজুন
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  maxLength={8}
                  value={toBengaliDigits(searchPostcode || "")}
                  onChange={(e) =>
                    setSearchPostcode(
                      formatDakthikId(toEnglishDigits(e.target.value)),
                    )
                  }
                  className="flex-1 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary text-xl font-mono text-center tracking-[0.2rem]"
                  placeholder="XXX-XXXX"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || searchPostcode.length < 4}
                  className="bg-primary text-white p-4 rounded-2xl shadow-lg disabled:opacity-50"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </div>

            {searchResult && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => setSelectedFriend(searchResult)}
                className="bg-white p-6 rounded-[2rem] shadow-xl border border-primary/10 flex flex-col items-center space-y-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center overflow-hidden">
                  {searchResult.photoURL ? (
                    <img
                      src={searchResult.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="text-primary w-10 h-10" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-primary">
                    {searchResult.displayName}
                  </h3>
                  <p className="text-sm text-gray-400 font-mono">
                    পোস্টকোড: {toBengaliDigits(searchResult.postcode)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sendRequest(searchResult);
                  }}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>অনুরোধ পাঠান</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedFriend && (
          <FriendProfileModal
            friend={selectedFriend}
            user={user}
            onClose={() => setSelectedFriend(null)}
            onUnfriend={removeFriend}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmUnfriendId && (
          <CustomConfirmModal
            isOpen={!!confirmUnfriendId}
            onClose={() => setConfirmUnfriendId(null)}
            onConfirm={() => {
              removeFriend(confirmUnfriendId);
              setConfirmUnfriendId(null);
            }}
            title="বন্ধু বাদ দিবেন?"
            message="আপনি কি নিশ্চিত যে এই ব্যক্তিকে আপনার বন্ধু তালিকা থেকে সরিয়ে ফেলতে চান?"
            confirmText="হ্যাঁ, বাদ দিন"
            cancelText="না, থাক"
            type="danger"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "হ্যাঁ, নিশ্চিত", 
  cancelText = "না, ফিরে যান",
  type = "danger"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "primary"
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-[280px] rounded-3xl p-6 shadow-2xl text-center"
      >
        <div className={`w-14 h-14 ${type === "danger" ? "bg-red-50" : "bg-primary/10"} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          {type === "danger" ? <UserMinus className="w-7 h-7 text-red-500" /> : <Info className="w-7 h-7 text-primary" />}
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-2 font-serif">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed mb-6 px-2">{message}</p>
        <div className="space-y-2">
          <button
            onClick={onConfirm}
            className={`w-full py-3.5 ${type === "danger" ? "bg-red-500 shadow-red-200" : "bg-primary shadow-primary/20"} text-white rounded-xl font-bold text-sm shadow-lg`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gray-50 text-gray-500 rounded-xl font-bold text-[11px] uppercase tracking-wider"
          >
            {cancelText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MoneyOrder = ({
  onBack,
  coins,
  user,
  onSend,
  onAccept,
  onReject,
}: {
  onBack: () => void;
  coins: number;
  user: any;
  onSend: (amount: number, postcode: string) => Promise<void>;
  onAccept: (order: any) => Promise<void>;
  onReject: (order: any, reason: string) => Promise<void>;
}) => {
  const [amount, setAmount] = useState(0);
  const [postcode, setPostcode] = useState("");
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [sentHistory, setSentHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"send" | "received" | "history">(
    "send",
  );
  const [friends, setFriends] = useState<any[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "moneyOrders"),
      where("receiverUid", "==", user.uid),
      where("status", "==", "pending"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setPendingOrders(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "moneyOrders"),
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "moneyOrders"),
      where("senderUid", "==", user.uid),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setSentHistory(
          snapshot.docs
            .map((doc) => ({ ...doc.data(), id: doc.id }))
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
        );
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "moneyOrders"),
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "friends"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setFriends(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "friends"),
    );
    return () => unsub();
  }, [user]);

  const handleRejectClick = (orderId: string) => {
    setShowRejectInput((prev) => ({ ...prev, [orderId]: true }));
  };

  const submitReject = (order: any) => {
    const reason = rejectReason[order.id] || "কোনো কারণ উল্লেখ করা হয়নি";
    if (reason.split(" ").length > 20) {
      showToast("কারণ সর্বোচ্চ ২০ শব্দের মধ্যে হতে হবে।", "error");
      return;
    }
    onReject(order, reason);
  };

  return (
    <div className="p-4 space-y-6 pb-24 paper-texture min-h-screen bg-background">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="text-primary w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold text-primary font-serif">
          মানি অর্ডার
        </h2>
      </div>

      <div className="flex bg-white/50 p-1 rounded-2xl border border-primary/5">
        <button
          onClick={() => setActiveTab("send")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === "send" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-white/50"}`}
        >
          অনুরোধ করুন
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === "received" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-white/50"}`}
        >
          অনুরোধসমূহ ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === "history" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-white/50"}`}
        >
          আমার অনুরোধ
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "send" && (
          <motion.div
            key="send"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-6"
          >
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                কয়েনের পরিমাণ (🪙)
              </label>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? 0 : Number(e.target.value))
                }
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary text-2xl font-bold text-primary"
              />
            </div>
            <div className="space-y-4 relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                বন্ধুর পোস্টকোড
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={8}
                  value={toBengaliDigits(postcode || "")}
                  onChange={(e) =>
                    setPostcode(
                      formatDakthikId(toEnglishDigits(e.target.value)),
                    )
                  }
                  onFocus={() => setShowFriends(true)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary text-xl font-mono tracking-[0.2rem]"
                  placeholder="XXX-XXXX"
                />
                <button
                  onClick={() => setShowFriends(!showFriends)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {showFriends && friends.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto"
                  >
                    {friends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => {
                          setPostcode(friend.postcode);
                          setShowFriends(false);
                        }}
                        className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center justify-between"
                      >
                        <span className="font-bold text-gray-800">
                          {friend.displayName}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {toBengaliDigits(friend.postcode)}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => onSend(amount, postcode)}
              disabled={amount <= 0 || postcode.length < 4}
              className="w-full py-5 bg-primary text-white rounded-3xl font-bold shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>কয়েন অনুরোধ করুন</span>
            </button>
          </motion.div>
        )}

        {activeTab === "received" && (
          <motion.div
            key="received"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                কোনো পেন্ডিং অনুরোধ নেই।
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                        <Wallet className="text-green-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {order.senderName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          আপনার কাছে {order.amount} 🪙 চেয়েছে
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-black text-primary">
                      ৳ {order.amount}
                    </span>
                  </div>

                  {showRejectInput[order.id] ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="বাতিল করার কারণ লিখুন (সর্বোচ্চ ২০ শব্দ)"
                        value={rejectReason[order.id] || ""}
                        onChange={(e) =>
                          setRejectReason((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => submitReject(order)}
                          className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold shadow-sm hover:bg-red-600 transition-colors text-sm"
                        >
                          নিশ্চিত করুন
                        </button>
                        <button
                          onClick={() =>
                            setShowRejectInput((prev) => ({
                              ...prev,
                              [order.id]: false,
                            }))
                          }
                          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-300 transition-colors text-sm"
                        >
                          ফিরে যান
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onAccept(order)}
                        className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-bold shadow-sm hover:bg-green-600 transition-colors"
                      >
                        প্রদান করুন
                      </button>
                      <button
                        onClick={() => handleRejectClick(order.id)}
                        className="flex-1 bg-red-50 text-red-600 py-3 rounded-2xl font-bold shadow-sm hover:bg-red-100 transition-colors"
                      >
                        বাতিল করুন
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            {sentHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                আপনি কোনো অনুরোধ পাঠাননি।
              </div>
            ) : (
              sentHistory.map((order, idx) => (
                <div
                  key={`${order.id}-${idx}`}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === "accepted" ? "bg-green-50" : order.status === "rejected" ? "bg-red-50" : "bg-yellow-50"}`}
                      >
                        <Wallet
                          className={`w-5 h-5 ${order.status === "accepted" ? "text-green-600" : order.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {order.receiverName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          এর কাছে {order.amount} 🪙 চাওয়া হয়েছিল
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-primary block">
                        ৳ {order.amount}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${order.status === "accepted" ? "text-green-500" : order.status === "rejected" ? "text-red-500" : "text-yellow-500"}`}
                      >
                        {order.status === "accepted"
                          ? "গৃহীত"
                          : order.status === "rejected"
                            ? "বাতিল"
                            : "পেন্ডিং"}
                      </span>
                    </div>
                  </div>
                  {order.status === "rejected" && order.rejectReason && (
                    <div className="bg-red-50 p-3 rounded-xl text-sm text-red-600">
                      <span className="font-bold">কারণ:</span>{" "}
                      {order.rejectReason}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SavingsScreen = ({
  onBack,
  coins,
  onClaimBonus,
  onClaimTwoHourBonus,
  user,
  onUpdateCoins,
}: {
  onBack: () => void;
  coins: number;
  onClaimBonus: () => void;
  onClaimTwoHourBonus: () => void;
  user: any;
  onUpdateCoins: (amount: number) => void;
}) => {
  const lastClaimed = user?.lastBonusClaimed
    ? new Date(user.lastBonusClaimed)
    : null;
  const canClaim =
    !lastClaimed || Date.now() - lastClaimed.getTime() >= 24 * 60 * 60 * 1000;

  const lastTwoHourClaimed = user?.lastTwoHourBonusClaimed
    ? new Date(user.lastTwoHourBonusClaimed)
    : null;
  const canClaimTwoHour =
    !lastTwoHourClaimed ||
    Date.now() - lastTwoHourClaimed.getTime() >= 2 * 60 * 60 * 1000;

  const getRemainingTime = (lastClaimed: Date | null, durationMs: number) => {
    if (!lastClaimed) return null;
    const timeLeft = durationMs - (Date.now() - lastClaimed.getTime());
    return timeLeft > 0 ? timeLeft : null;
  };

  const [timeRemaining, setTimeRemaining] = useState(
    getRemainingTime(lastClaimed, 24 * 60 * 60 * 1000),
  );
  const [timeRemainingTwoHour, setTimeRemainingTwoHour] = useState(
    getRemainingTime(lastTwoHourClaimed, 2 * 60 * 60 * 1000),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getRemainingTime(lastClaimed, 24 * 60 * 60 * 1000));
      setTimeRemainingTwoHour(
        getRemainingTime(lastTwoHourClaimed, 2 * 60 * 60 * 1000),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [lastClaimed, lastTwoHourClaimed]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 space-y-6 pb-24 paper-texture min-h-screen bg-background">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="text-primary w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold text-primary font-serif">
          ডাকটিক সেভিংস
        </h2>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            মোট ব্যালেন্স
          </p>
          <h3 className="text-5xl font-black text-primary">{coins} 🪙</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-primary">দৈনিক হাজিরা বোনাস</h4>
                <p className="text-[10px] text-gray-400">
                  প্রতি ২৪ ঘণ্টায় একবার
                </p>
              </div>
              <span className="text-lg font-bold text-primary">+২০ 🪙</span>
            </div>
            <button
              onClick={onClaimBonus}
              disabled={!canClaim}
              className={`w-full py-4 rounded-2xl font-bold shadow-md transition-all ${canClaim ? "bg-primary text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {canClaim
                ? "বোনাস গ্রহণ করুন"
                : `পরবর্তী বোনাস: ${timeRemaining ? formatTime(timeRemaining) : ""}`}
            </button>
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-blue-600">২ ঘণ্টার বোনাস</h4>
                <p className="text-[10px] text-gray-400">
                  প্রতি ২ ঘণ্টায় একবার
                </p>
              </div>
              <span className="text-lg font-bold text-blue-600">+৫ 🪙</span>
            </div>
            <button
              onClick={onClaimTwoHourBonus}
              disabled={!canClaimTwoHour}
              className={`w-full py-4 rounded-2xl font-bold shadow-md transition-all ${canClaimTwoHour ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {canClaimTwoHour
                ? "বোনাস গ্রহণ করুন"
                : `পরবর্তী বোনাস: ${timeRemainingTwoHour ? formatTime(timeRemainingTwoHour) : ""}`}
            </button>
          </div>

          <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-orange-600">
                  চিঠি লিখুন ও পাঠান
                </h4>
                <p className="text-[10px] text-gray-400">
                  প্রতিটি চিঠি পাঠানোতে বোনাস
                </p>
              </div>
              <span className="text-lg font-bold text-orange-600">+৫ 🪙</span>
            </div>
            <div className="text-[10px] text-orange-400 font-medium italic">
              * চিঠি পাঠানোর সময় এই বোনাসটি স্বয়ংক্রিয়ভাবে যোগ হবে।
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex justify-between items-center">
            <span className="text-xs font-bold text-green-700">
              বার্ষিক মুনাফা
            </span>
            <span className="text-xs font-bold text-green-700">৭.৫%</span>
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            "আপনার সঞ্চয়, দেশের ভবিষ্যৎ"
          </p>
        </div>
      </div>
    </div>
  );
};

const ReferralScreen = ({
  onBack,
  user,
  onApplyRefCode,
}: {
  onBack: () => void;
  user: any;
  onApplyRefCode: (code: string) => Promise<void>;
}) => {
  const [inputRefCode, setInputRefCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem("pending_referral");
    if (pending && !user.usedReferralCode) {
      setInputRefCode(pending.toUpperCase());
    }
  }, [user.usedReferralCode]);

  const handleApply = async () => {
    if (!inputRefCode.trim()) return;
    setIsApplying(true);
    try {
      await onApplyRefCode(inputRefCode.trim().toUpperCase());
      setInputRefCode("");
      localStorage.removeItem("pending_referral");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 bg-surface border-b border-outline-variant/30 sticky top-0 z-50">
        <button
          onClick={onBack}
          className="p-2 hover:bg-surface-container rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary font-serif">রেফারেল বোনাস</h1>
      </header>

      <main className="p-6 space-y-8 max-w-lg mx-auto w-full">
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">বন্ধুদের আমন্ত্রণ জানান!</h2>
          <p className="text-gray-500 text-sm">
            আপনার কোড ব্যবহার করে বন্ধুরা যোগ দিলে আপনারা দুজনেই পাবেন বিশেষ বোনাস।
          </p>
        </div>

        {/* My Code Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              আপনার রেফারেল কোড
            </span>
            <div className="text-4xl font-black text-primary tracking-[0.3em] font-mono">
              {user?.referralCode || "------"}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(user?.referralCode || "");
                showToast("কোড কপি করা হয়েছে!", "success");
              }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              <Copy className="w-5 h-5" />
              কোড কপি করুন
            </button>
            
            <button
              onClick={() => {
                const text = `ডাকটিক অ্যাপে যোগ দিন এবং আমার রেফারেল কোড ${user?.referralCode} ব্যবহার করে ২০ 🪙 বোনাস জিতে নিন! ডাউনলোড লিঙ্ক: ${window.location.origin}/?ref=${user?.referralCode}`;
                if (navigator.share) {
                  navigator.share({
                    title: 'ডাকটিক রেফারেল',
                    text: text,
                    url: window.location.origin + '/?ref=' + user?.referralCode,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(text);
                  showToast("শেয়ার করার টেক্সট কপি হয়েছে!", "info");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary/5 text-primary rounded-2xl font-bold active:scale-95 transition-all"
            >
              <Users className="w-5 h-5" />
              বন্ধুদের সাথে শেয়ার করুন
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-lg font-black text-primary">১০০ 🪙</div>
              <div className="text-[10px] text-gray-400 font-bold">আপনি পাবেন</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-amber-500">২০ 🪙</div>
              <div className="text-[10px] text-gray-400 font-bold">বন্ধু পাবে</div>
            </div>
          </div>
        </div>

        {/* Use Code Section */}
        {!user?.usedReferralCode ? (
          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center rotate-3 border-2 border-white shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-amber-900 leading-tight">কোড ব্যবহার করুন</h3>
                <p className="text-[10px] text-amber-700 font-bold">একবারই ২০ 🪙 বোনাস পাবেন</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="বন্ধুর কোড দিন"
                value={inputRefCode}
                onChange={(e) => setInputRefCode(e.target.value.toUpperCase())}
                className="flex-1 bg-white p-4 rounded-2xl text-lg font-black text-gray-700 border border-amber-100 outline-none focus:ring-2 focus:ring-amber-200 placeholder:text-gray-300 placeholder:font-normal"
              />
              <button
                disabled={isApplying || !inputRefCode}
                onClick={handleApply}
                className="px-6 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isApplying ? <RefreshCw className="w-5 h-5 animate-spin" /> : "প্রয়োগ"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-800">বোনাস গ্রহণ করেছেন</h4>
              <p className="text-[10px] text-green-600 font-bold">আপনি ইতিমধ্যে রেফারেল বোনাস সফলভাবে গ্রহণ করেছেন।</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const ProfileScreen = ({
  onBack,
  user,
  onSignOut,
  onNavigate,
}: {
  onBack: () => void;
  user: any;
  onSignOut: () => void;
  onNavigate: (s: Screen) => void;
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="p-4 space-y-6 pb-24 paper-texture min-h-screen bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft className="text-primary w-7 h-7" />
          </button>
          <h2 className="text-2xl font-bold text-primary font-serif">
            প্রোফাইল
          </h2>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-8 border border-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="text-primary w-14 h-14" />
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-2xl font-bold text-primary">
                {user?.displayName || "ব্যবহারকারী"}
              </h3>
              {(user?.email?.toLowerCase() === "tanvirtamim1111@gmail.com" ||
                user?.role === "admin") && (
                <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> ADMIN
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 font-medium">{user?.email}</p>
          </div>
          <button
            onClick={() => onNavigate("profile-edit")}
            className="px-6 py-2 bg-primary text-white rounded-2xl font-bold shadow-md flex items-center gap-2"
          >
            <PenLine className="w-4 h-4" />
            প্রোফাইল এডিট করুন
          </button>
        </div>

        <div className="space-y-4">
          {/* Birthday */}
          <div className="p-5 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
            <span className="font-bold text-gray-600">জন্মদিন</span>
            <span className="font-bold text-primary">
              {user?.birthday || "----"}
            </span>
          </div>
          {/* Gender */}
          <div className="p-5 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
            <span className="font-bold text-gray-600">জেন্ডার</span>
            <span className="font-bold text-primary">
              {user?.gender === "male"
                ? "পুরুষ"
                : user?.gender === "female"
                  ? "মহিলা"
                  : "অন্যান্য"}
            </span>
          </div>
          {/* Bio */}
          <div className="p-5 bg-gray-50 rounded-3xl flex flex-col border border-gray-100">
            <span className="font-bold text-gray-600 mb-2">বায়ো</span>
            <span className="font-bold text-primary">
              {user?.bio || "কিছু লিখুন..."}
            </span>
          </div>
          {/* Interests */}
          <div className="p-5 bg-gray-50 rounded-3xl flex flex-col border border-gray-100">
            <span className="font-bold text-gray-600 mb-2">পছন্দের কথা</span>
            <span className="font-bold text-primary">
              {user?.interests || "কিছু লিখুন..."}
            </span>
          </div>
          {/* Postcode */}
          <div className="p-5 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
            <div className="flex items-center space-x-3">
              <MapPin className="text-primary w-5 h-5" />
              <span className="font-bold text-gray-600">পোস্টকোড</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-black text-primary tracking-widest bn-number">
                {user?.postcode ? toBengaliDigits(user.postcode) : "----"}
              </span>
              <span className="text-[8px] text-gray-400 uppercase font-bold">
                অপরিবর্তনযোগ্য
              </span>
            </div>
          </div>

          {/* Village */}
          <div className="p-5 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
            <div className="flex items-center space-x-3">
              <Home className="text-primary w-5 h-5" />
              <span className="font-bold text-gray-600">গ্রাম/এলাকা</span>
            </div>
            <span className="font-bold text-primary">
              {user?.village || "অজানা"}
            </span>
          </div>

          {/* Post Office */}
          <div className="p-5 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
            <div className="flex items-center space-x-3">
              <Building2 className="text-primary w-5 h-5" />
              <span className="font-bold text-gray-600">ডাকটিক</span>
            </div>
            <span className="font-bold text-primary">
              {user?.postOffice || "অজানা"}
            </span>
          </div>

          {/* Thana */}
          <div className="p-5 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
            <div className="flex items-center space-x-3">
              <MapPin className="text-primary w-5 h-5" />
              <span className="font-bold text-gray-600">থানা</span>
            </div>
            <span className="font-bold text-primary">
              {user?.thana || "অজানা"}
            </span>
          </div>

          {/* District */}
          <div className="p-5 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100">
            <div className="flex items-center space-x-3">
              <Building2 className="text-primary w-5 h-5" />
              <span className="font-bold text-gray-600">জেলা</span>
            </div>
            <span className="font-bold text-primary">
              {user?.district || "অজানা"}
            </span>
          </div>

          {/* Admin Panel Button (Only for Admin) */}
          {(user?.email?.toLowerCase() === "tanvirtamim1111@gmail.com" ||
            user?.role === "admin") && (
            <button
              onClick={() => onNavigate("admin")}
              className="w-full flex items-center justify-between p-5 bg-primary/5 rounded-3xl border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-primary w-5 h-5" />
                <span className="font-bold text-primary">
                  এডমিন প্যানেল (Admin Panel)
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-primary" />
            </button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <LogOut className="text-red-500 w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  লগ আউট নিশ্চিত করুন
                </h3>
                <p className="text-gray-500">
                  আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট থেকে লগ আউট করতে চান?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  না
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onSignOut();
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                >
                  হ্যাঁ, লগ আউট
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PREDEFINED_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Mimi",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Mia",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Sam",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Lily",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Max",
];


const PrivacyPolicyScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="bg-background min-h-screen pb-24">
    <header className="bg-surface px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-outline-variant/30">
      <button
        onClick={onBack}
        className="p-2 hover:bg-surface-container rounded-full transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-primary" />
      </button>
      <h1 className="text-2xl font-serif font-bold text-primary">
        গোপনীয়তা নীতি
      </h1>
    </header>
    <div className="p-6 space-y-6 text-on-surface leading-relaxed">
      <p className="text-sm text-on-surface-variant">
        সর্বশেষ আপডেট: ১১ এপ্রিল, ২০২৬
      </p>
      <p>
        'ডাকটিক' (Dakthik) অ্যাপটি ব্যবহার করার জন্য আপনাকে স্বাগতম। আমরা আপনার
        ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা
        নীতিটি তৈরি করা হয়েছে যাতে আপনি বুঝতে পারেন আমরা কীভাবে আপনার তথ্য
        সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি।
      </p>

      <h2 className="text-lg font-bold">১. তথ্য সংগ্রহ ও ব্যবহার</h2>
      <p>
        আমাদের অ্যাপটি ব্যবহার করার সময় আমরা নিম্নলিখিত তথ্যগুলো সংগ্রহ করতে
        পারি:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>ব্যক্তিগত তথ্য:</strong> অ্যাপে সাইন-আপ বা প্রোফাইল তৈরির সময়
          আপনার নাম, ইমেল ঠিকানা এবং আপনার দেওয়া পোস্টাল কোড।
        </li>
        <li>
          <strong>চিঠির বিষয়বস্তু:</strong> আপনি যে চিঠিগুলো লিখছেন বা
          পাঠাচ্ছেন, সেগুলো আমাদের সার্ভারে এনক্রিপ্টেড অবস্থায় সংরক্ষিত থাকে
          যাতে আপনি এবং আপনার প্রাপক ছাড়া অন্য কেউ তা পড়তে না পারে।
        </li>
        <li>
          <strong>ডিভাইস তথ্য:</strong> অ্যাপের মানোন্নয়নের জন্য আমরা আপনার
          ডিভাইসের মডেল, অপারেটিং সিস্টেম এবং আইপি (IP) ঠিকানার মতো প্রযুক্তিগত
          তথ্য সংগ্রহ করতে পারি।
        </li>
      </ul>

      <h2 className="text-lg font-bold">২. তথ্যের নিরাপত্তা</h2>
      <p>
        আপনার চিঠিপত্র এবং ব্যক্তিগত তথ্যের নিরাপত্তা আমাদের কাছে সর্বোচ্চ
        অগ্রাধিকার পায়। আমরা আপনার ডেটা সুরক্ষিত রাখতে আধুনিক এনক্রিপশন
        প্রযুক্তি ব্যবহার করি। তবে মনে রাখবেন, ইন্টারনেটের মাধ্যমে তথ্য
        আদান-প্রদান ১০০% নিরাপদ নয়, তাই আমরা সর্বোচ্চ চেষ্টা করলেও সম্পূর্ণ
        নিরাপত্তার নিশ্চয়তা দিতে পারি না।
      </p>

      <h2 className="text-lg font-bold">
        ৩. তৃতীয় পক্ষের সেবা (Third-party Services)
      </h2>
      <p>
        আমাদের অ্যাপটি কিছু প্রয়োজনীয় তৃতীয় পক্ষের সেবা ব্যবহার করতে পারে (যেমন:
        Google Play Services, Firebase Analytics)। এই সেবা প্রদানকারী
        প্রতিষ্ঠানগুলো তাদের নিজস্ব গোপনীয়তা নীতি অনুযায়ী আপনার কিছু তথ্য
        সংগ্রহ করতে পারে।
      </p>

      <h2 className="text-lg font-bold">৪. কুকিজ (Cookies)</h2>
      <p>
        অ্যাপের অভিজ্ঞতা উন্নত করতে আমরা কিছু ক্ষেত্রে 'কুকিজ' ব্যবহার করতে
        পারি। আপনি চাইলে আপনার ডিভাইসের সেটিংস থেকে এগুলো নিয়ন্ত্রণ করতে পারেন।
      </p>

      <h2 className="text-lg font-bold">৫. শিশুদের গোপনীয়তা</h2>
      <p>
        আমাদের অ্যাপটি ১৩ বছরের কম বয়সী শিশুদের জন্য সরাসরি কোনো ডেটা সংগ্রহ করে
        না। যদি কোনো অভিভাবক মনে করেন যে তার সন্তান আমাদের কাছে তথ্য প্রদান
        করেছে, তবে আমাদের সাথে যোগাযোগ করলে আমরা দ্রুত তা মুছে ফেলব।
      </p>

      <h2 className="text-lg font-bold">৬. পরিবর্তন ও আপডেট</h2>
      <p>
        আমরা সময়ের সাথে সাথে এই গোপনীয়তা নীতি পরিবর্তন বা আপডেট করতে পারি।
        যেকোনো বড় পরিবর্তনের ক্ষেত্রে আমরা অ্যাপের মাধ্যমে আপনাকে অবহিত করব।
      </p>

      <h2 className="text-lg font-bold">৭. আপনার অধিকার</h2>
      <p>
        আপনি যেকোনো সময় আপনার তথ্য দেখতে, আপডেট করতে বা মুছে ফেলার অনুরোধ করতে
        পারেন।
      </p>

      <h2 className="text-lg font-bold">৮. যোগাযোগ</h2>
      <p>
        আমাদের গোপনীয়তা নীতি সম্পর্কে আপনার কোনো প্রশ্ন বা পরামর্শ থাকলে সরাসরি
        আমাদের ইমেল করুন:
      </p>
      <p>
        ইমেল:{" "}
        <a
          href="mailto:tanvirtamim1111@gmail.com"
          className="text-primary font-bold"
        >
          tanvirtamim1111@gmail.com
        </a>
      </p>
    </div>
  </div>
);

const addNotification = async (
  userId: string,
  title: string,
  body: string,
  type: "letter" | "friend_request" | "money_order" | "system" | "adda",
  metadata?: {
    letterId?: string;
    postmanId?: string;
    senderName?: string;
    location?: string;
    isSender?: boolean;
  },
) => {
  try {
    const notificationData = {
      userId,
      title,
      body,
      type,
      isRead: false,
      createdAt: serverTimestamp(),
      ...(metadata || {}),
    };
    await addDoc(collection(db, "notifications"), notificationData);

    // Global Notification - we rely on the global listener to trigger sendSystemNotification based on user preferences
  } catch (error) {
    console.error("Error adding notification:", error);
  }
};

const NotificationScreen = ({
  onBack,
  user,
  onNavigate,
  setSelectedNotification,
}: {
  onBack: () => void;
  user: any;
  onNavigate: (s: Screen) => void;
  setSelectedNotification: (n: any) => void;
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setNotifications(
          snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
        );
        setLoading(false);
      },
      (error) =>
        handleFirestoreError(error, OperationType.LIST, "notifications"),
    );

    return () => unsub();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notifications/${id}`);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const unreadNotifs = notifications.filter(n => !n.isRead);
      if (unreadNotifs.length === 0) return;

      const batch = writeBatch(db);
      unreadNotifs.forEach(n => {
        batch.update(doc(db, "notifications", n.id), { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "notifications/batch-update");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const handleNotifClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.type === "adda" || notif.location === "adda-room") {
      onNavigate("adda-room");
    } else {
      setSelectedNotification(notif);
      onNavigate("notification-detail");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "letter":
        return <Mail className="text-blue-500" />;
      case "friend_request":
        return <UserPlus className="text-green-500" />;
      case "money_order":
        return <Coins className="text-amber-500" />;
      case "adda":
        return <MessageCircle className="text-orange-500" />;
      default:
        return <Bell className="text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
          <header className="bg-surface px-6 py-5 flex items-center justify-between sticky top-0 z-50 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-2xl font-serif font-bold text-primary">
            ডাকবার্তা
          </h1>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center gap-2"
          >
            <CheckCheck size={12} />
            সব পঠিত
          </button>
        )}
      </header>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 space-y-4 opacity-50">
            <Bell size={64} className="mx-auto" />
            <p className="font-serif italic">কোনো ডাকবার্তা নেই</p>
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <motion.div
              key={`${notif.id}-${idx}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-[2rem] border transition-all flex gap-4 items-start cursor-pointer hover:scale-[1.02] active:scale-98 ${
                notif.isRead
                  ? "bg-stone-50/50 border-stone-100 opacity-70"
                  : "bg-white border-primary/30 shadow-xl shadow-primary/10 ring-1 ring-primary/5"
              }`}
              onClick={() => handleNotifClick(notif)}
            >
              <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100 shadow-inner">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3
                    className={`text-sm font-black truncate leading-tight ${notif.isRead ? "text-gray-500" : "text-gray-800"}`}
                  >
                    {notif.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl transition-all"
                  >
                    <X size={14} className="stroke-[3]" />
                  </button>
                </div>
                <p className={`text-xs mt-1 font-medium leading-relaxed line-clamp-1 ${notif.isRead ? "text-gray-400" : "text-gray-600"}`}>
                  {notif.body}
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${notif.isRead ? "bg-stone-200" : "bg-primary animate-pulse"}`} />
                  <span className="text-[9px] font-black text-outline uppercase bn-number">
                    {notif.createdAt?.toDate
                      ? new Date(notif.createdAt.toDate()).toLocaleString("bn-BD")
                      : "এইমাত্র"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const NotificationDetailScreen = ({
  notification,
  onBack,
  user,
  onNavigate,
}: {
  notification: any;
  onBack: () => void;
  user: any;
  onNavigate?: (screen: string) => void;
}) => {
  if (!notification) return null;

  const isAdda = notification.type === "adda" || notification.location === "adda-room";
  const postman = getPostmanById(notification.postmanId || "postman_1");
  const statusLabel = getDeliveryStatusLabel(notification.location || "", notification.isSender);

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white/80 backdrop-blur-md px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-stone-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-xl font-serif font-bold text-primary">ডাকবার্তার বিবরণ</h1>
      </header>

      <main className="p-6 space-y-6">
        {/* Postman Identity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex items-center gap-5"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={postman.avatar} 
                alt={postman.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">{postman.name}</h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">ডাক পিয়ন</p>
            <div className="mt-2 flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase">বর্তমানে {statusLabel}</span>
            </div>
          </div>
        </motion.div>

        {/* Message Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[3rem] shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Quote className="w-24 h-24 rotate-12" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-gray-800">{notification.title}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase bn-number">
                  {notification.createdAt?.toDate ? new Date(notification.createdAt.toDate()).toLocaleString("bn-BD") : "এইমাত্র"}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-100 min-h-[120px] flex items-center justify-center">
              <p className="text-sm font-medium text-gray-700 leading-relaxed text-center italic">
                "{notification.body}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50 space-y-1">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">চিঠি আইডি</span>
                <p className="text-xs font-black text-blue-600 truncate bn-number">
                  #{notification.letterId ? notification.letterId.slice(0, 8).toUpperCase() : "অজানা"}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100/50 space-y-1">
                <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">বর্তমান অবস্থান</span>
                <p className="text-xs font-black text-orange-600">{statusLabel}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => {
            vintageAudio.playClick();
            if (isAdda && onNavigate) {
              onNavigate("adda-room");
            } else {
              onBack();
            }
          }}
          className="w-full py-5 bg-gray-800 text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {isAdda ? <MessageCircle className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
          <span>{isAdda ? "আড্ডায় যোগ দিন" : "পরবর্তীতে দেখুন"}</span>
        </motion.button>
      </main>
    </div>
  );
};

const AboutScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-[#fdfaf3] pb-24 overflow-y-auto">
      <header className="bg-white/80 backdrop-blur-md px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-amber-100">
        <button
          onClick={onBack}
          className="p-2 hover:bg-amber-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-amber-800" />
        </button>
        <h1 className="text-2xl font-serif font-bold text-amber-900">
          ডাকটিক সম্পর্কে
        </h1>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="w-32 h-32 bg-amber-100/50 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-amber-100 p-2 overflow-hidden">
            <DakthikLogo id="dakthik-logo-svg" className="w-full h-full scale-110" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-amber-900">
            ডাকটিক
          </h2>
          <p className="text-amber-700 font-medium italic">
            হারিয়ে যাওয়া আবেগের ডিজিটাল ঠিকানা
          </p>
        </div>

        {/* Nostalgic Text */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-amber-900/5 border border-amber-100 space-y-6 leading-relaxed text-gray-800">
          <p className="font-serif text-lg">
            মনে পড়ে সেই ৯০ দশকের দুপুরগুলো? যখন জানালার গ্রিল ধরে আমরা পথ চেয়ে
            থাকতাম খাকি পোশাক পরা সেই পিয়নের ঘণ্টার শব্দের জন্য। একটি হলুদ খাম,
            হাতে লেখা কয়েকটা লাইন আর তাতে লেগে থাকা প্রিয় মানুষের হাতের কালির
            ঘ্রাণ—সেই অনুভূতির কোনো তুলনা হয় না।
          </p>
          <p className="font-serif text-lg">
            আজকের এই দ্রুতগতির যুগে আমরা মেসেজ পাঠাই সেকেন্ডে, কিন্তু সেই
            'অপেক্ষা' আর 'আবেগ' হারিয়ে গেছে। **'ডাকটিক'** অ্যাপটি তৈরি করা হয়েছে
            সেই হারানো দিনগুলোকে ফিরিয়ে আনতে। এটি শুধু একটি মেসেজিং অ্যাপ নয়,
            এটি একটি টাইম মেশিন।
          </p>
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-[0.2em] px-2">
            আমাদের বৈশিষ্ট্যসমূহ
          </h3>
          <div className="grid gap-4">
            {[
              {
                icon: PenLine,
                title: "হাতে লেখা চিঠির স্বাদ",
                desc: "বিভিন্ন ফন্ট আর স্টাইলে নিজের মনের কথা সাজিয়ে লিখুন।",
              },
              {
                icon: Truck,
                title: "বাস্তবসম্মত ডেলিভারি",
                desc: "চিঠি পাঠালেই পৌঁছাবে না, পিয়নের সাইকেলের গতিতে সময় নিয়ে পৌঁছাবে আপনার প্রিয়জনের কাছে।",
              },
              {
                icon: MapPin,
                title: "পোস্টকোড ভিত্তিক যোগাযোগ",
                desc: "ঠিকানা নয়, শুধু পোস্টকোড দিয়ে খুঁজে নিন বন্ধুদের।",
              },
              {
                icon: Wallet,
                title: "মানি অর্ডার",
                desc: "পুরোনো দিনের মতো কয়েন পাঠান মানি অর্ডারের মাধ্যমে।",
              },
              {
                icon: ShoppingBag,
                title: "ডাকটিক সওদালয়",
                desc: "সংগ্রহ করুন দুষ্প্রাপ্য স্ট্যাম্প, খাম আর সুগন্ধি কালি।",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 bg-white rounded-3xl border border-amber-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 text-amber-700">
                  <feature.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600 leading-snug">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing Message */}
        <div className="text-center p-8 bg-amber-900 text-amber-50 rounded-[3rem] space-y-4">
          <Heart size={32} className="mx-auto text-red-400 fill-red-400" />
          <p className="font-serif italic leading-relaxed">
            "চিঠি দিও প্রতিদিন, চিঠি দিও...
            <br />
            নইলে মনে হবে দূরে আছো, ভুলে গেছো।"
          </p>
          <div className="h-px bg-amber-800 w-16 mx-auto" />
          <p className="text-xs opacity-70">
            ডাকটিক - স্মৃতির আঙিনায় এক টুকরো ভালোবাসা
          </p>
        </div>
      </div>
    </div>
  );
};

const SupportScreen = ({ onBack, user }: { onBack: () => void; user: any }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportType, setSupportType] = useState("help");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "requests"), {
        userId: user?.uid,
        userEmail: user?.email,
        type: `support_${supportType}`,
        details: message,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("আপনার মেসেজটি এডমিনের কাছে পাঠানো হয়েছে। ধন্যবাদ!");
      onBack();
    } catch (error) {
      console.error("Error sending support request:", error);
      alert("দুঃখিত, মেসেজ পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-surface px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-outline-variant/30">
        <button
          onClick={onBack}
          className="p-2 hover:bg-surface-container rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-2xl font-serif font-bold text-primary">
          হেল্প ও সাপোর্ট
        </h1>
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-surface-container p-6 rounded-[2.5rem] shadow-xl space-y-6 border border-outline-variant/20">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              মেসেজের ধরন
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "help",
                  label: "সাহায্য",
                  color: "bg-primary/10 text-primary",
                },
                {
                  id: "complaint",
                  label: "অভিযোগ",
                  color: "bg-red-500/10 text-red-500",
                },
                {
                  id: "feedback",
                  label: "মতামত",
                  color: "bg-green-500/10 text-green-500",
                },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSupportType(type.id)}
                  className={`p-3 rounded-2xl text-sm font-bold transition-all ${
                    supportType === type.id
                      ? type.color + " ring-2 ring-current"
                      : "bg-surface text-on-surface-variant"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              আপনার মেসেজ
            </label>
            <textarea
              value={message || ""}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="এখানে বিস্তারিত লিখুন..."
              className="w-full p-4 bg-surface rounded-2xl border-none focus:ring-2 focus:ring-primary min-h-[200px] resize-none text-on-surface"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={20} />
                মেসেজ পাঠান
              </>
            )}
          </button>
        </div>

        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            আপনার যেকোনো সমস্যা বা ফিডব্যাক আমাদের জানান। এডমিন প্যানেল থেকে
            আপনার মেসেজটি পর্যালোচনা করে দ্রুত ব্যবস্থা নেওয়া হবে।
          </p>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ onBack, user }: { onBack: () => void; user: any }) => {
  // STRICT SECURITY CHECK
  useEffect(() => {
    if (user?.email !== "tanvirtamim1111@gmail.com") {
      onBack();
      showToast("আপনার এই প্যানেলে প্রবেশের অনুমতি নেই!", "error");
    }
  }, [user, onBack]);

  if (user?.email !== "tanvirtamim1111@gmail.com") return null;

  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newCoins, setNewCoins] = useState<number>(0);
  const [newPostcode, setNewPostcode] = useState("");
  const [activeTab, setActiveTab] = useState<
    "users" | "requests" | "broadcast" | "stats" | "tickets" | "shop" | "postmen" | "app_config"
  >("users");
  const [appConfig, setAppConfig] = useState<any>({
    disabledItems: [],
    customPapers: [],
    customFonts: [],
    customGifts: [],
    customEnvelopes: [],
    customStamps: [],
    customShopItems: [],
    customPostmen: []
  });

  // Effect to load config
  useEffect(() => {
    if (activeTab === "app_config") {
      const fetchConfig = async () => {
         try {
           const snap = await getDoc(doc(db, "app_config", "settings"));
           if (snap.exists()) {
              setAppConfig((prev: any) => ({ ...prev, ...snap.data() }));
           }
           setLoading(false);
         } catch(e) {
           console.error(e);
         }
      };
      fetchConfig();
    }
  }, [activeTab]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [postmen, setPostmen] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingPostman, setEditingPostman] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newItemType, setNewItemType] = useState<"stamp" | "envelope" | "page" | "seal">("stamp");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isReplying, setIsReplying] = useState(false);

  const handleSaveConfig = async () => {
    try {
      await setDoc(doc(db, "app_config", "settings"), appConfig, { merge: true });
      showToast("সেটিংস সফলভাবে সেভ হয়েছে।", "success");
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, "app_config/settings");
    }
  };

  useEffect(() => {
    const q = query(collection(db, "users"), limit(50));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setUsers(docs);
        if (activeTab === "users") setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "users"),
    );
    return unsub;
  }, [activeTab]);

  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setRequests(docs);
        if (activeTab === "requests") setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "requests"),
    );
    return unsub;
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "stats") {
      const fetchStats = async () => {
        try {
          const uSnap = await getDocs(collection(db, "users"));
          const lSnap = await getDocs(collection(db, "letters"));
          const rSnap = await getDocs(collection(db, "requests"));

          let totalCoins = 0;
          uSnap.docs.forEach((d) => (totalCoins += d.data().coins || 0));

          setStats({
            totalUsers: uSnap.size,
            totalLetters: lSnap.size,
            totalRequests: rSnap.size,
            activeRequests: rSnap.docs.filter((d) => d.data().status === "pending")
              .length,
            totalCoins,
          });
          setLoading(false);
        } catch (e) {
          console.error(e);
        }
      };
      fetchStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "tickets") {
      const q = query(
        collection(db, "supportTickets"),
        orderBy("createdAt", "desc"),
        limit(50),
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setTickets(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
        setLoading(false);
      });
      return unsub;
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "shop") {
      const q = query(collection(db, "shop_items"), orderBy("category"));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setShopItems(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
        } else {
          // If empty, we might want to initialize with SHOP_ITEMS for first time
          // But usually we just show empty and let admin add
          setShopItems([]);
        }
        setLoading(false);
      });
      return unsub;
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "postmen") {
      const q = query(collection(db, "piyons"));
      const unsub = onSnapshot(q, (snapshot) => {
        setPostmen(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
        setLoading(false);
      });
      return unsub;
    }
  }, [activeTab]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize Shop Items if empty
        const shopSnap = await getDocs(collection(db, "shop_items"));
        if (shopSnap.empty) {
          for (const item of SHOP_ITEMS) {
            // Explicitly clone to avoid non-serializable properties that might cause ID: 3029 error
            const cleanItem = JSON.parse(JSON.stringify(item));
            await setDoc(doc(db, "shop_items", item.id), { ...cleanItem, createdAt: serverTimestamp() });
          }
        }

        // Initialize piyons if empty
        const piyonSnap = await getDocs(collection(db, "piyons"));
        if (piyonSnap.empty) {
          for (const p of POSTMEN) {
            // Explicitly clone to avoid non-serializable properties
            const cleanPiyon = JSON.parse(JSON.stringify(p));
            await setDoc(doc(db, "piyons", p.id), { ...cleanPiyon, createdAt: serverTimestamp() });
          }
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };
    initializeData();
  }, []);

  const handleUpdateUserStatus = async (userId: string, isBanned: boolean) => {
    try {
      const reason = isBanned ? window.prompt("সাসপেন্ড বা ব্যান করার কারণ লিখুন:") : "";
      if (isBanned && reason === null) return;

      await updateDoc(doc(db, "users", userId), {
        status: isBanned ? "banned" : "active",
        isSuspended: isBanned,
        suspensionReason: reason || "কর্তৃপক্ষ কর্তৃক স্থগিত"
      });
      showToast(
        isBanned ? "ইউজারকে ব্লক করা হয়েছে" : "ইউজারকে আনব্লক করা হয়েছে",
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  };

  const handleReplyTicket = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setIsReplying(true);
    try {
      await updateDoc(doc(db, "supportTickets", selectedTicket.id), {
        adminReply: replyText,
        status: "resolved",
        repliedAt: serverTimestamp(),
      });

      // Send notification to user
      await addDoc(collection(db, "notifications"), {
        userId: selectedTicket.uid,
        title: "আপনার অভিযোগের উত্তর দেওয়া হয়েছে",
        body: `আপনার টিকেট #${selectedTicket.id.slice(-4)} এর উত্তর: ${replyText}`,
        type: "system",
        isRead: false,
        createdAt: serverTimestamp(),
      });

      showToast("রিপ্লাই পাঠানো হয়েছে!", "success");
      setReplyText("");
      setSelectedTicket(null);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `supportTickets/${selectedTicket.id}`,
      );
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await setDoc(
        doc(db, "users", editingUser.id),
        {
          coins: newCoins,
          postcode: newPostcode,
        },
        { merge: true },
      );
      showToast("ইউজার আপডেট করা হয়েছে!", "success");
      setEditingUser(null);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `users/${editingUser.id}`,
      );
    }
  };

  const handleApproveDeletion = async (request: any) => {
    try {
      // 1. Delete user document
      await deleteDoc(doc(db, "users", request.userId));
      // 2. Update request status
      await updateDoc(doc(db, "requests", request.id), {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      showToast("অ্যাকাউন্ট মুছে ফেলা হয়েছে!", "success");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `requests/${request.id}`,
      );
    }
  };

  const handleRejectDeletion = async (request: any) => {
    try {
      await updateDoc(doc(db, "requests", request.id), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
      showToast("অনুরোধ বাতিল করা হয়েছে!", "info");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `requests/${request.id}`,
      );
    }
  };

  const handleSaveShopItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const itemData = {
        name: editingItem.name,
        price: Number(editingItem.price),
        category: editingItem.category,
        premium: editingItem.premium || false,
        color: editingItem.color || "",
        border: editingItem.border || "",
        gradient: editingItem.gradient || "",
        textWhite: editingItem.textWhite || false,
        texture: editingItem.texture || "",
        image: editingItem.image || "",
        updatedAt: serverTimestamp(),
      };

      if (editingItem.id === "new") {
        await addDoc(collection(db, "shop_items"), {
          ...itemData,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "shop_items", editingItem.id), itemData);
      }
      showToast("সওদালয় আইটেম সেভ করা হয়েছে", "success");
      setEditingItem(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "shop_items");
    }
  };

  const handleDeleteShopItem = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই আইটেমটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "shop_items", id));
      showToast("আইটেম মুছে ফেলা হয়েছে", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `shop_items/${id}`);
    }
  };

  const handleSavePostman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPostman) return;
    try {
      const pData = {
        name: editingPostman.name,
        avatar: editingPostman.avatar || "👨‍💼",
        image: editingPostman.avatar || "",
        serviceId: editingPostman.serviceId || "",
        joiningDate: editingPostman.joiningDate || "",
        experience: editingPostman.experience || "",
        education: editingPostman.education || "",
        specialty: editingPostman.specialty || "",
        cost: Number(editingPostman.cost || 0),
        bio: editingPostman.bio || "",
        specialTalent: editingPostman.specialTalent || "",
        catchphrase: editingPostman.catchphrase || "",
        updatedAt: serverTimestamp(),
      };

      if (editingPostman.id === "new") {
        await addDoc(collection(db, "piyons"), {
          ...pData,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "piyons", editingPostman.id), pData);
      }
      showToast("পিয়ন তথ্য সেভ করা হয়েছে", "success");
      setEditingPostman(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "piyons");
    }
  };

  const handleDeletePostman = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই পিয়নকে মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "piyons", id));
      showToast("পিয়ন মুছে ফেলা হয়েছে", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `piyons/${id}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'shop' | 'postman') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("ছবির আকার ২MB এর কম হতে হবে।", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `admin/${type}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (type === 'shop') {
        setEditingItem({ ...editingItem, image: url });
      } else {
        setEditingPostman({ ...editingPostman, avatar: url });
      }
      showToast("ছবি আপলোড সফল হয়েছে!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("ছবি আপলোড ব্যর্থ হয়েছে।", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendGlobalNotice = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      showToast("শিরোনাম এবং বার্তা আবশ্যক!", "error");
      return;
    }

    setIsBroadcasting(true);
    try {
      // 1. Get all users
      const usersSnap = await getDocs(collection(db, "users"));
      const userDocs = usersSnap.docs;

      // 2. Create notification for each user
      // Note: For a large number of users, this should ideally be handled via a cloud function
      // but here we do it in batches or simple loop for now as per the environment scale.
      const batchSize = 500;
      for (let i = 0; i < userDocs.length; i += batchSize) {
        const batchDocSlice = userDocs.slice(i, i + batchSize);
        const batchPromise = batchDocSlice.map(u => {
          return addDoc(collection(db, "notifications"), {
            userId: u.id,
            title: broadcastTitle,
            body: broadcastBody,
            type: "system",
            isRead: false,
            createdAt: serverTimestamp()
          });
        });
        await Promise.all(batchPromise);
      }

      showToast(`সফলভাবে ${userDocs.length} জন ইউজারকে নোটিশ পাঠানো হয়েছে!`, "success");
      setBroadcastTitle("");
      setBroadcastBody("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "notifications");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.postcode?.includes(searchTerm),
  );

  return (
    <div className="bg-[#f5f2e9] min-h-screen pb-24 paper-texture">
      <header className="bg-[#1e1e1e] p-6 flex flex-col gap-5 sticky top-0 z-50 shadow-2xl border-b border-primary/20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-white border border-white/5 bg-white/5 active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-black text-white leading-none">
              এডমিন ড্যাশবোর্ড
            </h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
              POSTAL CONTROL SYSTEM v2.0
            </p>
          </div>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "users" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"}`}
          >
            ইউজার
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "requests" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"}`}
          >
            অনুরোধ ({requests.filter((r) => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "broadcast" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"}`}
          >
            নোটিশ
          </button>
          <button
            onClick={() => setActiveTab("shop")}
            className={`flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "shop" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"}`}
          >
            সওদালয়
          </button>
          <button
            onClick={() => setActiveTab("postmen")}
            className={`flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "postmen" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"}`}
          >
            পিয়ন
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "tickets" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"}`}
          >
            টিকেট ({tickets.filter((t) => t.status === "open").length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "stats" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"}`}
          >
            পরিসংখ্যান
          </button>
          <button
            onClick={() => setActiveTab("app_config")}
            className={`flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "app_config" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60"}`}
          >
            অ্যাপ সেটিংস
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {activeTab === "users" ? (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              <input
                type="text"
                placeholder="ইউজার খুঁজুন (ইমেইল বা পোস্টকোড)..."
                value={searchTerm || ""}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            {loading ? (
              <div className="text-center py-10 text-on-surface-variant font-medium">
                লোড হচ্ছে...
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((u, idx) => (
                  <div
                    key={`${u.id}-${idx}`}
                    className="p-5 bg-white/60 backdrop-blur rounded-[2rem] border border-stone-200 shadow-sm flex items-center justify-between group hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0 group-hover:scale-105 transition-transform">
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                             <UserIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-stone-800 truncate">
                          {u.displayName || "অচেনা পথিক"}
                        </h3>
                        <p className="text-[10px] font-mono text-stone-400 truncate uppercase tracking-widest">
                          {u.email}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[9px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg font-black inline-flex items-center gap-1 border border-stone-200">
                            🪙 <span className="bn-number">{toBengaliDigits(u.coins)}</span>
                          </span>
                          <span className="text-[9px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg font-black inline-flex items-center gap-1 border border-stone-200">
                            📮 <span className="bn-number">{toBengaliDigits(u.postcode)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setNewCoins(u.coins);
                          setNewPostcode(u.postcode);
                        }}
                        className="p-3 bg-stone-50 hover:bg-primary hover:text-white rounded-xl text-stone-400 transition-all border border-stone-100"
                      >
                        <PenLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateUserStatus(u.id, u.status !== "banned")
                        }
                        className={`p-3 rounded-xl transition-all border ${u.status === "banned" ? "bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white" : "bg-stone-50 text-stone-400 border-stone-100 hover:bg-red-500 hover:text-white"}`}
                      >
                        {u.status === "banned" ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <ShieldAlert className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === "requests" ? (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-16 bg-white/40 rounded-[2.5rem] border border-stone-200 text-stone-400 font-bold italic">
                কোন বকেয়া অনুরোধ পাওয়া যায়নি।
              </div>
            ) : (
              requests.map((req, idx) => (
                <div
                  key={`${req.id}-${idx}`}
                  className="p-6 bg-white/80 backdrop-blur rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-200/20 space-y-5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                        <AlertCircle className="text-red-500 w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-800">
                          অ্যাকাউন্ট মোছার আবেদন
                        </h3>
                        <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-1">
                          {req.userEmail}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                      যাচাইাধীন
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveDeletion(req)}
                      className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-red-200 active:scale-95 transition-all"
                    >
                      এপ্রুভ করুন
                    </button>
                    <button
                      onClick={() => handleRejectDeletion(req)}
                      className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black text-xs active:scale-95 transition-all"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "broadcast" ? (
          <div className="space-y-6 bg-surface p-6 rounded-[2.5rem] border border-outline-variant/20">
            <h3 className="text-xl font-bold font-serif text-primary">গ্লোবাল নোটিশ (ব্রডকাস্ট)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1">শিরোনাম</label>
                <input 
                  type="text" 
                  value={broadcastTitle} 
                  onChange={e => setBroadcastTitle(e.target.value)}
                  className="w-full p-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold"
                  placeholder="নোটিশ শিরোনাম"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1">বিস্তারিত বার্তা</label>
                <textarea 
                  value={broadcastBody} 
                  onChange={e => setBroadcastBody(e.target.value)}
                  className="w-full p-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold min-h-[150px] resize-none"
                  placeholder="আপনার মেসেজ এখানে লিখুন..."
                />
              </div>
              <button
                onClick={handleSendGlobalNotice}
                disabled={isBroadcasting}
                className="w-full py-5 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isBroadcasting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> সবাইকে পাঠান</>}
              </button>
            </div>
          </div>
        ) : activeTab === "shop" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-serif text-primary">সওদালয় আইটেম</h3>
              <button 
                onClick={() => setEditingItem({ id: 'new', name: '', price: 0, category: newItemType, image: '', color: 'bg-blue-50', border: 'border-blue-200' })}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold"
              >
                <Plus className="w-4 h-4" /> নতুন যোগ করুন
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {shopItems.map(item => (
                <div key={item.id} className="bg-white/80 backdrop-blur p-4 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-3 group hover:bg-white transition-all">
                  <div className={`w-full aspect-square rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform shadow-inner`}>
                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <DakthikLogo className="w-10 h-10 opacity-10" />}
                  </div>
                  <div className="text-center px-1">
                    <p className="font-black text-xs text-stone-700 truncate">{item.name}</p>
                    <p className="text-primary font-black text-[10px] mt-1">🪙 {toBengaliDigits(item.price)}</p>
                  </div>
                  <div className="flex gap-1.5 px-1">
                    <button onClick={() => setEditingItem(item)} className="p-2.5 bg-stone-100 text-stone-500 hover:bg-primary hover:text-white rounded-xl flex-1 flex justify-center transition-all"><PenLine size={14} /></button>
                    <button onClick={() => handleDeleteShopItem(item.id)} className="p-2.5 bg-stone-100 text-stone-500 hover:bg-red-500 hover:text-white rounded-xl flex-1 flex justify-center transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "postmen" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-serif text-primary">পিয়ন তালিকা</h3>
              <button 
                onClick={() => setEditingPostman({ id: 'new', name: '', cost: 0, avatar: '👨‍💼', bio: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold"
              >
                <Plus className="w-4 h-4" /> নতুন পিয়ন
              </button>
            </div>
            
            <div className="space-y-4">
              {postmen.map(p => (
                <div key={p.id} className="bg-white/80 backdrop-blur p-5 rounded-[2.5rem] border border-stone-200 shadow-sm flex items-center justify-between group hover:bg-white transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center overflow-hidden border border-stone-200 shadow-inner group-hover:scale-105 transition-transform">
                      <PostmanAvatar avatar={p.avatar} postmanId={p.id} name={p.name} className="text-3xl" />
                    </div>
                    <div>
                      <p className="font-black text-stone-800">{p.name}</p>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">🪙 {toBengaliDigits(POSTMEN.find(dp => dp.id === p.id)?.cost ?? p.cost)} সার্ভিস চার্জ</p>
                    </div>
                  </div>
                  <div className="flex gap-2 relative z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        vintageAudio.playClick();
                        setEditingPostman(p);
                      }} 
                      className="p-3 bg-stone-100 text-stone-500 hover:bg-primary hover:text-white rounded-2xl transition-all"
                    >
                      <PenLine size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // handleDeletePostman(p.id) is not defined here but keeping original code behavior
                      }} 
                      className="p-3 bg-stone-100 text-stone-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all hidden"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "tickets" ? (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant font-medium">কোন অভিযোগ পাওয়া যায়নি।</div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-surface p-5 rounded-[2.5rem] border border-outline-variant/20 shadow-sm space-y-4">
                  <div className="flex justify-between">
                    <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${ticket.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {ticket.status === 'open' ? 'ওপেন' : 'সমাধানকৃত'}
                    </span>
                    <span className="text-[10px] text-outline font-bold">{ticket.createdAt?.toDate ? new Date(ticket.createdAt.toDate()).toLocaleDateString('bn-BD') : ''}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">ইউজার ID: {ticket.uid?.slice(0, 8)}...</h4>
                    <p className="text-xs text-on-surface-variant mt-1 italic">"{ticket.message}"</p>
                  </div>
                  {ticket.adminReply && (
                    <div className="p-3 bg-surface-container rounded-xl border-l-4 border-primary">
                      <p className="text-[10px] font-bold text-primary uppercase mb-1">এডমিন রিপ্লাই</p>
                      <p className="text-xs text-on-surface-variant">{ticket.adminReply}</p>
                    </div>
                  )}
                  {ticket.status === 'open' && (
                    <button onClick={() => setSelectedTicket(ticket)} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs">রিপ্লাই দিন</button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : activeTab === "app_config" ? (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
                <button 
                  onClick={handleSaveConfig} 
                  className="absolute right-6 top-6 bg-primary text-white px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                   <Save className="w-4 h-4"/> সেভ করুন
                </button>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                    <Settings className="w-6 h-6 text-indigo-600"/>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-800">অ্যাপ কন্ট্রোল প্যানেল</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Manage App Features & Content</p>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* Toggles for Disabling Items */}
                  {[
                    { 
                      title: "ডাকটিকিট (Stamps) নিয়ন্ত্রণ", 
                      id: "stamps",
                      items: [
                        { id: "s1", label: "নৌকা ডাক", symbol: "⛵", category: "stamp" },
                        { id: "s2", label: "শহীদ মিনার", symbol: "🕌", category: "stamp" },
                        { id: "s3", label: "স্মৃতিসৌধ", symbol: "🗼", category: "stamp" },
                        { id: "s4", label: "লালবাগ কেল্লা", symbol: "🏰", category: "stamp" },
                        ...(appConfig.customStamps || []).map((s: any) => ({ ...s, label: s.name })),
                      ]
                    },
                    { 
                      title: "খাতা ও কাগজ (Papers) নিয়ন্ত্রণ", 
                      id: "papers",
                      items: [
                        { id: "white", label: "সাদা কাগজ", symbol: "📄", category: "page" },
                        { id: "ruled", label: "রোল টানা", symbol: "📝", category: "page" },
                        { id: "yellow", label: "হলুদ কাগজ", symbol: "🗒️", category: "page" },
                        ...(appConfig.customPapers || []).map((p: any) => ({ ...p, label: p.name })),
                      ]
                    },
                    { 
                      title: "খাম (Envelopes) নিয়ন্ত্রণ", 
                      id: "envelopes",
                      items: [
                        { id: "classic", label: "সাদা খাম", category: "envelope" },
                        { id: "vintage", label: "পুরানো খাম", category: "envelope" },
                        { id: "royal", label: "রাজকীয় খাম", category: "envelope" },
                        ...(appConfig.customEnvelopes || []).map((e: any) => ({ ...e, label: e.name })),
                      ]
                    },
                    { 
                      title: "ফন্ট (Fonts) নিয়ন্ত্রণ", 
                      id: "fonts",
                      items: [
                        { id: "serif", label: "ডাকটিক ১", symbol: "অ" },
                        { id: "sans", label: "ডাকটিক ২", symbol: "আ" },
                        { id: "handwriting", label: "ডাকটিক ৩", symbol: "ই" },
                        { id: "fancy", label: "ডাকটিক ৪", symbol: "ঈ" },
                        { id: "poushali", label: "ডাকটিক ৫", symbol: "উ" },
                        { id: "poushali-italic", label: "ডাকটিক ৬", symbol: "ঊ" },
                        { id: "priyotoma", label: "ডাকটিক ৭", symbol: "ঋ" },
                        { id: "priyotoma-italic", label: "ডাকটিক ৮", symbol: "এ" },
                        { id: "himu", label: "ডাকটিক ৯", symbol: "ঐ" },
                        { id: "himu-italic", label: "ডাকটিক ১০", symbol: "ও" },
                      ]
                    }
                  ].map((section) => (
                    <div key={section.id} className="space-y-4">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {section.title}
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {section.items.map((item) => {
                          const isBlocked = appConfig.disabledItems?.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                const newDisabled = isBlocked
                                  ? appConfig.disabledItems.filter((i: string) => i !== item.id)
                                  : [...(appConfig.disabledItems || []), item.id];
                                setAppConfig({ ...appConfig, disabledItems: newDisabled });
                              }}
                              className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${
                                isBlocked 
                                  ? "bg-gray-50 border-gray-100 opacity-60 grayscale" 
                                  : "bg-white border-primary/5 shadow-sm hover:border-primary/20"
                              }`}
                            >
                              <div className={`w-20 h-24 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 ${isBlocked ? "bg-gray-200" : "bg-white shadow-sm border border-gray-100"}`}>
                                {item.category === "stamp" ? (
                                  <StampVisual item={item} className="w-18 h-22" />
                                ) : item.category === "envelope" ? (
                                  <EnvelopeVisual item={item} className="w-10 h-6" />
                                ) : item.category === "page" ? (
                                  <PageVisual item={item} className="w-8 h-10" />
                                ) : (
                                  <div className="text-2xl font-bold text-primary">
                                    {item.symbol || item.label?.[0]}
                                  </div>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold text-center leading-tight min-h-[2rem] flex items-center justify-center ${isBlocked ? "text-gray-400" : "text-gray-700"}`}>
                                {item.label}
                                {isBlocked && <span className="block text-[8px] text-red-400 uppercase mt-1">(বন্ধ)</span>}
                              </span>
                              
                              <div className={`mt-auto w-10 h-5 rounded-full relative transition-all duration-300 ${isBlocked ? "bg-gray-300" : "bg-green-500"}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${isBlocked ? "left-0.5" : "left-5.5"}`} />
                              </div>

                              {isBlocked && (
                                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-full">
                                  <ShieldBan className="w-3 h-3 text-red-500"/>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                        <Settings2 className="w-5 h-5 text-amber-600"/>
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-gray-800">অ্যাডভান্সড সেটিংস</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">JSON Data Configuration</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {[
                        { key: 'customFonts', label: 'নতুন ফন্ট ডাটা' },
                        { key: 'customPapers', label: 'নতুন পেপার ডাটা' },
                        { key: 'customStamps', label: 'নতুন স্ট্যাম্প ডাটা' },
                      ].map((cfg) => (
                        <div key={cfg.key} className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">{cfg.label}</label>
                          <textarea
                            value={JSON.stringify(appConfig[cfg.key] || [], null, 2)}
                            onChange={(e) => {
                              try {
                                setAppConfig({ ...appConfig, [cfg.key]: JSON.parse(e.target.value) });
                              } catch (err) {}
                            }}
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-[10px] h-32 focus:border-primary/30 outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 px-2">
             {/* Stats tab content */}
             <div className="bg-white/80 backdrop-blur p-6 rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-125 transition-transform">
                  <UserIcon className="w-12 h-12" />
                </div>
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-3xl text-stone-800 bn-number leading-none">{toBengaliDigits(stats?.totalUsers || 0)}</span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2 block">মোট ইউজার</span>
                </div>
             </div>

             <div className="bg-white/80 backdrop-blur p-6 rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-125 transition-transform">
                  <FileText className="w-12 h-12" />
                </div>
                <div className="w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-3xl text-stone-800 bn-number leading-none">{toBengaliDigits(stats?.totalLetters || 0)}</span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2 block">মোট চিঠি</span>
                </div>
             </div>

             <div className="bg-white/80 backdrop-blur p-6 rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-125 transition-transform">
                  <Coins className="w-12 h-12" />
                </div>
                <div className="w-12 h-12 bg-amber-500/5 rounded-2xl flex items-center justify-center text-amber-600">
                  <Coins className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-2xl text-stone-800 bn-number leading-none">🪙 {toBengaliDigits(stats?.totalCoins || 0)}</span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2 block">সার্কুলেশন কয়েন</span>
                </div>
             </div>

             <div className="bg-white/80 backdrop-blur p-6 rounded-[2rem] border border-primary/5 shadow-xl shadow-primary/5 flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-125 transition-transform">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <div className="w-12 h-12 bg-red-500/5 rounded-2xl flex items-center justify-center text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-3xl text-stone-800 bn-number leading-none">{toBengaliDigits(stats?.activeRequests || 0)}</span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2 block">পেন্ডিং রিকোয়েস্ট</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Ticket Reply Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-surface rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6">
              <h3 className="text-xl font-bold font-serif text-primary">অভিযোগের রিপ্লাই</h3>
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/20">
                <p className="text-[10px] font-bold text-outline-variant uppercase mb-2">ইউজারের অভিযোগ</p>
                <p className="text-sm text-on-surface-variant italic">"{selectedTicket.message}"</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1">আপনার উত্তর</label>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full p-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none text-sm h-32 resize-none" placeholder="আপনার উত্তর এখানে লিখুন..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedTicket(null)} className="flex-1 py-4 bg-surface-container rounded-2xl font-bold text-on-surface-variant">বাতিল</button>
                <button onClick={handleReplyTicket} disabled={isReplying || !replyText.trim()} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                  {isReplying ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> রিপ্লাই পাঠান</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-surface rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6">
              <h3 className="text-xl font-bold font-serif text-primary">ইউজার আপডেট</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">কয়েন ব্যালেন্স</label>
                  <input type="number" value={newCoins} onChange={e => setNewCoins(Number(e.target.value))} className="w-full p-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">পোস্টকোড</label>
                  <input type="text" value={newPostcode} onChange={e => setNewPostcode(e.target.value)} className="w-full p-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-surface-container rounded-2xl font-bold text-on-surface-variant">বাতিল</button>
                <button onClick={handleUpdateUser} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold">আপডেট</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsScreen = ({
  onBack,
  user,
  onNavigate,
  onSignOut,
  onUpdateTheme,
}: {
  onBack: () => void;
  user: any;
  onNavigate: (s: Screen) => void;
  onSignOut: () => void;
  onUpdateTheme: (theme: string) => void;
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeletionRequest, setPendingDeletionRequest] =
    useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "requests"),
      where("userId", "==", user.uid),
      where("type", "==", "deletion_request"),
      limit(1),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPendingDeletionRequest({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      } else {
        setPendingDeletionRequest(null);
      }
    });
    return unsub;
  }, [user]);

  const handleRequestDeletion = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userEmail: user.email,
        type: "deletion_request",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      showToast(
        "অনুরোধ পাঠানো হয়েছে! এডমিন এপ্রুভ করলে অ্যাকাউন্ট মুছে যাবে।",
        "success",
      );
      setShowDeleteConfirm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "requests");
    }
  };

  const handleCancelDeletionRequest = async () => {
    if (!pendingDeletionRequest) return;
    try {
      await deleteDoc(doc(db, "requests", pendingDeletionRequest.id));
      showToast("অনুরোধ বাতিল করা হয়েছে।", "info");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `requests/${pendingDeletionRequest.id}`,
      );
    }
  };

  const isAdminUser = user?.email === "tanvirtamim1111@gmail.com";

  const menuItems = [
    { id: "profile-edit", icon: UserIcon, label: "প্রোফাইল এডিট", subLabel: "আপনার ব্যক্তিগত তথ্য" },
    { id: "settings-themes", icon: Palette, label: "ডাকটিক থিম", subLabel: "পুরোনো আমেজের সেরা ডিজাইন" },
    { id: "settings-notifications", icon: Bell, label: "ডাকবার্তা", subLabel: "চিঠির আপডেট জানুন" },
    { id: "settings-sounds", icon: Volume2, label: "সাউন্ড সেটিং", subLabel: "শব্দের আমেজ নিয়ন্ত্রণ করুন" },
    { id: "referral", icon: Gift, label: "রেফারেল বোনাস", subLabel: "১০০ 🪙 জিতে নিন" },
    { id: "about", icon: Info, label: "ডাকটিক সম্পর্কে" },
    { id: "support", icon: MessageSquare, label: "হেল্প ও সাপোর্ট" },
    { id: "privacy-policy", icon: ShieldCheck, label: "গোপনীয়তা নীতি" },
  ];

  if (isAdminUser) {
    menuItems.push({ id: "admin", icon: ShieldAlert, label: "অ্যাডমিন প্যানেল", subLabel: "সিস্টেম কন্ট্রোল" });
  }

  return (
    <div className="bg-background min-h-screen pb-24 paper-texture">
      <header className="bg-surface/90 backdrop-blur-md px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-primary/10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-2xl font-serif font-black text-primary tracking-tighter">সেটিংস</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* Profile Card Summary */}
        <button
          onClick={() => onNavigate("profile")}
          className="w-full flex items-center gap-5 p-6 bg-white rounded-[2.5rem] shadow-xl border border-primary/5 text-left active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <DakthikLogo className="w-20 h-20 rotate-12" />
          </div>
          <div className="relative z-10 w-20 h-20 rounded-[2rem] bg-primary/5 p-1 border-2 border-primary/10 overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <UserIcon className="w-10 h-10 text-primary/30" />
              </div>
            )}
          </div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900 leading-tight">
                {user?.displayName || "ব্যবহারকারী"}
              </h2>
              {user?.role === "admin" && (
                <div className="bg-amber-100 p-1 rounded-full"><ShieldCheck className="w-3 h-3 text-amber-600" /></div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ব্যক্তিগত প্রোফাইল</p>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-primary transition-colors" />
        </button>

        {/* Navigation Menu */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-primary/5 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
             <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] ml-2">অ্যাকাউন্ট সেটিংস</p>
          </div>
          <div className="divide-y divide-gray-50">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  vintageAudio.playClick();
                  onNavigate(item.id as Screen);
                }}
                className="w-full flex items-center justify-between p-5 hover:bg-primary/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    <item.icon className="text-primary w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-800 leading-none mb-1 group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item.subLabel}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Admin Section */}
        {(user?.email?.toLowerCase() === "tanvirtamim1111@gmail.com" || user?.role === "admin") && (
          <div className="space-y-3">
            <button
              onClick={() => {
                vintageAudio.playClick();
                onNavigate("admin");
              }}
              className="w-full p-6 bg-amber-50 rounded-[2.5rem] border-2 border-amber-100 flex items-center gap-5 group active:scale-[0.98] transition-all"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                 <ShieldCheck className="w-8 h-8 text-amber-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-black text-amber-900">এডমিন প্যানেল</p>
                <p className="text-[10px] text-amber-600/60 font-bold uppercase">সিস্টেম ম্যানেজমেন্ট</p>
              </div>
            </button>

            <button
              onClick={() => {
                vintageAudio.playClick();
                onNavigate("onboarding" as Screen);
              }}
              className="w-full p-4 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4 group active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                 <Play className="w-5 h-5 text-primary pl-0.5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-primary text-sm">অনবোর্ডিং অ্যানিমেশন দেখুন</p>
              </div>
            </button>
          </div>
        )}

        {/* Account Actions */}
        <div className="space-y-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full p-5 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center space-x-3 font-black text-sm border border-red-100 hover:bg-red-100 transition-colors shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>লগ আউট করুন</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!!pendingDeletionRequest && pendingDeletionRequest.status === "pending"}
            className="w-full p-5 bg-gray-50 text-gray-400 rounded-[2rem] flex items-center justify-center space-x-3 font-bold text-xs border border-gray-100 hover:bg-red-50 hover:text-red-400 transition-all disabled:opacity-50"
          >
            <AlertCircle className="w-4 h-4" />
            <span>
              {pendingDeletionRequest?.status === "pending"
                ? "মুছে ফেলার অনুরোধ পাঠানো হয়েছে"
                : "অ্যাকাউন্ট মুছে ফেলুন"}
            </span>
          </button>

          {pendingDeletionRequest?.status === "pending" && (
            <button
              onClick={handleCancelDeletionRequest}
              className="w-full p-2 text-[10px] text-gray-400 font-bold hover:text-primary transition-colors underline underline-offset-4"
            >
              অনুরোধ বাতিল করুন
            </button>
          )}
        </div>

        <div className="text-center py-6">
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
            ডাকটিক ভার্সন ১.০.৫
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
             <div className="w-1 h-1 rounded-full bg-primary/20" />
             <p className="text-[8px] text-gray-400 font-bold">© ২০২৬ ডাকটিক টিম</p>
             <div className="w-1 h-1 rounded-full bg-primary/20" />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center space-y-6 border-4 border-white"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <LogOut className="text-red-500 w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 font-serif">লগ আউট?</h3>
                <p className="text-gray-500 text-sm">
                  আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট থেকে লগ আউট করতে চান?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  না
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onSignOut();
                  }}
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-red-500 shadow-lg shadow-red-200 active:scale-95 transition-all"
                >
                  হ্যাঁ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl text-center space-y-6 border-4 border-white"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="text-red-600 w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 font-serif">অ্যাকাউন্ট মুছে ফেলুন?</h3>
                <p className="text-gray-500 text-xs">
                  আপনার সব চিঠি, কয়েন এবং ডাটা চিরতরে মুছে যাবে। এটি আর ফিরে পাওয়া সম্ভব নয়।
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRequestDeletion}
                  className="w-full py-4 rounded-2xl font-black text-white bg-red-600 shadow-xl shadow-red-200 active:scale-95 transition-all"
                >
                  হ্যাঁ, অনুরোধ পাঠান
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 rounded-2xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  না, ফিরে যান
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



const ProfileEditScreen = ({
  onBack,
  user,
}: {
  onBack: () => void;
  user: any;
}) => {
  const [name, setName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [birthday, setBirthday] = useState(user?.birthday || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [bio, setBio] = useState(user?.bio || "");
  const [interests, setInterests] = useState(user?.interests || "");
  const [village, setVillage] = useState(user?.village || "");
  const [postOffice, setPostOffice] = useState(user?.postOffice || "");
  const [thana, setThana] = useState(user?.thana || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpdate = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name,
        photoURL,
        birthday,
        gender,
        bio,
        interests,
        village,
        postOffice,
        thana,
        district,
        updatedAt: serverTimestamp(),
      });
      showToast("প্রোফাইল আপডেট করা হয়েছে!", "success");
      onBack();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("ছবি ২MB এর কম হতে হবে", "error");
      return;
    }
    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      showToast("ছবি আপলোড হয়েছে!", "success");
    } catch (error) {
      showToast("আপলোড ব্যর্থ হয়েছে", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-32 paper-texture">
      <header className="bg-surface/80 backdrop-blur-md px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-primary/10">
        <button onClick={onBack} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-2xl font-serif font-black text-primary">প্রোফাইল এডিট</h1>
      </header>

      <div className="p-8 space-y-12">
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[3rem] bg-primary/5 overflow-hidden border-2 border-primary/20 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-primary/20" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-4 bg-primary text-white rounded-[1.5rem] shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all z-10">
              <Camera className="w-6 h-6" />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
            {uploading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[3rem] flex items-center justify-center z-20">
                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">আপনার পরিচয়</p>
            <h2 className="text-2xl font-serif font-black text-gray-900">{user?.displayName || "ব্যবহারকারী"}</h2>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Info Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-2">
               প্রাসঙ্গিক তথ্য
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">আপনার নাম</label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-5 py-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800"
                  placeholder="নাম লিখুন"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">জন্মদিন</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full p-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">জেন্ডার</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800 appearance-none"
                >
                  <option value="male">পুরুষ</option>
                  <option value="female">মহিলা</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">বায়ো</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800 min-h-[120px] resize-none"
                placeholder="নিজের সম্পর্কে কিছু লিখুন..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">পছন্দের কথা</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full p-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800"
                placeholder="আপনার শখ বা পছন্দের কাজ..."
              />
            </div>
          </div>

          {/* Address Info Section */}
          <div className="space-y-6 pt-4">
            <h3 className="text-sm font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-2">
               ঠিকানা ও এলাকা
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">গ্রাম/এলাকা</label>
                <div className="relative">
                  <Home className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800"
                    placeholder="গ্রামের নাম"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">ডাকটিক</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                  <input
                    type="text"
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800"
                    placeholder="ডাকটিক"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">থানা</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                   <input
                    type="text"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800"
                    placeholder="থানা"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1 opacity-60">জেলা</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-white rounded-[2rem] border-2 border-primary/5 focus:border-primary/20 outline-none transition-all shadow-inner font-bold text-gray-800"
                    placeholder="জেলা"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 text-center">
             <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">ডাকটিক আইডি (অপরিবর্তনযোগ্য)</p>
             <div className="flex justify-center gap-4">
                <span className="text-lg bg-white px-5 py-2 rounded-full font-black shadow-sm text-primary bn-number tracking-widest">
                  {user?.postcode ? toBengaliDigits(user.postcode) : "----"}
                </span>
             </div>
             <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter italic">এই কোডটি আপনার স্থায়ী ডাকটিক ঠিকানা</p>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={isUpdating || uploading || !name.trim()}
          className="w-full py-6 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isUpdating ? <RefreshCw className="w-6 h-6 animate-spin" /> : "পরিবর্তন সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
};


const AuthScreen = ({ onGoogleLogin }: { onGoogleLogin: () => void }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      showToast("সঠিক ইমেইল এড্রেস দিন", "error");
      return;
    }

    if (password.length < 8) {
      showToast("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে", "error");
      return;
    }

    if (mode === "register" && !name) {
      showToast("আপনার নাম লিখুন", "error");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const firebaseUser = userCredential.user;

        await updateAuthProfile(firebaseUser, { displayName: name });
        showToast("নিবন্ধন সফল হয়েছে!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("লগইন সফল হয়েছে!", "success");
      }
    } catch (error: any) {
      console.error(error);
      let message = "একটি সমস্যা হয়েছে";
      if (error.code === "auth/email-already-in-use") {
        message = "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে। দয়া করে লগ ইন করুন।";
        setMode("login");
      } else if (error.code === "auth/wrong-password") {
        message = "ভুল পাসওয়ার্ড";
      } else if (error.code === "auth/user-not-found") {
        message = "এই ইমেইলে কোনো অ্যাকাউন্ট নেই";
      } else if (error.code === "auth/invalid-credential") {
        message = "ভুল ইমেইল বা পাসওয়ার্ড";
      } else if (error.code === "auth/network-request-failed") {
        message = "ইন্টারনেট সংযোগ বা ডোমেইন অথরাইজেশান চেক করুন";
      } else if (error.code === "auth/too-many-requests") {
        message = "অতিরিক্ত চেষ্টার ফলে অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। পরে চেষ্টা করুন।";
      } else if (error.code === "auth/operation-not-allowed") {
        message = "এই লগইন পদ্ধতিটি ফায়ারবেস কনসোলে চালু করা নেই।";
      } else if (error.code) {
        message = `ত্রুটি: ${error.code}`;
      }
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 paper-texture overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-8 space-y-8 border-2 border-primary/5 my-auto"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <DakthikLogo className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-primary font-serif">
            {mode === "login" ? "স্বাগতম" : "নতুন অ্যাকাউন্ট"}
          </h2>
          <p className="text-gray-500 font-bold text-sm">
            {mode === "login"
              ? "আপনার চিঠির যাত্রা শুরু করতে লগ ইন করুন"
              : "ডাকটিক পরিবারে যোগ দিতে নিবন্ধন করুন"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === "register" && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="আপনার নাম"
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold"
                required
              />
            </div>
          )}

          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="ইমেইল এড্রেস"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
              value={password || ""}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-bold"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
            ) : mode === "login" ? (
              "লগ ইন করুন"
            ) : (
              "নিবন্ধন করুন"
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-bold">অথবা</span>
          </div>
        </div>

        <button
          onClick={onGoogleLogin}
          className="w-full bg-white text-gray-700 font-bold py-4 rounded-2xl shadow-md flex items-center justify-center space-x-4 border border-gray-100 hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          <LogIn className="w-6 h-6 text-primary" />
          <span>গুগল দিয়ে লগ ইন করুন</span>
        </button>

        <p className="text-center text-sm font-bold text-gray-500">
          {mode === "login" ? "অ্যাকাউন্ট নেই?" : "ইতিমধ্যে অ্যাকাউন্ট আছে?"}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="ml-2 text-primary hover:underline"
          >
            {mode === "login" ? "নিবন্ধন করুন" : "লগ ইন করুন"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const NotificationSettingsScreen = ({
  onBack,
  user,
  onUpdateNotifications,
}: {
  onBack: () => void;
  user: any;
  onUpdateNotifications: (enabled: boolean) => void;
}) => {
  const isEnabled = user?.notificationsEnabled !== false; // Default to true
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  const requestPermission = async () => {
    if (typeof Notification !== "undefined") {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted" && !isEnabled) {
        onUpdateNotifications(true);
      }
    }
  };

  return (
    <div className="bg-background min-h-screen pb-24 paper-texture">
      <header className="bg-surface/80 backdrop-blur-md px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-primary/10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-2xl font-serif font-black text-primary tracking-tight">ডাকবার্তা সেটিং</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* Main Toggle Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-primary/5 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Bell className="w-24 h-24 rotate-12" />
           </div>

           <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <Bell className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-gray-800">পুশ ডাকবার্তা</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1">চিঠির রিয়েল-টাইম আপডেট</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  vintageAudio.playClick();
                  onUpdateNotifications(!isEnabled);
                }}
                className={`w-16 h-9 rounded-full relative transition-all duration-300 shadow-lg ${isEnabled ? 'bg-green-500 shadow-green-100' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all duration-300 shadow-md ${isEnabled ? 'left-8' : 'left-1'}`} />
              </button>
           </div>

           <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-primary/5">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  ডাকবার্তা অন থাকলে পিয়ন আপনার দরজায় আসার সাথে সাথে আপনি অ্যালার্ট পাবেন। বন্ধুদের মেসেজ এবং গিফটের খবর সবার আগে আপনার কাছে পৌঁছাবে।
                </p>
              </div>
           </div>
        </div>

        {/* Browser Permission Card */}
        {typeof Notification !== "undefined" && permission !== "granted" && (
          <div className="bg-amber-50 rounded-[2.5rem] p-8 border-2 border-amber-100/50 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-4 text-amber-600">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <h4 className="font-black">ব্রাউজার পারমিশন প্রয়োজন</h4>
             </div>
             <p className="text-xs text-amber-900/70 font-medium leading-relaxed">
                সিস্টেম ডাকবার্তা পেতে আপনার ব্রাউজারের অনুমতি প্রয়োজন। নিচের বাটনে ক্লিক করে অনুমতি দিন।
             </p>
             <button 
               onClick={requestPermission}
               className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-200 active:scale-95 transition-all"
             >
                অনুমতি দিন
             </button>
          </div>
        )}

        <div className="px-6 flex flex-col items-center gap-4 py-4">
           <div className="w-12 h-1 bg-gray-100 rounded-full" />
           <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] text-center">
             ডাকটিক হেরিটেজ সার্ভিস
           </p>
        </div>
      </div>
    </div>
  );
};

const SoundSettingsScreen = ({
  onBack,
  user,
}: {
  onBack: () => void;
  user: any;
}) => {
  const [settings, setSettings] = useState<AudioSettings>(vintageAudio.getSettings());

  const handleToggle = (key: keyof AudioSettings) => {
    const newValue = !settings[key];
    vintageAudio.updateSetting(key, newValue);
    setSettings({ ...settings, [key]: newValue });
    vintageAudio.playClick();
  };

  const handleRestoreDefaults = () => {
    const defaults: AudioSettings = {
      master: true,
      clicks: true,
      notifications: true,
      ui: true,
    };
    Object.entries(defaults).forEach(([key, value]) => {
      vintageAudio.updateSetting(key as keyof AudioSettings, value);
    });
    setSettings(defaults);
    vintageAudio.playCoins();
  };

  const playPreview = (type: 'notifications' | 'clicks' | 'ui') => {
    if (type === 'notifications') vintageAudio.playMessage();
    if (type === 'clicks') vintageAudio.playClick();
    if (type === 'ui') vintageAudio.playStamp();
  };

  return (
    <div className="bg-background min-h-screen pb-24 paper-texture">
      <header className="bg-surface/80 backdrop-blur-md px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-primary/10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-2xl font-serif font-black text-primary tracking-tight">সাউন্ড সেটিং</h1>
      </header>

      <div className="p-6 space-y-4">
        {/* Master Switch */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${settings.master ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400 shadow-inner'}`}>
              {settings.master ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </div>
            <div>
              <h3 className="font-black text-gray-800">মাস্টার সাউন্ড</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">সব শব্দ বন্ধ/চালু করুন</p>
            </div>
          </div>
          <button 
            onClick={() => handleToggle('master')}
            className={`w-14 h-8 rounded-full relative transition-all duration-300 ${settings.master ? 'bg-green-500 shadow-lg shadow-green-100' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${settings.master ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Granular Settings */}
        <div className={`space-y-4 transition-all duration-300 ${settings.master ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2 pointer-events-none'}`}>
          <div className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-black text-gray-800">ডাকবার্তা</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">চিঠির আগমনের শব্দ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => playPreview('notifications')}
                className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary"
                title="Preview Sound"
              >
                <Play size={16} fill="currentColor" />
              </button>
              <button 
                onClick={() => handleToggle('notifications')}
                className={`w-12 h-7 rounded-full relative transition-all duration-300 ${settings.notifications ? 'bg-primary shadow-md' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${settings.notifications ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-black text-gray-800">ট্যাপ / ক্লিক</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">বাটন ক্লিকের শব্দ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => playPreview('clicks')}
                className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary"
                title="Preview Sound"
              >
                <Play size={16} fill="currentColor" />
              </button>
              <button 
                onClick={() => handleToggle('clicks')}
                className={`w-12 h-7 rounded-full relative transition-all duration-300 ${settings.clicks ? 'bg-primary shadow-md' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${settings.clicks ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 shadow-lg border border-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-inner">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-black text-gray-800">ইন্টারঅ্যাকশন</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">কয়েন ও ডাকটিকিটের শব্দ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => playPreview('ui')}
                className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary"
                title="Preview Sound"
              >
                <Play size={16} fill="currentColor" />
              </button>
              <button 
                onClick={() => handleToggle('ui')}
                className={`w-12 h-7 rounded-full relative transition-all duration-300 ${settings.ui ? 'bg-primary shadow-md' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${settings.ui ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center space-y-4">
            <button
              onClick={handleRestoreDefaults}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              ডিফল্ট রিসেট করুন
            </button>
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">ডাকটিক • ডিজিটাল ডাক সেবা</p>
        </div>
      </div>
    </div>
  );
};

const ThemeSettingsScreen = ({
  onBack,
  user,
  onUpdateTheme,
}: {
  onBack: () => void;
  user: any;
  onUpdateTheme: (theme: string) => void;
}) => {
  return (
    <div className="bg-background min-h-screen pb-24 paper-texture">
      <header className="bg-surface/80 backdrop-blur-md px-6 py-5 flex items-center gap-4 sticky top-0 z-50 border-b border-primary/10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-primary" />
        </button>
        <h1 className="text-2xl font-serif font-black text-primary">থিম নির্বাচন</h1>
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-primary/10 mb-2">
          <p className="text-xs text-gray-500 font-bold leading-relaxed">
            আপনার ডাকটিকের আমেজ পরিবর্তন করুন। প্রতিটি থিম পুরোনো দিনের চিঠিপত্র এবং ডাকটিকের ঐতিহ্যের কথা মাথায় রেখে তৈরি করা হয়েছে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(THEMES).map(([key, theme]: [string, any]) => {
            const isActive = (user?.theme || "yellow") === key;
            return (
            <button
              key={key}
              onClick={() => {
                vintageAudio.playClick();
                onUpdateTheme(key);
              }}
              className={`relative p-5 rounded-[2rem] border-2 transition-all flex flex-col items-start gap-4 shadow-sm ${isActive ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]" : "border-gray-100 bg-white hover:scale-[1.01] hover:border-primary/20"}`}
            >
              <div className="w-full h-12 rounded-[1rem] flex overflow-hidden shadow-inner border border-black/5">
                {/* 60-30-10 Color Bar preview */}
                <div style={{ backgroundColor: theme.primary, width: '60%' }} className="h-full flex items-center justify-center">
                   <span className="text-white/40 text-[10px] font-black tracking-widest hidden sm:block">60%</span>
                </div>
                <div style={{ backgroundColor: theme.secondary, width: '30%' }} className="h-full flex items-center justify-center">
                   <span className="text-white/40 text-[10px] font-black tracking-widest hidden sm:block">30%</span>
                </div>
                <div style={{ backgroundColor: theme.tertiary, width: '10%' }} className="h-full" />
              </div>
              
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <span className="font-black text-lg text-gray-800 block">{theme.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold block mt-1 uppercase tracking-wider">{theme.description || "একটি সুন্দর থিম"}</span>
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${isActive ? "border-primary bg-primary text-white shadow-lg" : "border-gray-200 bg-gray-50 text-gray-400"}`}
                >
                  {isActive ? <CheckCircle2 className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
                </div>
              </div>
            </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const constraintsRef = useRef(null);
  const quickMenuControls = useAnimation();
  const [screen, setScreen] = useState<Screen>("splash");
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [activePostmanRecord, setActivePostmanRecord] = useState<any | null>(null);
  const [initialEditingPostman, setInitialEditingPostman] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnlineNotice, setShowOnlineNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineNotice(true);
      setTimeout(() => setShowOnlineNotice(false), 3000);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowOnlineNotice(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Scroll to top whenever the screen changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global click sound handler
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('button, a, input[type="button"], input[type="submit"], [role="button"], .cursor-pointer');
      
      if (interactive) {
        // If it's a link or button, play the click sound
        vintageAudio.playClick();
      }
    };

    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, []);

  const getOfficeStatus = () => {
    const hour = currentTime.getHours();
    if (hour < 9 || hour >= 17)
      return {
        label: "বন্ধ (Closed)",
        color: "text-red-500",
        icon: <LockIcon className="w-4 h-4" />,
      };
    if (hour >= 13 && hour < 14)
      return {
        label: "টিফিন সময় (Lunch)",
        color: "text-orange-500",
        icon: <Coffee className="w-4 h-4" />,
      };
    return {
      label: "খোলা (Open)",
      color: "text-green-500",
      icon: <CheckCircle2 className="w-4 h-4" />,
    };
  };

  const officeStatus = getOfficeStatus();

  const [currentLetter, setCurrentLetter] = useState<Partial<Letter> | null>(
    null,
  );
  const [user, setUser] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalConfig, setGlobalConfig] = useState<any>({ disabledItems: [] });
  const [allPostmen, setAllPostmen] = useState<any[]>(POSTMEN);
  const [allShopItems, setAllShopItems] = useState<any[]>(SHOP_ITEMS);
  
  useEffect(() => {
    let mergedPostmen = [...POSTMEN];
    if (globalConfig?.customPostmen?.length) {
      mergedPostmen = [...mergedPostmen, ...globalConfig.customPostmen];
    }
    mergedPostmen = mergedPostmen.filter((p) => !globalConfig?.disabledItems?.includes(p.id));
    setAllPostmen(mergedPostmen);

    // Filter and merge for shop state
    const nextStamps = STAMPS.filter((s) => !globalConfig?.disabledItems?.includes(s.id));
    const nextEnvelopes = ENVELOPES.filter((e) => !globalConfig?.disabledItems?.includes(e.id)).map(e => ({ ...e, category: "envelope" }));
    
    // Base other items (papers, seals) from SHOP_ITEMS
    const otherBaseItems = SHOP_ITEMS.filter(item => 
      item.category === "page" || item.category === "seal"
    ).filter(item => !globalConfig?.disabledItems?.includes(item.id));

    // Merge for shop state
    let mergedShopItems = [...nextStamps, ...nextEnvelopes, ...otherBaseItems];
    if (globalConfig?.customShopItems?.length) {
      mergedShopItems = [...mergedShopItems, ...globalConfig.customShopItems];
    }
    if (globalConfig?.customPapers?.length) {
      mergedShopItems = [...mergedShopItems, ...globalConfig.customPapers];
    }
    mergedShopItems = mergedShopItems.filter((item) => !globalConfig?.disabledItems?.includes(item.id));
    setAllShopItems(mergedShopItems);
  }, [globalConfig]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // New Global Notification Listener
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("isRead", "==", false),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          // Check if it's a very recent notification (within last 30 seconds)
          // to avoid showing old unread notifications on login
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().getTime() : Date.now();
          if (Date.now() - createdAt < 30000) {
            if (user?.notificationsEnabled !== false) {
              showToast(data.title, "info");
              sendSystemNotification(data.title, data.body);
              vintageAudio.playMessage(); // Assume playMessage or similar
            }
          }
        }
      });
    });

    return () => unsub();
  }, [user?.uid]);

  useDeliverySync(user);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubPostmen = onSnapshot(collection(db, "piyons"), (snapshot) => {
      if (!snapshot.empty) {
        setAllPostmen(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      }
    }, (error) => {
      console.warn("Piyons listener error:", error);
    });

    const unsubShop = onSnapshot(collection(db, "shop_items"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedItems = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        
        // Merge with defaults, prioritizing fetched items by ID
        setAllShopItems(prev => {
          const merged = [...prev];
          fetchedItems.forEach(fetched => {
            const idx = merged.findIndex(i => i.id === fetched.id);
            if (idx >= 0) merged[idx] = fetched;
            else merged.push(fetched);
          });
          return merged;
        });
      }
    }, (error) => {
      console.warn("Shop items listener error:", error);
    });

    return () => {
      unsubPostmen();
      unsubShop();
    };
  }, [user?.uid]);

  useEffect(() => {
    const handler = (e: any) => {
      const { message, type } = e.detail;
      setToast({ message, type });
      
      if (type === 'error') {
        vintageAudio.playError();
      } else if (type === 'success') {
        vintageAudio.playDing();
      }
      
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener("show-toast", handler);
    return () => window.removeEventListener("show-toast", handler);
  }, []);

  useEffect(() => {
    const themeKey = user?.theme || "yellow";
    const theme = THEMES[themeKey] || THEMES.yellow;

    const root = document.documentElement;
    root.style.setProperty("--theme-primary", theme.primary);
    root.style.setProperty("--theme-primary-container", theme.primaryContainer);
    root.style.setProperty("--theme-secondary", theme.secondary);
    root.style.setProperty(
      "--theme-secondary-container",
      theme.secondaryContainer,
    );
    root.style.setProperty("--theme-tertiary", theme.tertiary);
    root.style.setProperty("--theme-background", theme.background);
    root.style.setProperty("--theme-surface", theme.surface);
    root.style.setProperty("--theme-surface-container", theme.surfaceContainer);
    root.style.setProperty(
      "--theme-surface-container-low",
      theme.surfaceContainerLow,
    );
    root.style.setProperty(
      "--theme-surface-container-high",
      theme.surfaceContainerHigh,
    );
    root.style.setProperty(
      "--theme-surface-container-highest",
      theme.surfaceContainerHighest,
    );
    root.style.setProperty("--theme-on-surface", theme.onSurface);
  }, [user?.theme]);

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;
    let unsubInv: (() => void) | null = null;

    // Handle redirect result for mobile
    const handleRedirect = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            showToast("লগইন সফল হয়েছে!", "success");
          }
        } catch (error: any) {
          console.error("Redirect login failed", error);
          if (error.code && error.code !== "auth/no-auth-event") {
            showToast(`রিডাইরেক্ট লগইন এরর: ${error.code}`, "error");
          }
        }
      }
    };

    handleRedirect();

    // Listen for app state changes to catch redirect return
    let appStateListener: any = null;
    let backButtonListener: any = null;

    if (Capacitor.isNativePlatform()) {
      appStateListener = CapacitorApp.addListener(
        "appStateChange",
        ({ isActive }) => {
          if (isActive) {
            handleRedirect();
          }
        },
      );

      backButtonListener = CapacitorApp.addListener("backButton", () => {
        if (screen !== "home" && screen !== "splash") {
          setScreen("home");
        } else if (screen === "home") {
          CapacitorApp.exitApp();
        }
      });
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Auto-set admin role for the owner email
        if (firebaseUser.email?.toLowerCase() === "tanvirtamim1111@gmail.com") {
          try {
            await setDoc(
              doc(db, "users", firebaseUser.uid),
              { role: "admin" },
              { merge: true },
            );
          } catch (e) {
            console.error("Failed to auto-set admin role:", e);
          }
        }

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          try {
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
              // Generate a unique Dakthik ID (XXX-XXXX)
              let postcode = "";
              let isUnique = false;
              while (!isUnique) {
                const part1 = Math.floor(100 + Math.random() * 900).toString(); // 100-999
                const part2 = Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0"); // 0000-9999
                postcode = `${part1}-${part2}`;

                if (RESERVED_IDS.includes(postcode)) continue;

                const q = query(
                  collection(db, "users"),
                  where("postcode", "==", postcode),
                  limit(1),
                );
                try {
                  const snapshot = await getDocs(q);
                  if (snapshot.empty) isUnique = true;
                } catch (error) {
                  handleFirestoreError(error, OperationType.LIST, "users");
                  break; // Exit loop on error
                }
              }

              const referralCode = generateReferralCode();

              const userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "অজানা ব্যবহারকারী",
                photoURL: firebaseUser.photoURL || "",
                postcode,
                village: "",
                thana: "",
                district: "",
                postOffice: "",
                role: "user",
                coins: 50, // Initial coins
                referralCode,
                usedReferralCode: false,
                postmen: POSTMEN, // Initialize with default postmen
                createdAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, userData);

              // URL based referral check
              const urlParams = new URLSearchParams(window.location.search);
              const refCodeFromUrl = urlParams.get("ref");
              if (refCodeFromUrl) {
                // We'll store this in localStorage so the user can "Apply" it easily later or we process it now
                localStorage.setItem("pending_referral", refCodeFromUrl);
              }
            } else {
              // Sync missing profile data from Google/Firebase Auth for existing users
              const data = userDoc.data();
              const updates: any = {};
              
              // Move existing postcodes used as referral codes if necessary
              const isPostcodeCode = data.referralCode === data.postcode?.replace("-", "");
              if (!data.referralCode || isPostcodeCode) {
                updates.referralCode = generateReferralCode();
                updates.usedReferralCode = data.usedReferralCode ?? false;
              }

              // Update photo and name if they exist in Auth but not in the doc
              if (!data.photoURL && firebaseUser.photoURL) {
                updates.photoURL = firebaseUser.photoURL;
              }
              if (!data.displayName && firebaseUser.displayName) {
                updates.displayName = firebaseUser.displayName;
              }

              // Migrate postmen if missing or incomplete
              if (!data.postmen || data.postmen.length < POSTMEN.length) {
                const currentPostmen = data.postmen || [];
                const mergedPostmen = [...currentPostmen];
                
                POSTMEN.forEach(defaultP => {
                  const exists = mergedPostmen.some(p => p.id === defaultP.id);
                  if (!exists) {
                    mergedPostmen.push(defaultP);
                  }
                });

                if (mergedPostmen.length !== currentPostmen.length) {
                  updates.postmen = mergedPostmen;
                }
              }

              if (Object.keys(updates).length > 0) {
                await updateDoc(userDocRef, updates);
              }
            }
          } catch (err: any) {
            if (err.message?.includes("offline")) {
              console.warn("Client is offline, skipping user creation check.");
            } else {
              handleFirestoreError(
                err,
                OperationType.GET,
                `users/${firebaseUser.uid}`,
              );
            }
          }

          let unsubConfig: any;
          
          try {
            unsubConfig = onSnapshot(doc(db, "app_config", "settings"), (snap) => {
              if (snap.exists()) {
                setGlobalConfig((prev: any) => ({ ...prev, ...snap.data() }));
              }
            });
          } catch (e) {
            console.error("Failed to listen to global config:", e);
          }

          // Listen for real-time updates to the user document (including coins)
          unsubUserDoc = onSnapshot(
            userDocRef,
            (doc) => {
              if (doc.exists()) {
                const data = doc.data();
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  ...data,
                });
              }
            },
            (error) =>
              handleFirestoreError(
                error,
                OperationType.GET,
                `users/${firebaseUser.uid}`,
              ),
          );

          // Listen for inventory
          const qInv = query(
            collection(db, "users", firebaseUser.uid, "inventory"),
          );
          unsubInv = onSnapshot(
            qInv,
            (snapshot) => {
              setInventory(
                snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
              );
            },
            (error) =>
              handleFirestoreError(
                error,
                OperationType.LIST,
                `users/${firebaseUser.uid}/inventory`,
              ),
          );

          // Request notification permission and save token
          const setupNotifications = async () => {
            if (Capacitor.isNativePlatform()) {
              try {
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === "prompt") {
                  permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive === "granted") {
                  await PushNotifications.register();

                  PushNotifications.addListener(
                    "registration",
                    async (token) => {
                      if (token.value) {
                        await setDoc(
                          doc(db, "users", firebaseUser.uid),
                          { fcmToken: token.value },
                          { merge: true },
                        );
                        console.log("Native Push Token saved successfully");
                      }
                    },
                  );

                  PushNotifications.addListener(
                    "registrationError",
                    (error) => {
                      console.error(
                        "Error on registration: " + JSON.stringify(error),
                      );
                    },
                  );

                  PushNotifications.addListener(
                    "pushNotificationReceived",
                    (notification) => {
                      console.log(
                        "Push received: " + JSON.stringify(notification),
                      );
                      showToast(
                        notification.title || "নতুন ডাকবার্তা",
                        "info",
                      );
                    },
                  );

                  PushNotifications.addListener(
                    "pushNotificationActionPerformed",
                    (notification) => {
                      console.log(
                        "Push action performed: " +
                          JSON.stringify(notification),
                      );
                    },
                  );
                }
              } catch (error) {
                console.error("Error setting up native notifications:", error);
              }
            } else {
              // Web FCM fallback
              try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                  try {
                    const token = await getToken(messaging);
                    if (token) {
                      await setDoc(
                        doc(db, "users", firebaseUser.uid),
                        { fcmToken: token },
                        { merge: true },
                      );
                      console.log("Web FCM Token saved successfully");
                    }
                  } catch (tokenError) {
                    console.warn(
                      "Could not get FCM token. You may need to configure VAPID keys in Firebase Console.",
                      tokenError,
                    );
                  }
                }
              } catch (error) {
                console.error(
                  "Error requesting web notification permission:",
                  error,
                );
              }
            }
          };

          setupNotifications();
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      } else {
        setUser(null);
        setInventory([]);
        setCurrentLetter(null);
        if (unsubUserDoc) unsubUserDoc();
        if (unsubInv) unsubInv();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserDoc) unsubUserDoc();
      if (unsubInv) unsubInv();
      if (appStateListener) appStateListener.remove();
      if (backButtonListener) backButtonListener.remove();
    };
  }, []);

  const updateCoins = async (amount: number) => {
    try {
      const newCoins = (user.coins || 0) + amount;
      if (newCoins < 0) return;
      
      if (amount !== 0) {
        vintageAudio.playCoins();
      }
      
      await setDoc(
        doc(db, "users", user.uid),
        { coins: newCoins },
        { merge: true },
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const updateTheme = async (theme: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { theme }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  // Push Notification Setup
  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;

    const setupPush = async () => {
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive !== "granted") {
        perm = await PushNotifications.requestPermissions();
      }

      if (perm.receive === "granted") {
        await PushNotifications.register();
      }

      PushNotifications.addListener("registration", async (token) => {
        // Save FCM token to user profile for server-side push
        try {
          await updateDoc(doc(db, "users", user.uid), {
            fcmToken: token.value,
          });
        } catch (e) {
          console.error("Failed to save FCM token", e);
        }
      });

      PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          showToast(notification.title || "নতুন ডাকবার্তা", "info");
          Haptics.notification({ type: ImpactStyle.Heavy as any }).catch(
            () => {},
          );
        },
      );
    };

    setupPush();
  }, [user]);

  // Global Listener for Database Notifications
  // This ensures that when a document is added to /notifications, 
  // we show a toast/haptic if the app is open.
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty || snapshot.metadata.hasPendingWrites) return;
      
      const latest = snapshot.docs[0].data();
      const createdAt = latest.createdAt?.toDate?.()?.getTime() || 
                        (latest.createdAt?.seconds ? latest.createdAt.seconds * 1000 : 0);
      
      // Only show if it's very recent (last 15 seconds) to avoid historical alerts on mount
      if (Date.now() - createdAt < 15000) {
        showToast(latest.title, "info");
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      }
    });

    return () => unsub();
  }, [user]);

  const updateProfile = async (data: any) => {
    if (!user) return;
    try {
      // Prevent updating postcode if it's already set
      const { postcode, ...otherData } = data;
      const finalData = user.postcode ? otherData : data;
      await setDoc(doc(db, "users", user.uid), finalData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const claimDailyBonus = async () => {
    if (!user) return;
    const now = new Date();
    const lastClaimed = user.lastBonusClaimed
      ? new Date(user.lastBonusClaimed)
      : null;

    if (
      lastClaimed &&
      now.getTime() - lastClaimed.getTime() < 24 * 60 * 60 * 1000
    ) {
      const hoursLeft =
        24 -
        Math.floor((now.getTime() - lastClaimed.getTime()) / (60 * 60 * 1000));
      showToast(
        `আপনি ইতিমধ্যে আজকের বোনাস নিয়েছেন। আবার ${hoursLeft} ঘণ্টা পর চেষ্টা করুন।`,
        "info",
      );
      return;
    }

    try {
      const bonusAmount = 20;
      await setDoc(
        doc(db, "users", user.uid),
        {
          coins: (user.coins || 0) + bonusAmount,
          lastBonusClaimed: now.toISOString(),
        },
        { merge: true },
      );
      showToast(
        `অভিনন্দন! আপনি ${bonusAmount} 🪙 বোনাস পেয়েছেন। 🎉`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const claimTwoHourBonus = async () => {
    if (!user) return;
    const now = new Date();
    const lastClaimed = user.lastTwoHourBonusClaimed
      ? new Date(user.lastTwoHourBonusClaimed)
      : null;

    if (
      lastClaimed &&
      now.getTime() - lastClaimed.getTime() < 2 * 60 * 60 * 1000
    ) {
      const minutesLeft = Math.ceil(
        (2 * 60 * 60 * 1000 - (now.getTime() - lastClaimed.getTime())) /
          (60 * 1000),
      );
      showToast(
        `আপনি ইতিমধ্যে ২ ঘণ্টার বোনাস নিয়েছেন। আবার ${minutesLeft} মিনিট পর চেষ্টা করুন।`,
        "info",
      );
      return;
    }

    try {
      const bonusAmount = 5;
      await setDoc(
        doc(db, "users", user.uid),
        {
          coins: (user.coins || 0) + bonusAmount,
          lastTwoHourBonusClaimed: now.toISOString(),
        },
        { merge: true },
      );
      showToast(
        `অভিনন্দন! আপনি ${bonusAmount} 🪙 বোনাস পেয়েছেন। 🎉`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleSendMoneyOrder = async (amount: number, postcode: string) => {
    if (!user) return;
    if (amount > 50) {
      showToast("একবারে সর্বোচ্চ ৫০ 🪙 অনুরোধ করা যাবে!", "error");
      return;
    }

    try {
      // Find receiver (try exact match then prefix)
      let q = query(
        collection(db, "users"),
        where("postcode", "==", postcode),
        limit(1),
      );
      let snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Try prefix search if exact match fails
        q = query(
          collection(db, "users"),
          where("postcode", ">=", postcode),
          where("postcode", "<=", postcode + "\uf8ff"),
          limit(1),
        );
        snapshot = await getDocs(q);
      }

      if (snapshot.empty) {
        showToast("এই পোস্টকোডে কোনো ব্যবহারকারী পাওয়া যায়নি।", "error");
        return;
      }
      const receiverData = snapshot.docs[0].data();
      const receiverUid = snapshot.docs[0].id;

      if (receiverUid === user.uid) {
        showToast("আপনি নিজের কাছে কয়েন অনুরোধ করতে পারবেন না!", "error");
        return;
      }

      // Check if friends
      let friendDoc;
      try {
        friendDoc = await getDoc(
          doc(db, "users", user.uid, "friends", receiverUid),
        );
      } catch (error) {
        handleFirestoreError(
          error,
          OperationType.GET,
          `users/${user.uid}/friends/${receiverUid}`,
        );
        return;
      }

      if (!friendDoc.exists()) {
        showToast(
          "আপনি শুধুমাত্র বন্ধুদের কাছে কয়েন অনুরোধ করতে পারবেন!",
          "error",
        );
        return;
      }

      // Check pending orders limit (max 2)
      const pendingQ = query(
        collection(db, "moneyOrders"),
        where("senderUid", "==", user.uid),
        where("status", "==", "pending"),
      );
      let pendingSnapshot;
      try {
        pendingSnapshot = await getDocs(pendingQ);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "moneyOrders");
        return;
      }

      if (pendingSnapshot.docs.length >= 2) {
        showToast("আপনি একসাথে সর্বোচ্চ ২টি অনুরোধ পাঠাতে পারবেন।", "error");
        return;
      }

      // Check 2 days cooldown for the same receiver
      const historyQ = query(
        collection(db, "moneyOrders"),
        where("senderUid", "==", user.uid),
        where("receiverUid", "==", receiverUid),
      );
      let historySnapshot;
      try {
        historySnapshot = await getDocs(historyQ);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "moneyOrders");
        return;
      }
      const twoDaysAgo = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const recentOrder = historySnapshot.docs.find(
        (doc) => doc.data().createdAt > twoDaysAgo,
      );
      if (recentOrder) {
        showToast(
          "আপনি একজন বন্ধুকে ২ দিনে একবারই অনুরোধ পাঠাতে পারবেন।",
          "error",
        );
        return;
      }

      // Create money order (request)
      await addDoc(collection(db, "moneyOrders"), {
        senderUid: user.uid,
        senderName: user.displayName,
        senderPostcode: user.postcode,
        receiverUid: receiverUid,
        receiverName: receiverData.displayName || "অজানা",
        receiverPostcode: receiverData.postcode || postcode,
        amount,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Add notification for receiver
      addNotification(
        receiverUid,
        "কয়েন অনুরোধ!",
        `${user.displayName || "আপনার বন্ধু"} আপনার কাছে ${amount} ৳ এর অনুরোধ পাঠিয়েছেন।`,
        "money_order",
      );

      showToast(`${amount} 🪙 এর জন্য অনুরোধ পাঠানো হয়েছে! 🎉`, "success");
      setScreen("home");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "moneyOrders");
    }
  };

  const handleAcceptMoneyOrder = async (order: any) => {
    if (!user) return;
    if (user.coins < order.amount) {
      showToast("আপনার পর্যাপ্ত কয়েন নেই!", "error");
      return;
    }
    try {
      // Deduct coins from current user (the friend who is giving)
      await updateCoins(-order.amount);

      // Update order status to accepted and set isClaimed to false
      await setDoc(
        doc(db, "moneyOrders", order.id),
        {
          status: "accepted",
          isClaimed: false,
        },
        { merge: true },
      );

      // Add notification for the one who requested
      addNotification(
        order.senderUid,
        "মানি অর্ডার গৃহীত!",
        `${user.displayName} আপনার ${order.amount} ৳ এর অনুরোধ গ্রহণ করেছেন।`,
        "money_order",
      );

      showToast(
        `আপনি ${order.senderName}-কে ${order.amount} 🪙 দিয়েছেন। 🎉`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "moneyOrders");
    }
  };

  const handleRejectMoneyOrder = async (order: any, reason: string) => {
    if (!user) return;
    try {
      // Update order status
      await setDoc(
        doc(db, "moneyOrders", order.id),
        { status: "rejected", rejectReason: reason },
        { merge: true },
      );

      addNotification(
        order.senderUid,
        "মানি অর্ডার বাতিল",
        `${user.displayName} আপনার ${order.amount} ৳ এর অনুরোধ বাতিল করেছেন। কারণ: ${reason}`,
        "money_order"
      );

      showToast(`অনুরোধটি বাতিল করা হয়েছে।`, "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "moneyOrders");
    }
  };

  // Auto-claim accepted money orders
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "moneyOrders"),
      where("senderUid", "==", user.uid),
      where("status", "==", "accepted"),
      where("isClaimed", "==", false),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docs.forEach(async (orderDoc) => {
          const order = orderDoc.data();
          try {
            // Add coins to current user (the requester)
            await updateCoins(order.amount);

            // Mark as claimed
            await setDoc(
              doc(db, "moneyOrders", orderDoc.id),
              { isClaimed: true },
              { merge: true },
            );

            showToast(
              `আপনার ${order.amount} 🪙 এর অনুরোধ গৃহীত হয়েছে এবং কয়েন যোগ করা হয়েছে! 🎉`,
              "success",
            );
          } catch (error) {
            console.error("Error claiming money order:", error);
          }
        });
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "moneyOrders"),
    );

    return () => unsub();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      if (Capacitor.isNativePlatform()) {
        showToast("Native Platform detected. Opening Google Login...", "info");
        console.log("Native Platform detected. Using signInWithRedirect");
        await signInWithRedirect(auth, provider);
      } else {
        showToast("Web Platform detected. Opening Popup...", "info");
        console.log("Web Platform detected. Using signInWithPopup");
        await signInWithPopup(auth, provider);
        showToast("লগইন সফল হয়েছে!", "success");
      }
    } catch (error: any) {
      console.error("Login failed detailed error:", error);
      let message = "লগইন ব্যর্থ হয়েছে।";
      
      if (error.code) {
        message += ` (Error Code: ${error.code})`;
      }
      
      if (error.message) {
        console.log("Error Message:", error.message);
      }
      
      showToast(message, "error");
    }
  };

  const handleApplyReferralCode = async (code: string) => {
    if (!user) return;
    if (user.usedReferralCode) {
      showToast("আপনি ইতিমধ্যেই একটি রেফারেল কোড ব্যবহার করেছেন।", "error");
      return;
    }
    if (code === user.referralCode) {
      showToast("আপনি নিজের কোড নিজেই ব্যবহার করতে পারবেন না!", "error");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("referralCode", "==", code.toUpperCase()),
        limit(1),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showToast("ভুল রেফারেল কোড! দয়া করে সঠিক কোডটি লিখুন।", "error");
        return;
      }

      const referrerDoc = snapshot.docs[0];
      const referrerData = referrerDoc.data();

      // Bonus for referrer: 100
      await updateDoc(referrerDoc.ref, {
        coins: increment(100),
      });

      // Bonus for referee: 20
      await updateDoc(doc(db, "users", user.uid), {
        coins: increment(20),
        usedReferralCode: true,
      });

      // Notify referrer
      addNotification(
        referrerDoc.id,
        "রেফারেল বোনাস! 🎉",
        `${user.displayName} আপনার কোড ব্যবহার করেছেন। আপনি ১০০ 🪙 বোনাস পেয়েছেন!`,
        "system",
      );

      showToast(
        "রেফারেল কোড সফলভাবে ব্যবহার করা হয়েছে! আপনি ২০ 🪙 বোনাস পেয়েছেন। 🎉",
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "users");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setScreen("splash");
  };

  useEffect(() => {
    if (user && user.email === "tanvirtamim1111@gmail.com") {
      if (user.coins < 1000 || user.postcode !== "111-1111") {
        updateDoc(doc(db, "users", user.uid), {
          coins: 5000,
          postcode: "111-1111",
        }).catch(console.error);
      }

      // Migration: Update postcode '7730' to '123-7730'
      const migratePostcode = async () => {
        try {
          const q = query(
            collection(db, "users"),
            where("postcode", "==", "7730"),
          );
          const snapshot = await getDocs(q);
          snapshot.forEach((userDoc) => {
            updateDoc(doc(db, "users", userDoc.id), {
              postcode: "123-7730",
            });
            console.log(
              `Updated user ${userDoc.id} postcode from 7730 to 123-7730`,
            );
          });
        } catch (err) {
          console.error("Migration failed:", err);
        }
      };
      migratePostcode();
    }
  }, [user]);

  const handleSendLetter = async (
    letterData: Partial<Letter>,
    address: string,
    postmanId: string,
    stampPrice: number,
    envelopeStyle: EnvelopeStyle = "classic",
    sealId?: string,
    stampId?: string,
  ) => {
    if (!user) return;

    // Extract postcode from address (supports XXX-XXXX or 4-8 digit numbers)
    const postcodeMatch = toEnglishDigits(address).match(/\d{3}-\d{4}|\d{4,8}/);
    const receiverPostcode = postcodeMatch ? postcodeMatch[0] : "000-0000";

    const postman = allPostmen.find((p) => p.id === postmanId) || allPostmen[0];

    try {
      // Find receiver UID by postcode (try exact match then prefix)
      let q = query(
        collection(db, "users"),
        where("postcode", "==", receiverPostcode),
        limit(1),
      );
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Try prefix search if exact match fails
        q = query(
          collection(db, "users"),
          where("postcode", ">=", receiverPostcode),
          where("postcode", "<=", receiverPostcode + "\uf8ff"),
          limit(1),
        );
        querySnapshot = await getDocs(q);
      }
      let receiverUid = null;
      if (!querySnapshot.empty) {
        receiverUid = querySnapshot.docs[0].id;
      }

      let baseDelayHours = 24;
      if (stampPrice >= 35) baseDelayHours = 10;
      else if (stampPrice >= 30) baseDelayHours = 15;
      else if (stampPrice >= 20) baseDelayHours = 20;
      else if (stampPrice >= 10) baseDelayHours = 24;

      const baseDelay = baseDelayHours * 60 * 60 * 1000;
      let deliveryDelay = baseDelay * postman.speed;

      const nowMs = Date.now();
      let dispatchTime = getDispatchTime(nowMs);

      // Special privilege for admin: Instant delivery
      if (user.email === "tanvirtamim1111@gmail.com") {
        deliveryDelay = 0;
        dispatchTime = nowMs; // Bypass post office hours
      }

      const letterPayload = {
        ...letterData,
        senderUid: user.uid,
        senderName: user.displayName || "অজানা প্রেরক",
        senderPostcode: user.postcode,
        receiverUid,
        receiverPostcode,
        status: "sent",
        deliveryStatus: "in-transit",
        timestamp: nowMs,
        dispatchTime,
        deliveryDelay,
        postmanId,
        fontFamily: letterData.fontFamily || "serif",
        scent: letterData.scent || null,
        envelopeStyle,
        sealId: sealId || null,
        stampId: stampId || null,
      };

      await addDoc(collection(db, "letters"), letterPayload);
      localStorage.removeItem(`letter_draft_${user.uid}`);

      // Add notification for receiver
      if (receiverUid) {
        addNotification(
          receiverUid,
          "নতুন চিঠি আসছে!",
          `কেউ একজন আপনাকে একটি চিঠি পাঠিয়েছেন। পিয়ন শীঘ্রই আপনার ঠিকানায় পৌঁছাবে।`,
          "letter",
          { postmanId }
        );
      }

      // Deduct cost but also reward 5 coins for sending a letter
      await updateCoins(-(postman.cost + stampPrice) + 5);

      // Decrement inventory
      if (stampId) {
        const stampRef = doc(db, "users", user.uid, "inventory", stampId);
        const stampDoc = await getDoc(stampRef);
        if (stampDoc.exists()) {
          const qty = stampDoc.data().quantity || 1;
          if (qty > 1) await updateDoc(stampRef, { quantity: qty - 1 });
          else await deleteDoc(stampRef);
        }
      }
      if (envelopeStyle !== "classic") {
        const envRef = doc(db, "users", user.uid, "inventory", envelopeStyle);
        const envDoc = await getDoc(envRef);
        if (envDoc.exists()) {
          const qty = envDoc.data().quantity || 1;
          if (qty > 1) await updateDoc(envRef, { quantity: qty - 1 });
          else await deleteDoc(envRef);
        }
      }
      if (sealId) {
        const sealRef = doc(db, "users", user.uid, "inventory", sealId);
        const sealDoc = await getDoc(sealRef);
        if (sealDoc.exists()) {
          const qty = sealDoc.data().quantity || 1;
          if (qty > 1) await updateDoc(sealRef, { quantity: qty - 1 });
          else await deleteDoc(sealRef);
        }
      }

      // Decrement paper
      const freePapers = ["old", "postcard", "inland"];
      if (letterData.paperType && !freePapers.includes(letterData.paperType)) {
        const paperRef = doc(db, "users", user.uid, "inventory", letterData.paperType);
        const paperDoc = await getDoc(paperRef);
        if (paperDoc.exists()) {
          const qty = paperDoc.data().quantity || 1;
          if (qty > 1) await updateDoc(paperRef, { quantity: qty - 1 });
          else await deleteDoc(paperRef);
        }
      }

      setScreen("home");
      showToast(
        "চিঠি পোস্টবক্সে ফেলা হয়েছে! পাঠানোর জন্য আপনি ৫ 🪙 বোনাস পেয়েছেন।",
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "letters");
    }
  };

  const handleBuyItem = async (item: any) => {
    if (!user) return;
    if (user.coins < item.price) {
      showToast("আপনার পর্যাপ্ত কয়েন নেই!", "error");
      return;
    }

    try {
      const inventoryRef = doc(db, "users", user.uid, "inventory", item.id);
      const inventoryDoc = await getDoc(inventoryRef);

      if (inventoryDoc.exists()) {
        await updateDoc(inventoryRef, {
          quantity: (inventoryDoc.data()?.quantity || 1) + 1,
        });
      } else {
        // Sanitize item to remove non-serializable data like React components
        const { icon, ...serializableItem } = item;
        await setDoc(inventoryRef, {
          ...serializableItem,
          quantity: 1,
          purchasedAt: serverTimestamp(),
        });
      }

      await updateCoins(-item.price);
      showToast(`${item.name} কেনা হয়েছে! 🎉`, "success");
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `users/${user.uid}/inventory`,
      );
    }
  };

  const handleSplashFinish = useCallback(() => {
    const seenOnboarding = localStorage.getItem("dakthik_onboarding_seen");
    if (!seenOnboarding) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  }, []);

  const triggerPostmanAdda = async (isBackground = false) => {
    if (!user) return;
    
    // Check time constraints (Max 10 PM, usually between 6 AM and 10 PM)
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 6) {
      if (!isBackground) {
         showToast("রাত অনেক হয়েছে, ডাকটিক বন্ধ। সব পিয়নরা এখন ঘুমাচ্ছে! কাল সকালে আবার আড্ডা হবে।", "info");
      }
      return;
    }

    try {
      // Get recent letters for context
      const lettersQuery = query(
        collection(db, "letters"),
        where("senderUid", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const lettersSnapshot = await getDocs(lettersQuery);
      const recentLetters = lettersSnapshot.docs.map(d => {
        const data = d.data();
        return `Letter to ${data.receiverPostcode} sent on ${new Date(data.timestamp).toLocaleDateString("bn-BD")}`;
      });

      const qActive = query(
        collection(db, "letters"),
        where("deliveryStatus", "in", ["in-transit", "processing-at-post-office", "with-mail-carrier", "at-veranda"])
      );
      const activeSnapshot = await getDocs(qActive);
      const busyPostmenIds = new Set(activeSnapshot.docs.map(doc => doc.data().postmanId));
      
      const allAvailablePostmen = [...(user.postmen || []), ...allPostmen].filter((v: any, i: number, a: any[]) => a.findIndex(v2 => (v2.id === v.id || v2.name === v.name)) === i);
      const idlePostmen = allAvailablePostmen.filter((p: any) => !busyPostmenIds.has(p.id));
      const names = idlePostmen.map((p: any) => p.name);

      if (names.length < 2) {
        if (!isBackground) {
          showToast("সব পিয়ন এখন চিঠিপত্র বিলি করতে বাহিরে আছে। আড্ডা জমানোর মতো কেউ নেই!", "info");
        }
        return;
      }

      if (!isBackground) {
        showToast("পিয়নরা আড্ডা শুরু করছে... ☕", "info");
      } else {
        // Send notification for system-triggered adda
        addNotification(
          user.uid,
          "পিয়নদের আড্ডা শুরু!",
          "রুম ৬০৯ এ পিয়নরা আড্ডায় মেতেছে। আপনিও যোগ দিন!",
          "adda",
          { location: "adda-room" }
        );
      }

      // Get history
      const historyQuery = query(
        collection(db, "users", user.uid, "adda_messages"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const historySnapshot = await getDocs(historyQuery);
      const history = historySnapshot.docs
        .map(d => ({ speaker: d.data().postmanName, message: d.data().message }))
        .reverse();

      const result = await generatePostmanAdda({
        villageName: user.village || "সোনারগাঁও",
        deadLettersCount: 0,
        activeLettersCount: activeSnapshot.docs.length,
        postmenNames: names.slice(0, 5),
        userName: user.displayName,
        recentLetters,
        history
      });

      // Add to Firestore with Stagger and Typing Indicator
      for (const msg of result) {
        // Dispatch typing event for the UI
        window.dispatchEvent(new CustomEvent('postman-typing', { detail: msg.speaker }));
        
        // Human-like typing delay (min 2s, max 5s)
        const typingDelay = Math.min(Math.max(msg.message.length * 40, 2000), 5000);
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        // Remove typing
        window.dispatchEvent(new CustomEvent('postman-typing', { detail: null }));

        const postman = allPostmen.find(p => p.name === msg.speaker);
        await addDoc(collection(db, "users", user.uid, "adda_messages"), {
          postmanId: postman?.id || "unknown",
          postmanName: msg.speaker,
          message: msg.message,
          timestamp: Date.now(),
          type: "dialogue"
        });
        
        // Pause before the next person speaks
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Add system message
      await addDoc(collection(db, "users", user.uid, "adda_messages"), {
        postmanName: "সিস্টেম",
        message: "পিয়নরা চা আর পানের আড্ডা জমাচ্ছে...",
        timestamp: Date.now() + 10,
        type: "system"
      });

      // Global Notification
      if (!isBackground) {
        addNotification(
          user.uid,
          "পিয়নরা আড্ডা দিচ্ছে! ☕",
          `${result[0].speaker} আর বাকিরা মিলে আপনার নাম ধরে গল্প করছে... শুনে আসুন!`,
          "system"
        );
        showToast("আড্ডা সম্পন্ন হয়েছে! আড্ডা ঘরে গিয়ে দেখুন। 📬", "success");
      }

    } catch (error) {
       console.error("Adda trigger failed", error);
       showToast("আড্ডা জমাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
    }
  };

  const handleUserAddaMessage = async (message: string) => {
    if (!user) return;
    
    // Check time constraints (Max 10 PM, usually between 6 AM and 10 PM)
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 6) {
      showToast("রাত অনেক হয়েছে! সব পিয়নরা এখন ঘুমাচ্ছে। কাল সকালে কথা হবে।", "info");
      return;
    }

    try {
      // 1. Save user message
      await addDoc(collection(db, "users", user.uid, "adda_messages"), {
        postmanName: "আপনি",
        message: message,
        timestamp: Date.now(),
        type: "user"
      });

      // Get recent letters for context
      const lettersQuery = query(
        collection(db, "letters"),
        where("senderUid", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const lettersSnapshot = await getDocs(lettersQuery);
      const recentLetters = lettersSnapshot.docs.map(d => {
        const data = d.data();
        return `Letter to ${data.receiverPostcode} sent on ${new Date(data.timestamp).toLocaleDateString("bn-BD")}`;
      });

      // 2. Trigger AI Response
      // Get busy postmen again for context
      const qActive = query(
        collection(db, "letters"),
        where("deliveryStatus", "in", ["in-transit", "processing-at-post-office", "with-mail-carrier", "at-veranda"])
      );
      const activeSnapshot = await getDocs(qActive);
      const busyPostmenIds = new Set(activeSnapshot.docs.map(doc => doc.data().postmanId));
      
      const allAvailablePostmen = [...(user.postmen || []), ...allPostmen].filter((v: any, i: number, a: any[]) => a.findIndex(v2 => (v2.id === v.id || v2.name === v.name)) === i);
      const idlePostmen = allAvailablePostmen.filter((p: any) => !busyPostmenIds.has(p.id));

      // Get history
      const historyQuery = query(
        collection(db, "users", user.uid, "adda_messages"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const historySnapshot = await getDocs(historyQuery);
      const history = historySnapshot.docs
        .map(d => ({ speaker: d.data().postmanName, message: d.data().message }))
        .reverse();

      const responses = await generatePostmanResponse(message, {
        villageName: user.village || "সোনারগাঁও",
        deadLettersCount: 0,
        activeLettersCount: activeSnapshot.docs.length,
        postmenNames: idlePostmen.map(p => p.name).slice(0, 5),
        userName: user.displayName,
        recentLetters,
        history
      });

      // 3. Save AI responses one by one with typing indicators
      for (const msg of responses) {
        // Dispatch typing event
        window.dispatchEvent(new CustomEvent('postman-typing', { detail: msg.speaker }));
        
        // Realistic typing delay (min 2s, max 6s)
        const typingDelay = Math.min(Math.max(msg.message.length * 50, 2000), 6000);
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        // Remove typing
        window.dispatchEvent(new CustomEvent('postman-typing', { detail: null }));

        const postman = allPostmen.find(p => p.name === msg.speaker);
        await addDoc(collection(db, "users", user.uid, "adda_messages"), {
          postmanId: postman?.id || "unknown",
          postmanName: msg.speaker,
          message: msg.message,
          timestamp: Date.now(),
          type: "dialogue"
        });

        // Add a slight response lag for the next peon reacting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // 20% Chance for agents to keeps talking among themselves after user speaks
      if (Math.random() > 0.8) {
         setTimeout(() => triggerPostmanAdda(true), 10000);
      }

    } catch (error) {
      console.error("User adda message failed", error);
      showToast("কথোপকথনে সমস্যা হয়েছে।", "error");
    }
  };

  useEffect(() => {
    (window as any).postmanNavigate = setScreen;
  }, []);

  // background adda trigger logic
  useEffect(() => {
    if (!user?.uid || screen === "splash") return;

    // Check every 3 minutes (180,000 ms)
    const interval = setInterval(() => {
      // 40% chance to trigger adda periodically
      if (Math.random() < 0.4) {
        triggerPostmanAdda(true);
      }
    }, 180000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <DakthikLogo className="w-20 h-20 animate-pulse relative z-10" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-primary/30 rounded-full"
          />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 animate-pulse">
            অপেক্ষা করুন...
        </p>
      </div>
    );
  }

  if (user?.isSuspended) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-red-50 p-6 z-[999]">
        <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl space-y-6 text-center border border-red-100 relative">
           <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50">
             <Ban className="w-10 h-10" />
           </div>
           
           <div>
             <h2 className="text-2xl font-black text-red-600 mb-2 font-serif tracking-tight">অ্যাকাউন্ট স্থগিত!</h2>
             <p className="text-gray-500 text-sm mb-6 leading-relaxed">আমাদের নীতিমালার কারণে আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে।</p>
             
             <div className="bg-red-50/50 p-5 rounded-2xl text-left border border-red-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
               <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> কারণ
               </p>
               <p className="text-sm font-medium text-red-900 leading-relaxed">{user?.suspensionReason || "কর্তৃপক্ষ কর্তৃক স্থগিত"}</p>
             </div>
           </div>
           
           <div className="pt-2 flex flex-col gap-3">
             <a href={`mailto:tanvirtamim1111@gmail.com?subject=Account Suspension (${user.email})`} className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
               <Mail className="w-4 h-4" /> অ্যাডমিনকে মেসেজ করুন
             </a>
             <button onClick={() => auth.signOut()} className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all">
               লগআউট করুন
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (!user && screen !== "splash") {
    return <AuthScreen onGoogleLogin={handleLogin} />;
  }

  const quickActions = [
    { id: "write", icon: PenLine, label: "চিঠি লিখুন", color: "bg-blue-600" },
    { id: "adda-room", icon: MessageCircle, label: "আড্ডা ঘর", color: "bg-orange-500" },
    { id: "money-order", icon: Coins, label: "মানি অর্ডার", color: "bg-green-600" },
    { id: "track", icon: MapPin, label: "ট্র্যাকিং", color: "bg-purple-600" },
    { id: "inbox", icon: Inbox, label: "সিন্দুক", color: "bg-red-500" },
  ];

  const renderScreen = () => {
    const handleBack = () => setScreen("home");
    const coins = user?.coins || 0;
    switch (screen) {
      case "home":
        return (
          <Dashboard
            onNavigate={setScreen}
            coins={coins}
            user={user}
            inventory={inventory}
            officeStatus={officeStatus}
            allPostmen={allPostmen}
          />
        );
      case "onboarding":
        return <OnboardingScreen onFinish={() => setScreen("home")} />;
      case "baranda":
        return <BarandaScreen onBack={handleBack} user={user} />;
      case "head-office":
        return (
          <HeadPostOfficeScreen
            onBack={handleBack}
            user={user}
            onUpdateCoins={updateCoins}
            allPostmen={allPostmen}
            onTriggerAdda={triggerPostmanAdda}
          />
        );
      case "adda-room":
        return (
          <AddaRoomScreen
            onBack={handleBack}
            user={user}
            allPostmen={allPostmen}
            onSendMessage={handleUserAddaMessage}
            onTriggerAdda={triggerPostmanAdda}
          />
        );
      case "write":
        return (
          <WriteLetter
            onBack={handleBack}
            inventory={inventory}
            user={user}
            allPostmen={allPostmen}
            globalConfig={globalConfig}
            onNext={(letter) => {
              setCurrentLetter(letter);
              setScreen("send");
            }}
          />
        );
      case "send":
        return (
          <SendProcess
            letter={currentLetter || {}}
            inventory={inventory}
            coins={coins}
            user={user}
            allPostmen={allPostmen}
            globalConfig={globalConfig}
            onBack={() => setScreen("write")}
            onComplete={(
              address,
              postmanId,
              stampPrice,
              envelopeStyle,
              sealId,
              stampId,
            ) =>
              handleSendLetter(
                currentLetter || {},
                address,
                postmanId,
                stampPrice,
                envelopeStyle,
                sealId,
                stampId,
              )
            }
          />
        );
      case "inbox":
        return (
          <InboxScreen
            onBack={handleBack}
            user={user}
            onUpdateCoins={updateCoins}
            allPostmen={allPostmen}
            allShopItems={allShopItems}
          />
        );
      case "sent-letters":
        return <SentLettersScreen onBack={handleBack} user={user} allPostmen={allPostmen} allShopItems={allShopItems} />;
      case "track":
        return <Tracking onBack={handleBack} user={user} allPostmen={allPostmen} />;
      case "postmen":
        return (
          <PostmenScreen
            onBack={handleBack}
            user={user}
            onUpdateProfile={updateProfile}
            allPostmen={allPostmen}
            initialEditingPostman={initialEditingPostman}
            clearInitialEditingPostman={() => setInitialEditingPostman(null)}
            onOpenRecord={(p) => {
              setActivePostmanRecord(p);
              setScreen("postman-record");
            }}
          />
        );
      case "postman-record": {
        const _currentPostman = [...(user?.postmen || []), ...allPostmen].find((p: any) => p.id === activePostmanRecord?.id) || activePostmanRecord;
        const safePostman = _currentPostman ? { ..._currentPostman } : null;
        if (safePostman) {
          const defaultP = POSTMEN.find(dp => dp.id === safePostman.id);
          if (defaultP) safePostman.cost = defaultP.cost;
        }
        return safePostman ? (
          <PostmanRecordScreen
            postman={safePostman}
            onBack={() => setScreen("postmen")}
            user={user}
            allPostmen={allPostmen}
            onUpdateProfile={updateProfile}
          />
        ) : null;
      }
      case "dakthik-sodoyaloy":
        return (
          <DakthikSodoyaloy
            onBack={handleBack}
            coins={coins}
            onBuy={handleBuyItem}
            user={user}
            allShopItems={allShopItems}
          />
        );
      case "sodapati":
        return <Sodapati onBack={handleBack} user={user} onNavigate={setScreen} />;
      case "stamps":
        return (
          <DakthikSodoyaloy
            onBack={handleBack}
            coins={coins}
            onBuy={handleBuyItem}
            user={user}
            allShopItems={allShopItems}
          />
        );
      case "archives":
        return (
          <DakthikSodoyaloy
            onBack={handleBack}
            coins={coins}
            onBuy={handleBuyItem}
            user={user}
            allShopItems={allShopItems}
          />
        );
      case "dead-letter":
        return <DeadLetterOffice onBack={handleBack} user={user} allPostmen={allPostmen} />;
      case "money-order":
        return (
          <MoneyOrder
            onBack={handleBack}
            coins={coins}
            user={user}
            onSend={handleSendMoneyOrder}
            onAccept={handleAcceptMoneyOrder}
            onReject={handleRejectMoneyOrder}
          />
        );
      case "friends":
        return <FriendsScreen onBack={handleBack} user={user} />;
      case "savings":
        return (
          <SavingsScreen
            onBack={handleBack}
            coins={coins}
            onClaimBonus={claimDailyBonus}
            onClaimTwoHourBonus={claimTwoHourBonus}
            user={user}
            onUpdateCoins={updateCoins}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            onBack={handleBack}
            user={user}
            onSignOut={handleSignOut}
            onNavigate={setScreen}
          />
        );
      case "referral":
        return (
          <ReferralScreen
            onBack={() => setScreen("settings")}
            user={user}
            onApplyRefCode={handleApplyReferralCode}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            onBack={handleBack}
            user={user}
            onNavigate={setScreen}
            onSignOut={handleSignOut}
            onUpdateTheme={updateTheme}
          />
        );
      case "settings-themes":
        return (
          <ThemeSettingsScreen
            onBack={() => setScreen("settings")}
            user={user}
            onUpdateTheme={updateTheme}
          />
        );
      case "settings-notifications":
        return (
          <NotificationSettingsScreen
            onBack={() => setScreen("settings")}
            user={user}
            onUpdateNotifications={(enabled) => updateProfile({ notificationsEnabled: enabled })}
          />
        );
      case "settings-sounds":
        return (
          <SoundSettingsScreen
            onBack={() => setScreen("settings")}
            user={user}
          />
        );
      case "admin":
        return <AdminPanel onBack={handleBack} user={user} />;
      case "support":
        return <SupportScreen onBack={handleBack} user={user} />;
      case "about":
        return <AboutScreen onBack={handleBack} />;
      case "notifications":
        return (
          <NotificationScreen
            onBack={handleBack}
            user={user}
            onNavigate={setScreen}
            setSelectedNotification={setSelectedNotification}
          />
        );
      case "notification-detail":
        return (
          <NotificationDetailScreen
            notification={selectedNotification}
            onBack={() => setScreen("notifications")}
            user={user}
            onNavigate={setScreen}
          />
        );
      case "privacy-policy":
        return <PrivacyPolicyScreen onBack={handleBack} />;
      case "profile-edit":
        return (
          <ProfileEditScreen onBack={() => setScreen("settings")} user={user} />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={constraintsRef} className="min-h-screen bg-background relative overflow-hidden selection:bg-primary selection:text-white">
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100000] bg-red-500 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
          >
            <WifiOff size={14} className="animate-pulse" />
            <span>কোনো ইন্টারনেট নেই! অনুগ্রহ করে আপনার মোবাইল নেট চেক করুন।</span>
          </motion.div>
        )}
        {!isOffline && showOnlineNotice && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100000] bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
          >
            <Wifi size={14} />
            <span>ইন্টারনেট ফিরে এসেছে!</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global SVG Filters for realistic paper burning effects */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="ash-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
          </filter>
        </defs>
      </svg>
      <AnimatePresence mode="wait">
        {screen === "splash" ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen"
          >
            {renderScreen()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action Floating Menu - Backdrop */}
      <AnimatePresence>
        {isQuickMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickMenuOpen(false);
              vintageAudio.playClick();
            }}
            className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-[9998]"
          />
        )}
      </AnimatePresence>

      {/* Quick Action Floating Menu - Robust Global Implementation */}
      {screen !== "splash" && screen !== "onboarding" && (
        <motion.div 
          id="quick-menu"
          drag
          dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 200, bottom: 0 }}
          dragElastic={0.05}
          dragMomentum={false}
          animate={quickMenuControls}
          onDragEnd={(event, info) => {
            const viewportWidth = window.innerWidth;
            const threshold = viewportWidth / 2;
            
            // Getting final pointer position relative to viewport
            const finalX = info.point.x;
            
            if (finalX > threshold) {
              // Snap to Right Edge (Reset to initial relative x: 0)
              quickMenuControls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
            } else {
              // Snap to Left Edge
              const snapX = -(viewportWidth - 88); 
              quickMenuControls.start({ x: snapX, transition: { type: "spring", stiffness: 400, damping: 30 } });
            }
          }}
          className="fixed bottom-28 right-6 z-[9999] touch-none"
        >
         <AnimatePresence>
           {isQuickMenuOpen && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className="flex flex-col items-end gap-4 mb-6"
             >
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ delay: (quickActions.length - idx) * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                    onClick={() => {
                      setScreen(action.id as Screen);
                      setIsQuickMenuOpen(false);
                      vintageAudio.playClick();
                    }}
                    className={`${action.color} text-white flex items-center gap-3 pr-6 pl-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform group pointer-events-auto`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest pointer-events-none">{action.label}</span>
                    <action.icon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </motion.button>
                ))}
             </motion.div>
           )}
         </AnimatePresence>

         <motion.button
           onClick={() => {
             setIsQuickMenuOpen(!isQuickMenuOpen);
             vintageAudio.playStamp();
           }}
           animate={{ rotate: isQuickMenuOpen ? 135 : 0 }}
           whileDrag={{ scale: 1.1, cursor: "grabbing" }}
           className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-colors border-4 border-white/20 relative ${isQuickMenuOpen ? "bg-red-900" : "bg-primary"}`}
         >
           <Plus className={`w-8 h-8 text-white transition-all ${isQuickMenuOpen ? "rotate-0" : ""}`} />
           
           {!isQuickMenuOpen && (
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 rounded-full bg-primary -z-10"
             />
           )}

           <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full scale-90" />
         </motion.button>
      </motion.div>
      )}

            {/* Bottom Navigation - 90s Retro Style */}
            {screen !== "write" && screen !== "splash" && screen !== "onboarding" && (
              <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pt-2 pb-6 bg-surface/95 backdrop-blur-xl rounded-t-[1.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-primary/10">
                <div className="absolute top-0 left-0 w-full h-0.5 postal-stripes opacity-10 rounded-t-[1.5rem]" />
                {[
                  { id: "home", icon: Home, label: "হোম" },
                  { id: "write", icon: PenLine, label: "লিখুন" },
                  { id: "inbox", icon: Inbox, label: "সিন্দুক" },
                  { id: "friends", icon: Users, label: "বন্ধু" },
                  { id: "postmen", icon: UserIcon, label: "ডাকপিয়ন" },
                  {
                    id: "dakthik-sodoyaloy",
                    icon: ShoppingBag,
                    label: "সওদালয়",
                  },
                  { id: "settings", icon: Settings, label: "সেটিং" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setScreen(item.id as Screen)}
                    className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 relative p-1.5 rounded-xl ${
                      screen === item.id
                        ? "text-primary bg-primary/5"
                        : "text-gray-400 hover:text-primary/60 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon
                      className={`relative z-10 ${screen === item.id ? "w-5 h-5" : "w-4.5 h-4.5 opacity-80"}`}
                    />
                    <span
                      className={`relative z-10 font-bold text-[8px] uppercase tracking-tighter mt-1 ${screen === item.id ? "block" : "hidden lg:block text-gray-300"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>
            )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xs"
          >
            <div
              className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
                toast.type === "error"
                  ? "bg-red-50 border-red-100 text-red-800"
                  : toast.type === "success"
                    ? "bg-green-50 border-green-100 text-green-800"
                    : "bg-blue-50 border-blue-100 text-blue-800"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle className="w-5 h-5" />
              ) : toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
              <p className="text-xs font-bold font-serif">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
