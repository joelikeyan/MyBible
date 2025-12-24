export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  type: 'narrator' | 'clone';
  audioUri?: string;
}

export interface StudyRoom {
  id: string;
  name: string;
  description: string;
  host: string;
  participants: number;
  schedule?: string;
  isPublic: boolean;
}

export interface StudyPlan {
  id: string;
  name: string;
  description: string;
  progress?: number;
}

export interface UpcomingSession {
  id: string;
  title: string;
  time: string;
  host: string;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOwn?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  avatar?: string;
  unread?: number;
}

export interface InterlinearWord {
  text: string;
  transliteration?: string;
  strongs?: string;
  grammar?: string;
  definition?: string;
  englishGloss?: string; // The translated word corresponding to this original word
}

export interface BibleVerse {
  number: number;
  originalText: string;
  englishText: string;
  language: 'hebrew' | 'greek' | 'aramaic';
  transliteration?: string;
  strongsNumbers?: string[];
  words?: InterlinearWord[];
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
  language: 'hebrew' | 'greek' | 'aramaic';
}
