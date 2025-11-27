import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  NOTES: 'mybible_notes',
  HIGHLIGHTS: 'mybible_highlights',
  READING_PROGRESS: 'mybible_reading_progress',
  VOICE_SETTINGS: 'mybible_voice_settings',
  USER_PREFERENCES: 'mybible_preferences',
  CLONED_VOICES: 'mybible_cloned_voices',
  STUDY_ROOMS: 'mybible_study_rooms',
  BOOKMARKS: 'mybible_bookmarks',
};

// Types
export interface BibleNote {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BibleHighlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  createdAt: string;
}

export interface ReadingProgress {
  lastBook: string;
  lastChapter: number;
  lastVerse: number;
  timestamp: string;
}

export interface VoiceSettings {
  selectedVoiceId: string;
  pitch: number;
  rate: number;
  audioFirstMode: boolean;
}

export interface UserPreferences {
  textSize: number;
  highContrast: boolean;
  theme: 'light' | 'dark';
  defaultTranslation: string;
}

export interface ClonedVoice {
  id: string;
  name: string;
  sampleUri: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verse?: number;
  label?: string;
  createdAt: string;
}

// Storage Service
class StorageService {
  // Notes
  async saveNote(note: BibleNote): Promise<void> {
    const notes = await this.getNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      notes[existingIndex] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      notes.push({ ...note, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  }

  async getNotes(): Promise<BibleNote[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getNotesForPassage(book: string, chapter: number): Promise<BibleNote[]> {
    const notes = await this.getNotes();
    return notes.filter(n => n.book === book && n.chapter === chapter);
  }

  async deleteNote(noteId: string): Promise<void> {
    const notes = await this.getNotes();
    const filtered = notes.filter(n => n.id !== noteId);
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(filtered));
  }

  // Highlights
  async saveHighlight(highlight: BibleHighlight): Promise<void> {
    const highlights = await this.getHighlights();
    const existingIndex = highlights.findIndex(
      h => h.book === highlight.book && h.chapter === highlight.chapter && h.verse === highlight.verse
    );
    
    if (existingIndex >= 0) {
      highlights[existingIndex] = highlight;
    } else {
      highlights.push({ ...highlight, createdAt: new Date().toISOString() });
    }
    
    await AsyncStorage.setItem(KEYS.HIGHLIGHTS, JSON.stringify(highlights));
  }

  async getHighlights(): Promise<BibleHighlight[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.HIGHLIGHTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getHighlightsForPassage(book: string, chapter: number): Promise<BibleHighlight[]> {
    const highlights = await this.getHighlights();
    return highlights.filter(h => h.book === book && h.chapter === chapter);
  }

  async removeHighlight(book: string, chapter: number, verse: number): Promise<void> {
    const highlights = await this.getHighlights();
    const filtered = highlights.filter(
      h => !(h.book === book && h.chapter === chapter && h.verse === verse)
    );
    await AsyncStorage.setItem(KEYS.HIGHLIGHTS, JSON.stringify(filtered));
  }

  // Reading Progress
  async saveReadingProgress(progress: ReadingProgress): Promise<void> {
    await AsyncStorage.setItem(KEYS.READING_PROGRESS, JSON.stringify({
      ...progress,
      timestamp: new Date().toISOString(),
    }));
  }

  async getReadingProgress(): Promise<ReadingProgress | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.READING_PROGRESS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // Voice Settings
  async saveVoiceSettings(settings: VoiceSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.VOICE_SETTINGS, JSON.stringify(settings));
  }

  async getVoiceSettings(): Promise<VoiceSettings | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.VOICE_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // User Preferences
  async savePreferences(prefs: UserPreferences): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(prefs));
  }

  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // Cloned Voices
  async saveClonedVoice(voice: ClonedVoice): Promise<void> {
    const voices = await this.getClonedVoices();
    voices.push({ ...voice, createdAt: new Date().toISOString() });
    await AsyncStorage.setItem(KEYS.CLONED_VOICES, JSON.stringify(voices));
  }

  async getClonedVoices(): Promise<ClonedVoice[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CLONED_VOICES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async deleteClonedVoice(voiceId: string): Promise<void> {
    const voices = await this.getClonedVoices();
    const filtered = voices.filter(v => v.id !== voiceId);
    await AsyncStorage.setItem(KEYS.CLONED_VOICES, JSON.stringify(filtered));
  }

  // Bookmarks
  async saveBookmark(bookmark: Bookmark): Promise<void> {
    const bookmarks = await this.getBookmarks();
    bookmarks.push({ ...bookmark, createdAt: new Date().toISOString() });
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }

  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    const bookmarks = await this.getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== bookmarkId);
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(filtered));
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  }
}

export const storageService = new StorageService();

