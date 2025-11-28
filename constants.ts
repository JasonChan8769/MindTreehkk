import { Language } from './types';

export const USEFUL_LINKS = [
  { id: 'l1', title: { zh: '社會福利署', en: 'Social Welfare Dept' }, url: 'https://www.swd.gov.hk' },
  { id: 'l2', title: { zh: '香港紅十字會', en: 'HK Red Cross' }, url: 'https://www.redcross.org.hk' },
  { id: 'l3', title: { zh: '生命熱線', en: 'Suicide Prevention' }, url: 'https://www.sps.org.hk' },
];

export const CONTENT = {
  zh: {
    appTitle: "MindTree | 大埔火災支援平台",
    appSubtitle: "我們一直都在。為受影響居民提供心理支援與陪伴。",
    startBtn: "開始使用",
    intro: {
      welcome: "歡迎來到 MindTree",
      desc: "這是一個專為大埔居民建立的心理支援空間。",
      slide1Title: "聆聽與陪伴",
      slide1Desc: "無論是焦慮、恐懼還是悲傷，我們的 AI 樹洞與義工都在這裡聽你說。",
      slide2Title: "專業轉介",
      slide2Desc: "如果有需要，我們會協助轉介社工或專業輔導資源。",
    },
    aiRole: {
      title: "AI 樹洞 (24/7)",
      desc: "隨時隨地，抒發情緒，獲得即時回應。",
      welcome: "你好，我是 MindTree 的 AI 樹洞。我知道這段時間不容易，你想跟我聊聊嗎？",
      placeholder: "在此輸入你的感受...",
      disclaimer: "AI 僅供情緒支持，非醫療建議。如遇緊急危險請致電 999。"
    },
    humanRole: {
      title: "預約義工聆聽",
      desc: "由受過訓練的鄰舍義工與你線上對談。",
      headerVerified: "認證社工",
      headerPeer: "同行義工",
      systemJoin: "系統正在為您配對義工，請稍候...",
      waitingMessage: "已收到您的請求，義工很快就會加入。",
      placeholder: "輸入訊息...",
      caseResolved: "對話已結束。",
      report: "舉報"
    },
    intake: {
      title: "建立求助請求",
      desc: "簡單填寫，讓我們知道如何幫助你。",
      q1: "如何稱呼你？",
      q1_placeholder: "例如：陳先生 / 小美",
      q_age: "年齡層",
      q_age_opts: ["18歲以下", "18-25", "26-40", "41-60", "60歲以上"],
      q_gender: "性別",
      q_gender_opts: ["男", "女", "其他"],
      q3: "你現在的困擾程度 (1-5)",
      q4: "你需要哪方面的支援？",
      q4_opt1: "情緒困擾 (焦慮/失眠)",
      q4_opt2: "創傷後壓力 (回想火災)",
      q4_opt3: "生活安置問題",
      q4_opt4: "緊急/自傷念頭",
      q5: "還有什麼想告訴我們？",
      q5_placeholder: "簡述你的情況...",
      submit: "送出請求"
    },
    volunteer: {
      login: "義工登入",
      portalTitle: "義工平台",
      welcome: "歡迎回來",
      exit: "登出",
      authTitle: "義工認證",
      disclaimer: "感謝你為大埔社區付出。請輸入名稱加入。",
      nameLabel: "顯示名稱",
      namePlaceholder: "你的稱呼",
      joinBtn: "以同行義工身分加入",
      proJoinTitle: "專業人員 / 社工通道",
      codePlaceholder: "輸入認證碼",
      verifyBtn: "驗證並登入",
      errorMsg: "認證碼錯誤",
      activeRequests: "等待中的請求",
      noRequests: "目前沒有等待中的案件。",
      accept: "接聽",
      priority: { critical: "緊急", high: "高", medium: "中", low: "低" },
      topic: "求助主題",
      guidelinesTitle: "義工守則",
      guidelinesDesc: "在開始服務前，請務必閱讀以下守則。",
      rule1Title: "保持同理心",
      rule1Desc: "專注聆聽，不急於提供建議或批判。",
      rule2Title: "保密原則",
      rule2Desc: "嚴禁洩露求助者的任何個人資料。",
      rule3Title: "緊急情況",
      rule3Desc: "如遇對方有自殘傾向，請立即通報管理員。",
      acknowledgeBtn: "我同意並開始服務"
    },
    memo: {
      cheerUp: "或是留下祝福",
      label: "寫下打氣說話",
      title: "送上祝福",
      placeholder: "寫一句溫暖的話給大埔街坊...",
      btn: "發佈",
      success: "發佈成功！"
    },
    links: {
      btn: "實用資源連結",
      title: "社區資源",
      desc: "以下是一些相關的支援機構與熱線。",
      close: "關閉"
    },
    landingNotice: {
      disclaimer: "本平台由社區自發建立，旨在提供心理慰藉。",
      rules: "請保持友善，禁止發佈不當內容。"
    },
    actions: {
      cancel: "取消",
      back: "返回",
      leaveChat: "離開對話",
      endChat: "結束對話"
    },
    dialogs: {
      volLeaveMsg: "確定要離開此對話嗎？",
      citEndMsg: "確定要結束這次諮詢嗎？"
    }
  },
  en: {
    appTitle: "MindTree | Tai Po Support",
    appSubtitle: "We are here for you. Mental support for fire-affected residents.",
    startBtn: "Get Started",
    intro: {
      welcome: "Welcome to MindTree",
      desc: "A dedicated mental support space for Tai Po residents.",
      slide1Title: "Listen & Support",
      slide1Desc: "Whether it's anxiety, fear, or sadness, our AI and volunteers are here to listen.",
      slide2Title: "Professional Referral",
      slide2Desc: "We can help refer you to social workers or counseling resources if needed.",
    },
    aiRole: {
      title: "AI Tree Hole (24/7)",
      desc: "Express your feelings anytime, get instant support.",
      welcome: "Hello, I am MindTree AI. I know this is a tough time. Do you want to talk?",
      placeholder: "Type your feelings here...",
      disclaimer: "AI for emotional support only. Call 999 for emergencies."
    },
    humanRole: {
      title: "Talk to Volunteer",
      desc: "Chat online with trained peer volunteers.",
      headerVerified: "Social Worker",
      headerPeer: "Peer Volunteer",
      systemJoin: "Matching you with a volunteer, please wait...",
      waitingMessage: "Request received. A volunteer will join shortly.",
      placeholder: "Type a message...",
      caseResolved: "Chat ended.",
      report: "Report"
    },
    intake: {
      title: "Request Help",
      desc: "Fill in simple details to help us assist you.",
      q1: "What should we call you?",
      q1_placeholder: "e.g., Mr. Chan / Amy",
      q_age: "Age Group",
      q_age_opts: ["Under 18", "18-25", "26-40", "41-60", "Above 60"],
      q_gender: "Gender",
      q_gender_opts: ["Male", "Female", "Other"],
      q3: "Distress Level (1-5)",
      q4: "What support do you need?",
      q4_opt1: "Emotional (Anxiety/Insomnia)",
      q4_opt2: "PTSD (Flashbacks)",
      q4_opt3: "Housing/Living Issues",
      q4_opt4: "Urgent/Self-harm thoughts",
      q5: "Anything else?",
      q5_placeholder: "Briefly describe...",
      submit: "Submit Request"
    },
    volunteer: {
      login: "Volunteer Login",
      portalTitle: "Volunteer Portal",
      welcome: "Welcome back",
      exit: "Exit",
      authTitle: "Volunteer Access",
      disclaimer: "Thank you for supporting Tai Po. Enter your name to join.",
      nameLabel: "Display Name",
      namePlaceholder: "Your Name",
      joinBtn: "Join as Peer Volunteer",
      proJoinTitle: "Professional / Staff Access",
      codePlaceholder: "Enter Access Code",
      verifyBtn: "Verify & Login",
      errorMsg: "Invalid Code",
      activeRequests: "Active Requests",
      noRequests: "No active cases at the moment.",
      accept: "Accept",
      priority: { critical: "Critical", high: "High", medium: "Medium", low: "Low" },
      topic: "Topic",
      guidelinesTitle: "Guidelines",
      guidelinesDesc: "Please read the following rules before serving.",
      rule1Title: "Empathy First",
      rule1Desc: "Listen actively, do not rush to judge or advise.",
      rule2Title: "Confidentiality",
      rule2Desc: "Never disclose personal information of help-seekers.",
      rule3Title: "Emergency Protocol",
      rule3Desc: "Report immediately if self-harm risk is detected.",
      acknowledgeBtn: "I Agree & Start"
    },
    memo: {
      cheerUp: "Or leave a blessing",
      label: "Send Blessing",
      title: "Send Blessing",
      placeholder: "Write something warm for the neighbors...",
      btn: "Post",
      success: "Posted successfully!"
    },
    links: {
      btn: "Useful Resources",
      title: "Community Resources",
      desc: "Here are some helplines and support organizations.",
      close: "Close"
    },
    landingNotice: {
      disclaimer: "Community-driven platform for emotional comfort.",
      rules: "Please be kind. Inappropriate content is prohibited."
    },
    actions: {
      cancel: "Cancel",
      back: "Back",
      leaveChat: "Leave Chat",
      endChat: "End Chat"
    },
    dialogs: {
      volLeaveMsg: "Are you sure you want to leave this chat?",
      citEndMsg: "Are you sure you want to end this session?"
    }
  }
};
