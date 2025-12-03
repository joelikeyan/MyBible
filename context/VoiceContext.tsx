import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { VoiceProfile } from '../types';
import { voiceCloningService } from '../services/voiceCloningService';
import { ClonedVoice } from '../services/storageService';
import { storageService } from '../services/storageService';

interface VoiceContextType {
  selectedVoice: VoiceProfile;
  setSelectedVoice: (voice: VoiceProfile) => void;
  voices: VoiceProfile[];
  addVoice: (voice: VoiceProfile) => void;
  removeVoice: (id: string) => void;
  refreshVoices: (preferredId?: string) => Promise<void>;
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
  const [preferredVoiceId, setPreferredVoiceId] = useState<string | undefined>();

  const persistVoiceSettings = useCallback(
    async (updates: Partial<{ selectedVoiceId: string; audioFirstMode: boolean }>) => {
      const existingSettings = await storageService.getVoiceSettings();
      await storageService.saveVoiceSettings({
        selectedVoiceId: updates.selectedVoiceId ?? existingSettings?.selectedVoiceId ?? selectedVoice.id,
        pitch: existingSettings?.pitch ?? 1,
        rate: existingSettings?.rate ?? 1,
        audioFirstMode: updates.audioFirstMode ?? existingSettings?.audioFirstMode ?? audioFirstMode,
      });
    },
    [audioFirstMode, selectedVoice.id]
  );

  const buildVoiceProfiles = useCallback((clonedVoices: ClonedVoice[]): VoiceProfile[] => {
    const cloneProfiles: VoiceProfile[] = clonedVoices.map(voice => ({
      id: voice.id,
      name: voice.name,
      description: 'Custom cloned voice',
      type: 'clone',
      audioUri: voice.sampleUri,
    }));

    return [...defaultNarrators, ...cloneProfiles];
  }, []);

  const ensureValidSelection = useCallback(
    (updatedVoices: VoiceProfile[], preferredId?: string) => {
      const candidates = [preferredId, selectedVoice.id].filter(Boolean) as string[];
      const matchedVoice = candidates
        .map(candidateId => updatedVoices.find(voice => voice.id === candidateId))
        .find(Boolean);

      const nextVoice = matchedVoice ?? updatedVoices[0] ?? defaultNarrators[0];
      setSelectedVoice(nextVoice);
      persistVoiceSettings({ selectedVoiceId: nextVoice.id });
    },
    [persistVoiceSettings, selectedVoice.id]
  );

  const refreshVoices = useCallback(
    async (preferredId?: string) => {
      const targetId = preferredId ?? preferredVoiceId;
      try {
        const clonedVoices = await voiceCloningService.getClonedVoices();
        const updatedVoices = buildVoiceProfiles(clonedVoices);
        setVoices(updatedVoices);
        ensureValidSelection(updatedVoices, targetId);
      } catch (error) {
        console.error('Failed to refresh voices', error);
      }
    },
    [buildVoiceProfiles, ensureValidSelection, preferredVoiceId]
  );

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await storageService.getVoiceSettings();
      if (settings?.selectedVoiceId) {
        setPreferredVoiceId(settings.selectedVoiceId);
      }
      if (settings?.audioFirstMode !== undefined) {
        setAudioFirstMode(settings.audioFirstMode);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    refreshVoices(preferredVoiceId);
  }, [preferredVoiceId, refreshVoices]);

  const handleSelectVoice = useCallback(
    (voice: VoiceProfile) => {
      setSelectedVoice(voice);
      void persistVoiceSettings({ selectedVoiceId: voice.id });
    },
    [persistVoiceSettings]
  );

  const addVoice = (voice: VoiceProfile) => {
    setVoices(prev => [...prev, voice]);
  };

  const removeVoice = (id: string) => {
    setVoices(prev => {
      const updatedVoices = prev.filter(v => v.id !== id);
      ensureValidSelection(updatedVoices);
      return updatedVoices;
    });
  };

  return (
    <VoiceContext.Provider value={{
      selectedVoice,
      setSelectedVoice: handleSelectVoice,
      voices,
      addVoice,
      removeVoice,
      refreshVoices,
      audioFirstMode,
      setAudioFirstMode: enabled => {
        setAudioFirstMode(enabled);
        void persistVoiceSettings({ audioFirstMode: enabled });
      },
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

