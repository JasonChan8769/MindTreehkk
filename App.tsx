import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { 
  MessageCircle, User, Heart, Shield, Clock, CheckCircle, Menu, X, Send, Bot, 
  Users, AlertCircle, Globe, Wifi, Lock, BadgeCheck, Flag, AlertTriangle, 
  ArrowRight, ArrowLeft, Trees, BookOpen, Coffee, Info, UserCheck, XCircle, LogOut,
  Moon, Sun, HelpCircle, ChevronRight, MessageSquarePlus, Link, ExternalLink, Share2,
  Wind, Home, Play, Pause, Volume2, VolumeX, Sparkles, MessageSquare, HandHeart, Smartphone,
  Mail, ThumbsUp, Music
} from 'lucide-react';

// --- 1. TYPES & INTERFACES ---

export type Language = 'zh' | 'en';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Message {
  id: number | string;
  text: string;
  isUser: boolean;
  sender: string;
  timestamp: number;
  isVerified?: boolean;
}

export interface Ticket {
  id: string;
  name: string;
  issue: string;
  priority: Priority;
  status: 'waiting' | 'active' | 'resolved';
  time: string;
  tags: string[];
}

export interface VolunteerProfile {
  name: string;
  role: string;
  isVerified: boolean;
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

const COMFORT_SYMBOLS = ["🌿", "🕊️", "✨", "🤍", "🌱", "☂️", "🌤️", "🌕", "🍃", "💫"];

const SUGGESTED_PROMPTS = {
  zh: ["我覺得好不安...", "我想搵人傾計", "最近訓得唔好", "對於未來好迷惘"],
  en: ["I feel anxious...", "I need to talk", "Can't sleep well", "Confused about future"]
};

// Useful Links (Updated)
const USEFUL_LINKS = [
  { id: 1, title: { zh: "社會福利署熱線 (24小時)", en: "SWD Hotline (24hr)" }, url: "https://www.swd.gov.hk", category: "support" },
  { id: 2, title: { zh: "香港撒瑪利亞防止自殺會", en: "The Samaritans HK" }, url: "https://sbhk.org.hk", category: "support" },
  { id: 3, title: { zh: "醫院管理局精神健康專線", en: "HA Mental Health Hotline" }, url: "https://www3.ha.org.hk", category: "support" },
  { id: 4, title: { zh: "Shall We Talk", en: "Shall We Talk" }, url: "https://shallwetalk.hk", category: "app" },
  { id: 5, title: { zh: "香港紅十字會 (心理支援)", en: "HK Red Cross (Support)" }, url: "https://www.redcross.org.hk/en/services/psychological_support_service.html", category: "support" },
  { id: 6, title: { zh: "賽馬會「開聲」情緒支援", en: "Jockey Club Open Up" }, url: "https://www.openup.hk/", category: "app" },
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
      volunteerCard: { title: "加入義工團隊", desc: "成為別人的祕密樹窿" },
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
      waitingMessage: "正在為你配對最合適的義工，請稍候...",
      systemJoin: "系統訊息：輔導員已加入",
      headerVerified: "認證輔導員",
      headerPeer: "同行者義工",
      report: "舉報",
      caseResolved: "對話已結束。希望你有好過一點。",
      placeholder: "輸入訊息..."
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
      unsafe: "未能發佈：內容可能包含不當用語，請保持友善。"
    },
    volunteer: {
      login: "義工登入",
      authTitle: "義工專區",
      disclaimer: "感謝你的無私奉獻。請遵守義工守則。",
      nameLabel: "稱呼",
      namePlaceholder: "例如：陳大文",
      joinBtn: "進入控制台",
      proJoinTitle: "專業人員通道",
      codePlaceholder: "輸入存取碼",
      verifyBtn: "驗證",
      errorMsg: "存取碼錯誤",
      guidelinesTitle: "服務守則",
      guidelinesDesc: "專業 • 同理 • 保密",
      rule1Title: "專注聆聽",
      rule1Desc: "不急於批判或建議，給予空間。",
      rule2Title: "自我覺察",
      rule2Desc: "留意自身情緒，適時休息。",
      rule3Title: "危機處理",
      rule3Desc: "遇自毀風險，立即啟動緊急程序。",
      acknowledgeBtn: "我同意",
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
      submit: "開始配對"
    },
    links: {
      btn: "資源",
      title: "社區資源",
      desc: "專業機構聯絡方式、醫院捐款及義工招募。",
      close: "關閉"
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
      waitingMessage: "Connecting you with a counselor...",
      systemJoin: "System: Counselor joined",
      headerVerified: "Verified Counselor",
      headerPeer: "Peer Volunteer",
      report: "Report",
      caseResolved: "Session ended. Take care.",
      placeholder: "Type message..."
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
      unsafe: "Blocked: Inappropriate content detected."
    },
    volunteer: {
      login: "Volunteer Access",
      authTitle: "Volunteer Portal",
      disclaimer: "Thank you for your service.",
      nameLabel: "Name",
      namePlaceholder: "e.g., Alex",
      joinBtn: "Enter Dashboard",
      proJoinTitle: "Professional Login",
      codePlaceholder: "Access Code",
      verifyBtn: "Verify",
      errorMsg: "Invalid Code",
      guidelinesTitle: "Guidelines",
      guidelinesDesc: "Professional • Empathetic • Safe",
      rule1Title: "Active Listening",
      rule1Desc: "Listen more, advise less.",
      rule2Title: "Self Awareness",
      rule2Desc: "Monitor your own well-being.",
      rule3Title: "Emergency",
      rule3Desc: "Report self-harm risks immediately.",
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
      submit: "Connect"
    },
    links: {
      btn: "Resources",
      title: "Resources",
      desc: "Help, Donation & Volunteering",
      close: "Close"
    },
    feedback: {
      title: "Feedback",
      desc: "Your feedback is important to us.",
      placeholder: "How can we improve?",
      submit: "Send",
      thanks: "Thank you! Sent to database."
    },
    breath: {
      inhale: "Inhale",
      hold: "Hold",
      exhale: "Exhale",
      relax: "Relax Your Mind",
      musicOn: "Music On",
      musicOff: "Muted",
      playErr: "Tap to Play Music"
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

// --- 3. SERVICES (Internal Implementation) ---

// Synchronous Safety Check (Restored to fix "no reaction")
const checkContentSafety = (text: string) => {
  const badWords = ["die", "kill", "死", "自殺", "殺", "idiot", "stupid", "hate", "fuck", "shit"];
  const lower = text.toLowerCase();
  const hasBadWord = badWords.some(word => lower.includes(word));
  if (hasBadWord) {
    return { safe: false, reason: "Content contains inappropriate words." };
  }
  return { safe: true, reason: null };
};

// Async AI Scanner for Memo (Simulated)
const scanContentWithAI = async (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const check = checkContentSafety(text);
      resolve(check.safe);
    }, 1500); 
  });
};

const SYSTEM_PROMPTS = {
  zh: `你係「MindTree 樹洞」，一個有溫度、有思想嘅數碼同伴。
1. **講野似真人**：用自然嘅廣東話口語（例如：真係好難過、唔好咁諗、係咪...）。
2. **要有自己嘅諗法**：唔好淨係重複用戶講嘅野。
3. **禁止機械式回應**：絕對唔好講「作為一個 AI...」。
4. **主動關心**：每次回應完，試下用一個溫柔、相關嘅問題結尾。
5. **安全底線**：如果對方提及自殺，建議打 999。`,
  en: `You are MindTree, a thoughtful digital companion.
1. **Speak Naturally:** Use casual English.
2. **No Robot Speak:** NEVER say "As an AI language model".
3. **Be Proactive:** End responses with a gentle question.
4. **Safety First:** If self-harm is mentioned, suggest 999.`
};

const generateAIResponse = async (history: Message[], lang: 'zh' | 'en'): Promise<string> => {
  try {
    const systemInstruction = SYSTEM_PROMPTS[lang];
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.isUser ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Using Backend API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: recentHistory,
        systemInstruction: systemInstruction 
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Thinking...";

  } catch (error: any) {
    console.error("AI Service Error:", error);
    return lang === 'zh' 
      ? `[系統訊息] 連線發生錯誤。(${error.message})` 
      : `[System Error] Connection failed. (${error.message})`;
  }
};

// --- 4. CONTEXT (State Management) ---

interface AppContextType {
  tickets: Ticket[];
  createTicket: (name: string, issue: string, priority: Priority, tags: string[]) => Ticket;
  updateTicketStatus: (id: string, status: 'waiting' | 'active' | 'resolved') => void;
  messages: Record<string, Message[]>;
  addMessage: (ticketId: string, message: Message) => void;
  getMessages: (ticketId: string) => Message[];
  volunteerProfile: VolunteerProfile;
  setVolunteerProfile: (profile: VolunteerProfile) => void;
  publicMemos: { id: number, text: string, style: any }[];
  addPublicMemo: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>({ name: "", role: "", isVerified: false });
  const [publicMemos, setPublicMemos] = useState<{ id: number, text: string, style: any }[]>([]);

  const createTicket = (name: string, issue: string, priority: Priority, tags: string[]) => {
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      issue,
      priority,
      status: 'waiting',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tags
    };
    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicketStatus = (id: string, status: 'waiting' | 'active' | 'resolved') => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const addMessage = (ticketId: string, message: Message) => {
    setMessages(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), message]
    }));
  };

  const getMessages = (ticketId: string) => messages[ticketId] || [];

  const addPublicMemo = (text: string) => {
    console.log("Public Memo Added to DB:", text);
  };

  return (
    <AppContext.Provider value={{ tickets, createTicket, updateTicketStatus, messages, addMessage, getMessages, volunteerProfile, setVolunteerProfile, publicMemos, addPublicMemo }}>
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

const stripAITag = (text: string | undefined) => {
  if (typeof text !== 'string') return "";
  return text.replace(/\s*\(AI\)/g, '');
};

const Notification = ({ message, type, onClose }: { message: string, type: 'error' | 'info' | 'loading', onClose: () => void }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-500/90' : (type === 'loading' ? 'bg-indigo-500/90' : 'bg-teal-600/90');
  
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] ${bgColor} backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in max-w-md w-full mx-4 border border-white/10`}>
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
    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/80 dark:bg-white/5 border border-white/20 shadow-sm flex items-center gap-1 backdrop-blur-sm">
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

  const userBubbleStyle = "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm shadow-md border-transparent";
  const aiBubbleStyle = "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm";
  const peerBubbleStyle = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm";

  let bubbleClass = isUser ? userBubbleStyle : (isAI ? aiBubbleStyle : peerBubbleStyle);
  const displaySender = stripAITag(sender);

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-6 animate-fade-in group`}>
      <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
          isUser 
            ? 'bg-indigo-100 border-indigo-200 text-indigo-600' 
            : (isAI 
                ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-white/10 dark:border-white/10 dark:text-teal-400' 
                : 'bg-white border-slate-200 text-pink-500')
        }`}>
          {isUser ? <User size={16} /> : (isAI ? <Trees size={16} /> : <Heart size={16} />)}
        </div>
        <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed relative ${bubbleClass}`}>
          {text}
          {!isUser && !isAI && (
             isVerified 
             ? <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-slate-900 flex items-center gap-0.5 shadow-sm"><BadgeCheck size={8} /> PRO</div>
             : <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-slate-900 flex items-center gap-0.5 shadow-sm"><UserCheck size={8} /> PEER</div>
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
    
    // Attempt play on mount
    if(audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex items-center justify-center animate-fade-in overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-black opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent animate-pulse" style={{ animationDuration: '12s' }}></div>

      {/* Relaxing Nature Sound */}
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=forest-lullaby-110624.mp3" type="audio/mpeg" />
      </audio>

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
        <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 text-white/70 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all backdrop-blur-md border border-white/5"><X size={24} /></button>
        
        <div className="absolute top-8 left-8 flex gap-4">
           <button onClick={toggleAudio} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all backdrop-blur-md border text-xs font-bold uppercase tracking-widest ${!isPlaying ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 animate-pulse' : 'bg-white/5 text-white/70 border-white/5'}`}>
              {isPlaying ? <Volume2 size={16} /> : <Music size={16} />}
              <span>{isPlaying ? t.musicOn : t.playErr}</span>
           </button>
        </div>

        <div className="relative flex items-center justify-center">
           <svg className="absolute w-[340px] h-[340px] rotate-[-90deg] pointer-events-none">
              <circle cx="170" cy="170" r={radius} stroke="white" strokeWidth="2" fill="transparent" opacity="0.1" />
              <circle 
                cx="170" cy="170" r={radius} 
                stroke="url(#gradient)" 
                strokeWidth="4" 
                fill="transparent" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-100 linear"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
           </svg>

           <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out relative ${stage === 'Inhale' ? 'scale-125 shadow-[0_0_100px_rgba(45,212,191,0.4)] bg-teal-500/20' : stage === 'Exhale' ? 'scale-75 bg-indigo-500/10' : 'scale-100 bg-white/10'}`}>
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
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    // Simulate DB connection
    console.log("Sending Feedback to Database:", text);
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><MessageCircle size={24} className="text-indigo-500"/> {t.title}</h3>
        <p className="text-xs text-slate-500 mb-6">{t.desc}</p>
        
        {sent ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4 animate-bounce"/>
            <p className="text-slate-600 dark:text-slate-300 font-bold">{t.thanks}</p>
          </div>
        ) : (
          <>
            <textarea 
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder={t.placeholder} 
              className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none resize-none focus:ring-2 focus:ring-indigo-500 mb-4 dark:text-white"
            />
            <button onClick={handleSubmit} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
              {t.submit}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// --- SCREENS ---

const IntroScreen = ({ onStart, lang, toggleLang, theme, toggleTheme }: { onStart: () => void, lang: Language, toggleLang: () => void, theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const t = CONTENT[lang].intro;
  const [step, setStep] = useState(0);

  const steps = [
    { title: t.welcome, desc: t.desc, icon: <Trees className="text-emerald-500 w-24 h-24" /> },
    { title: t.slide1Title, desc: t.slide1Desc, icon: <Bot className="text-indigo-500 w-24 h-24" /> },
    { title: t.slide2Title, desc: t.slide2Desc, icon: <Shield className="text-teal-500 w-24 h-24" /> }
  ];

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-teal-500/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

      <div className="w-full flex justify-end gap-3 p-6 z-20 shrink-0">
        <button onClick={toggleLang} className="flex items-center gap-1 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/20 dark:border-white/10 shadow-sm transition-all hover:bg-white/80 dark:text-white"><Globe size={12} /> {lang === 'zh' ? 'EN' : '繁體'}</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full text-center z-10">
        <div className="mb-10 p-12 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-indigo-500/10 border border-white/20 animate-float">
          {steps[step].icon}
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-6 tracking-tight animate-fade-in" key={`title-${step}`}>{steps[step].title}</h2>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in max-w-xs mx-auto" key={`desc-${step}`}>{steps[step].desc}</p>
        
        <div className="flex gap-2 mt-12 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-slate-800 dark:bg-white' : 'w-2 bg-slate-300 dark:bg-slate-700'}`} />
          ))}
        </div>
      </div>

      <div className="p-8 pb-12 z-10 max-w-md mx-auto w-full shrink-0">
        <button 
          onClick={() => { if (step < steps.length - 1) setStep(s => s + 1); else onStart(); }}
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-sm tracking-wide uppercase"
        >
          {step < steps.length - 1 ? <ArrowRight size={20} /> : t.startBtn}
        </button>
      </div>
    </div>
  );
};

const LandingScreen = ({ onSelectRole, lang, toggleLang, theme, toggleTheme, onShowIntro }: { onSelectRole: (role: string) => void, lang: Language, toggleLang: () => void, theme: 'light' | 'dark', toggleTheme: () => void, onShowIntro: () => void }) => {
  const t = CONTENT[lang];
  const { addPublicMemo } = useAppContext();
  const [showMemoInput, setShowMemoInput] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showBreath, setShowBreath] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'info' | 'loading'} | null>(null);
  const [floatingBubbles, setFloatingBubbles] = useState<{id: number, text: string, style: any}[]>([]);

  useEffect(() => {
    const shuffledQuotes = [...AI_QUOTES].sort(() => 0.5 - Math.random());
    const selectedQuotes = shuffledQuotes.slice(0, 15);
    const bubbles = selectedQuotes.map((quote, index) => {
        const randomSymbol = COMFORT_SYMBOLS[Math.floor(Math.random() * COMFORT_SYMBOLS.length)];
        const textWithSymbol = Math.random() > 0.5 ? `${randomSymbol} ${quote}` : `${quote} ${randomSymbol}`;
        return {
            id: index, text: textWithSymbol,
            style: { left: `${Math.random() * 90}%`, animationDuration: `${30 + Math.random() * 20}s`, animationDelay: `${Math.random() * 10}s`, scale: 0.8 + Math.random() * 0.3 }
        };
    });
    setFloatingBubbles(bubbles);
  }, []);

  const handlePostMemo = async () => {
    if (!memoText.trim()) return;
    
    // AI Safety Scanner Simulation
    setNotification({ message: t.memo.scanning, type: 'loading' });
    const isSafe = await scanContentWithAI(memoText);
    
    if (!isSafe) {
      setNotification({ message: t.memo.unsafe, type: 'error' });
      return;
    }

    addPublicMemo(memoText); 
    setMemoText(""); 
    setShowMemoInput(false);
    setNotification({ message: t.memo.success, type: 'info' }); 
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-500 font-sans">
      <Notification message={notification?.message || ""} type={notification?.type || 'info'} onClose={() => setNotification(null)} />
      {showBreath && <BreathingExercise onClose={() => setShowBreath(false)} lang={lang} />}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} lang={lang} />}

      {/* Modern Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-white to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/30 z-0" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="relative w-full h-full">
            {floatingBubbles.map((memo) => (
            <div key={memo.id} className="absolute text-center animate-float select-none will-change-transform opacity-60" style={{ left: memo.style.left, animationDuration: memo.style.animationDuration, animationDelay: memo.style.animationDelay, bottom: -50 }}>
                <span className="inline-block bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm" style={{ transform: `scale(${memo.style.scale})` }}>{memo.text}</span>
            </div>
            ))}
        </div>
      </div>

      {/* Header */}
      <div className="w-full flex justify-between items-center p-6 z-20 shrink-0">
        <div className="flex flex-col">
           <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t.appTitle}</h1>
           <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">{t.appSubtitle}</span>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setShowFeedback(true)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform" title={t.landing.feedback}><MessageSquare size={18} /></button>
           <button onClick={toggleLang} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"><Globe size={18} /></button>
           <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 w-full overflow-y-auto z-10 px-6 pb-24 no-scrollbar">
        <div className="max-w-md mx-auto">
            
            <h2 className="text-slate-800 dark:text-white font-bold text-lg mb-4 flex items-center gap-2"><Trees size={18} className="text-indigo-500"/> {t.landing.servicesTitle}</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
               {/* AI Card */}
               <button onClick={() => onSelectRole('citizen-ai')} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg shadow-indigo-500/5 border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all group text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-[100%] z-0" />
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30 z-10"><Bot size={32} /></div>
                  <div className="z-10">
                     <div className="font-bold text-xl text-slate-800 dark:text-white mb-1">{t.landing.aiCard.title}</div>
                     <div className="text-slate-500 text-xs font-medium">{t.landing.aiCard.desc}</div>
                  </div>
                  <div className="ml-auto text-slate-300 z-10"><ChevronRight size={24}/></div>
               </button>

               {/* Human Card */}
               <button onClick={() => onSelectRole('citizen-human')} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg shadow-pink-500/5 border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:shadow-xl hover:scale-[1.02] transition-all group text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 dark:bg-pink-900/10 rounded-bl-[100%] z-0" />
                  <div className="w-16 h-16 rounded-2xl bg-pink-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/30 z-10"><Heart size={32} /></div>
                  <div className="z-10">
                     <div className="font-bold text-xl text-slate-800 dark:text-white mb-1">{t.landing.humanCard.title}</div>
                     <div className="text-slate-500 text-xs font-medium">{t.landing.humanCard.desc}</div>
                  </div>
                  <div className="ml-auto text-slate-300 z-10"><ChevronRight size={24}/></div>
               </button>
            </div>

            {/* Breathing Exercise Card */}
            <div className="mb-8">
               <button onClick={() => setShowBreath(true)} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-6 rounded-[2rem] shadow-xl shadow-teal-500/30 flex items-center justify-between group hover:scale-[1.02] transition-transform relative overflow-hidden">
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="text-left relative z-10">
                     <div className="font-black text-xl mb-1 flex items-center gap-2"><Sparkles size={20}/> {t.landing.breathTitle}</div>
                     <div className="text-teal-100 text-xs font-medium bg-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-sm">{t.landing.breathDesc}</div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform backdrop-blur-sm border border-white/20 relative z-10"><Play size={20} fill="white" /></div>
               </button>
            </div>

            {/* Volunteer Card - Enhanced Style */}
            <button onClick={() => onSelectRole('volunteer-login')} className="w-full bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-1 rounded-[2rem] shadow-lg shadow-slate-500/10 hover:shadow-xl transition-all group mb-8">
               <div className="bg-slate-50 dark:bg-slate-900 rounded-[1.8rem] p-5 flex items-center gap-5 h-full w-full">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors"><HandHeart size={24} /></div>
                  <div className="flex-1 text-left">
                     <div className="font-bold text-base text-slate-800 dark:text-white">{t.landing.volunteerCard.title}</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400">{t.landing.volunteerCard.desc}</div>
                  </div>
                  <div className="text-slate-300"><ArrowRight size={20}/></div>
               </div>
            </button>

            <div className="flex gap-4">
               <button onClick={() => setShowMemoInput(true)} className="flex-1 py-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors">
                  <MessageSquarePlus size={20} /> {t.memo.label}
               </button>
               <button onClick={() => setShowResources(true)} className="flex-1 py-4 rounded-2xl bg-teal-50 dark:bg-teal-900/10 text-teal-600 dark:text-teal-400 font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-teal-100 dark:hover:bg-teal-900/20 transition-colors">
                  <Link size={20} /> {t.links.btn}
               </button>
            </div>
        </div>
      </div>

      {showMemoInput && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-slide-up sm:animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><MessageSquarePlus size={24} className="text-indigo-500" /> {t.memo.title}</h3>
            <p className="text-xs text-slate-500 mb-6 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">{t.memo.desc}</p>
            <textarea value={memoText} onChange={(e) => setMemoText(e.target.value)} placeholder={t.memo.placeholder} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-base focus:ring-2 focus:ring-indigo-500 mb-6 h-32 resize-none text-slate-900 dark:text-white placeholder:text-slate-400" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowMemoInput(false)} className="flex-1 py-4 text-slate-500 font-bold text-sm bg-slate-100 dark:bg-slate-800 rounded-xl">{t.actions.cancel}</button>
              <button onClick={handlePostMemo} className="flex-1 py-4 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30">{t.memo.btn}</button>
            </div>
          </div>
        </div>
      )}

      {showResources && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Link size={20} className="text-teal-500" /> {t.links.title}</h3>
                 <button onClick={() => setShowResources(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><X size={16}/></button>
              </div>
              <p className="text-xs text-slate-500 mb-4 px-1">{t.links.desc}</p>
              <div className="space-y-3">
                {USEFUL_LINKS.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-transparent hover:border-teal-100 dark:hover:border-teal-900">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${link.category === 'support' ? 'bg-red-50 text-red-500' : (link.category === 'app' ? 'bg-indigo-50 text-indigo-500' : (link.category === 'donation' ? 'bg-amber-50 text-amber-500' : 'bg-teal-50 text-teal-500'))}`}>
                            {link.category === 'support' ? <Shield size={16} /> : (link.category === 'app' ? <Smartphone size={16} /> : (link.category === 'donation' ? <Heart size={16} /> : <UserCheck size={16} />))}
                         </div>
                         <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{link.title[lang]}</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-500" />
                  </a>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const AIChat = ({ onBack, lang }: { onBack: () => void, lang: Language }) => {
  const t = CONTENT[lang];
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: t.aiRole.welcome, isUser: false, sender: stripAITag(t.aiRole.title), timestamp: Date.now() }]);
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
    
    const userMsg: Message = { id: Date.now(), text: inputText, isUser: true, sender: lang === 'zh' ? "我" : "Me", timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    
    try {
      const aiText = await generateAIResponse([...messages, userMsg], lang);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, isUser: false, sender: stripAITag(t.aiRole.title), timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection error. Please try again.", isUser: false, sender: "System", timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <Notification message={notification?.message || ""} type={notification?.type || 'info'} onClose={() => setNotification(null)} />
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex items-center justify-between shadow-sm z-20 sticky top-0">
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
            <button key={prompt} onClick={() => { setInputText(prompt); handleSend(); }} className="whitespace-nowrap px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-colors shadow-sm">
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-20 pb-8">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-[2rem] px-2 py-2 border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-inner">
          <input className="flex-1 bg-transparent text-base text-slate-900 dark:text-white focus:outline-none px-4 min-h-[44px] placeholder:text-slate-400" value={inputText} onChange={e => setInputText(e.target.value)} placeholder={t.aiRole.placeholder} autoFocus />
          <button type="submit" disabled={!inputText.trim() || isTyping} className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:scale-100 hover:scale-105 transition-all shadow-md"><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
};

const IntakeForm = ({ onComplete, onBack, lang }: { onComplete: (name: string, issue: string, priority: Priority, tags: string[], safetySafe: boolean) => void, onBack: () => void, lang: Language }) => {
  const t = CONTENT[lang];
  const [userName, setUserName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [distress, setDistress] = useState(3);
  const [category, setCategory] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {
    let priority: Priority = 'low';
    if (category === t.intake.q4_opt4) priority = 'critical';
    else if (distress >= 5) priority = 'high';
    else if (distress >= 3) priority = 'medium';

    const tags = [];
    if (distress >= 4) tags.push("High Distress");
    if (category) tags.push(category);

    const issueSummary = `${category} (Lv:${distress}) ${remarks ? `- ${remarks}` : ''}`;
    const displayName = `${userName || "Anonymous"} (${gender === "Male" || gender === "男" ? "M" : "F"}, ${ageRange})`;

    onComplete(displayName, issueSummary, priority, tags, true);
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 p-6 shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><ArrowLeft size={20} /></button>
            <div><h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.intake.title}</h2><p className="text-xs text-slate-500">{t.intake.desc}</p></div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-xl mx-auto space-y-8 pb-12">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">{t.intake.q1}</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder={t.intake.q1_placeholder} className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">{t.intake.q_age}</label>
                    <div className="relative"><select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 appearance-none focus:border-indigo-500 outline-none"><option value="" disabled>-</option>{t.intake.q_age_opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select><ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} /></div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1">{t.intake.q_gender}</label>
                    <div className="relative"><select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 appearance-none focus:border-indigo-500 outline-none"><option value="" disabled>-</option>{t.intake.q_gender_opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select><ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} /></div>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 ml-1">{t.intake.q3}</label>
                <div className="relative w-full h-12 flex items-center">
                  <input type="range" min="1" max="5" step="1" value={distress} onChange={(e) => setDistress(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-indigo-600 z-10" />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest"><span>Calm</span><span>Crisis</span></div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 ml-1">{t.intake.q4}</label>
                <div className="grid grid-cols-1 gap-3">
                    {[t.intake.q4_opt1, t.intake.q4_opt2, t.intake.q4_opt3, t.intake.q4_opt4].map(opt => (
                    <button key={opt} onClick={() => setCategory(opt)} className={`py-4 px-6 rounded-2xl text-left text-sm font-bold border-2 transition-all ${category === opt ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>{opt}</button>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t.intake.q5}</label>
                <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={t.intake.q5_placeholder} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white dark:placeholder-slate-600 resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={!category || !userName.trim() || !ageRange || !gender} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold py-5 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] text-lg tracking-wide">
                {t.intake.submit} <ArrowRight size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

const VolunteerAuth = ({ onBack, onLoginSuccess, lang }: { onBack: () => void, onLoginSuccess: () => void, lang: Language }) => {
  const t = CONTENT[lang];
  const [nameInput, setNameInput] = useState("");
  const [code, setCode] = useState("");
  const [showPro, setShowPro] = useState(false);
  const { setVolunteerProfile } = useAppContext();

  const handleQuickJoin = () => {
    if (!nameInput.trim()) return;
    setVolunteerProfile({ name: nameInput, role: "Peer Listener", isVerified: false });
    onLoginSuccess();
  };

  const handleProLogin = () => {
    if (code === "HELP2025" || code === "ADMIN") {
      setVolunteerProfile({ name: nameInput || "Staff", role: "Social Worker", isVerified: true });
      onLoginSuccess();
    } else {
      alert(t.volunteer.errorMsg);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-indigo-900 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-800 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-teal-800 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl flex flex-col relative z-10 animate-fade-in border border-white/10">
        <button onClick={onBack} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={24}/></button>
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 mx-auto"><Lock size={32} /></div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t.volunteer.authTitle}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 leading-relaxed">{t.volunteer.disclaimer}</p>
        <div className="text-left mb-6">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide ml-1">{t.volunteer.nameLabel}</label>
          <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder={t.volunteer.namePlaceholder} className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base focus:border-indigo-500 focus:outline-none transition-colors bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:text-white" />
        </div>
        <button onClick={handleQuickJoin} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 mb-8 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98]">
          <UserCheck size={20} /> {t.volunteer.joinBtn}
        </button>
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <button onClick={() => setShowPro(!showPro)} className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center justify-center gap-1 w-full hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">{t.volunteer.proJoinTitle} {showPro ? '▲' : '▼'}</button>
          {showPro && (
            <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-5 rounded-xl animate-fade-in border border-slate-100 dark:border-slate-700">
              <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t.volunteer.codePlaceholder} className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-2.5 text-sm mb-3 text-center uppercase tracking-widest text-slate-900 dark:text-white" />
              <button onClick={handleProLogin} className="w-full bg-slate-800 dark:bg-slate-900 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-slate-900 dark:hover:bg-black transition-colors">{t.volunteer.verifyBtn}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VolunteerGuidelines = ({ onConfirm, onBack, lang }: { onConfirm: () => void, onBack: () => void, lang: Language }) => {
  const t = CONTENT[lang];
  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <header className="bg-indigo-900 dark:bg-slate-900 text-white p-8 shadow-lg relative">
        <div className="max-w-4xl mx-auto flex items-center justify-center relative">
            <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"><ArrowLeft size={24} /></button>
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10"><BookOpen size={32} /></div>
                <h2 className="text-2xl font-bold text-center">{t.volunteer.guidelinesTitle}</h2>
            </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto w-full space-y-6">
            <p className="text-slate-600 dark:text-slate-300 text-base text-center mb-6 font-medium bg-white dark:bg-slate-900 py-3 px-6 rounded-full w-fit mx-auto shadow-sm">{t.volunteer.guidelinesDesc}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-t-4 border-indigo-500 shadow-sm animate-fade-in hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2"><MessageCircle size={20} className="text-indigo-500" /> {t.volunteer.rule1Title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.volunteer.rule1Desc}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-t-4 border-amber-500 shadow-sm animate-fade-in hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2"><Coffee size={20} className="text-amber-500" /> {t.volunteer.rule2Title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.volunteer.rule2Desc}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-t-4 border-red-500 shadow-sm animate-fade-in hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-red-900 dark:text-red-300 mb-3 flex items-center gap-2"><AlertTriangle size={20} className="text-red-500" /> {t.volunteer.rule3Title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.volunteer.rule3Desc}</p>
                </div>
            </div>
        </div>
      </div>
      <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-20">
        <div className="max-w-md mx-auto">
          <button onClick={onConfirm} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg">{t.volunteer.acknowledgeBtn} <ArrowRight size={20} /></button>
        </div>
      </div>
    </div>
  );
};

const VolunteerDashboard = ({ onBack, onJoinChat, lang }: { onBack: () => void, onJoinChat: (ticket: Ticket) => void, lang: Language }) => {
  const t = CONTENT[lang];
  const { tickets, volunteerProfile } = useAppContext();
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  const activeTickets = tickets.filter(t => t.status !== 'resolved');
  const sortedTickets = [...activeTickets].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 animate-pulse';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-indigo-900 dark:bg-slate-900 text-white p-6 shadow-md z-10 sticky top-0">
        <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold">{t.volunteer.portalTitle}</h1>
            <p className="text-sm text-indigo-200 flex items-center gap-2 mt-1">{t.volunteer.welcome}, <span className="font-semibold text-white">{volunteerProfile.name}</span>{volunteerProfile.isVerified ? <BadgeCheck size={16} className="text-green-400"/> : <UserCheck size={16} className="text-blue-300"/>}</p>
          </div>
          <button onClick={onBack} className="text-xs bg-indigo-800 border border-indigo-700 px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-bold uppercase tracking-wide"><LogOut size={14} /> {t.volunteer.exit}</button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base flex gap-2 items-center"><Users size={20} className="text-indigo-500" /> {t.volunteer.activeRequests}</h3>
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800">{tickets.filter(t => t.status === 'waiting').length} Cases Waiting</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedTickets.length === 0 ? (
                <div className="p-20 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center"><CheckCircle size={64} className="mb-6 opacity-20 text-indigo-500" /><p className="text-lg font-medium">{t.volunteer.noRequests}</p></div>
                ) : (
                sortedTickets.map(ticket => (
                <div key={ticket.id} className="p-6 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded text-xs font-black border uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>{t.volunteer.priority[ticket.priority] || ticket.priority}</span>
                            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-medium"><Clock size={14} /> {ticket.time}</div>
                        </div>
                        {ticket.status === 'waiting' ? (
                            <button onClick={() => onJoinChat(ticket)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 w-full md:w-auto">{t.volunteer.accept}</button>
                        ) : (
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-100 dark:border-green-800 w-fit"><CheckCircle size={14} /> Active Session</span>
                        )}
                    </div>
                    <div className="mb-3"><div className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-1">{ticket.name}</div></div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-4 group-hover:bg-white dark:group-hover:bg-slate-800/50 transition-colors">
                        <span className="font-semibold text-slate-500 dark:text-slate-500 text-xs block mb-1 uppercase tracking-wide">{t.volunteer.topic}</span>
                        {ticket.issue}
                    </div>
                    <div className="flex flex-wrap gap-2">{ticket.tags && ticket.tags.map((tag, i) => (<span key={i} className="text-xs bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">#{tag}</span>))}</div>
                </div>
                ))
                )}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const HumanChat = ({ ticketId, onLeave, isVolunteer, lang }: { ticketId: string, onLeave: () => void, isVolunteer: boolean, lang: Language }) => {
  const t = CONTENT[lang];
  const { addMessage, getMessages, updateTicketStatus, volunteerProfile, tickets } = useAppContext();
  const [inputText, setInputText] = useState("");
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  const messages = getMessages(ticketId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ticket = tickets.find(t => t.id === ticketId);

  useEffect(() => {
    if (messages.length === 0) {
      const initMsg = isVolunteer ? t.humanRole.systemJoin : t.humanRole.waitingMessage;
      addMessage(ticketId, { id: 'sys-init', text: initMsg, isUser: false, sender: "System", timestamp: Date.now() });
    }
  }, []);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault(); // Fix for form submission
    if (!inputText.trim()) return;
    const check = checkContentSafety(inputText);
    if (!check.safe) {
      setNotification({ message: check.reason || "Safety Alert", type: 'error' });
      return; 
    }
    addMessage(ticketId, { id: Date.now(), text: inputText, isUser: !isVolunteer, sender: isVolunteer ? volunteerProfile.name : "Me", isVerified: isVolunteer && volunteerProfile.isVerified, timestamp: Date.now() });
    setInputText("");
  };

  const handleEndChat = () => {
    if (window.confirm(isVolunteer ? t.dialogs.volLeaveMsg : t.dialogs.citEndMsg)) {
        if(isVolunteer) {
            addMessage(ticketId, { id: Date.now(), text: `${volunteerProfile.name} left.`, isUser: false, sender: "System", timestamp: Date.now() });
            updateTicketStatus(ticketId, 'waiting');
        } else {
            addMessage(ticketId, { id: Date.now(), text: t.humanRole.caseResolved, isUser: false, sender: "System", timestamp: Date.now() });
            updateTicketStatus(ticketId, 'resolved');
        }
        onLeave();
    }
  };

  if (!ticket) return null;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <Notification message={notification?.message || ""} type={notification?.type || 'info'} onClose={() => setNotification(null)} />
      <header className={`p-4 md:px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm z-20 sticky top-0 ${isVolunteer ? 'bg-indigo-900 text-white' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-full ${isVolunteer ? 'bg-indigo-800' : 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'}`}>{isVolunteer ? <User size={24} /> : <Heart size={24} />}</div>
          <div>
            <h2 className="font-bold text-base md:text-lg flex items-center gap-1">{isVolunteer ? ticket.name : (volunteerProfile.isVerified ? t.humanRole.headerVerified : t.humanRole.headerPeer)}{!isVolunteer && volunteerProfile.isVerified && (<BadgeCheck size={18} className="text-green-500 fill-green-100" />)}</h2>
            <p className={`text-xs ${isVolunteer ? 'text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>{isVolunteer ? `Issue: ${ticket.issue.substring(0, 40)}${ticket.issue.length > 40 ? '...' : ''}` : t.humanRole.systemJoin}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isVolunteer && (<button onClick={() => alert("Report submitted. Admins will review.")} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs md:text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"><Flag size={14} /> <span className="hidden md:inline">{t.humanRole.report}</span></button>)}
            <button onClick={handleEndChat} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-xs md:text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">{isVolunteer ? t.actions.leaveChat : t.actions.endChat}</button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-3xl mx-auto w-full">
            {isVolunteer && ticket.priority === 'critical' && (<div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-xl text-sm mb-8 flex items-start gap-3 animate-fade-in shadow-sm"><AlertTriangle size={20} className="shrink-0 mt-0.5" /><div><span className="font-bold block mb-1">CRITICAL PRIORITY CASE</span>User reported unsafe conditions or high distress. Please prioritize safety check.</div></div>)}
            {messages.map(msg => (<ChatBubble key={msg.id} {...msg} />))}
            <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-20">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-[2rem] px-2 py-2 border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-inner">
          <input className="flex-1 bg-transparent text-base text-slate-900 dark:text-white focus:outline-none px-4 min-h-[44px] placeholder:text-slate-400" placeholder={t.humanRole.placeholder} value={inputText} onChange={e => setInputText(e.target.value)} autoFocus />
          <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:scale-100 hover:scale-105 transition-all shadow-md"><Send size={18} /></button>
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
  const handleIntakeComplete = (n: string, i: string, p: Priority, t: string[]) => { const ticket = createTicket(n, i, p, t); setCurrentTicket(ticket); setView('human-chat'); };
  const handleVolunteerJoin = (t: Ticket) => { updateTicketStatus(t.id, 'active'); setCurrentTicket(t); setView('human-chat'); };

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
            {view === 'human-chat' && currentTicket && (<HumanChat ticketId={currentTicket.id} onLeave={() => setView(role === 'volunteer' ? 'volunteer-dashboard' : 'landing')} isVolunteer={role === 'volunteer'} lang={lang} />)}
        </div>
    </div>
  );
};

export default function App() { return <AppProvider><MainLayout /></AppProvider>; }
