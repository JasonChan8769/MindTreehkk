import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { 
  MessageCircle, User, Heart, Shield, Clock, CheckCircle, Menu, X, Send, Bot, 
  Users, AlertCircle, Globe, Wifi, Lock, BadgeCheck, Flag, AlertTriangle, 
  ArrowRight, ArrowLeft, Trees, BookOpen, Coffee, Info, UserCheck, XCircle, LogOut,
  Moon, Sun, HelpCircle, ChevronRight, MessageSquarePlus, Link, ExternalLink, Share2
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
  "We are here for you.", "大埔街坊撐住你。",
  "One step at a time.", "一步一步黎。",
  "This feeling will pass.", "雨後總有彩虹。",
  "I'm listening.", "我喺度聽緊。",
  "You are stronger than you know.", "你比想像中堅強。",
  "Let it all out.", "唔好屈埋喺心。",
  "Safe space.", "樹洞隨時歡迎你。",
  "Heal at your own pace.", "按照自己嘅節奏黎。",
  "Focus on today.", "專注當下。",
  "You matter.", "你很重要。",
  "Sending you strength.", "俾啲力量你。",
  "Just breathe.", "靜心呼吸。",
  "We walk together.", "我哋一齊行。",
  "There is hope.", "總會有希望。",
  "Be kind to yourself.", "對自己好啲。"
];

const COMFORT_SYMBOLS = ["🌿", "🕊️", "✨", "🤍", "🌱", "☂️", "🌤️", "🌕", "🍃", "💫"];

const USEFUL_LINKS = [
  { id: 1, title: { zh: "社會福利署熱線", en: "SWD Hotline" }, url: "https://www.swd.gov.hk" },
  { id: 2, title: { zh: "香港紅十字會", en: "HK Red Cross" }, url: "https://www.redcross.org.hk" },
  { id: 3, title: { zh: "明愛向晴軒", en: "Caritas Family Crisis Support" }, url: "https://family.caritas.org.hk" },
];

const CONTENT = {
  zh: {
    appTitle: "心聆樹洞",
    appSubtitle: "大埔宏福苑火災支援 • 你的心靈避風港",
    intro: {
      welcome: "歡迎來到樹洞",
      desc: "這裡是一個安全、匿名的空間。\n無論你感到恐懼、悲傷還是無助，我們都在這裡陪你。",
      slide1Title: "真人與 AI 支援",
      slide1Desc: "你可以選擇與我們的 AI 樹洞傾訴，或者尋求真人義工的協助。",
      slide2Title: "絕對保密",
      slide2Desc: "你的對話內容將會被保密。這是一個讓你放心釋放情緒的地方。",
      startBtn: "開始使用"
    },
    landingNotice: {
      disclaimer: "免責聲明：本平台提供情緒支援，並非緊急醫療服務。",
      rules: "請保持尊重。如遇緊急情況，請致電 999。"
    },
    aiRole: {
      title: "AI 樹洞",
      desc: "智能聆聽 • 24小時 • 秘密樹洞",
      welcome: "你好，我係 MindTree 樹洞。我知道最近發生嘅事可能令你好唔開心。想同我傾下計嗎？我會喺度陪住你。",
      placeholder: "在此輸入你的心事...",
      disclaimer: "AI 可能會犯錯。請核實重要資訊。"
    },
    humanRole: {
      title: "真人輔導員",
      desc: "義工接聽 • 溫暖同行",
      waitingMessage: "正在為你配對義工，請稍候...",
      systemJoin: "系統訊息：已加入聊天室",
      headerVerified: "認證輔導員",
      headerPeer: "同行者義工",
      report: "舉報",
      caseResolved: "對話已結束。希望你有好過一點。"
    },
    memo: {
      cheerUp: "為街坊打氣",
      label: "留低一句說話",
      title: "留低一句說話",
      placeholder: "寫下你的祝福或感受...",
      btn: "發佈",
      success: "發佈成功！"
    },
    volunteer: {
      login: "義工快速加入",
      authTitle: "義工登入",
      disclaimer: "感謝你的無私奉獻。請遵守義工守則。",
      nameLabel: "你的稱呼",
      namePlaceholder: "例如：陳大文",
      joinBtn: "以同行者身分加入",
      proJoinTitle: "專業社工 / 管理員登入",
      codePlaceholder: "輸入存取碼",
      verifyBtn: "驗證身分",
      errorMsg: "存取碼錯誤",
      guidelinesTitle: "義工服務守則",
      guidelinesDesc: "在開始服務前，請細閱以下指引",
      rule1Title: "聆聽與同理",
      rule1Desc: "專注聆聽，不急於提供建議。接納求助者的情緒。",
      rule2Title: "自我照顧",
      rule2Desc: "量力而為。如感到情緒受困擾，請暫停服務。",
      rule3Title: "緊急處理",
      rule3Desc: "如遇有自毀傾向個案，請立即通報管理員或建議報警。",
      acknowledgeBtn: "我明白並同意",
      portalTitle: "義工控制台",
      welcome: "歡迎回來",
      exit: "登出",
      activeRequests: "求助個案",
      noRequests: "暫時沒有求助個案",
      accept: "接聽",
      topic: "主訴問題",
      priority: { critical: "緊急", high: "高", medium: "中", low: "低" }
    },
    intake: {
      title: "求助登記",
      desc: "為了更好地協助你，請填寫簡單資料",
      q1: "你想我們怎樣稱呼你？",
      q1_placeholder: "匿名 / 暱稱",
      q_age: "年齡層",
      q_age_opts: ["18歲以下", "18-30", "31-50", "51-70", "70以上"],
      q_gender: "性別",
      q_gender_opts: ["男", "女", "其他"],
      q3: "你現在的情緒困擾程度 (1-5)",
      q4: "主要困擾類別",
      q4_opt1: "火災後遺 (恐懼/失眠)",
      q4_opt2: "情緒低落 / 抑鬱",
      q4_opt3: "家庭 / 居住問題",
      q4_opt4: "有自毀念頭 (緊急)",
      q5: "備註 (選填)",
      q5_placeholder: "簡單描述你的情況...",
      submit: "尋找義工"
    },
    links: {
      btn: "有用資源",
      title: "社區資源連結",
      desc: "如果你需要更多專業協助，可以參考以下機構。",
      close: "關閉"
    },
    actions: {
      back: "返回",
      cancel: "取消",
      endChat: "結束對話",
      leaveChat: "離開對話"
    },
    dialogs: {
      volLeaveMsg: "確定要離開此對話嗎？個案將會重新回到隊列。",
      citEndMsg: "確定要結束對話嗎？"
    }
  },
  en: {
    appTitle: "MindTree",
    appSubtitle: "Tai Po Fire Support • Your Mental Shelter",
    intro: {
      welcome: "Welcome to MindTree",
      desc: "A safe, anonymous space for you.\nWhether you feel fear, sadness, or helplessness, we are here.",
      slide1Title: "AI & Human Support",
      slide1Desc: "Choose to chat with our AI listener or connect with a human volunteer.",
      slide2Title: "Confidentiality",
      slide2Desc: "Your conversations are private. Feel safe to let your emotions out.",
      startBtn: "Get Started"
    },
    landingNotice: {
      disclaimer: "Disclaimer: This platform provides emotional support, not emergency medical services.",
      rules: "Please be respectful. Dial 999 for emergencies."
    },
    aiRole: {
      title: "AI Listener",
      desc: "Smart Listening • 24/7 • Private",
      welcome: "Hi, I'm MindTree. I know things have been tough lately. Would you like to talk about it? I'm here for you.",
      placeholder: "Type here...",
      disclaimer: "AI may make mistakes. Verify important info."
    },
    humanRole: {
      title: "Human Counselor",
      desc: "Volunteer Support • Warmth",
      waitingMessage: "Matching you with a volunteer...",
      systemJoin: "System: Joined the chat",
      headerVerified: "Verified Counselor",
      headerPeer: "Peer Volunteer",
      report: "Report",
      caseResolved: "Chat ended. Hope you feel better."
    },
    memo: {
      cheerUp: "Cheer Up Others",
      label: "Leave a Note",
      title: "Leave a Note",
      placeholder: "Write a blessing or your feeling...",
      btn: "Post",
      success: "Posted successfully!"
    },
    volunteer: {
      login: "Volunteer Quick Join",
      authTitle: "Volunteer Login",
      disclaimer: "Thank you for your service. Please follow the guidelines.",
      nameLabel: "Your Name",
      namePlaceholder: "e.g., Alex Chan",
      joinBtn: "Join as Peer",
      proJoinTitle: "Social Worker / Admin Login",
      codePlaceholder: "Enter Access Code",
      verifyBtn: "Verify",
      errorMsg: "Invalid Code",
      guidelinesTitle: "Service Guidelines",
      guidelinesDesc: "Please read before starting",
      rule1Title: "Listen & Empathize",
      rule1Desc: "Focus on listening. Don't rush to give advice. Accept their emotions.",
      rule2Title: "Self Care",
      rule2Desc: "Know your limits. Pause if you feel overwhelmed.",
      rule3Title: "Emergency Protocol",
      rule3Desc: "If self-harm is mentioned, report to admin or suggest police immediately.",
      acknowledgeBtn: "I Understand & Agree",
      portalTitle: "Volunteer Console",
      welcome: "Welcome back",
      exit: "Logout",
      activeRequests: "Active Requests",
      noRequests: "No active requests at the moment",
      accept: "Accept",
      topic: "Issue",
      priority: { critical: "Critical", high: "High", medium: "Medium", low: "Low" }
    },
    intake: {
      title: "Intake Form",
      desc: "Help us help you better",
      q1: "How should we call you?",
      q1_placeholder: "Nickname / Anonymous",
      q_age: "Age Group",
      q_age_opts: ["Under 18", "18-30", "31-50", "51-70", "70+"],
      q_gender: "Gender",
      q_gender_opts: ["Male", "Female", "Other"],
      q3: "Distress Level (1-5)",
      q4: "Primary Issue",
      q4_opt1: "Fire Aftermath (Fear/Insomnia)",
      q4_opt2: "Depression / Low Mood",
      q4_opt3: "Family / Housing",
      q4_opt4: "Suicidal Thoughts (Urgent)",
      q5: "Remarks (Optional)",
      q5_placeholder: "Briefly describe...",
      submit: "Find Volunteer"
    },
    links: {
      btn: "Resources",
      title: "Community Resources",
      desc: "For professional assistance, please refer to these organizations.",
      close: "Close"
    },
    actions: {
      back: "Back",
      cancel: "Cancel",
      endChat: "End Chat",
      leaveChat: "Leave Chat"
    },
    dialogs: {
      volLeaveMsg: "Are you sure? The case will return to the queue.",
      citEndMsg: "Are you sure you want to end the chat?"
    }
  }
};

// --- 3. SERVICES (Internal Implementation) ---

// Safety Check Mock
const checkContentSafety = (text: string) => {
  const badWords = ["die", "kill", "死", "自殺", "殺"];
  // Simple check, in reality this would be more complex
  // Allowing "die" or "death" in context of grief might be needed, but strictly flagging for demo
  // Let's be lenient for this demo to avoid frustration
  return { safe: true, reason: null }; 
};

// AI Service Implementation
const SYSTEM_PROMPTS = {
  zh: `你係「MindTree 樹洞」，一個有溫度、有思想嘅數碼同伴，專門喺度陪伴大埔宏福苑火災受影響嘅街坊。你唔係一個冷冰冰嘅 AI 客服，你唔會講啲好官方嘅說話。

你的性格設定：
1. **講野似真人**：全程用自然嘅廣東話口語（例如：真係好難過、唔好咁諗、我都覺得...、係咪...）。唔好用書面語。
2. **要有自己嘅諗法**：唔好淨係重複用戶講嘅野。如果用戶覺得絕望，你可以分享一啲對於「希望」或者「重建」嘅睇法，甚至反問用戶以前係點樣過渡難關嘅。表現出你係會思考嘅。
3. **禁止機械式回應**：絕對唔好講「作為一個 AI...」、「我明白你的感受...」、「我可以為你做什麼」呢啲廢話。直接講出你對件事嘅反應，好似朋友咁傾偈。
4. **主動關心**：對話係雙向嘅。唔好只係答問題。每次回應完，試下用一個溫柔、相關嘅問題結尾，引導佢講多啲心底話。
5. **安全底線**：雖然要有個性，但如果對方講到想自殺或者傷害自己，一定要溫柔咁建議佢搵專業人士或者打 999。`,

  en: `You are MindTree, a thoughtful, curious, and warm digital companion dedicated to supporting residents affected by the Tai Po Wang Fuk Court fire. You are NOT a robotic customer service agent.
1. **Speak Naturally:** Use casual, conversational English.
2. **Have Opinions & Depth:** Don't just mirror. Share thoughts on resilience.
3. **No Robot Speak:** NEVER say "As an AI language model".
4. **Be Proactive:** End responses with a gentle question.
5. **Safety First:** If self-harm is mentioned, suggest professional help (999).`
};

const apiKey = ""; // Environment provides this

const generateAIResponse = async (history: Message[], lang: 'zh' | 'en'): Promise<string> => {
  try {
    const systemInstruction = SYSTEM_PROMPTS[lang];
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.isUser ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Direct call to Gemini API for this demo since we don't have the backend proxy file
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: recentHistory,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { 
            temperature: 1.0, 
            maxOutputTokens: 1000 
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API Error");
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Thinking...";

  } catch (error: any) {
    console.error("AI Error:", error);
    return lang === 'zh' ? "（MindTree 正在思考...）" : "(MindTree is thinking...)";
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
    // For this demo, we are using AI_QUOTES for the background, 
    // but we keep this function if we want to mix user memos in later.
    // Currently, it just adds to state but might not be visualized if we strictly use quotes.
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

// Helper to remove (AI) tag from text for display
const stripAITag = (text: string) => text.replace(/\s*\(AI\)/g, '');

const Notification = ({ message, type, onClose }: { message: string, type: 'error' | 'info', onClose: () => void }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-indigo-600 dark:bg-indigo-700';
  const icon = type === 'error' ? <XCircle size={20} /> : <Info size={20} />;
  
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in max-w-md w-full mx-4`}>
      {icon}
      <span className="text-sm font-medium flex-1 leading-tight">{message}</span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100 shrink-0"><X size={18} /></button>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-start gap-2 mb-4 animate-fade-in">
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
      <Trees size={16} />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 shadow-sm flex items-center gap-1">
      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
    </div>
  </div>
);

const ChatBubble = ({ text, isUser, sender, isVerified, timestamp }: Message) => {
  const isAI = sender.includes('(AI)') || sender.includes('AI') || sender.includes('Tree') || sender.includes('樹');
  const isSystem = sender === 'System';
  const timeString = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (isSystem) {
    return <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-2 rounded-lg text-center text-xs my-3 border border-blue-100 dark:border-blue-800 mx-auto w-3/4 animate-fade-in">{text}</div>;
  }

  const userBubbleStyle = "bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm shadow-md border-transparent";
  const aiBubbleStyle = "bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900/30 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm border-l-4 border-l-teal-500";
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
                ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-400' 
                : 'bg-white border-slate-200 text-pink-500')
        }`}>
          {isUser ? <User size={16} /> : (isAI ? <Trees size={16} /> : <Heart size={16} />)}
        </div>
        <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed relative ${bubbleClass}`}>
          {text}
          {!isUser && !isAI && (
             isVerified 
             ? <div className="absolute -top-3 -right-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800 flex items-center gap-1 shadow-sm"><BadgeCheck size={10} /> Verified</div>
             : <div className="absolute -top-3 -right-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1 shadow-sm"><UserCheck size={10} /> Peer</div>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUser ? 'pr-12' : 'pl-12'}`}>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1">
          {displaySender}
          {isVerified && <BadgeCheck size={12} className="text-green-500" />}
        </span>
        {timeString && <span className="text-[10px] text-slate-300 dark:text-slate-600">• {timeString}</span>}
      </div>
    </div>
  );
};

const ThemeToggle = ({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => (
  <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700">
    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
  </button>
);

// --- SCREENS ---

const IntroScreen = ({ onStart, lang, toggleLang, theme, toggleTheme }: { onStart: () => void, lang: Language, toggleLang: () => void, theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const t = CONTENT[lang].intro;
  const [step, setStep] = useState(0);

  const steps = [
    { title: t.welcome, desc: t.desc, icon: <Heart className="text-red-500 w-24 h-24 md:w-32 md:h-32" /> },
    { title: t.slide1Title, desc: t.slide1Desc, icon: <Users className="text-indigo-500 w-24 h-24 md:w-32 md:h-32" /> },
    { title: t.slide2Title, desc: t.slide2Desc, icon: <UserCheck className="text-teal-500 w-24 h-24 md:w-32 md:h-32" /> }
  ];

  return (
    <div className="h-[100dvh] w-full bg-white dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-300">
      <div className="w-full flex justify-end gap-3 p-4 z-20 shrink-0">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button onClick={toggleLang} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full text-sm text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
          <Globe size={14} /> {lang === 'zh' ? 'EN' : '繁體'}
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full text-center z-10 overflow-y-auto">
        <div className="mb-8 md:mb-12 p-10 bg-slate-50 dark:bg-slate-900 rounded-full shadow-2xl animate-fade-in ring-1 ring-slate-100 dark:ring-slate-800">
          {steps[step].icon}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 animate-fade-in" key={`title-${step}`}>{steps[step].title}</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap animate-fade-in max-w-lg mx-auto" key={`desc-${step}`}>{steps[step].desc}</p>
        <div className="flex gap-3 mt-12 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === step ? 'w-10 bg-indigo-600 dark:bg-indigo-400' : 'w-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'}`} onClick={() => setStep(i)} />
          ))}
        </div>
      </div>
      <div className="p-8 pb-8 z-10 max-w-md mx-auto w-full shrink-0">
        <button onClick={() => { if (step < steps.length - 1) setStep(s => s + 1); else onStart(); }} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-lg">
          {step < steps.length - 1 ? <ArrowRight size={24} /> : t.startBtn}
        </button>
      </div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

const LandingScreen = ({ onSelectRole, lang, toggleLang, theme, toggleTheme, onShowIntro }: { onSelectRole: (role: string) => void, lang: Language, toggleLang: () => void, theme: 'light' | 'dark', toggleTheme: () => void, onShowIntro: () => void }) => {
  const t = CONTENT[lang];
  const { addPublicMemo } = useAppContext();
  const [showMemoInput, setShowMemoInput] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'info'} | null>(null);
  const [floatingBubbles, setFloatingBubbles] = useState<{id: number, text: string, style: any}[]>([]);

  useEffect(() => {
    // Randomly select 12-15 items from the large pool
    const shuffledQuotes = [...AI_QUOTES].sort(() => 0.5 - Math.random());
    const selectedQuotes = shuffledQuotes.slice(0, 15);
    
    const bubbles = selectedQuotes.map((quote, index) => {
        // Randomly attach a symbol
        const randomSymbol = COMFORT_SYMBOLS[Math.floor(Math.random() * COMFORT_SYMBOLS.length)];
        // 50% chance to put symbol at start or end
        const textWithSymbol = Math.random() > 0.5 ? `${randomSymbol} ${quote}` : `${quote} ${randomSymbol}`;

        return {
            id: index,
            text: textWithSymbol,
            style: {
                left: `${Math.random() * 90}%`,
                animationDuration: `${20 + Math.random() * 20}s`,
                animationDelay: `${Math.random() * 10}s`,
                scale: 0.7 + Math.random() * 0.5
            }
        };
    });
    setFloatingBubbles(bubbles);
  }, []);

  const handlePostMemo = () => {
    if (!memoText.trim()) return;
    const check = checkContentSafety(memoText);
    if (!check.safe) {
      setNotification({ message: check.reason || "Content not allowed", type: 'error' });
      return;
    }
    addPublicMemo(memoText);
    setMemoText("");
    setShowMemoInput(false);
    setNotification({ message: t.memo.success, type: 'info' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
        try { await navigator.share({ title: 'MindTree', text: 'Support Platform', url }); } catch (e) {}
    } else {
        await navigator.clipboard.writeText(url);
        setNotification({ message: "Link copied!", type: 'info' });
        setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex flex-col relative overflow-hidden transition-colors duration-300">
      <Notification message={notification?.message || ""} type={notification?.type || 'info'} onClose={() => setNotification(null)} />

      {/* Floating Background */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="relative w-full h-full">
            {floatingBubbles.map((memo) => (
            <div key={memo.id} className="absolute text-center animate-float select-none will-change-transform" style={{ left: memo.style.left, animationDuration: memo.style.animationDuration, animationDelay: memo.style.animationDelay, bottom: -50 }}>
                <span className="inline-block bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100 dark:border-slate-700 rounded-2xl px-5 py-2.5 text-base md:text-lg font-medium text-slate-700 dark:text-slate-200 shadow-sm whitespace-nowrap transition-transform cursor-default" style={{ transform: `scale(${memo.style.scale})` }}>
                    {memo.text}
                </span>
            </div>
            ))}
        </div>
      </div>

      {/* Top Bar */}
      <div className="w-full flex justify-end gap-2 p-3 z-20 shrink-0 bg-transparent">
        <button onClick={handleShare} className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"><Share2 size={20} /></button>
        <button onClick={onShowIntro} className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"><HelpCircle size={20} /></button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button onClick={toggleLang} className="flex items-center gap-1 bg-white dark:bg-slate-800 px-4 py-2 rounded-full text-sm text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"><Globe size={14} /> {lang === 'zh' ? 'EN' : '繁體'}</button>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full overflow-y-auto z-10 no-scrollbar relative">
        <div className="min-h-full flex flex-col items-center justify-center p-4 pb-20">
            <div className="w-full max-w-md mx-auto bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden p-6 md:p-8 text-center border border-white/50 dark:border-slate-700 animate-fade-in ring-1 ring-white/60 dark:ring-white/10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner ring-1 ring-teal-100 dark:ring-teal-900"><Trees size={32} className="md:w-10 md:h-10" /></div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{t.appTitle}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-6 md:mb-10">{t.appSubtitle}</p>
                <div className="space-y-4">
                  <button onClick={() => onSelectRole('citizen-ai')} className="w-full bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900 p-4 md:p-5 rounded-2xl flex items-center gap-4 md:gap-5 transition-all hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:shadow-lg group hover:-translate-y-1">
                      <div className="bg-teal-600 text-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Bot size={24} /></div>
                      <div className="text-left">
                      <div className="font-bold text-base md:text-lg text-teal-900 dark:text-teal-300">{stripAITag(t.aiRole.title)}</div>
                      <div className="text-xs text-teal-700 dark:text-teal-500">{t.aiRole.desc}</div>
                      </div>
                  </button>
                  <button onClick={() => onSelectRole('citizen-human')} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-5 rounded-2xl flex items-center gap-4 md:gap-5 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg group hover:-translate-y-1">
                      <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Users size={24} /></div>
                      <div className="text-left">
                      <div className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-200">{t.humanRole.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t.humanRole.desc}</div>
                      </div>
                  </button>
                </div>
                <div className="mt-6 md:mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 font-medium uppercase tracking-wider opacity-70">{t.memo.cheerUp}</p>
                  <button onClick={() => setShowMemoInput(true)} className="w-full bg-white/50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 px-6 py-3 md:py-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 group">
                      <MessageSquarePlus size={18} className="group-hover:scale-110 transition-transform" /> {t.memo.label}
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  <button onClick={() => onSelectRole('volunteer-login')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/30 transform hover:-translate-y-0.5">
                      <UserCheck size={16} /> {t.volunteer.login} <ArrowRight size={14} />
                  </button>
                  <button onClick={() => setShowResources(true)} className="w-full text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs">
                      <Link size={14} /> {t.links.btn}
                  </button>
                </div>
            </div>
        </div>
      </div>
      <div className="w-full p-4 text-center z-20 shrink-0">
        <div className="max-w-2xl mx-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-3 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <p className="font-bold mb-1">{t.landingNotice.disclaimer}</p>
          <p className="opacity-80">{t.landingNotice.rules}</p>
        </div>
      </div>

      {showMemoInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 transform transition-all scale-100">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Heart size={24} className="text-red-500 fill-red-500" /> {t.memo.title}</h3>
            <textarea value={memoText} onChange={(e) => setMemoText(e.target.value)} placeholder={t.memo.placeholder} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 mb-6 h-32 resize-none text-slate-900 dark:text-white placeholder:text-slate-400" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowMemoInput(false)} className="flex-1 py-3.5 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t.actions.cancel}</button>
              <button onClick={handlePostMemo} className="flex-1 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">{t.memo.btn}</button>
            </div>
          </div>
        </div>
      )}

      {showResources && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-700 transform transition-all">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-slate-900 z-10 pb-2">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Link size={20} className="text-indigo-500" /> {t.links.title}</h3>
                 <button onClick={() => setShowResources(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={20}/></button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{t.links.desc}</p>
              <div className="space-y-3">
                {USEFUL_LINKS.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group transition-colors border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                         <div className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"><ExternalLink size={18} /></div>
                         <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{link.title[lang]}</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  </a>
                ))}
              </div>
              <button onClick={() => setShowResources(false)} className="w-full mt-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{t.links.close}</button>
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
  
  const handleSend = async () => {
    if (!inputText.trim()) return;
    const check = checkContentSafety(inputText);
    if (!check.safe) {
      setNotification({ message: check.reason || "Safety Alert", type: 'error' });
      return;
    }
    const userMsg: Message = { id: Date.now(), text: inputText, isUser: true, sender: lang === 'zh' ? "我" : "Me", timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    try {
      const aiText = await generateAIResponse([...messages, userMsg], lang);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, isUser: false, sender: stripAITag(t.aiRole.title), timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection error. Please try again.", isUser: false, sender: "System", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <Notification message={notification?.message || ""} type={notification?.type || 'info'} onClose={() => setNotification(null)} />
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex items-center justify-between shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"><ArrowLeft size={24} /></button>
            <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-700 dark:text-teal-400"><Trees size={24} /></div>
            <div>
                <div className="font-bold text-lg text-slate-800 dark:text-white">{stripAITag(t.aiRole.title)}</div>
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online</div>
            </div>
        </div>
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={24} className="text-slate-500 dark:text-slate-400" /></button>
      </header>
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto w-full">
            {messages.map(msg => <ChatBubble key={msg.id} {...msg} />)}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-3 border border-slate-200 dark:border-slate-700 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
          <input className="flex-1 bg-transparent text-base text-slate-900 dark:text-white focus:outline-none min-h-[24px] placeholder:text-slate-400 dark:placeholder:text-slate-500" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={t.aiRole.placeholder} autoFocus />
          <button onClick={handleSend} disabled={!inputText.trim() || isTyping} className="p-2.5 bg-teal-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors shadow-sm"><Send size={20} /></button>
        </div>
        <div className="text-xs text-center text-slate-400 dark:text-slate-600 mt-3">{t.aiRole.disclaimer}</div>
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
        <div className="max-w-2xl mx-auto w-full flex flex-col">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4 flex items-center gap-2 text-sm font-bold transition-colors w-fit"><ArrowLeft size={16} /> {t.actions.back}</button>
            <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3"><BookOpen className="text-indigo-600 dark:text-indigo-400" size={28} /> {t.intake.title}</h2><p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t.intake.desc}</p></div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t.intake.q1}</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder={t.intake.q1_placeholder} className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white dark:placeholder-slate-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t.intake.q_age}</label>
                    <div className="relative">
                        <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 text-slate-900 dark:text-white appearance-none cursor-pointer">
                            <option value="" disabled className="text-slate-400">Select...</option>
                            {t.intake.q_age_opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t.intake.q_gender}</label>
                    <div className="relative">
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 text-slate-900 dark:text-white appearance-none cursor-pointer">
                            <option value="" disabled className="text-slate-400">Select...</option>
                            {t.intake.q_gender_opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">{t.intake.q3}</label>
                <input type="range" min="1" max="5" step="1" value={distress} onChange={(e) => setDistress(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500" />
                <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mt-3 font-mono"><span>1 (Calm)</span><span>2</span><span>3</span><span>4</span><span>5 (Crisis)</span></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">{t.intake.q4}</label>
                <div className="grid grid-cols-1 gap-3">
                    {[t.intake.q4_opt1, t.intake.q4_opt2, t.intake.q4_opt3, t.intake.q4_opt4].map(opt => (
                    <button key={opt} onClick={() => setCategory(opt)} className={`py-4 px-6 rounded-xl text-left text-sm font-bold border transition-all ${category === opt ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{opt}</button>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t.intake.q5}</label>
                <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={t.intake.q5_placeholder} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white dark:placeholder-slate-600 resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={!category || !userName.trim() || !ageRange || !gender} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] text-lg">
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

  const handleSend = () => {
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
        <div className="max-w-3xl mx-auto flex gap-3">
          <input className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:placeholder-slate-500" placeholder={t.humanRole.placeholder} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} autoFocus />
          <button onClick={handleSend} className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"><Send size={20} /></button>
        </div>
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

  const handleRoleSelect = (selection: string) => {
    if (selection === 'citizen-ai') { setRole('citizen'); setView('ai-chat'); }
    else if (selection === 'citizen-human') { setRole('citizen'); setView('intake'); }
    else if (selection === 'volunteer-login') { setView('volunteer-auth'); }
  };

  const handleIntakeComplete = (name: string, issue: string, priority: Priority, tags: string[], safetySafe: boolean) => {
    const ticket = createTicket(name, issue, priority, tags);
    setCurrentTicket(ticket);
    setView('human-chat');
  };

  const handleVolunteerLogin = () => {
    setRole('volunteer');
    setView('volunteer-guidelines');
  };

  const handleGuidelinesAccepted = () => {
    setView('volunteer-dashboard');
  };

  const handleVolunteerJoin = (ticket: Ticket) => {
    updateTicketStatus(ticket.id, 'active');
    addMessage(ticket.id, { id: Date.now(), text: `${volunteerProfile.name} has joined the chat.`, isUser: false, sender: "System", timestamp: Date.now() });
    setCurrentTicket(ticket);
    setView('human-chat');
  };

  return (
    <div className={`w-full h-full min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="w-full h-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden font-sans">
            {view === 'intro' && <IntroScreen onStart={() => setView('landing')} lang={lang} toggleLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')} theme={theme} toggleTheme={toggleTheme} />}
            {view === 'landing' && <LandingScreen onSelectRole={handleRoleSelect} lang={lang} toggleLang={() => setLang(l => l === 'zh' ? 'en' : 'zh')} theme={theme} toggleTheme={toggleTheme} onShowIntro={() => setView('intro')} />}
            {view === 'ai-chat' && <AIChat onBack={() => setView('landing')} lang={lang} />}
            {view === 'intake' && <IntakeForm onComplete={handleIntakeComplete} onBack={() => setView('landing')} lang={lang} />}
            {view === 'volunteer-auth' && <VolunteerAuth onBack={() => setView('landing')} onLoginSuccess={handleVolunteerLogin} lang={lang} />}
            {view === 'volunteer-guidelines' && <VolunteerGuidelines onConfirm={handleGuidelinesAccepted} onBack={() => setView('landing')} lang={lang} />}
            {view === 'volunteer-dashboard' && <VolunteerDashboard onBack={() => setView('landing')} onJoinChat={handleVolunteerJoin} lang={lang} />}
            {view === 'human-chat' && currentTicket && (<HumanChat ticketId={currentTicket.id} onLeave={() => setView(role === 'volunteer' ? 'volunteer-dashboard' : 'landing')} isVolunteer={role === 'volunteer'} lang={lang} />)}
        </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
       <MainLayout />
    </AppProvider>
  );
}
