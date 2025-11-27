import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VoiceProfile } from '../types';

interface VoiceContextType {
  selectedVoice: VoiceProfile;
  setSelectedVoice: (voice: VoiceProfile) => void;
  voices: VoiceProfile[];
  addVoice: (voice: VoiceProfile) => void;
  removeVoice: (id: string) => void;
  audioFirstMode: boolean;
  setAudioFirstMode: (enabled: boolean) => void;
  textSize: number;
  setTextSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const defaultNarrators: VoiceProfile[] = [
  { id: 'narrator-1', name: 'David', description: 'Calm, warm male voice', type: 'narrator' },
  { id: 'narrator-2', name: 'Sarah', description: 'Clear, gentle female voice', type: 'narrator' },
  { id: 'narrator-3', name: 'Michael', description: 'Deep, authoritative male voice', type: 'narrator' },
  { id: 'narrator-4', name: 'Grace', description: 'Soft, soothing female voice', type: 'narrator' },
];

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(defaultNarrators[0]);
  const [voices, setVoices] = useState<VoiceProfile[]>(defaultNarrators);
  const [audioFirstMode, setAudioFirstMode] = useState(false);
  const [textSize, setTextSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  const addVoice = (voice: VoiceProfile) => {
    setVoices(prev => [...prev, voice]);
  };

  const removeVoice = (id: string) => {
    setVoices(prev => prev.filter(v => v.id !== id));
    if (selectedVoice.id === id) {
      setSelectedVoice(defaultNarrators[0]);
    }
  };

  return (
    <VoiceContext.Provider value={{
      selectedVoice,
      setSelectedVoice,
      voices,
      addVoice,
      removeVoice,
      audioFirstMode,
      setAudioFirstMode,
      textSize,
      setTextSize,
      highContrast,
      setHighContrast,
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}

