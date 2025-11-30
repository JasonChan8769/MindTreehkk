import React, { useState, useRef, useEffect, createContext, useContext, Component, ErrorInfo } from 'react';
import { 
  MessageCircle, User, Heart, Shield, Clock, CheckCircle, X, Send, Bot, 
  Lock, BadgeCheck, Flag, AlertTriangle, 
  ArrowRight, ArrowLeft, Trees, BookOpen, Coffee, LogOut,
  Moon, Sun, MessageSquare, Link, Globe,
  Play, Volume2, VolumeX, Sparkles, HandHeart, Smartphone,
  Music, Leaf, Cloud, SunDim, Sprout, Droplet, FileText,
  ChevronRight, MessageSquarePlus, Ban, AlertOctagon, XCircle, UserCheck,
  Loader2, Trash2, Inbox, Download, FileSpreadsheet
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, limit, deleteDoc, writeBatch
} from 'firebase/firestore';

// --- GLOBAL DECLARATIONS ---
declare const __firebase_config: string;
declare const __app_id: string;
declare const __initial_auth_token: string;

// --- ERROR BOUNDARY ---
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-6 bg-slate-50 text-slate-800">
          <AlertOctagon size={48} className="text-rose-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">應用程式發生錯誤</h1>
          <p className="text-sm text-slate-500 mb-4 text-center">
            {this.state.error?.message || "未知錯誤"}
            <br/>請重新整理頁面。
          </p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-teal-600 text-white rounded-lg shadow-md">重新整理</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- FIREBASE CONFIGURATION (USER PROVIDED) ---
// This configuration ensures cross-device connectivity
const firebaseConfig = {
  apiKey: "AIzaSyB0abQmyf4vALgQ3XNM_we5B0JCfrteZ4I",
  authDomain: "mindtreehk.firebaseapp.com",
  projectId: "mindtreehk",
  storageBucket: "mindtreehk.firebasestorage.app",
  messagingSenderId: "326871687350",
  appId: "1:326871687350:web:92ce082c58f80ef74b8617",
  measurementId: "G-R6TVNF43T4"
};

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
// Use a fixed App ID fallback to ensure different devices see the same data path
let appId = typeof __app_id !== 'undefined' ? __app_id : 'mindtree-live';
// NOTE: We ignore __initial_auth_token here because we are using a custom Firebase project
// which requires separate authentication (Anonymous).

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized with MindTree config.");
} catch (e) {
  console.error("Firebase initialization error:", e);
}

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
  volunteerName?: string;
}

export interface Feedback {
  id: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface VolunteerProfile {
  name: string;
  role: 'peer' | 'pro' | 'admin';
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
  { id: 1, title: { zh: "社會福利署熱線 (24小時)", en: "SWD Hotline (24hr)" }, url: "https://www.swd.gov.hk", category: "mental" },
  { id: 2, title: { zh: "香港撒瑪利亞防止自殺會", en: "The Samaritans HK" }, url: "https://sbhk.org.hk", category: "mental" },
  { id: 3, title: { zh: "醫院管理局精神健康專線", en: "HA Mental Health Hotline" }, url: "https://www3.ha.org.hk", category: "mental" },
  { id: 4, title: { zh: "Shall We Talk", en: "Shall We Talk" }, url: "https://shallwetalk.hk", category: "mental" },
  { id: 5, title: { zh: "賽馬會「開聲」情緒支援", en: "Jockey Club Open Up" }, url: "https://www.openup.hk/", category: "mental" },
  { id: 6, title: { zh: "紅十字會輸血服務中心", en: "Red Cross Blood Transfusion" }, url: "https://www5.ha.org.hk/rcbts/", category: "blood" },
  { id: 7, title: { zh: "捐血站位置", en: "Donor Centres Locations" }, url: "https://www5.ha.org.hk/rcbts/donor-centres", category: "blood" },
  { id: 8, title: { zh: "民政事務總署 - 大埔區", en: "HAD - Tai Po District" }, url: "https://www.had.gov.hk/en/18_districts/my_district/tai_po.htm", category: "info" },
  { id: 9, title: { zh: "大埔區地區康健站", en: "Tai Po DHC Express" }, url: "https://www.dhc.gov.hk/en/district_health_centre_express.html", category: "info" },
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
      caseResolved: "對話已結束。數據已銷毀。",
      placeholder: "輸入訊息...",
      chatReminder: "⚠️ 提醒：請保持尊重與禮貌。嚴禁任何非法、騷擾或侵犯隱私的行為。為了保障雙方安全，請勿透露個人敏感資料（如全名、地址、電話、身份證號碼）。",
      scanBlock: "訊息未能發送：AI 偵測到不當或攻擊性內容。",
      endChatConfirm: "確定結束並刪除紀錄？",
      cancelWait: "取消等待"
    },
    memo: {
      cheerUp: "社區心聲",
      label: "留低一句",
      title: "留低一句說話",
      desc: "你的訊息將會「即時」顯示在首頁的漂浮氣泡中。請發放正能量，支持身邊人。",
      placeholder: "寫下你的祝福或感受...",
      btn: "發佈",
      success: "發佈成功！訊息已上傳。",
      scanning: "AI 正在嚴格審查內容...",
      unsafe: "未能發佈：內容可能包含不當用語或無意義內容。",
      guidance: "請保持正面、友善。"
    },
    volunteer: {
      login: "義工登入",
      authTitle: "義工/管理員入口", 
      disclaimer: "感謝你的無私奉獻。加入前請確認你已準備好聆聽。", 
      nameLabel: "稱呼 (輸入 6221Like 進入管理員模式)",
      namePlaceholder: "例如：陳大文",
      joinBtn: "進入義工平台",
      proJoinTitle: "專業人員通道",
      codePlaceholder: "輸入存取碼 (義工免填)",
      verifyBtn: "進入平台", 
      errorMsg: "存取碼錯誤",
      reminder: "溫馨提示：請時刻保持同理心及尊重。我們建立的是一個安全、包容的空間，請用心聆聽每一位求助者的心聲。",
      guidelinesTitle: "心理支援指南",
      guidelinesDesc: "簡單三步，成為更好的聆聽者",
      rule1Title: "第一步：專注聆聽 (Listen)",
      rule1Desc: "給予對方空間表達。不要急著打斷或給予建議。用「嗯」、「我明白」來回應，讓對方感到被接納。",
      rule2Title: "第二步：同理回應 (Empathize)",
      rule2Desc: "確認對方的感受。試著說「聽起來你現在很無助」、「這真的很不容易」。避免說「你看開點」、「這沒什麼大不了」。",
      rule3Title: "第三步：安全評估 (Assess)",
      rule3Desc: "時刻保持警覺。如果對方提及自殺、傷害自己或他人，請保持冷靜，不要獨自處理。建議對方尋求專業協助 (999)，並立即報告管理員。",
      acknowledgeBtn: "我明白並同意",
      portalTitle: "控制台",
      welcome: "歡迎回來",
      exit: "登出",
      activeRequests: "待處理個案",
      noRequests: "暫時沒有新個案",
      accept: "接聽",
      topic: "主訴",
      priority: { critical: "緊急", high: "高", medium: "中", low: "低" },
      tabRequests: "求助個案",
      tabFeedback: "管理員專區",
      noFeedbacks: "暫時沒有意見",
      exportCSV: "匯出 CSV (下載至裝置)"
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
      submit: "傳送",
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
      volLeaveMsg: "Return case to queue?",
      citEndMsg: "End this session?"
    },
    chatWarning: {
      text: "⚠️ 提醒：請保持尊重與禮貌。嚴禁任何非法、騷擾或侵犯隱私的行為。為了保障雙方安全，請勿透露個人敏感資料（如全名、地址、電話、身份證號碼）。"
    }
  }
};

// --- 3. SERVICES ---

const checkContentSafety = (text: string) => {
  const badWords = ["die", "kill", "死", "自殺", "殺", "idiot", "stupid", "hate", "fuck", "shit", "bitch", "porn", "sex", "笨", "白痴", "廢", "垃圾"];
  const lower = text.toLowerCase();
  const hasBadWord = badWords.some(word => lower.includes(word));
  
  if (text.trim().length < 2) return { safe: false, reason: "Message too short." };
  
  if (hasBadWord) {
    return { safe: false, reason: "Content contains inappropriate words." };
  }
  return { safe: true, reason: null };
};

const scanContentWithAI = async (text: string): Promise<{ safe: boolean, reason: string | null }> => {
  try {
    const localCheck = checkContentSafety(text);
    if (!localCheck.safe) return localCheck;

    const contentReviewSystemPrompt = `
    You are a lenient Content Moderator for 'MindTree'.
    Task: Filter ONLY strictly harmful content.
    
    PERMITTED CONTENT (RETURN "PASS"):
    - Positive, encouraging messages.
    - Neutral greetings (e.g., "Hi", "Testing", "Good morning").
    - Short messages are OKAY.
    - Anything that is NOT hateful or abusive.
    
    BANNED CONTENT (REJECT):
    - Insults, hate speech, bullying.
    - Encouraging self-harm or violence.
    - Explicit sexual content.
    - Nonsense keysmashing (e.g. "asdfghjkl").

    Output Format:
    - If SAFE: Return exactly "PASS".
    - If UNSAFE: Return a polite, warm reminder in Traditional Chinese.
    `;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: [{ role: "user", parts: [{ text: text }] }],
        systemInstruction: contentReviewSystemPrompt,
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await response.json();
    if (!response.ok) return { safe: true, reason: null }; 

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (result === "PASS") {
      return { safe: true, reason: null };
    } else {
      return { safe: false, reason: result || "Content filtered by AI." };
    }

  } catch (e) {
    return { safe: true, reason: null };
  }
};

const SYSTEM_PROMPTS = {
  zh: `你係「MindTree 樹洞」，一個有溫度、有思想嘅數碼同伴。用廣東話口語。禁止機械式回應。`,
  en: `You are MindTree, a thoughtful digital companion. Speak naturally.`
};

const generateAIResponse = async (history: Message[], lang: 'zh' | 'en'): Promise<string> => {
  try {
    const systemInstruction = SYSTEM_PROMPTS[lang];
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.isUser ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: recentHistory,
        systemInstruction: systemInstruction 
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error("API Error");
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "...";
  } catch (error) {
    return lang === 'zh' ? "（MindTree 正在思考...）" : "(MindTree is thinking...)";
  }
};

// --- 4. CONTEXT (State Management) ---

interface AppContextType {
  tickets: Ticket[];
  createTicket: (name: string, issue: string, priority: Priority, tags: string[]) => Promise<string>;
  updateTicketStatus: (id: string, status: 'waiting' | 'active' | 'resolved', volId?: string, volName?: string) => void;
  deleteTicket: (id: string) => Promise<void>;
  endSession: (ticketId: string) => Promise<void>;
  messages: Message[]; 
  addMessage: (ticketId: string, message: Omit<Message, "id">) => void;
  getMessages: (ticketId: string) => Message[];
  volunteerProfile: VolunteerProfile;
  setVolunteerProfile: (profile: VolunteerProfile) => void;
  publicMemos: Memo[];
  addPublicMemo: (text: string) => void;
  feedbacks: Feedback[];
  submitFeedback: (text: string) => Promise<void>;
  user: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); 
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>({ name: "", role: "peer", isVerified: false });
  const [publicMemos, setPublicMemos] = useState<Memo[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // 1. Auth
  useEffect(() => {
    const initAuth = async () => {
        if (auth) {
            try {
                // FORCE ANONYMOUS AUTH for custom project
                await signInAnonymously(auth);
            } catch (e) {
                console.error("Auth failed:", e);
                // Fallback for dev mode without firebase
                setUser({ uid: 'demo-user' });
            }
        } else {
            setUser({ uid: 'demo-user' });
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
    }, (err) => console.log("Ticket sync error:", err));
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
    }, (err) => console.log("Message sync error:", err));
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
    }, (err) => console.log("Memo sync error:", err));
    return () => unsubscribe();
  }, [user]);

  // 5. Sync Feedbacks (Only fetch, simple version)
  useEffect(() => {
    if (!user || !db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'feedbacks');
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedFeedbacks = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
        loadedFeedbacks.sort((a, b) => b.timestamp - a.timestamp);
        setFeedbacks(loadedFeedbacks);
    }, (err) => console.log("Feedback sync error:", err));
    return () => unsubscribe();
  }, [user]);


  const createTicket = async (name: string, issue: string, priority: Priority, tags: string[]) => {
    if (!db) {
       const localId = "local-" + Date.now();
       const newTicket: Ticket = {
         id: localId, name, issue, priority, tags,
         status: 'waiting',
         time: new Date().toLocaleTimeString(),
         createdAt: Date.now()
       };
       setTickets(prev => [newTicket, ...prev]);
       return localId;
    }
    
    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), {
        name, issue, priority, tags, 
        status: 'waiting', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
    });
    return docRef.id;
  };

  const updateTicketStatus = async (id: string, status: 'waiting' | 'active' | 'resolved', volId?: string, volName?: string) => {
     if (!db) {
       setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
       return;
     }
     await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id), { 
         status, 
         ...(volId && { volunteerId: volId }),
         ...(volName && { volunteerName: volName })
     });
  };

  const deleteTicket = async (id: string) => {
      if(!db) {
          setTickets(prev => prev.filter(t => t.id !== id));
          return;
      }
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id));
  };

  const endSession = async (ticketId: string) => {
    await updateTicketStatus(ticketId, 'resolved');

    if (!db) {
       setMessages(prev => prev.filter(m => m.ticketId !== ticketId));
       return;
    }

    // --- AUTO DELETE FEATURE ---
    const msgsToDelete = messages.filter(m => m.ticketId === ticketId);
    
    const batch = writeBatch(db);
    msgsToDelete.forEach(msg => {
       const ref = doc(db, 'artifacts', appId, 'public', 'data', 'messages', msg.id);
       batch.delete(ref);
    });
    
    try {
        await batch.commit();
    } catch(e) {
        console.error("Deletion error:", e);
    }
  };

  const addMessage = async (ticketId: string, message: Omit<Message, "id">) => {
     if (!db) {
       const newMsg = { id: Date.now().toString(), ...message };
       setMessages(prev => [...prev, newMsg]);
       return;
     }
     await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
         ...message,
         ticketId
     });
  };

  const getMessages = (ticketId: string) => {
      return messages.filter(m => m.ticketId === ticketId);
  };

  const addPublicMemo = async (text: string) => {
     const newMemoData = {
        text,
        timestamp: Date.now(),
        style: {
            left: `${Math.random() * 80 + 10}%`,
            animationDuration: `${25 + Math.random() * 15}s`,
            animationDelay: '0s',
            scale: 0.9 + Math.random() * 0.3
        }
     };

     if (!db) {
       const newMemo = { id: Date.now(), ...newMemoData } as Memo;
       setPublicMemos(prev => [newMemo, ...prev]);
       return;
     }
     await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'memos'), newMemoData);
  };

  const submitFeedback = async (text: string) => {
      if(!db) {
          const newFb: Feedback = { id: Date.now().toString(), text, timestamp: Date.now(), read: false };
          setFeedbacks(prev => [newFb, ...prev]);
          return;
      }
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'feedbacks'), {
          text, timestamp: Date.now(), read: false
      });
  };

  return (
    <AppContext.Provider value={{ tickets, createTicket, updateTicketStatus, deleteTicket, endSession, messages, addMessage, getMessages, volunteerProfile, setVolunteerProfile, publicMemos, addPublicMemo, feedbacks, submitFeedback, user }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- 5. COMPONENT DEFINITIONS (ORDER IS CRITICAL) ---

const stripAITag = (text: string | undefined) => {
  if (typeof text !== 'string') return "";
  return text.replace(/\s*\(AI\)/g, '');
};

const Notification = ({ message, type, onClose }: { message: string, type: 'error' | 'info' | 'loading', onClose: () => void }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-rose-500/90' : (type === 'loading' ? 'bg-indigo-500/90' : 'bg-emerald-500/90');
  
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] ${bgColor} backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in max-w-md w-full mx-4 ring-1 ring-white/20`}>
      {type === 'error' ? <XCircle size={18} /> : (type === 'loading' ? <Clock size={18} className="animate-spin"/> : <CheckCircle size={18} />)}
      <span className="text-sm font-medium flex-1 leading-tight">{message}</span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100 shrink-0"><X size={16} /></button>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-start gap-2 mb-4 animate-fade-in">
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/50 dark:bg-white/10 text-teal-600 dark:text-teal-400 border border-white/20">
      <Bot size={16} />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/60 dark:bg-white/5 shadow-sm flex items-center gap-1 backdrop-blur-sm">
      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"></div>
    </div>
  </div>
);

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

// --- PRO BREATHING EXERCISE ---

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
        audioRef.current.volume = 0.8; // Increased volume
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

      {/* Relaxing Nature Sound - Better Source (Rain & Birds) */}
      <audio ref={audioRef} loop onError={(e) => console.log("Audio error:", e)}>
        <source src="https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg" type="audio/ogg" />
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
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

const FeedbackModal = ({ onClose, lang }: { onClose: () => void, lang: Language }) => {
  const t = CONTENT[lang].feedback;
  const { submitFeedback } = useAppContext();
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await submitFeedback(text);
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><MessageCircle size={24} className="text-teal-500"/> {t.title}</h3>
        <p className="text-xs text-slate-500 mb-6">{t.desc}</p>
        {sent ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4 animate-bounce"/>
            <p className="text-slate-600 dark:text-slate-300 font-bold">{t.thanks}</p>
          </div>
        ) : (
          <>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder={t.placeholder} className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none resize-none focus:ring-2 focus:ring-teal-500 mb-4 dark:text-white"/>
            <button onClick={handleSubmit} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30">{t.submit}</button>
          </>
        )}
      </div>
    </div>
  );
};

const IntroScreen = ({ onStart, lang, toggleLang, theme, toggleTheme }: { onStart: () => void, lang: Language, toggleLang: () => void, theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const t = CONTENT[lang].intro;
  const [step, setStep] = useState(0);
  const steps = [
    { title: t.welcome, desc: t.desc, icon: <Trees className="text-emerald-500 w-24 h-24" /> },
    { title: t.slide1Title, desc: t.slide1Desc, icon: <Bot className="text-teal-500 w-24 h-24" /> },
    { title: t.slide2Title, desc: t.slide2Desc, icon: <Shield className="text-emerald-600 w-24 h-24" /> }
  ];

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-teal-500/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      <div className="w-full flex justify-end gap-3 p-6 z-20 shrink-0">
        <button onClick={toggleLang} className="flex items-center gap-1 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all hover:bg-white/80 dark:text-white"><Globe size={12} /> {lang === 'zh' ? 'EN' : '繁體'}</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full text-center z-10">
        <div className="mb-10 p-12 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-teal-500/10 animate-float">
          {steps[step].icon}
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-6 tracking-tight animate-fade-in" key={`title-${step}`}>{steps[step].title}</h2>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in max-w-xs mx-auto" key={`desc-${step}`}>{steps[step].desc}</p>
        <div className="flex gap-2 mt-12 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-teal-600 dark:bg-teal-400' : 'w-2 bg-slate-300 dark:bg-slate-700'}`} />
          ))}
        </div>
      </div>
      <div className="p-8 pb-12 z-10 max-w-md mx-auto w-full shrink-0">
        <button onClick={() => { if (step < steps.length - 1) setStep(s => s + 1); else onStart(); }} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-3xl shadow-xl shadow-teal-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-sm tracking-wide uppercase">{step < steps.length - 1 ? <ArrowRight size={20} /> : t.startBtn}</button>
      </div>
    </div>
  );
};

const LandingScreen = ({ onSelectRole, lang, toggleLang, theme, toggleTheme, onShowIntro }: { onSelectRole: (role: string) => void, lang: Language, toggleLang: () => void, theme: 'light' | 'dark', toggleTheme: () => void, onShowIntro: () => void }) => {
  const t = CONTENT[lang];
  const { addPublicMemo, publicMemos } = useAppContext();
  const [showMemoInput, setShowMemoInput] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showBreath, setShowBreath] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'info' | 'loading'} | null>(null);
  const [floatingBubbles, setFloatingBubbles] = useState<Memo[]>([]);

  // Update Theme Color for iOS Status Bar
  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    const color = theme === 'light' ? '#ecfdf5' : '#0f172a';
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", color);
    } else {
        const meta = document.createElement('meta');
        meta.name = "theme-color";
        meta.content = color;
        document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, [theme]);

  // Init with quotes
  useEffect(() => {
    const shuffledQuotes = [...AI_QUOTES].sort(() => 0.5 - Math.random());
    const selectedQuotes = shuffledQuotes.slice(0, 12);
    const initialBubbles = selectedQuotes.map((quote, index) => {
        const randomSymbol = COMFORT_SYMBOLS[Math.floor(Math.random() * COMFORT_SYMBOLS.length)];
        const textWithSymbol = Math.random() > 0.5 ? `${randomSymbol} ${quote}` : `${quote} ${randomSymbol}`;
        return {
            id: `init-${index}`, 
            text: textWithSymbol,
            timestamp: Date.now(),
            style: { 
                left: `${Math.random() * 80 + 10}%`, 
                animationDuration: `${25 + Math.random() * 20}s`, 
                animationDelay: `${Math.random() * 10}s`, 
                scale: 0.8 + Math.random() * 0.3 
            }
        };
    });
    setFloatingBubbles(initialBubbles);
  }, []);

  // Update when new memo is added
  useEffect(() => {
    if (publicMemos.length > 0) {
        setFloatingBubbles(prev => [...publicMemos, ...prev]);
    }
  }, [publicMemos]);

  // Auto-dismiss error notification
  useEffect(() => {
      if(notification?.message && notification.type !== 'loading') {
          const timer = setTimeout(() => setNotification(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [notification]);

  const handlePostMemo = async () => {
    if (!memoText.trim()) return;
    setNotification({ message: t.memo.scanning, type: 'loading' });
    const result = await scanContentWithAI(memoText);
    
    if (!result.safe) {
      setNotification({ message: result.reason || t.memo.unsafe, type: 'error' });
      return;
    }

    addPublicMemo(memoText); 
    setMemoText(""); 
    setShowMemoInput(false);
    setNotification({ message: t.memo.success, type: 'info' }); 
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-500 font-sans">
      <Notification message={notification?.message || ""} type={notification?.type || 'info'} onClose={() => setNotification(null)} />
      {showBreath && <BreathingExercise onClose={() => setShowBreath(false)} lang={lang} />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} lang={lang} />}
      
      {/* Nature Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-teal-950 dark:to-emerald-950 z-0" />
      
      {/* Decorative Background Elements (Forest Theme) */}
      <div className="absolute top-10 left-[-50px] text-teal-100/50 dark:text-emerald-900/10 pointer-events-none opacity-50 rotate-45"><Leaf size={300} /></div>
      <div className="absolute bottom-[-50px] right-[-50px] text-emerald-100/50 dark:text-teal-900/10 pointer-events-none opacity-50 -rotate-12"><Cloud size={400} /></div>
      <div className="absolute top-[20%] right-[10%] text-yellow-100/40 dark:text-yellow-900/10 pointer-events-none opacity-60"><SunDim size={150} /></div>

      {/* Floating Elements (Memos) */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="relative w-full h-full">
            {floatingBubbles.map((memo) => (
            <div key={memo.id} className="absolute text-center animate-float select-none will-change-transform opacity-70" style={{ left: memo.style.left, animationDuration: memo.style.animationDuration, animationDelay: memo.style.animationDelay, bottom: -80 }}>
                <span className="inline-block bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm border border-white/20" style={{ transform: `scale(${memo.style.scale})` }}>{memo.text}</span>
            </div>
            ))}
        </div>
      </div>

      <div className="w-full flex justify-between items-center p-6 z-20 shrink-0">
        <div className="flex flex-col">
           <h1 className="text-3xl font-serif font-black text-teal-900 dark:text-white tracking-tight flex items-center gap-2"><div className="bg-emerald-500 text-white p-2 rounded-xl"><Sprout size={24} fill="currentColor"/></div> {t.appTitle}</h1>
           <span className="text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider pl-12">{t.appSubtitle}</span>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setShowFeedback(true)} className="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-800 shadow-sm flex items-center justify-center text-teal-600 dark:text-teal-300 hover:scale-105 transition-transform backdrop-blur-md" title={t.landing.feedback}><MessageSquare size={18} /></button>
           <button onClick={toggleLang} className="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-800 shadow-sm flex items-center justify-center text-teal-600 dark:text-teal-300 hover:scale-105 transition-transform backdrop-blur-md"><Globe size={18} /></button>
           <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-800 shadow-sm flex items-center justify-center text-teal-600 dark:text-teal-300 hover:scale-105 transition-transform backdrop-blur-md">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
        </div>
      </div>
      
      <div className="flex-1 w-full overflow-y-auto z-10 px-6 pb-24 no-scrollbar">
        <div className="max-w-md mx-auto">
            <h2 className="text-teal-800 dark:text-white font-bold text-lg mb-4 flex items-center gap-2"><Trees size={18} className="text-emerald-500"/> {t.landing.servicesTitle}</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
               <button onClick={() => onSelectRole('citizen-ai')} className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2rem] shadow-lg shadow-teal-500/5 backdrop-blur-xl flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all group text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-bl-[100%] z-0" />
                  <div className="w-16 h-16 rounded-2xl bg-teal-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/30 z-10"><Bot size={32} /></div>
                  <div className="z-10">
                      <div className="font-bold text-xl text-slate-800 dark:text-white mb-1">{t.landing.aiCard.title}</div>
                      <div className="text-slate-500 text-xs font-medium">{t.landing.aiCard.desc}</div>
                  </div>
                  <div className="ml-auto text-slate-300 z-10"><ChevronRight size={24}/></div>
               </button>

               <button onClick={() => onSelectRole('citizen-human')} className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2rem] shadow-lg shadow-emerald-500/5 backdrop-blur-xl flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all group text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-[100%] z-0" />
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30 z-10"><Heart size={32} /></div>
                  <div className="z-10">
                      <div className="font-bold text-xl text-slate-800 dark:text-white mb-1">{t.landing.humanCard.title}</div>
                      <div className="text-slate-500 text-xs font-medium">{t.landing.humanCard.desc}</div>
                  </div>
                  <div className="ml-auto text-slate-300 z-10"><ChevronRight size={24}/></div>
               </button>
            </div>

            <div className="mb-8">
               <button onClick={() => setShowBreath(true)} className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-white p-6 rounded-[2rem] shadow-xl shadow-teal-500/30 flex items-center justify-between group hover:scale-[1.02] transition-transform relative overflow-hidden">
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
                  <div className="text-left relative z-10">
                      <div className="font-black text-xl mb-1 flex items-center gap-2"><Sparkles size={20}/> {t.landing.breathTitle}</div>
                      <div className="text-teal-50 text-xs font-medium bg-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-sm">{t.landing.breathDesc}</div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform backdrop-blur-sm relative z-10"><Play size={20} fill="white" /></div>
               </button>
            </div>

            <button onClick={() => onSelectRole('volunteer-login')} className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 p-1 rounded-[2rem] shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all group mb-8">
               <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[1.8rem] p-5 flex items-center gap-5 h-full w-full">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform"><HandHeart size={24} /></div>
                  <div className="flex-1 text-left">
                      <div className="font-bold text-base text-slate-800 dark:text-white">{t.landing.volunteerCard.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t.landing.volunteerCard.desc}</div>
                  </div>
                  <div className="text-slate-300"><ArrowRight size={20}/></div>
               </div>
            </button>

            <div className="flex gap-4">
               <button onClick={() => setShowMemoInput(true)} className="flex-1 py-4 rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-teal-600 dark:text-teal-400 font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-sm">
                  <MessageSquarePlus size={20} /> {t.memo.label}
               </button>
               <button onClick={() => setShowResources(true)} className="flex-1 py-4 rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-emerald-600 dark:text-emerald-400 font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors shadow-sm">
                  <Link size={20} /> {t.links.btn}
               </button>
            </div>

            <div className="mt-12 mb-6 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-white/20 dark:border-white/5 text-[10px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
               {t.footer.legal}
            </div>
        </div>
      </div>

      {showMemoInput && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-t-[2rem] sm:rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-slide-up sm:animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><MessageSquarePlus size={24} className="text-teal-500" /> {t.memo.title}</h3>
            <p className="text-xs text-slate-500 mb-6 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">{t.memo.desc}</p>
            <textarea value={memoText} onChange={(e) => setMemoText(e.target.value)} placeholder={t.memo.placeholder} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base focus:ring-2 focus:ring-teal-500 mb-6 h-32 resize-none text-slate-900 dark:text-white placeholder:text-slate-400" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowMemoInput(false)} className="flex-1 py-4 text-slate-500 font-bold text-sm bg-slate-100 dark:bg-slate-800 rounded-2xl">{t.actions.cancel}</button>
              <button onClick={handlePostMemo} className="flex-1 py-4 bg-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/30">{t.memo.btn}</button>
            </div>
          </div>
        </div>
      )}

      {showResources && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Link size={20} className="text-teal-500" /> {t.links.title}</h3>
                 <button onClick={() => setShowResources(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><X size={16}/></button>
              </div>
              <p className="text-xs text-slate-500 mb-4 px-1">{t.links.desc}</p>
              <div className="space-y-4">
                {['mental', 'blood', 'info'].map(cat => {
                   const catLinks = USEFUL_LINKS.filter(l => l.category === cat);
                   if(catLinks.length === 0) return null;
                   return (
                     <div key={cat}>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">{cat === 'mental' ? t.links.catMental : (cat === 'blood' ? t.links.catBlood : t.links.catInfo)}</h4>
                        <div className="space-y-2">
                            {catLinks.map(link => (
                              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl group transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20 shadow-sm">
                                  <div className="flex items-center gap-3">
                                     <div className={`p-2 rounded-full ${link.category === 'mental' || link.category === 'support' ? 'bg-red-50 text-red-500' : (link.category === 'blood' ? 'bg-pink-50 text-pink-500' : 'bg-indigo-50 text-indigo-500')}`}>
                                        {link.category === 'mental' || link.category === 'support' ? <Shield size={16} /> : (link.category === 'blood' ? <Droplet size={16} /> : <FileText size={16} />)}
                                     </div>
                                     <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{link.title[lang]}</span>
                                  </div>
                                  <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-500" />
                              </a>
                            ))}
                        </div>
                     </div>
                   );
                })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const AIChat = ({ onBack, lang }: { onBack: () => void, lang: Language }) => {
  const t = CONTENT[lang];
  const [messages, setMessages] = useState<Message[]>([{ id: "init", text: t.aiRole.welcome, isUser: false, sender: stripAITag(t.aiRole.title), timestamp: Date.now() }]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isTyping]);
  
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    const check = checkContentSafety(inputText);
    if (!check.safe) { setNotification({ message: check.reason || "Safety Alert", type: 'error' }); return; }
    
    const userMsg: Message = { id: Date.now().toString(), text: inputText, isUser: true, sender: lang === 'zh' ? "我" : "Me", timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    
    try {
      const aiText = await generateAIResponse([...messages, userMsg], lang);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: aiText, isUser: false, sender: stripAITag(t.aiRole.title), timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Connection error. Please try again.", isUser: false, sender: "System", timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <Notification message={notification?.message || ""} type={notification?.type || 'info'} onClose={() => setNotification(null)} />
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 px-6 flex items-center justify-between shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><ArrowLeft size={20} /></button>
            <div className="flex flex-col">
                <div className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">{stripAITag(t.aiRole.title)} <BadgeCheck size={16} className="text-teal-500"/></div>
                <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">Online</div>
            </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto w-full pb-4">
            {messages.map(msg => <ChatBubble key={msg.id} {...msg} />)}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Suggested Prompts */}
      {messages.length < 3 && !isTyping && (
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-950 flex gap-2 overflow-x-auto no-scrollbar">
          {SUGGESTED_PROMPTS[lang].map(prompt => (
            <button key={prompt} onClick={() => { setInputText(prompt); handleSend(); }} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-white transition-colors shadow-sm backdrop-blur-sm">
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white/90 dark:bg-slate-900/90 p-4 sticky bottom-0 z-20 pb-8 backdrop-blur-md">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-[2rem] px-2 py-2 border-none focus-within:ring-2 focus-within:ring-teal-500 transition-all shadow-inner">
          <input className="flex-1 bg-transparent text-base text-slate-900 dark:text-white focus:outline-none px-4 min-h-[44px] placeholder:text-slate-400" value={inputText} onChange={e => setInputText(e.target.value)} placeholder={t.aiRole.placeholder} autoFocus />
          <button type="submit" disabled={!inputText.trim() || isTyping} className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center disabled:opacity-50 disabled:scale-100 hover:scale-105 transition-all shadow-md"><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
};

// --- MISSING COMPONENTS (Restored) ---

const IntakeForm = ({ onComplete, onBack, lang }: { onComplete: (n: string, i: string, p: Priority, t: string[]) => void, onBack: () => void, lang: Language }) => {
  const t = CONTENT[lang].intake;
  const [name, setName] = useState("");
  const [age, setAge] = useState(t.q_age_opts[1]);
  const [gender, setGender] = useState(t.q_gender_opts[0]);
  const [distress, setDistress] = useState(3);
  const [issue, setIssue] = useState(t.q4_opt1);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to prevent double submission

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double click
    setIsSubmitting(true);

    // Logic to determine priority based on distress level and issue
    let priority: Priority = 'medium';
    if (distress >= 4 || issue === t.q4_opt4) priority = 'high';
    if (issue === t.q4_opt4) priority = 'critical';

    const tags = [age, gender, issue];
    onComplete(name || t.q1_placeholder, note || issue, priority, tags);
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-xl">
        <button onClick={onBack} className="mb-6 text-slate-400 hover:text-slate-600 flex items-center gap-2"><ArrowLeft size={20}/> {CONTENT[lang].actions.back}</button>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">{t.title}</h2>
        <p className="text-slate-500 mb-8 text-sm">{t.desc}</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.q1}</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t.q1_placeholder} className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-teal-500 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.q_age}</label>
              <select value={age} onChange={e => setAge(e.target.value)} className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none dark:text-white">
                {t.q_age_opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.q_gender}</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none dark:text-white">
                {t.q_gender_opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.q3} ({distress})</label>
            <input type="range" min="1" max="5" value={distress} onChange={e => setDistress(parseInt(e.target.value))} className="w-full accent-teal-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>{t.calm}</span><span>{t.crisis}</span></div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.q4}</label>
            <div className="grid grid-cols-1 gap-2">
              {[t.q4_opt1, t.q4_opt2, t.q4_opt3, t.q4_opt4].map(opt => (
                <button key={opt} onClick={() => setIssue(opt)} className={`p-3 rounded-xl text-left text-sm font-medium transition-all ${issue === opt ? 'bg-teal-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.q5}</label>
             <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={t.q5_placeholder} className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none h-24 resize-none dark:text-white"/>
          </div>

          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

const VolunteerAuth = ({ onBack, onLoginSuccess, lang }: { onBack: () => void, onLoginSuccess: () => void, lang: Language }) => {
  const t = CONTENT[lang].volunteer;
  const { setVolunteerProfile } = useAppContext();
  const [name, setName] = useState("");

  const handleApply = () => {
    if (!name.trim()) return;
    
    // ADMIN CHECK via Name (SECRET CODE)
    if (name.trim() === "6221Like") {
        setVolunteerProfile({ name: "Admin", role: "admin", isVerified: true });
    } else {
        // Default peer volunteer
        setVolunteerProfile({ name: name, role: "peer", isVerified: false });
    }
    onLoginSuccess();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl">
        <button onClick={onBack} className="mb-8 text-slate-400 hover:text-slate-600"><ArrowLeft size={24}/></button>
        <h2 className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mb-2">{t.authTitle}</h2>
        <p className="text-sm text-slate-500 mb-6">{t.disclaimer}</p>
        
        {/* Empathy Reminder Block */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl mb-6 flex items-start gap-3 border border-emerald-100 dark:border-emerald-800/30">
            <Heart size={18} className="text-emerald-600 shrink-0 mt-0.5 fill-emerald-100 dark:fill-emerald-900" />
            <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
                {(t as any).reminder}
            </p>
        </div>
        
        <div className="space-y-4">
           <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">{t.nameLabel}</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t.namePlaceholder} className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
           </div>
           
           <button onClick={handleApply} disabled={!name.trim()} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
             {t.verifyBtn}
           </button>
        </div>
      </div>
    </div>
  );
};

const VolunteerGuidelines = ({ onConfirm, onBack, lang }: { onConfirm: () => void, onBack: () => void, lang: Language }) => {
  const t = CONTENT[lang].volunteer;
  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
         <button onClick={onBack} className="mb-6 text-slate-400"><ArrowLeft size={24}/></button>
         <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">{t.guidelinesTitle}</h2>
         <p className="text-slate-500 mb-8">{t.guidelinesDesc}</p>

         <div className="space-y-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500">
                <h3 className="font-bold text-lg dark:text-white mb-2">{(t as any)[`rule${i}Title`]}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{(t as any)[`rule${i}Desc`]}</p>
              </div>
            ))}
         </div>
         <button onClick={onConfirm} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl">{t.acknowledgeBtn}</button>
      </div>
    </div>
  );
};

const VolunteerDashboard = ({ onBack, onJoinChat, lang }: { onBack: () => void, onJoinChat: (t: Ticket) => void, lang: Language }) => {
  const t = CONTENT[lang].volunteer;
  const { tickets, volunteerProfile, feedbacks } = useAppContext();
  const [activeTab, setActiveTab] = useState<'requests' | 'feedback'>('requests');
  
  const isAdmin = volunteerProfile.role === 'admin';

  const downloadCSV = () => {
      const headers = "ID,Timestamp,Message\n";
      const rows = feedbacks.map(fb => `"${fb.id}","${new Date(fb.timestamp).toLocaleString()}","${fb.text.replace(/"/g, '""')}"`).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "mindtree_feedback.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 flex flex-col">
       <div className="p-6 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4 z-10">
          <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.portalTitle}</h2>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-emerald-600 font-bold uppercase">{t.welcome}, {volunteerProfile.name}</p>
                    {isAdmin && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                </div>
            </div>
            <button onClick={onBack} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500">{t.exit}</button>
          </div>
          
          {/* Only show Tabs if Admin, otherwise just title */}
          {isAdmin && (
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button 
                      onClick={() => setActiveTab('requests')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600' : 'text-slate-400'}`}
                  >
                      {(t as any).tabRequests}
                  </button>
                  <button 
                      onClick={() => setActiveTab('feedback')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'feedback' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600' : 'text-slate-400'}`}
                  >
                      {(t as any).tabFeedback}
                  </button>
              </div>
          )}
       </div>
       
       <div className="flex-1 overflow-y-auto p-6">
         {(activeTab === 'requests' || !isAdmin) ? (
             <>
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t.activeRequests} ({tickets.filter(x => x.status === 'waiting').length})</h3>
                 
                 {tickets.filter(x => x.status === 'waiting').length === 0 ? (
                   <div className="text-center py-20 opacity-50">
                     <Bot size={48} className="mx-auto mb-4 text-slate-300"/>
                     <p>{t.noRequests}</p>
                   </div>
                 ) : (
                   <div className="grid gap-4">
                     {tickets.filter(t => t.status === 'waiting').map(ticket => (
                       <div key={ticket.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                         <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                               <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ticket.priority === 'critical' || ticket.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>{ticket.priority}</span>
                               <span className="text-slate-400 text-xs">{ticket.time}</span>
                            </div>
                         </div>
                         <div>
                            <div className="font-bold text-lg dark:text-white">{ticket.name}</div>
                            <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{ticket.issue}</div>
                         </div>
                         <div className="flex gap-2 mt-2">
                            {ticket.tags.map((tag, i) => <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500">{tag}</span>)}
                         </div>
                         <button onClick={() => onJoinChat(ticket)} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl mt-2">{t.accept}</button>
                       </div>
                     ))}
                   </div>
                 )}
             </>
         ) : (
             <div className="space-y-4">
                 <button onClick={downloadCSV} className="w-full py-3 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-4 hover:bg-slate-700">
                     <Download size={16}/> {(t as any).exportCSV || "Export CSV"}
                 </button>

                 {feedbacks.length === 0 ? (
                     <div className="text-center py-20 opacity-50 text-slate-400">
                         <Inbox size={48} className="mx-auto mb-4"/>
                         <p>{(t as any).noFeedbacks}</p>
                     </div>
                 ) : (
                     feedbacks.map(fb => (
                         <div key={fb.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                             <div className="flex justify-between mb-2">
                                 <span className="text-xs text-slate-400 font-mono">{new Date(fb.timestamp).toLocaleString()}</span>
                             </div>
                             <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{fb.text}</p>
                         </div>
                     ))
                 )}
             </div>
         )}
       </div>
    </div>
  );
};

const HumanChat = ({ ticketId, ticket, onLeave, isVolunteer, lang }: { ticketId: string, ticket: Ticket, onLeave: () => void, isVolunteer: boolean, lang: Language }) => {
  const t = CONTENT[lang].humanRole;
  const { messages, addMessage, volunteerProfile, tickets, endSession, deleteTicket } = useAppContext();
  const [text, setText] = useState("");
  const [showWarning, setShowWarning] = useState(true);
  
  // LIVE TICKET UPDATE: Find the real-time version of this ticket from context
  const liveTicket = tickets.find(t => t.id === ticketId) || ticket;
  const chatMessages = messages.filter(m => m.ticketId === ticketId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [chatMessages, liveTicket.status]);

  const handleSend = () => {
    if (!text.trim()) return;
    const senderName = isVolunteer ? volunteerProfile.name : "User";
    
    addMessage(ticketId, {
      text,
      isUser: !isVolunteer,
      sender: senderName,
      timestamp: Date.now(),
      isVerified: isVolunteer && volunteerProfile.isVerified
    });
    setText("");
  };

  const handleEndChat = async () => {
      if(window.confirm(t.endChatConfirm)) {
          await endSession(ticketId);
          onLeave();
      }
  };

  const handleCancelWait = async () => {
      // PERMANENTLY DELETE TICKET TO CLEAN UP QUEUE
      await deleteTicket(ticketId);
      onLeave();
  };

  // --- 1. WAITING ROOM VIEW (For Citizen) ---
  if (!isVolunteer && liveTicket.status === 'waiting') {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center animate-fade-in">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"/>
                  <User size={40} className="text-emerald-600 dark:text-emerald-400"/>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.waitingTitle}</h2>
              <p className="text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">{t.waitingMessage}</p>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-left w-full max-w-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tips</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2"><Music size={16}/> 試下深呼吸練習放鬆心情</div>
              </div>
              <button onClick={handleCancelWait} className="mt-8 text-slate-400 text-sm hover:text-slate-600">{(t as any).cancelWait || "取消等待"}</button>
          </div>
      );
  }

  // --- 2. ENDED SESSION VIEW ---
  if (liveTicket.status === 'resolved') {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center animate-fade-in">
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-slate-400"/>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.caseResolved}</h2>
              <button onClick={onLeave} className="mt-6 px-8 py-3 bg-slate-800 text-white rounded-xl font-bold">返回首頁</button>
          </div>
      );
  }

  // --- 3. ACTIVE CHAT VIEW ---
  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 p-4 shadow-sm flex justify-between items-center z-20">
         <div className="flex items-center gap-3">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isVolunteer ? 'bg-teal-100 text-teal-600' : 'bg-pink-100 text-pink-600'}`}>
             {isVolunteer ? <User size={20}/> : <Heart size={20}/>}
           </div>
           <div>
             <h3 className="font-bold dark:text-white">
                 {isVolunteer ? ticket.name : (liveTicket.volunteerName || t.joinedTitle)}
             </h3>
             <span className="text-xs text-emerald-500 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> Live Session</span>
           </div>
         </div>
         <button onClick={handleEndChat} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-bold rounded-full transition-colors flex items-center gap-1">
             <Trash2 size={14}/> {CONTENT[lang].actions.endChat}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950">
         {showWarning && (
             <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl text-xs text-yellow-700 dark:text-yellow-400 mb-6 text-center mx-auto max-w-lg border border-yellow-100 dark:border-yellow-900/30 relative">
                {t.chatReminder}
                <button onClick={() => setShowWarning(false)} className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-600">
                    <X size={14}/>
                </button>
             </div>
         )}
         <div className="max-w-3xl mx-auto">
            {chatMessages.map(msg => {
                // ALIGNMENT LOGIC:
                // If I am Volunteer (isVolunteer=true): My msgs are `isUser=false`. So `isMe` = !msg.isUser
                // If I am Citizen (isVolunteer=false): My msgs are `isUser=true`. So `isMe` = msg.isUser
                const isMe = isVolunteer ? !msg.isUser : msg.isUser;
                
                // We pass `isMe` into the `isUser` prop of ChatBubble to control alignment (Right=Me, Left=Them)
                return <ChatBubble key={msg.id} {...msg} isUser={isMe} />;
            })}
            <div ref={messagesEndRef}/>
         </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 shadow-up">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="max-w-3xl mx-auto flex gap-2">
           <input value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-6 h-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" placeholder={t.placeholder}/>
           <button type="submit" className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-105 transition-transform"><Send size={20}/></button>
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
  const { createTicket, updateTicketStatus, volunteerProfile } = useAppContext();

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const handleRoleSelect = (sel: string) => { if (sel === 'citizen-ai') { setRole('citizen'); setView('ai-chat'); } else if (sel === 'citizen-human') { setRole('citizen'); setView('intake'); } else if (sel === 'volunteer-login') { setView('volunteer-auth'); } };
  
  // Immediately set local ticket to avoid White Page while waiting for DB sync
  const handleIntakeComplete = async (n: string, i: string, p: Priority, t: string[]) => { 
      const ticketId = await createTicket(n, i, p, t); 
      const tempTicket: Ticket = {
          id: ticketId, name: n, issue: i, priority: p, status: 'waiting', time: 'Now', tags: t, createdAt: Date.now()
      };
      setCurrentTicket(tempTicket); 
      setView('human-chat'); 
  };

  const handleVolunteerJoin = (t: Ticket) => { 
      updateTicketStatus(t.id, 'active', volunteerProfile.name, volunteerProfile.name); 
      setCurrentTicket(t); 
      setView('human-chat'); 
  };

  return (
    <ErrorBoundary>
      <div className={`w-full h-full min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
          <div className="w-full h-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden font-sans">
              {view === 'intro' && <IntroScreen onStart={() => setView('landing')} lang={lang} toggleLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')} theme={theme} toggleTheme={toggleTheme} />}
              {view === 'landing' && <LandingScreen onSelectRole={handleRoleSelect} lang={lang} toggleLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')} theme={theme} toggleTheme={toggleTheme} onShowIntro={() => setView('intro')} />}
              {view === 'ai-chat' && <AIChat onBack={() => setView('landing')} lang={lang} />}
              {view === 'intake' && <IntakeForm onComplete={handleIntakeComplete} onBack={() => setView('landing')} lang={lang} />}
              {view === 'volunteer-auth' && <VolunteerAuth onBack={() => setView('landing')} onLoginSuccess={() => { setRole('volunteer'); setView('volunteer-guidelines'); }} lang={lang} />}
              {view === 'volunteer-guidelines' && <VolunteerGuidelines onConfirm={() => setView('volunteer-dashboard')} onBack={() => setView('landing')} lang={lang} />}
              {view === 'volunteer-dashboard' && <VolunteerDashboard onBack={() => setView('landing')} onJoinChat={handleVolunteerJoin} lang={lang} />}
              {/* Pass whole ticket object to avoid async lookup failure */}
              {view === 'human-chat' && currentTicket && (<HumanChat ticketId={currentTicket.id} ticket={currentTicket} onLeave={() => setView(role === 'volunteer' ? 'volunteer-dashboard' : 'landing')} isVolunteer={role === 'volunteer'} lang={lang} />)}
          </div>
      </div>
    </ErrorBoundary>
  );
};

export default function App() { return <AppProvider><MainLayout /></AppProvider>; }
