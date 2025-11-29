
export type Language = 'zh' | 'en';

export type UserRole = 'citizen' | 'volunteer' | null;

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 'waiting' | 'active' | 'resolved';

export interface Ticket {
  id: string;
  name: string;
  issue: string;
  time: string; // Display string like "2 mins ago"
  status: TicketStatus;
  priority: Priority;
  tags: string[];
  gender?: string;
  ageRange?: string;
  safetySafe?: boolean;
}

export interface Message {
  id: number | string;
  text: string;
  isUser: boolean;
  sender: string;
  isVerified?: boolean; // For verified counselors
  timestamp?: number;
}

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  type?: 'privacy' | 'offensive' | 'safe' | 'promotional' | 'illegal' | 'hkid' | 'offensive_en' | 'offensive_zh' | 'illegal_en' | 'illegal_zh' | 'harm_zh';
}

export interface VolunteerProfile {
  name: string;
  role: 'Peer Listener' | 'Social Worker';
  isVerified: boolean;
}

export interface PublicMemo {
  id: string;
  text: string;
  style: {
    left: string;
    animationDuration: string;
    animationDelay: string;
    scale: number;
  };
}
