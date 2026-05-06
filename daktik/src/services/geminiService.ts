import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiClient) {
    // এখানে আপনার Gemini API Key বসান। 
    // AI Studio থেকে কোড ডাউনলোড করার সময় key থাকে না, তাই এই Error টি আসে।
    // @ts-ignore
    const myGeminiApiKey = (import.meta.env?.VITE_GEMINI_API_KEY) || (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : "") || "এখানে_আপনার_GEMINI_API_KEY_দিন";
    
    if (myGeminiApiKey === "এখানে_আপনার_GEMINI_API_KEY_দিন") {
      console.warn("GEMINI_API_KEY is missing! AI Adda features will not work.");
    }
    
    aiClient = new GoogleGenAI({ apiKey: myGeminiApiKey });
  }
  return aiClient;
};

export interface PostmanDialogue {
  speaker: string;
  message: string;
}

export interface AddaContext {
  deadLettersCount: number;
  activeLettersCount: number;
  villageName: string;
  postmenNames: string[];
  userName?: string;
  recentLetters?: string[]; // Brief descriptions like "Letter to Jorina"
  history?: PostmanDialogue[]; // Recent conversation history
}

export const generatePostmanAdda = async (context: AddaContext): Promise<PostmanDialogue[]> => {
  try {
    const postmenStr = context.postmenNames.join(", ");
    const lettersContext = context.recentLetters && context.recentLetters.length > 0 
      ? `Recent activity by ${context.userName || "the user"}: ${context.recentLetters.join(", ")}`
      : "";
    const historyStr = context.history 
      ? context.history.map(h => `${h.speaker}: ${h.message}`).join("\n")
      : "No previous messages.";

    const response = await getAi().models.generateContent({
      model: "gemini-flash-latest",
      contents: `You are generating a witty conversation between postmen at a rural Bangladeshi dakghor (post office). 
      
      Participating Postmen: ${postmenStr}
      The User: ${context.userName || "User"}

      Recent conversation history:
      ${historyStr}

      Current Context:
      - Village: ${context.villageName}
      - Dead Letters: ${context.deadLettersCount}
      - Active letters in transit: ${context.activeLettersCount}
      ${lettersContext}

      Rules:
      - The conversation MUST be in any regional Bangladeshi dialect mixed with standard Bengali.
      - Use at least 2 or 3 of the names provided.
      - Act like a real rural tea stall. Discuss village gossip, rumors, ghost stories, politics, or local events.
      - Sometimes mention the user or their letters playfully, but DO NOT make it the only topic. Keep a natural variety.
      - Do NOT overdo asking for tea. Follow the history naturally.
      - Length: 5-8 lines.
      - Character Rule: "তরুণ রফিক" is the youngest. He MUST call others "চাচা" (Chacha) or "আঙ্কেল" (Uncle).
      - Return JSON array of objects with 'speaker' and 'message'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING },
              message: { type: Type.STRING },
            },
            required: ["speaker", "message"],
          },
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.warn("Failed to connect to AI. Using fallback conversation data.");
    return [
      { speaker: "করিম চাচা", message: "রফিক, ওই বোরহান মিয়ার খবর কী ক দেখি? তার নাতনী তো চিঠি পায় না শুনি।" },
      { speaker: "তরুণ রফিক", message: "চাচা, বোরহান মিয়া এখন অনলাইনে খবর টবর পায় বোধহয়, ডাকঘরের কথা ভুইলাই গেছে!" }
    ];
  }
};

export const generatePostmanResponse = async (userMessage: string, context: AddaContext): Promise<PostmanDialogue[]> => {
  try {
    const postmenStr = context.postmenNames.join(", ");
    const lettersContext = context.recentLetters && context.recentLetters.length > 0 
      ? `Recent activity by ${context.userName || "the user"}: ${context.recentLetters.join(", ")}`
      : "";
    const historyStr = context.history 
      ? context.history.map(h => `${h.speaker}: ${h.message}`).join("\n")
      : "No previous messages.";
    
    const response = await getAi().models.generateContent({
      model: "gemini-flash-latest",
      contents: `You are simulating rural Bangladeshi postmen responding to a user at their 'Adda'.
      
      User Message: "${userMessage}"
      User's Name: ${context.userName || "User"}
      Available Postmen: ${postmenStr}
      ${lettersContext}

      Conversation History:
      ${historyStr}
      
      Rules:
      - Return 1 to 3 messages as a JSON array. More than one postman should often react to the user.
      - Respond in regional dialect.
      - PRIORITY: Directly answer or address the user's message first. If they say "hello" or ask a question, answer it naturally like a real person in a tea stall.
      - Do NOT constantly bring up the user's letters unless it fits the flow naturally. Balance the conversation.
      - Playfully mock or gossip, but mix it with village issues, the weather, their own tiredness, or asking for tea.
      - Be witty, natural, and consistent with the conversation history. 
      - Stay in character. Rafiq respects elders (calls them Chacha/Uncle).
      - JSON array: [{ "speaker": "Name", "message": "Text" }, ...]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING },
              message: { type: Type.STRING },
            },
            required: ["speaker", "message"],
          },
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.warn("Failed to connect to AI. Using fallback response data.");
    return [{ speaker: "করিম চাচা", message: "কী বললা বাবা? চা খেয়ে মাথাটা একটু ঝিমঝিম করতেছে..." }];
  }
};

export interface PeonExcuseContext {
  postmanName: string;
  cost: number;
  location: string;
  weather?: string;
}

export const generatePeonExcuse = async (context: PeonExcuseContext): Promise<string> => {
  try {
    // Logic distribution:
    // 5 coins: 40% chance of delay (personal reasons)
    // 15 coins: 15% chance of delay (environmental reasons)
    // 30 coins: <5% chance (official/administrative reasons)
    
    let scenario = "";
    if (context.cost <= 5) {
      scenario = "গল্পগুজব, পানের দোকানে আড্ডা, অলসতা বা ছোটখাটো ব্যক্তিগত সমস্যার অজুহাত।";
    } else if (context.cost <= 15) {
      scenario = "পরিবেশগত সমস্যা যেমন বৃষ্টি, কাদা, সাইকেলের চাকা পাংচার, বা চেইন পড়ার ঝামেলা।";
    } else {
      scenario = "বড় বাবুর (পোস্টমাস্টার) বিশেষ নির্দেশ, প্রশাসনিক কাজ বা সরকারি জরুরি কোনো ঝামেলার অজুহাত।";
    }

    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `তুমি এখন "ডাকটিক" (Daktik) অ্যাপের মূল ইঞ্জিন এবং নস্টালজিক কিউরেটর। 
      তোমার দায়িত্ব হলো পিয়নের ডেলিভারিতে দেরি হওয়ার একটি নস্টালজিক অজুহাত মেসেজ তৈরি করা।

      পিয়নের নাম: ${context.postmanName}
      পিয়নের চার্জ: ${context.cost} কয়েন
      অবস্থান: ${context.location}
      ভিত্তি (Scenario): ${scenario}

      নির্দেশিকা:
      ১. ভাষা ও টোন: ৯০ দশকের গ্রাম্য পোস্টমাস্টারের মতো কথা বলবে।
      ২. শব্দ চয়ন: নস্টালজিক শব্দ ব্যবহার করবে (যেমন: হারিকেন, পানের দোকান, কাঁচা রাস্তা, টিনের চাল, লণ্ঠন, তালপাখা)।
      ৩. নিষিদ্ধ: কোনো আধুনিক বা টেকনিক্যাল শব্দ (Server, Delay, Loading, App) ব্যবহার করা যাবে না।
      ৪. দৈর্ঘ্য: ১-২ বাক্য।
      ৫. সরাসরি মেসেজটি রিটার্ন করবে, অন্য কোনো ভূমিকা ছাড়াই।`,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Excuse Error:", error);
    return "রাস্তায় একটু ঝামেলা হয়েছে বাবা, আসছি দাঁড়াও।";
  }
};

export interface NoticeContext {
  date: string;
  userName: string;
  stats: {
    activeLetters: number;
    missedLetters: number;
    coins: number;
  };
}

export const generateDailyNotice = async (context: NoticeContext): Promise<{ memoNo: string; title: string; body: string }> => {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `তুমি এখন ৯০-এর দশকের বাংলাদেশের একটি গ্রামীণ প্রধান ডাকঘরের "বড় বাবু" (Head Postmaster)।
      তদানীন্তন সময়ে ডাকঘরের নোটিশ বোর্ডে টাঙানোর জন্য একজন নির্দিষ্ট গ্রাহক (নাম: ${context.userName}) এর জন্য একটি অফিসিয়াল স্মারক বা বিজ্ঞপ্তি তৈরি করো। 
      
      গ্রাহকের বর্তমান অবস্থা:
      - বর্তমানে পথে থাকা চিঠি: ${context.stats.activeLetters} টি
      - হেড অফিসে আটকা/মিস হওয়া চিঠি: ${context.stats.missedLetters} টি
      - পকেটে থাকা কয়েন: ${context.stats.coins} টি
      
      নির্দেশিকা:
      ১. মোটিভ: যদি গ্রাহকের অনেক চিঠি হেড অফিসে আটকা থাকে, তবে তাকে তাড়াতাড়ি সংগ্রহ করার তাগাদা দাও। যদি অনেক চিঠি পথে থাকে, তবে ধৈর্য ধরার পরামর্শ দাও। যদি খুব বেশি টাকা থাকে, তবে ডাক সঞ্চয় প্রকল্পে জমানোর বুদ্ধি দাও। 
      ২. ভাষা: অতি শুদ্ধ ও গম্ভীর প্রাঞ্জল বাংলা (বড় বাবু মার্কা কথা)। কোনো ভাবেই আধুনিক শব্দ ব্যবহার করা যাবে না। 
      ৩. ফরমেট: একটি স্মারক নম্বর (Memo No), একটি ছোট শিরোনাম (Title) এবং একটি বিবরণ (Body)। 
      ৪. বিবরণটি ১-২ বাক্যের মধ্যে হতে হবে যাতে তা সংক্ষিপ্ত ও প্রভাবশালী হয়।
      ৫. Return JSON: { "memoNo": "...", "title": "...", "body": "..." }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            memoNo: { type: Type.STRING },
            title: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ["memoNo", "title", "body"],
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Notice Error:", error);
    return {
      memoNo: "১০২/ডাক/৯৬",
      title: "বিশেষ সতর্কবার্তা",
      body: "হেড অফিসে চিঠিপত্রের ভিড় বাড়িতেছে। আপনার প্রয়োজনীয় পত্রাদি সময়মতো সংগ্রহ করিবার জন্য অনুরোধ করা হইল।"
    };
  }
};
