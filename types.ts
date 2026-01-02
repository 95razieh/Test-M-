
export type Language = 'fa' | 'en';
export type CoachTone = 'strict' | 'compassionate' | 'scientific' | 'enthusiastic';

export interface HabitTask {
  id: string;
  label: string;
  score: number; 
  category: HabitCategory;
  weight: number; 
  isGroupChallenge?: boolean;
}

export enum HabitCategory {
  HEALTH = 'HEALTH',
  MINDSET = 'MINDSET',
  ROUTINE = 'ROUTINE',
  DIET = 'DIET',
  COMMUNITY = 'COMMUNITY'
}

export interface SuperiorSelf {
  vision: string;
  blooming: string;
  identity: string;
  lifestyle: string;
  habits: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface Biometrics {
  height?: number;
  weight?: number; // Keeps last weight for quick access
  age?: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string;
}

export interface Friend {
  id: string;
  alias: string;
  evolutionScore: number;
  motto: string;
  avatar: string;
}

export interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  telegramId: string;
  preferredName: string; // New field: What should we call you?
  job: string;
  city: string;
  birthDate: string;
  onboarded: boolean;
  motto: string;
  language: Language;
  biometrics: Biometrics;
  weightHistory: WeightEntry[];
  superiorSelf: SuperiorSelf;
  coins: number; 
  coachTone: CoachTone;
  friends: Friend[];
  lifeContext?: string;
}

export interface DayProgress {
  date: string; 
  tasks: HabitTask[];
  note?: string;
}

export interface HistoryData {
  [date: string]: DayProgress;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  telegramLink: string;
  telegramChatId?: string; 
  requiredHabitLabels: string[];
  memberCount: string;
  icon: string;
  leaderName?: string;
  leaderAvatar?: string;
  joined?: boolean; 
  currentManagerId?: string; 
  dailyChallenge?: string;
  engagementScore?: number; 
  activeMembersCount?: number;
}
