import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Ticket, Message, VolunteerProfile, Priority, TicketStatus, PublicMemo } from '../types';
import { db } from '../firebaseConfig'; 
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

interface AppContextType {
  tickets: Ticket[];
  chats: Record<string, Message[]>;
  volunteerProfile: VolunteerProfile;
  publicMemos: PublicMemo[];
  // 【修正 1】將回傳型別從 Promise<void> 改為 Promise<string>
  createTicket: (name: string, issue: string, priority: Priority, tags: string[]) => Promise<string>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  addMessage: (ticketId: string, msg: Message) => void;
  getMessages: (ticketId: string) => Message[];
  setVolunteerProfile: (profile: VolunteerProfile) => void;
  addPublicMemo: (text: string) => void;
}

const INITIAL_MEMOS_TEXT: string[] = [
  "大埔人加油！💪", "Stay strong everyone ❤️", "平安就好 🙏",
  "We are with you", "小心身體，多飲水", "有事慢慢講，大家都會幫手",
  "Love from Tai Po ❤️", "富亨邨加油！", "撐住呀！",
  "You are not alone", "大埔一家人", "雨後總有彩虹 🌈"
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [publicMemos, setPublicMemos] = useState<PublicMemo[]>([]);

  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>(() => {
    try {
      const saved = localStorage.getItem('mindtree_volunteer');
      return saved ? JSON.parse(saved) : { name: "Volunteer", role: "Peer Listener", isVerified: false };
    } catch (e) { return { name: "Volunteer", role: "Peer Listener", isVerified: false }; }
  });

  useEffect(() => {
    const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudTickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
      setTickets(cloudTickets);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newChats: Record<string, Message[]> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const ticketId = data.ticketId;
        if (!newChats[ticketId]) newChats[ticketId] = [];
        newChats[ticketId].push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          isUser: data.isUser,
          timestamp: data.timestamp,
        });
      });
      setChats(newChats);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const generateInitial = () => Array.from({ length: 40 }).map((_, i) => {
      const text = INITIAL_MEMOS_TEXT[i % INITIAL_MEMOS_TEXT.length];
      return {
        id: `init-${i}`,
        text,
        style: {
          left: `${Math.random() * 90}%`, 
          animationDuration: `${Math.random() * 30 + 35}s`, 
          animationDelay: `-${Math.random() * 60}s`, 
          scale: Math.random() * 0.5 + 1.0 
        }
      };
    });

    const unsubscribe = onSnapshot(collection(db, "memos"), (snapshot) => {
      const cloudMemos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PublicMemo[];
      setPublicMemos([...generateInitial(), ...cloudMemos]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('mindtree_volunteer', JSON.stringify(volunteerProfile));
  }, [volunteerProfile]);

  // --- Actions ---

  const createTicket = async (name: string, issue: string, priority: Priority, tags: string[]) => {
    // 【修正 2】將新增的 Document 存入變數 docRef
    const docRef = await addDoc(collection(db, "tickets"), {
      name,
      issue,
      priority,
      tags,
      status: 'waiting',
      time: "Just now",
      createdAt: Date.now()
    });
    
    // 【修正 3】回傳 docRef.id (這是修復白畫面的關鍵！)
    return docRef.id;
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, { status });
  };

  const addMessage = async (ticketId: string, msg: Message) => {
    await addDoc(collection(db, "messages"), {
      ticketId,
      text: msg.text,
      sender: msg.sender,
      isUser: msg.isUser,
      timestamp: Date.now()
    });
  };

  const addPublicMemo = async (text: string) => {
    await addDoc(collection(db, "memos"), {
      text,
      style: {
        left: `${Math.random() * 90}%`,
        animationDuration: `${Math.random() * 20 + 40}s`,
        animationDelay: '0s',
        scale: Math.random() * 0.5 + 1.0
      },
      createdAt: Date.now()
    });
  };

  const getMessages = (ticketId: string) => chats[ticketId] || [];

  return (
    <AppContext.Provider value={{ 
      tickets, chats, createTicket, updateTicketStatus, 
      addMessage, getMessages, volunteerProfile, 
      setVolunteerProfile, publicMemos, addPublicMemo
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
