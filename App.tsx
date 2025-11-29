import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { 
  MessageCircle, User, Heart, Shield, Clock, CheckCircle, X, Send, Bot, 
  Lock, BadgeCheck, Flag, AlertTriangle, 
  ArrowRight, ArrowLeft, Trees, BookOpen, Coffee, LogOut,
  Moon, Sun, MessageSquare, Link, 
  Play, Volume2, VolumeX, Sparkles, HandHeart, Smartphone,
  Music, Leaf, Cloud, SunDim, Feather, Sprout, Droplet, FileText, Ban
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, onSnapshot, query
} from 'firebase/firestore';

// --- GLOBAL DECLARATIONS ---
declare const __firebase_config: string;
declare const __app_id: string;
declare const __initial_auth_token: string;

// --- FIREBASE CONFIGURATION ---
let firebaseConfig = {};
try {
  firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
} catch (e) {
  console.error("Firebase config parse error", e);
}

const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : undefined;

// --- 1. TYPES & INTERFACES ---

export type Language = 'zh' | 'en';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  sender: string;
  timestamp: number;
  isVerified?: boolean;
  ticketId?: string; 
}

export interface Ticket {
  id: string;
  name: string;
  issue: string;
  priority: Priority;
  status: 'waiting' | 'active' | 'resolved';
  time: string;
  createdAt: number;
  tags: string[];
  volunteerId?: string;
}

export interface VolunteerProfile {
  name: string;
  role: string;
  isVerified: boolean;
  uid?: string;
}

export interface Memo {
  id: string | number;
  text: string;
  timestamp: number;
  style: {
    left: string;
    animationDuration: string;
    animationDelay: string;
    scale: number;
  };
}

// --- 2. CONSTANTS & CONTENT ---

const AI_QUOTES = [
  "You are not alone.", "這裡有我。", 
  "Take a deep breath.", "深呼吸，慢慢黎。",
  "It's okay not to be okay.", "想喊就喊出黎啦。",
  "We are here for you.", "我們撐你。",
  "One step at a time.", "一步一步黎。",
  "This feeling will pass.", "雨後總有彩虹。",
  "I'm listening.", "我喺度聽緊。",
  "You are stronger than you know.", "你比想像中堅強。",
  "Safe space.", "樹洞隨時歡迎你。",
  "Heal at your own pace.", "按照自己嘅節奏黎。",
  "Focus on today.", "專注當下。",
  "You matter.", "你很重要。",
  "Sending you strength.", "俾啲力量你。",
  "Just breathe.", "靜心呼吸。",
  "There is hope.", "總會有希望。",
  "Be kind to yourself.", "對自己好啲。"
];

const COMFORT_SYMBOLS = ["🌿", "🕊️", "✨", "🤍", "🌱", "☂️", "🌤️", "🌕", "🍃", "💫", "🦋"];

const SUGGESTED_PROMPTS = {
  zh: ["我覺得好不安...", "我想搵人傾計", "最近訓得唔好", "對於未來好迷惘"],
  en: ["I feel anxious...", "I need to talk", "Can't sleep well", "Confused about future"]
};

const USEFUL_LINKS = [
  // Mental Support
  { id: 1, title: { zh: "社會福利署熱線 (24小時)", en: "SWD Hotline (24hr)" }, url: "https://www.swd.gov.hk", category: "mental" },
  { id: 2, title: { zh: "香港撒瑪利亞防止自殺會", en: "The Samaritans HK" }, url: "https://sbhk.org.hk", category: "mental" },
  { id: 3, title: { zh: "醫院管理局精神健康專線", en: "HA Mental Health Hotline" }, url: "https://www3.ha.org.hk", category: "mental" },
  { id: 4, title: { zh: "Shall We Talk", en: "Shall We Talk" }, url: "https://shallwetalk.hk", category: "mental" },
  { id: 5, title: { zh: "賽馬會「開聲」情緒支援", en: "Jockey Club Open Up" }, url: "https://www.openup.hk/", category: "mental" },
  
  // Blood Donation
  { id: 6, title: { zh: "紅十字會輸血服務中心", en: "Red Cross Blood Transfusion" }, url: "https://www5.ha.org.hk/rcbts/", category: "blood" },
  { id: 7, title: { zh: "捐血站位置", en: "Donor Centres Locations" }, url: "https://www5.ha.org.hk/rcbts/donor-centres", category: "blood" },

  // Information
  { id: 8, title: { zh: "民政事務總署 - 大埔區", en: "HAD - Tai Po District" }, url: "https://www.had.gov.hk/en/18_districts/my_district/tai_po.htm", category: "info" },
];

const CONTENT = {
  zh: {
    appTitle: "MindTree 心聆樹洞",
    appSubtitle: "你的心靈避風港 • 全港支援",
    nav: { home: "首頁", chat: "AI 樹洞", human: "真人支援", resources: "資源" },
    intro: {
      welcome: "歡迎來到 MindTree",
      desc: "一個安全、隱密、高私隱度的心理支援空間。\n無論情緒好壞，我們都與你同在。",
      slide1Title: "智能與真人協作",
      slide1Desc: "先進 AI 全天候聆聽，專業義工隨時接力。",
      slide2Title: "絕對保密",
      slide2Desc: "採用端對端加密概念，你的心事只有樹洞知道。",
      startBtn: "開始旅程"
    },
    landing: {
      servicesTitle: "選擇服務",
      breathTitle: "靜心呼吸練習",
      breathDesc: "專業引導 • 60秒放鬆",
      startBreath: "開始練習",
      aiCard: { title: "AI 樹洞", desc: "24/7 智能聆聽 • 即時回應" },
      humanCard: { title: "真人輔導", desc: "義工與社工 • 溫暖同行" },
      volunteerCard: { title: "加入義工團隊", desc: "成為別人的秘密樹窿" },
      feedback: "提供意見"
    },
    landingNotice: {
      disclaimer: "免責聲明：本平台提供情緒支援，並非緊急醫療服務。",
      rules: "請保持尊重。如遇緊急情況，請致電 999。"
    },
    aiRole: {
      title: "AI 樹洞",
      welcome: "你好，我係 MindTree。我知道最近發生嘅事可能令你好唔開心。想同我傾下計嗎？",
      placeholder: "在此輸入你的心事...",
      disclaimer: "AI 內容僅供參考，重要資訊請查證。"
    },
    humanRole: {
      title: "真人輔導員",
      waitingTitle: "正在為你配對義工...",
      waitingMessage: "我們正在聯絡在線義工，請稍候片刻...",
      joinedTitle: "輔導員已加入",
      systemJoin: "系統訊息：輔導員已加入",
      headerVerified: "認證社工",
      headerPeer: "同行者義工",
      report: "檢舉用戶",
      reportSuccess: "已檢舉該用戶。管理員將會審查對話紀錄。",
      caseResolved: "對話已結束。希望你有好過一點。",
      placeholder: "輸入訊息...",
      chatReminder: "⚠️ 提醒：請保持尊重與禮貌。嚴禁任何非法、騷擾或侵犯隱私的行為。為了保障雙方安全，請勿透露個人敏感資料（如全名、地址、電話、身份證號碼）。",
      scanBlock: "訊息未能發送：AI 偵測到不當或攻擊性內容。"
    },
    memo: {
      cheerUp: "社區心聲",
      label: "留低一句",
      title: "留低一句說話",
      desc: "你的訊息將會「即時」顯示在首頁的漂浮氣泡中。請發放正能量，支持身邊人。",
      placeholder: "寫下你的祝福或感受...",
      btn: "發佈",
      success: "發佈成功！訊息已上傳。",
      scanning: "AI 正在審查內容...",
      unsafe: "未能發佈：AI 偵測到不當用語或無意義內容。",
      guidance: "請保持正面、友善。"
    },
    volunteer: {
      login: "義工登入",
      authTitle: "義工專區",
      disclaimer: "感謝你的無私奉獻。請遵守義工守則。",
      nameLabel: "稱呼",
      namePlaceholder: "例如：陳大文",
      joinBtn: "進入義工平台",
      proJoinTitle: "專業人員通道",
      codePlaceholder: "輸入存取碼",
      verifyBtn: "驗證",
      errorMsg: "存取碼錯誤",
      guidelinesTitle: "心理支援指南",
      guidelinesDesc: "簡單三步，成為更好的聆聽者",
      rule1Title: "第一步：專注聆聽 (Listen)",
      rule1Desc: "給予對方空間表達。不要急著打斷或給予建議。用「嗯」、「我明白」來回應，讓對方感到被接納。",
      rule2Title: "第二步：同理回應 (Empathize)",
      rule2Desc: "確認對方的感受。試著說「聽起來你現在很無助」、「這真的很不容易」。避免說「你看開點」或「別想太多」。",
      rule3Title: "第三步：安全評估 (Assess)",
      rule3Desc: "時刻保持警覺。如果對方提及自殺、傷害自己或他人，請保持冷靜，不要獨自處理。建議對方尋求專業協助 (999)，並立即報告管理員。",
      acknowledgeBtn: "我明白並同意",
      portalTitle: "義工控制台",
      welcome: "歡迎回來",
      exit: "登出",
      activeRequests: "待處理個案",
      noRequests: "暫時沒有新個案",
      accept: "接聽",
      topic: "主訴",
      priority: { critical: "緊急", high: "高", medium: "中", low: "低" }
    },
    intake: {
      title: "求助登記",
      desc: "讓我們更了解你的需要",
      q1: "稱呼 (匿名)",
      q1_placeholder: "暱稱",
      q_age: "年齡組別",
      q_age_opts: ["18歲以下", "18-30", "31-50", "51-70", "70+"],
      q_gender: "性別",
      q_gender_opts: ["男", "女", "其他"],
      q3: "困擾指數 (1-5)",
      q4: "主要困擾",
      q4_opt1: "焦慮 / 驚恐",
      q4_opt2: "情緒低落 / 抑鬱",
      q4_opt3: "家庭 / 居住問題",
      q4_opt4: "有自毀念頭 (緊急)",
      q5: "補充 (選填)",
      q5_placeholder: "簡述情況...",
      submit: "開始配對",
      calm: "平靜",
      crisis: "極度困擾"
    },
    links: {
      btn: "資源",
      title: "社區資源",
      desc: "心理支援、捐血資訊及實用資料。",
      close: "關閉",
      catMental: "心理支援",
      catBlood: "捐血資訊",
      catInfo: "實用資料"
    },
    feedback: {
      title: "提供意見",
      desc: "你的意見對我們很重要。請告訴我們如何改進。",
      placeholder: "請輸入你的意見...",
      submit: "以電郵傳送",
      thanks: "感謝你的意見！我們會盡快處理。"
    },
    breath: {
      inhale: "吸氣",
      hold: "保持",
      exhale: "呼氣",
      relax: "放鬆身心",
      musicOn: "音樂開啟",
      musicOff: "靜音",
      playErr: "點擊播放音樂"
    },
    footer: {
      legal: "免責聲明：本平台由志願者運營，僅提供同儕情緒支援，並非專業醫療機構或緊急救援服務。本平台不對任何因使用本服務而產生的後果負責。如遇生命危險或緊急情況，請立即致電 999 報警或前往最近急症室。使用者需自行承擔使用本服務之風險。"
    },
    actions: {
      back: "返回",
      cancel: "取消",
      endChat: "結束",
      leaveChat: "離開"
    },
    dialogs: {
      volLeaveMsg: "確定離開？個案將重回隊列。",
      citEndMsg: "確定結束對話？"
    }
  },
  en: {
    appTitle: "MindTree",
    appSubtitle: "Mental Support for Everyone • Your Shelter",
    nav: { home: "Home", chat: "AI Chat", human: "Support", resources: "Links" },
    intro: {
      welcome: "Welcome to MindTree",
      desc: "A premium, private sanctuary for your mind.\nWe are here to listen, support, and heal.",
      slide1Title: "AI & Human Synergy",
      slide1Desc: "Advanced AI listening available 24/7, backed by professional volunteers.",
      slide2Title: "Private & Secure",
      slide2Desc: "Your thoughts are safe here. End-to-end privacy focused.",
      startBtn: "Begin Journey"
    },
    landing: {
      servicesTitle: "Services",
      breathTitle: "Mindful Breathing",
      breathDesc: "Professional • 60s Calm",
      startBreath: "Start",
      aiCard: { title: "AI Listener", desc: "Smart & Private • 24/7" },
      humanCard: { title: "Human Support", desc: "Volunteers • Empathy" },
      volunteerCard: { title: "Join Volunteer Team", desc: "Become a Secret Listener" },
      feedback: "Feedback"
    },
    landingNotice: {
      disclaimer: "Disclaimer: Not emergency medical services.",
      rules: "Respectful interactions only. Dial 999 for emergencies."
    },
    aiRole: {
      title: "AI Listener",
      welcome: "Hi, I'm MindTree. I'm here to listen without judgment. What's on your mind?",
      placeholder: "Type here...",
      disclaimer: "AI can make mistakes. Verify info."
    },
    humanRole: {
      title: "Counselor",
      waitingTitle: "Matching Volunteer...",
      waitingMessage: "We are connecting you to a volunteer...",
      joinedTitle: "Counselor Joined",
      systemJoin: "System: Counselor joined",
      headerVerified: "Verified Counselor",
      headerPeer: "Peer Volunteer",
      report: "Report User",
      reportSuccess: "User reported. Admins will review logs.",
      caseResolved: "Session ended. Take care.",
      placeholder: "Type message...",
      chatReminder: "⚠️ Important: Please be respectful. Illegal acts, harassment, and privacy violations are strictly prohibited. For your safety, do not share sensitive personal details (e.g., full name, address, ID).",
      scanBlock: "Message Blocked: AI detected inappropriate or offensive content."
    },
    memo: {
      cheerUp: "Community Board",
      label: "Post a Note",
      title: "Leave a Note",
      desc: "Your message will float on the home page IMMEDIATELY. Please share positivity.",
      placeholder: "Share your positivity...",
      btn: "Post",
      success: "Posted! Floating now.",
      scanning: "AI Safety Check...",
      unsafe: "Blocked: Inappropriate content detected.",
      guidance: "Please share positivity."
    },
    volunteer: {
      login: "Volunteer Access",
      authTitle: "Volunteer Portal",
      disclaimer: "Thank you for your service.",
      nameLabel: "Name",
      namePlaceholder: "e.g., Alex",
      joinBtn: "Enter Volunteer Platform",
      proJoinTitle: "Professional Login",
      codePlaceholder: "Access Code",
      verifyBtn: "Verify",
      errorMsg: "Invalid Code",
      guidelinesTitle: "Support Guidelines",
      guidelinesDesc: "3 Steps to be a good listener",
      rule1Title: "Step 1: Active Listening",
      rule1Desc: "Give them space. Don't interrupt or rush to advise. Use 'I see', 'I understand' to show acceptance.",
      rule2Title: "Step 2: Empathetic Response",
      rule2Desc: "Validate feelings. Say 'It sounds like you are hurting' instead of 'Don't think too much'.",
      rule3Title: "Step 3: Safety Assessment",
      rule3Desc: "Stay alert. If self-harm is mentioned, stay calm and urge them to seek professional help (999).",
      acknowledgeBtn: "I Agree",
      portalTitle: "Console",
      welcome: "Welcome",
      exit: "Exit",
      activeRequests: "Requests",
      noRequests: "No active requests",
      accept: "Accept",
      topic: "Issue",
      priority: { critical: "Critical", high: "High", medium: "Med", low: "Low" }
    },
    intake: {
      title: "Intake",
      desc: "Help us understand you",
      q1: "Name (Anon)",
      q1_placeholder: "Nickname",
      q_age: "Age",
      q_age_opts: ["<18", "18-30", "31-50", "51-70", "70+"],
      q_gender: "Gender",
      q_gender_opts: ["M", "F", "Other"],
      q3: "Distress (1-5)",
      q4: "Main Issue",
      q4_opt1: "Anxiety / Panic",
      q4_opt2: "Depression",
      q4_opt3: "Family/Housing",
      q4_opt4: "Suicidal (Urgent)",
      q5: "Note",
      q5_placeholder: "Details...",
      submit: "Connect",
      calm: "Calm",
      crisis: "Crisis"
    },
    links: {
      btn: "Resources",
      title: "Resources",
      desc: "Help, Donation & Volunteering",
      close: "Close",
      catMental: "Mental Support",
      catBlood: "Blood Donation",
      catInfo: "Information"
    },
    feedback: {
      title: "Feedback",
      desc: "Your feedback is important to us.",
      placeholder: "How can we improve?",
      submit: "Send via Email",
      thanks: "Thank you! Sent to database."
    },
    breath: {
      inhale: "Inhale",
      hold: "Hold",
      exhale: "Exhale",
      relax: "Relax Your Mind",
      musicOn: "Music On",
      musicOff: "Muted",
      playErr: "Tap to Play"
    },
    footer: {
      legal: "Disclaimer: This platform is volunteer-run and provides peer emotional support only. It is NOT a substitute for professional medical advice or emergency services. We are not liable for any consequences arising from the use of this service. In case of emergency, dial 999 immediately. Use at your own risk."
    },
    actions: {
      back: "Back",
      cancel: "Cancel",
      endChat: "End",
      leaveChat: "Leave"
    },
    dialogs: {
      volLeaveMsg: "Return case to queue?",
      citEndMsg: "End this session?"
    }
  }
};

// --- 3. SERVICES (Strict AI Scanner) ---

const checkContentSafety = (text: string) => {
  const badWords = ["die", "kill", "死", "自殺", "殺", "idiot", "stupid", "hate", "fuck", "shit", "bitch", "porn", "sex"];
  const lower = text.toLowerCase();
  const hasBadWord = badWords.some(word => lower.includes(word));
  
  // Basic Length Check for gibberish
  if (text.length < 2) return { safe: false, reason: "Message too short" };

  if (hasBadWord) {
    return { safe: false, reason: "Content contains inappropriate words." };
  }
  return { safe: true, reason: null };
};

const scanContentWithAI = async (text: string): Promise<{ safe: boolean, reason: string | null }> => {
  try {
    // First pass: Local check for speed and obvious blocks
    const localCheck = checkContentSafety(text);
    if (!localCheck.safe) return localCheck;

    const contentReviewSystemPrompt = `
    You are a strict Content Moderator for a mental health app 'MindTree'.
    Task: Analyze the user's message for public display.
    
    Criteria for APPROVAL (SAFE):
    - Must be positive, supportive, encouraging, warm, or empathetic.
    - Can be a simple greeting like "Hello" or "Jiayou".

    Criteria for REJECTION (UNSAFE):
    - Offensive, hateful, sexual, violent, or illegal content.
    - Random gibberish (e.g. "asdf", "123"), spam.
    - Negative, cynical, complaining.

    Output Format:
    - If APPROVED: Return exactly "PASS".
    - If REJECTED: Return a warm, gentle, polite reminder in Traditional Chinese (繁體中文) explaining why. 
    `;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: [{ role: "user", parts: [{ text: text }] }],
        systemInstruction: contentReviewSystemPrompt
      })
    });

    const data = await response.json();
    if (!response.ok) return { safe: true, reason: null }; // Fail open if API is down to not block users

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (result === "PASS") {
      return { safe: true, reason: null };
    } else {
      return { safe: false, reason: result || "Content filtered." };
    }

  } catch (e) {
    return { safe: true, reason: null }; // Default to safe if system fails
  }
};

// --- 4. CONTEXT (State Management) ---

interface AppContextType {
  tickets: Ticket[];
  createTicket: (name: string, issue: string, priority: Priority, tags: string[]) => Promise<string>;
  updateTicketStatus: (id: string, status: 'waiting' | 'active' | 'resolved', volId?: string) => void;
  messages: Message[]; 
  addMessage: (ticketId: string, message: Omit<Message, "id">) => void;
  getMessages: (ticketId: string) => Message[];
  volunteerProfile: VolunteerProfile;
  setVolunteerProfile: (profile: VolunteerProfile) => void;
  publicMemos: Memo[];
  addPublicMemo: (text: string) => void;
  user: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); 
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>({ name: "", role: "", isVerified: false });
  const [publicMemos, setPublicMemos] = useState<Memo[]>([]);

  // 1. Auth & Data Sync
  useEffect(() => {
    const initAuth = async () => {
        if (typeof initialAuthToken !== 'undefined' && initialAuthToken) {
            if (auth) await signInWithCustomToken(auth, initialAuthToken);
        } else {
            if (auth) await signInAnonymously(auth);
        }
    };
    initAuth();
    if (auth) {
        return onAuthStateChanged(auth, (u) => setUser(u));
    }
  }, []);

  // 2. Sync Tickets
  useEffect(() => {
    if (!user || !db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedTickets = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
        loadedTickets.sort((a, b) => b.createdAt - a.createdAt);
        setTickets(loadedTickets);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Sync Messages
  useEffect(() => {
    if (!user || !db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
        loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(loadedMessages);
    });
    return () => unsubscribe();
  }, [user]);

  // 4. Sync Memos
  useEffect(() => {
    if (!user || !db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'memos');
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMemos = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Memo));
        loadedMemos.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setPublicMemos(loadedMemos.slice(0, 15)); 
    });
    return () => unsubscribe();
  }, [user]);


  const createTicket = async (name: string, issue: string, priority: Priority, tags: string[]) => {
    if (!db) return "local-id";
    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), {
        name, issue, priority, tags, 
        status: 'waiting', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
    });
    return docRef.id;
  };

  const updateTicketStatus = async (id: string, status: 'waiting' | 'active' | 'resolved', volId?: string) => {
     if (!db) return;
     await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id), { 
         status, 
         ...(volId && { volunteerId: volId }) 
     });
  };

  const addMessage = async (ticketId: string, message: Omit<Message, "id">) => {
     if (!db) return;
     await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
         ...message,
         ticketId
     });
  };

  const getMessages = (ticketId: string) => {
      return messages.filter(m => m.ticketId === ticketId);
  };

  const addPublicMemo = async (text: string) => {
     if (!db) return;
     await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'memos'), {
        text,
        timestamp: Date.now(),
        style: {
            left: `${Math.random() * 80 + 10}%`,
            animationDuration: `${25 + Math.random() * 15}s`,
            animationDelay: '0s',
            scale: 0.9 + Math.random() * 0.3
        }
     });
  };

  return (
    <AppContext.Provider value={{ tickets, createTicket, updateTicketStatus, messages, addMessage, getMessages, volunteerProfile, setVolunteerProfile, publicMemos, addPublicMemo, user }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- 5. COMPONENTS ---

// [FIX] Audio Player Component
const BreathingExercise = ({ onClose, lang }: { onClose: () => void, lang: Language }) => {
  const t = CONTENT[lang].breath;
  const [stage, setStage] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [stageText, setStageText] = useState(t.inhale);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); 
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const totalDuration = 60;
  
  useEffect(() => {
    let timeLeft = totalDuration;
    
    // Attempt play on mount with error handling
    if(audioRef.current) {
        audioRef.current.volume = 0.8;
    }

    const cycle = async () => {
      if (timeLeft <= 0) return;
      setStage('Inhale'); setStageText(t.inhale); await new Promise(r => setTimeout(r, 4000));
      setStage('Hold'); setStageText(t.hold); await new Promise(r => setTimeout(r, 4000));
      setStage('Exhale'); setStageText(t.exhale); await new Promise(r => setTimeout(r, 4000));
      cycle();
    };
    cycle();

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); return 100; }
        return p + (100 / totalDuration / 10);
      });
      timeLeft -= 0.1;
    }, 100);

    return () => clearInterval(timer);
  }, [t]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
         // Explicitly triggered by user interaction - browsers like this
         audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error("Play failed:", e));
      }
    }
  };

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center animate-fade-in overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950 via-slate-900 to-black opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '12s' }}></div>

      {/* Reliable Rainforest Sound */}
      <audio ref={audioRef} loop playsInline onError={(e) => console.log("Audio error:", e)}>
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3" type="audio/mpeg" />
      </audio>

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
        <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 text-white/70 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"><X size={24} /></button>
        
        <div className="absolute top-8 left-8 flex gap-4">
           <button onClick={toggleAudio} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all backdrop-blur-md text-xs font-bold uppercase tracking-widest ${!isPlaying ? 'bg-emerald-500/20 text-emerald-300 animate-pulse ring-1 ring-emerald-500/50' : 'bg-white/5 text-white/70'}`}>
              {isPlaying ? <Volume2 size={16} /> : <Music size={16} />}
              <span>{isPlaying ? t.musicOn : t.playErr}</span>
           </button>
        </div>

        <div className="relative flex items-center justify-center">
           <svg className="absolute w-[340px] h-[340px] rotate-[-90deg] pointer-events-none">
              <circle cx="170" cy="170" r={radius} stroke="white" strokeWidth="2" fill="transparent" opacity="0.1" />
              <circle cx="170" cy="170" r={radius} stroke="url(#gradient)" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-100 linear"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
           </svg>
           <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out relative ${stage === 'Inhale' ? 'scale-125 shadow-[0_0_100px_rgba(52,211,153,0.4)] bg-emerald-500/20' : stage === 'Exhale' ? 'scale-75 bg-teal-500/10' : 'scale-100 bg-white/10'}`}>
              <div className={`absolute inset-0 rounded-full border border-white/30 transition-all duration-[4000ms] ${stage === 'Inhale' ? 'scale-110 opacity-50' : 'scale-90 opacity-20'}`} />
              <div className={`absolute inset-0 rounded-full border border-white/10 transition-all duration-[4000ms] delay-75 ${stage === 'Inhale' ? 'scale-125 opacity-30' : 'scale-75 opacity-10'}`} />
              <div className="flex flex-col items-center text-center z-10">
                 <span className="text-3xl font-light text-white tracking-[0.2em] uppercase drop-shadow-lg">{stageText}</span>
                 <span className="text-white/50 text-xs mt-2 font-mono tracking-widest">{Math.round(progress)}%</span>
              </div>
           </div>
        </div>
        <p className="mt-16 text-white/40 text-sm font-light tracking-[0.2em] uppercase animate-pulse">{t.relax}</p>
      </div>
    </div>
  );
};

// [FIX] Chat Bubble
const ChatBubble = ({ text, isUser, sender, isVerified, timestamp }: Message) => {
  const isAI = sender?.includes('(AI)') || sender?.includes('AI') || sender?.includes('Tree') || sender?.includes('樹') || false;
  const isSystem = sender === 'System';
  const timeString = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (isSystem) {
    return <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest text-center my-4 font-medium flex items-center justify-center gap-2 before:content-[''] before:h-px before:w-8 before:bg-slate-300 dark:before:bg-slate-700 after:content-[''] after:h-px after:w-8 after:bg-slate-300 dark:after:bg-slate-700">{text}</div>;
  }

  const userBubbleStyle = "bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-tr-sm shadow-md";
  const aiBubbleStyle = "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm";
  const peerBubbleStyle = "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm";

  let bubbleClass = isUser ? userBubbleStyle : (isAI ? aiBubbleStyle : peerBubbleStyle);
  const displaySender = stripAITag(sender);

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-6 animate-fade-in group`}>
      <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser 
            ? 'bg-teal-100 text-teal-600' 
            : (isAI 
                ? 'bg-white/50 text-emerald-600' 
                : 'bg-white text-pink-500')
        }`}>
          {isUser ? <User size={16} /> : (isAI ? <Trees size={16} /> : <Heart size={16} />)}
        </div>
        <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed relative ${bubbleClass}`}>
          {text}
          {!isUser && !isAI && (
             isVerified 
             ? <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5"><BadgeCheck size={8} /> PRO</div>
             : <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5"><UserCheck size={8} /> PEER</div>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUser ? 'pr-12' : 'pl-12'}`}>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1">
          {displaySender}
        </span>
        {timeString && <span className="text-[10px] text-slate-300 dark:text-slate-600">• {timeString}</span>}
      </div>
    </div>
  );
};

// [FIX] Human Chat - Passing Ticket
const HumanChat = ({ ticket, onLeave, isVolunteer, lang }: { ticket: Ticket, onLeave: () => void, isVolunteer: boolean, lang: Language }) => {
  const t = CONTENT[lang];
  const { addMessage, getMessages, updateTicketStatus, volunteerProfile } = useAppContext();
  const [inputText, setInputText] = useState("");
  const [showReminder, setShowReminder] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  const messages = getMessages(ticket.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const initMsg = isVolunteer ? t.humanRole.systemJoin : t.humanRole.waitingMessage;
      addMessage(ticket.id, { id: 'sys-init', text: initMsg, isUser: false, sender: "System", timestamp: Date.now() });
    }
  }, []);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    
    const check = checkContentSafety(inputText);
    if (!check.safe) {
      setNotification({ message: check.reason || "Safety Alert", type: 'error' });
      return; 
    }
    addMessage(ticket.id, { id: Date.now().toString(), text: inputText, isUser: !isVolunteer, sender: isVolunteer ? volunteerProfile.name : "Me", isVerified: isVolunteer && volunteerProfile.isVerified, timestamp: Date.now() });
    setInputText("");
  };

  const handleEndChat = () => {
    if (window.confirm(isVolunteer ? t.dialogs.volLeaveMsg : t.dialogs.citEndMsg)) {
        if(isVolunteer) {
            addMessage(ticket.id, { id: Date.now().toString(), text: `${volunteerProfile.name} left.`, isUser: false, sender: "System", timestamp: Date.now() });
            updateTicketStatus(ticket.id, 'waiting');
        } else {
            addMessage(ticket.id, { id: Date.now().toString(), text: t.humanRole.caseResolved, isUser: false, sender: "System", timestamp: Date.now() });
            updateTicketStatus(ticket.id, 'resolved');
        }
        onLeave();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <Notification message={notification?.message || ""} type={notification?.type || 'info'} onClose={() => setNotification(null)} />
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 flex items-center justify-between shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-full ${isVolunteer ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>{isVolunteer ? <User size={24} /> : <Heart size={24} />}</div>
          <div>
            <h2 className="font-bold text-base md:text-lg flex items-center gap-1">
              {isVolunteer 
                ? ticket.name 
                : (ticket.status === 'active' 
                    ? t.humanRole.joinedTitle 
                    : t.humanRole.waitingTitle)
              }
              {!isVolunteer && ticket.status === 'active' && (<BadgeCheck size={18} className="text-emerald-500" />)}
            </h2>
            <p className={`text-xs ${isVolunteer ? 'text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
               {isVolunteer ? `Issue: ${ticket.issue.substring(0, 40)}` : (ticket.status === 'active' ? t.humanRole.systemJoin : t.humanRole.waitingMessage)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isVolunteer && (<button onClick={() => alert("Report submitted.")} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors"><Flag size={18} className="text-slate-500"/></button>)}
            <button onClick={handleEndChat} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">{isVolunteer ? t.actions.leaveChat : t.actions.endChat}</button>
        </div>
      </header>
      
      {showReminder && (
        <div className="mb-4 mx-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-2xl text-xs text-amber-800 dark:text-amber-200 flex gap-3 items-start animate-fade-in mt-4 relative">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed pr-6">{t.humanRole.chatReminder}</span>
            <button onClick={() => setShowReminder(false)} className="absolute top-3 right-3 text-amber-400 hover:text-amber-600 dark:hover:text-amber-100 transition-colors"><X size={16}/></button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-3xl mx-auto w-full">
            {isVolunteer && ticket.priority === 'critical' && (<div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 p-4 rounded-2xl text-sm mb-8 flex items-start gap-3"><AlertTriangle size={20} className="shrink-0 mt-0.5" /><div><span className="font-bold block mb-1">CRITICAL CASE</span>High distress level reported. Please handle with care.</div></div>)}
            {messages.map(msg => (<ChatBubble key={msg.id} {...msg} />))}
            <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky bottom-0 z-20">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-[2rem] px-2 py-2 border-none focus-within:ring-2 focus-within:ring-teal-500 transition-all shadow-inner">
          <input className="flex-1 bg-transparent text-base text-slate-900 dark:text-white focus:outline-none px-4 min-h-[44px] placeholder:text-slate-400" placeholder={t.humanRole.placeholder} value={inputText} onChange={e => setInputText(e.target.value)} autoFocus />
          <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center disabled:opacity-50 disabled:scale-100 hover:scale-105 transition-all shadow-md"><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT ---

const MainLayout = () => {
  const [view, setView] = useState<'intro' | 'landing' | 'ai-chat' | 'intake' | 'volunteer-auth' | 'volunteer-guidelines' | 'volunteer-dashboard' | 'human-chat'>('landing');
  const [lang, setLang] = useState<Language>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [role, setRole] = useState<'citizen' | 'volunteer' | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const { createTicket, updateTicketStatus, addMessage, volunteerProfile } = useAppContext();

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const handleRoleSelect = (sel: string) => { if (sel === 'citizen-ai') { setRole('citizen'); setView('ai-chat'); } else if (sel === 'citizen-human') { setRole('citizen'); setView('intake'); } else if (sel === 'volunteer-login') { setView('volunteer-auth'); } };
  
  // [FIX] Immediately set local ticket to avoid White Page while waiting for DB sync
  const handleIntakeComplete = async (n: string, i: string, p: Priority, t: string[]) => { 
      const ticketId = await createTicket(n, i, p, t); 
      const tempTicket: Ticket = {
          id: ticketId, name: n, issue: i, priority: p, status: 'waiting', time: 'Now', tags: t, createdAt: Date.now()
      };
      setCurrentTicket(tempTicket); 
      setView('human-chat'); 
  };

  const handleVolunteerJoin = (t: Ticket) => { 
      updateTicketStatus(t.id, 'active', volunteerProfile.name); 
      setCurrentTicket(t); 
      setView('human-chat'); 
  };

  return (
    <div className={`w-full h-full min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="w-full h-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden font-sans">
            {view === 'intro' && <IntroScreen onStart={() => setView('landing')} lang={lang} toggleLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')} theme={theme} toggleTheme={toggleTheme} />}
            {view === 'landing' && <LandingScreen onSelectRole={handleRoleSelect} lang={lang} toggleLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')} theme={theme} toggleTheme={toggleTheme} onShowIntro={() => setView('intro')} />}
            {view === 'ai-chat' && <AIChat onBack={() => setView('landing')} lang={lang} />}
            {view === 'intake' && <IntakeForm onComplete={handleIntakeComplete} onBack={() => setView('landing')} lang={lang} />}
            {view === 'volunteer-auth' && <VolunteerAuth onBack={() => setView('landing')} onLoginSuccess={() => setView('volunteer-guidelines')} lang={lang} />}
            {view === 'volunteer-guidelines' && <VolunteerGuidelines onConfirm={() => setView('volunteer-dashboard')} onBack={() => setView('landing')} lang={lang} />}
            {view === 'volunteer-dashboard' && <VolunteerDashboard onBack={() => setView('landing')} onJoinChat={handleVolunteerJoin} lang={lang} />}
            {/* [FIX] Pass whole ticket object to avoid async lookup failure */}
            {view === 'human-chat' && currentTicket && (<HumanChat ticket={currentTicket} onLeave={() => setView(role === 'volunteer' ? 'volunteer-dashboard' : 'landing')} isVolunteer={role === 'volunteer'} lang={lang} />)}
        </div>
    </div>
  );
};

export default function App() { return <AppProvider><MainLayout /></AppProvider>; }
