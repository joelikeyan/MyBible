import * as Speech from 'expo-speech';
import { VoiceProfile } from '../types';

// Voice configurations for different narrator profiles
const voiceConfigs: Record<string, { pitch: number; rate: number; voice?: string }> = {
  'narrator-1': { pitch: 0.9, rate: 0.85 },   // David - calm, warm male
  'narrator-2': { pitch: 1.2, rate: 0.9 },    // Sarah - clear, gentle female
  'narrator-3': { pitch: 0.7, rate: 0.8 },    // Michael - deep, authoritative
  'narrator-4': { pitch: 1.3, rate: 0.85 },   // Grace - soft, soothing female
};

class VoiceService {
  private isSpeaking = false;
  private availableVoices: Speech.Voice[] = [];

  async loadVoices(): Promise<void> {
    this.availableVoices = await Speech.getAvailableVoicesAsync();
  }

  async speak(text: string, voice?: VoiceProfile): Promise<void> {
    if (this.isSpeaking) {
      await this.stop();
    }

    this.isSpeaking = true;

    // Get voice configuration based on selected profile
    const config = voice ? voiceConfigs[voice.id] : undefined;
    const pitch = config?.pitch ?? 1.0;
    const rate = config?.rate ?? 0.9;

    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        language: 'en-US',
        pitch,
        rate,
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: (error) => {
          this.isSpeaking = false;
          reject(error);
        },
        onStopped: () => {
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  async stop(): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceService = new VoiceService();

