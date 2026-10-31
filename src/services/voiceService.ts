import { Audio } from 'expo-av';
import { File, Paths } from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { VoiceProfile } from '../types';
import { requestBytes } from './httpClient';

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
  private sound: Audio.Sound | null = null;
  private audioFile: File | null = null;
  private objectUrl: string | null = null;
  private finishPlayback: (() => void) | null = null;

  async loadVoices(): Promise<void> {
    this.availableVoices = await Speech.getAvailableVoicesAsync();
  }

  async speak(text: string, voice?: VoiceProfile): Promise<void> {
    await this.stop();
    this.isSpeaking = true;

    try {
      if (voice?.type === 'clone') {
        await this.speakWithClonedVoice(text, voice.id);
      } else {
        await this.speakLocally(text, voice);
      }
    } finally {
      this.isSpeaking = false;
    }
  }

  private async speakLocally(text: string, voice?: VoiceProfile): Promise<void> {

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
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
        onStopped: () => {
          resolve();
        },
      });
    });
  }

  async stop(): Promise<void> {
    await Speech.stop();
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch {
      }
      this.sound = null;
    }
    this.releaseAudioResource();
    this.finishPlayback?.();
    this.finishPlayback = null;
    this.isSpeaking = false;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  private async speakWithClonedVoice(text: string, voiceId: string): Promise<void> {
    const audio = await requestBytes('/v1/read-aloud', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId }),
      timeoutMs: 120_000,
    });
    try {
      const uri = this.createAudioUri(audio);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      this.sound = sound;

      await new Promise<void>((resolve, reject) => {
        this.finishPlayback = resolve;
        sound.setOnPlaybackStatusUpdate(status => {
          if (!status.isLoaded) {
            if (status.error) {
              reject(new Error(status.error));
            }
            return;
          }
          if (status.didJustFinish) {
            resolve();
          }
        });
      });
    } finally {
      if (this.sound) {
        try {
          await this.sound.unloadAsync();
        } catch {
        }
        this.sound = null;
      }
      this.finishPlayback = null;
      this.releaseAudioResource();
    }
  }

  private createAudioUri(audio: Uint8Array): string {
    if (Platform.OS === 'web') {
      const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(audio.byteLength);
      bytes.set(audio);
      this.objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
      return this.objectUrl;
    }

    const file = new File(Paths.cache, `mybible-read-aloud-${Date.now()}.mp3`);
    file.write(audio);
    this.audioFile = file;
    return file.uri;
  }

  private releaseAudioResource(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    if (this.audioFile?.exists) {
      this.audioFile.delete();
    }
    this.audioFile = null;
  }
}

export const voiceService = new VoiceService();

