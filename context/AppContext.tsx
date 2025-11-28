

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Ticket, Message, VolunteerProfile, Priority, TicketStatus, PublicMemo } from '../types';

interface AppContextType {
  tickets: Ticket[];
  chats: Record<string, Message[]>;
  volunteerProfile: VolunteerProfile;
  publicMemos: PublicMemo[];
  createTicket: (name: string, issue: string, priority: Priority, tags: string[]) => Ticket;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  addMessage: (ticketId: string, msg: Message) => void;
  getMessages: (ticketId: string) => Message[];
  setVolunteerProfile: (profile: VolunteerProfile) => void;
  addPublicMemo: (text: string) => void;
}

const INITIAL_TICKETS: Ticket[] = [
  { id: 't1', name: "Ms. Chan (F, 26-40)", issue: "Anxious about returning home after fire", time: "2m ago", status: 'waiting', priority: 'medium', tags: ['Anxiety', 'Housing'] },
  { id: 't2', name: "Mr. Wong (M, 41-60)", issue: "Flashbacks of fire, insomnia", time: "5m ago", status: 'waiting', priority: 'high', tags: ['Trauma', 'Sleep'] },
];

const INITIAL_MEMOS_TEXT: string[] = [
  "大埔人加油！💪",
  "Stay strong everyone ❤️",
  "平安就好 🙏",
  "We are with you",
  "小心身體，多飲水",
  "有事慢慢講，大家都會幫手",
  "Love from Tai Po ❤️",
  "富亨邨加油！",
  "撐住呀！",
  "You are not alone",
  "大埔一家人",
  "雨後總有彩虹 🌈"
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Load initial state from LocalStorage if available
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem('mindtree_tickets');
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch (e) { return INITIAL_TICKETS; }
  });

  const [chats, setChats] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('mindtree_chats');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>(() => {
    try {
      const saved = localStorage.getItem('mindtree_volunteer');
      return saved ? JSON.parse(saved) : { name: "Volunteer", role: "Peer Listener", isVerified: false };
    } catch (e) { return { name: "Volunteer", role: "Peer Listener", isVerified: false }; }
  });

  const [publicMemos, setPublicMemos] = useState<PublicMemo[]>([]);

  // Persist to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mindtree_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('mindtree_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('mindtree_volunteer', JSON.stringify(volunteerProfile));
  }, [volunteerProfile]);

  // Initialize memos (Client-side only to ensure animation randomness)
  useEffect(() => {
    // Generate bubbles
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

    // Try to load user added memos from LS
    const savedUserMemos = localStorage.getItem('mindtree_user_memos');
    const userMemos = savedUserMemos ? JSON.parse(savedUserMemos) : [];
    
    setPublicMemos([...generateInitial(), ...userMemos]);
  }, []);

  const createTicket = (name: string, issue: string, priority: Priority, tags: string[]) => {
    const newTicket: Ticket = { 
      id: `t${Date.now()}`, 
      name, 
      issue, 
      time: "Just now", 
      status: 'waiting', 
      priority, 
      tags
    };
    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
  };

  const addMessage = (ticketId: string, msg: Message) => {
    setChats(prev => ({ 
      ...prev, 
      [ticketId]: [...(prev[ticketId] || []), { ...msg, timestamp: Date.now() }] 
    }));
  };

  const addPublicMemo = (text: string) => {
    const newMemo: PublicMemo = {
      id: `memo-${Date.now()}`,
      text,
      style: {
        left: `${Math.random() * 90}%`,
        animationDuration: `${Math.random() * 20 + 40}s`, 
        animationDelay: '0s', 
        scale: Math.random() * 0.5 + 1.0 
      }
    };
    
    setPublicMemos(prev => {
        const updated = [...prev.slice(-59), newMemo];
        // Identify which are user-created (non-init) to save to LS
        const userCreated = updated.filter(m => m.id.startsWith('memo-'));
        localStorage.setItem('mindtree_user_memos', JSON.stringify(userCreated));
        return updated;
    }); 
  };

  const getMessages = (ticketId: string) => chats[ticketId] || [];

  return (
    <AppContext.Provider value={{ 
      tickets, 
      chats,
      createTicket, 
      updateTicketStatus, 
      addMessage, 
      getMessages, 
      volunteerProfile, 
      setVolunteerProfile,
      publicMemos,
      addPublicMemo
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
