

import { Language } from './types';

export const SAFETY_PATTERNS = {
  privacy: [
    { regex: /[569]\d{3}[ -]?\d{4}/, type: "phone", warning: "Privacy Alert: Please do not share phone numbers." },
    { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, type: "email", warning: "Privacy Alert: Please do not share email addresses." },
    { regex: /\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}/, type: "financial", warning: "Security Alert: Never share credit card or banking numbers." },
    { regex: /[A-Z]{1,2}[0-9]{6}\(?[0-9A]\)?/, type: "hkid", warning: "Privacy Alert: Please do not share HKID numbers." }
  ],
  offensive: [
    // English Profanity & Hate Speech (Word boundary \b to avoid false positives)
    { regex: /\b(fuck|shit|bitch|asshole|cunt|dick|pussy|whore|slut|faggot|nigger|retard|kill\s*yourself|kys)\b/i, type: "offensive_en", warning: "Content Warning: Please keep the conversation respectful and safe." },
    // Cantonese Profanity & Abuse
    { regex: /(屌|撚|柒|鳩|西|閪|仆街|冚家鏟|死全家|弱智|白痴|廢柴|on9|on79|DLLM|DLGH|PK|HCL|MCF|MLGB|NMSL)/i, type: "offensive_zh", warning: "內容警告：請保持對話禮貌及理性，避免使用攻擊性字眼。" }
  ],
  illegal: [
    // Drugs & Dangerous items
    { regex: /\b(buy|sell)\s+(drugs|cocaine|heroin|meth|weed|ketamine|ecstasy)\b/i, type: "illegal_en", warning: "Safety Alert: Content related to illegal drugs or activities is prohibited." },
    { regex: /(買|賣|吸|食)(毒|大麻|K仔|冰毒|白粉|可卡因|搖頭丸|太空油)/, type: "illegal_zh", warning: "安全警告：嚴禁涉及毒品或違法內容。" },
    { regex: /(自殺教學|怎么自杀|how to suicide)/i, type: "harm_zh", warning: "Content Warning: Self-harm promotion is not allowed. Please seek help immediately." }
  ],
  promotional: [
    { regex: /(http|https|www\.|t\.me|discord\.gg|\.com|\.net|\.org)/i, type: "promotional", warning: "No promotional links or ads allowed." }
  ]
};

export const USEFUL_LINKS = [
  { 
    id: 'l1',
    title: { zh: "社會福利署 - 緊急救援", en: "SWD - Emergency Relief" }, 
    url: "https://www.swd.gov.hk", 
  },
  { 
    id: 'l2',
    title: { zh: "香港紅十字會 - 捐血服務", en: "Red Cross - Blood Donation" }, 
    url: "https://www5.ha.org.hk/rcbts", 
  },
  { 
    id: 'l3',
    title: { zh: "民政事務總署 - 大埔", en: "Tai Po District Office" }, 
    url: "https://www.had.gov.hk", 
  },
  { 
    id: 'l4',
    title: { zh: "東華三院 - 緊急援助基金", en: "TWGHs - Emergency Fund" }, 
    url: "https://www.tungwah.org.hk", 
  }
];

export const CONTENT = {
  zh: {
    appTitle: "心聆樹洞",
    appSubtitle: "大埔宏福苑火災支援 • 你的心靈避風港",
    intro: {
      welcome: "歡迎來到心聆樹洞",
      desc: "我們明白這是一段艱難的時刻。這個平台專為受火災影響的街坊而設。",
      slide1Title: "我們如何幫助你",
      slide1Desc: "1. AI 樹洞：24小時隨時聆聽你的情緒。\n2. 真人輔導：配對社區義工或社工進行深入傾訴。",
      slide2Title: "想出一分力？",
      slide2Desc: "如果你想幫助鄰里，可以加入成為「聆聽義工」。我們會提供指引。",
      startBtn: "進入平台"
    },
    landingNotice: {
      disclaimer: "免責聲明：本平台僅提供情緒支援及社區互助，並非專業醫療服務。如遇緊急危險或有自毀傾向，請立即致電 999 求助。",
      rules: "溫馨提示：請保持互相尊重及同理心。我們致力維持安全的樹洞環境，任何攻擊性、違法或滋擾內容將被刪除，違規用戶會被即時封鎖。",
    },
    aiRole: {
      title: "AI 樹洞 (AI)", 
      desc: "智能聆聽 • 24小時 • 秘密樹洞", 
      welcome: "你好，我係你嘅 AI 樹洞。知道最近發生咗火災，你心入面可能有好多情緒無處宣洩。無論係驚、唔開心，定係想搵個地方呻下，我都會喺度靜靜聆聽。你依家想講咩都可以講架。", 
      typing: "樹洞正在思考...",
      placeholder: "隨便講下你嘅感受...",
      disclaimer: "【重要】此為 AI 樹洞程式。對話保密。AI 無法提供醫療診斷。如遇緊急危險請即報警。",
    },
    humanRole: {
      title: "真人輔導員",
      desc: "義工接聽 • 溫暖同行",
      systemJoin: "已連接輔導員。對話內容受監管及保密。", 
      waitingMessage: "正在為你聯絡輔導員，請耐心等候。在等待期間，如感到不安，你可以先嘗試與「AI 樹洞」傾訴，平復心情。", 
      placeholder: "輸入訊息...",
      headerVerified: "認證輔導員",
      headerPeer: "社區聆聽者", 
      tagVerified: "已認證",
      tagPeer: "街坊義工",
      report: "舉報用戶",
      wait: "正在為你配對輔導員，請稍候...",
      caseResolved: "對話已結束"
    },
    intake: {
      title: "個案評估",
      desc: "為了讓輔導員更快了解你的情況，請回答幾條簡單問題。",
      q1: "1. 請問我們該如何稱呼你？", 
      q1_placeholder: "例如：陳先生 / 小美 (可使用化名)",
      q_age: "2. 年齡組別",
      q_age_opts: ["18歲以下", "18-25歲", "26-40歲", "41-60歲", "60歲以上"],
      q_gender: "3. 性別",
      q_gender_opts: ["男", "女", "其他"],
      q3: "4. 你現在的情緒困擾程度 (1-5分)",
      q3_desc: "1分=平靜，5分=極度崩潰",
      q4: "5. 你最主要的困擾是？",
      q4_opt1: "情緒 (驚恐/悲傷)",
      q4_opt2: "居住/物資問題",
      q4_opt3: "尋找親友",
      q4_opt4: "身體不適/受傷",
      q5: "6. 有其他想預先話比輔導員知嘅野嗎？",
      q5_placeholder: "例如：我有點失眠...",
      submit: "開始配對輔導員"
    },
    volunteer: {
      prompt: "想成為聆聽者？",
      login: "義工快速加入",
      authTitle: "成為社區聆聽者",
      quickJoinTitle: "快速加入 (無需審核)",
      proJoinTitle: "專業人員登入 (需代碼)",
      nameLabel: "你的稱呼",
      namePlaceholder: "例如: Alex",
      codeLabel: "機構代碼",
      codePlaceholder: "如有 (例如: HELP2025)",
      joinBtn: "以 街坊義工 身份加入",
      verifyBtn: "以 認證人員 身份登入",
      disclaimer: "緊急情況下，無需等待審核即可幫忙。但請注意「街坊義工」身份會顯示給求助者。",
      errorMsg: "代碼無效。",
      portalTitle: "義工平台",
      welcome: "感謝你守護社區。",
      activeRequests: "待處理個案",
      waiting: "等待中",
      accept: "接聽",
      topic: "求助事項",
      exit: "登出",
      noRequests: "暫無求助個案。感謝你的候命！",
      priority: {
        critical: "緊急",
        high: "高危",
        medium: "中等",
        low: "一般"
      },
      guidelinesTitle: "義工服務守則",
      guidelinesDesc: "緊急動員期間，請緊記以下原則：",
      rule1Title: "只需聆聽",
      rule1Desc: "你不需要很專業，只需要用心聽。讓街坊知道有人關心就足夠。",
      rule2Title: "量力而爲",
      rule2Desc: "如果個案太沈重，請轉交給有「認證」標記的專業社工。保護好自己。",
      rule3Title: "緊急轉介",
      rule3Desc: "如果對方有危險，請叫佢打 999。不要自己承擔。",
      acknowledgeBtn: "明白，開始服務"
    },
    crisis: "緊急求助？請致電 999 或 2389 2222",
    actions: {
      back: "返回",
      endChat: "結束對話",
      leaveChat: "暫時離開", 
      send: "發送",
      confirm: "確認",
      cancel: "取消",
      close: "關閉",
      share: "分享此平台"
    },
    dialogs: {
      volLeaveTitle: "確認離開對話？",
      volLeaveMsg: "離開後，此個案將重新開放給其他義工接聽。求助者不會被斷線。",
      citEndTitle: "確認結束對話？",
      citEndMsg: "這將會結束是次輔導服務。如需再協助，請重新發起對話。",
    },
    memo: {
      title: "為大埔集氣",
      placeholder: "留低一句鼓勵說話...",
      btn: "傳送祝福",
      success: "已傳送",
      label: "留言",
      cheerUp: "留低一句說話，為大埔街坊打氣"
    },
    links: {
      btn: "有用資源 / 相關連結",
      title: "支援資源",
      desc: "以下是相關的官方及社區資源：",
      visit: "前往",
      close: "關閉"
    }
  },
  en: {
    appTitle: "MindTree", 
    appSubtitle: "Tai Po Fire Support • Your Safe Haven",
    intro: {
      welcome: "Welcome to MindTree",
      desc: "We know this is a tough time. This platform is here for residents affected by the fire.",
      slide1Title: "How We Help",
      slide1Desc: "1. AI Tree Hole: 24/7 safe space to vent.\n2. Counselors: Match with volunteers for human support.",
      slide2Title: "Want to Help?",
      slide2Desc: "If you want to support your neighbors, you can join as a 'Peer Listener'. Guidelines provided.",
      startBtn: "Enter Platform"
    },
    landingNotice: {
      disclaimer: "Disclaimer: This platform provides emotional support and community aid only, not medical diagnosis. In emergencies, call 999 immediately.",
      rules: "Community Rules: Please be kind and empathetic. We maintain a safe environment; offensive, illegal, or harassment content will be removed and users banned.",
    },
    aiRole: {
      title: "AI Tree Hole (AI)", 
      desc: "Smart Listener • 24/7 • Safe Space",
      welcome: "Hello, I am your AI Tree Hole. I know the recent fire might be weighing on your mind. Whether you are scared, sad, or just need to vent, I am here to listen. You can tell me anything.", 
      typing: "Tree Hole is thinking...",
      placeholder: "Share your feelings...",
      disclaimer: "【Important】I am an AI listener. Chats are private. Not a medical diagnosis. Call 999 for emergencies.",
    },
    humanRole: {
      title: "Talk to Counselor",
      desc: "Volunteers • Human Connection",
      systemJoin: "Connected to a volunteer. This chat is monitored for safety.",
      waitingMessage: "Connecting you to a counselor, please be patient. While you wait, you can try chatting with our 'AI Tree Hole' to calm your mind.",
      placeholder: "Type a message...",
      headerVerified: "Verified Counselor",
      headerPeer: "Community Listener",
      tagVerified: "Verified",
      tagPeer: "Peer",
      report: "Report User",
      wait: "Matching you with a counselor, please wait...",
      caseResolved: "Conversation Ended"
    },
    intake: {
      title: "Quick Assessment",
      desc: "Help us understand your situation so we can prioritize your case.",
      q1: "1. What should we call you?",
      q1_placeholder: "e.g. Mr. Chan / Alex (Nickname ok)",
      q_age: "2. Age Range",
      q_age_opts: ["Under 18", "18-25", "26-40", "41-60", "60+"],
      q_gender: "3. Gender",
      q_gender_opts: ["Male", "Female", "Other"],
      q3: "4. Emotional Distress Level (1-5)",
      q3_desc: "1=Calm, 5=Overwhelmed",
      q4: "5. Main Concern?",
      q4_opt1: "Emotional (Fear/Sadness)",
      q4_opt2: "Housing/Supplies",
      q4_opt3: "Missing Persons",
      q4_opt4: "Injury/Medical",
      q5: "6. Anything else you want to tell the volunteer?",
      q5_placeholder: "e.g. I haven't slept...",
      submit: "Connect to Counselor"
    },
    volunteer: {
      prompt: "Want to help?",
      login: "Volunteer Fast Track",
      authTitle: "Join as Volunteer",
      quickJoinTitle: "Quick Join (No Check)",
      proJoinTitle: "Pro Login (Code Req)",
      nameLabel: "Your Name",
      namePlaceholder: "e.g. Alex",
      codeLabel: "Organization Code",
      codePlaceholder: "Only if you have one",
      joinBtn: "Join as Peer Listener",
      verifyBtn: "Login as Verified Staff",
      disclaimer: "In emergencies, you can join instantly as a 'Peer Listener'. Your status will be shown to users.",
      errorMsg: "Invalid code.",
      portalTitle: "Volunteer Portal",
      welcome: "Thank you for helping the community.",
      activeRequests: "Incoming Cases",
      waiting: "Waiting",
      accept: "Accept Chat",
      topic: "Topic",
      exit: "Exit",
      noRequests: "No active requests. You are all caught up!",
      priority: {
        critical: "CRITICAL",
        high: "HIGH",
        medium: "MEDIUM",
        low: "LOW"
      },
      guidelinesTitle: "Volunteer Guidelines",
      guidelinesDesc: "Emergency Response Guidelines:",
      rule1Title: "Just Listen",
      rule1Desc: "You don't need to be an expert. Just being there to listen helps.",
      rule2Title: "Know Your Limits",
      rule2Desc: "If a case is too heavy, pass it to a Verified Pro. Take care of yourself.",
      rule3Title: "Emergency",
      rule3Desc: "If they are in danger, tell them to call 999.",
      acknowledgeBtn: "I Understand, Start"
    },
    crisis: "In crisis? Call 999 or 2389 2222",
    actions: {
      back: "Back",
      endChat: "End Chat",
      leaveChat: "Leave Chat", 
      send: "Send",
      confirm: "Confirm",
      cancel: "Cancel",
      close: "Close",
      share: "Share Platform"
    },
    dialogs: {
      volLeaveTitle: "Leave this chat?",
      volLeaveMsg: "The case will return to the waiting queue for other volunteers. The citizen will NOT be disconnected.",
      citEndTitle: "End this session?",
      citEndMsg: "This will close the current counseling session. You can request help again anytime.",
    },
    memo: {
      title: "Blessings for Tai Po",
      placeholder: "Leave a short message...",
      btn: "Send Blessing",
      success: "Sent",
      label: "Leave Message",
      cheerUp: "Leave a message to cheer up others"
    },
    links: {
      btn: "Useful Links / Resources",
      title: "Support Resources",
      desc: "Official and community resources:",
      visit: "Visit",
      close: "Close"
    }
  }
};