export type Language = 'zh' | 'en';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TicketStatus = 'waiting' | 'active' | 'resolved';

export interface Ticket {
  id: string;
  name: string;
  issue: string;
  time: string;
  status: TicketStatus;
  priority: Priority;
  tags: string[];
  createdAt?: number;
}

export interface Message {
  id: string | number;
  text: string;
  isUser: boolean;
  sender: string;
  isVerified?: boolean;
  timestamp: number;
}

export interface VolunteerProfile {
  name: string;
  role: string;
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
  createdAt?: number;
}
