import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { storageService, ClonedVoice } from './storageService';
import { requestJson } from './httpClient';

const MIN_RECORDING_DURATION = 30;
const MAX_RECORDING_DURATION = 300;
const SUPPORTED_FORMATS = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

interface RecordingState {
  isRecording: boolean;
  duration: number;
  uri: string | null;
}

interface VoiceCloneResult {
  success: boolean;
  voiceId?: string;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getAudioMetadata(uri: string): { name: string; type: string } {
  const path = uri.split(/[?#]/)[0];
  const extension = path.split('.').pop()?.toLowerCase();
  const safeExtension = extension && SUPPORTED_FORMATS.includes(extension) ? extension : 'm4a';
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
  };
  return { name: `recording.${safeExtension}`, type: mimeTypes[safeExtension] };
}

class VoiceCloningService {
  private recording: Audio.Recording | null = null;
  private recordingState: RecordingState = {
    isRecording: false,
    duration: 0,
    uri: null,
  };
  private durationInterval: ReturnType<typeof setInterval> | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async startRecording(onDurationUpdate?: (duration: number) => void): Promise<boolean> {
    try {
      if (!(await this.requestPermissions())) {
        throw new Error('Microphone permission not granted.');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      this.recordingState = { isRecording: true, duration: 0, uri: null };
      this.durationInterval = setInterval(() => {
        this.recordingState.duration += 1;
        onDurationUpdate?.(this.recordingState.duration);
        if (this.recordingState.duration >= MAX_RECORDING_DURATION) {
          void this.stopRecording();
        }
      }, 1000);
      return true;
    } catch {
      await this.resetRecordingState();
      return false;
    }
  }

  async stopRecording(): Promise<{ uri: string; duration: number } | null> {
    if (!this.recording) {
      return null;
    }

    try {
      this.clearDurationInterval();
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const duration = this.recordingState.duration;
      this.recording = null;
      this.recordingState = { isRecording: false, duration: 0, uri };
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      return uri && duration >= MIN_RECORDING_DURATION ? { uri, duration } : null;
    } catch {
      await this.resetRecordingState();
      return null;
    }
  }

  async cancelRecording(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
      }
    }
    await this.resetRecordingState();
  }

  async pickAudioFile(): Promise<{ uri: string; name: string } | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      const asset = result.assets[0];
      const extension = asset.name.split('.').pop()?.toLowerCase();
      if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
        throw new Error(`Unsupported audio format: ${extension ?? 'unknown'}.`);
      }
      return { uri: asset.uri, name: asset.name };
    } catch {
      return null;
    }
  }

  async createVoiceClone(
    audioUri: string,
    voiceName: string,
    onProgress?: (progress: number) => void
  ): Promise<VoiceCloneResult> {
    const normalizedName = voiceName.trim();
    if (!audioUri || !normalizedName) {
      return { success: false, error: 'An audio file and voice name are required.' };
    }

    try {
      onProgress?.(10);
      const metadata = getAudioMetadata(audioUri);
      const formData = new FormData();
      formData.append('name', normalizedName);
      formData.append('consent', 'true');
      formData.append('files', { uri: audioUri, ...metadata } as unknown as Blob);
      onProgress?.(30);

      const payload = await requestJson<unknown>('/v1/voice-clones', {
        method: 'POST',
        body: formData,
        timeoutMs: 120_000,
      });
      onProgress?.(90);

      if (!isRecord(payload) || typeof payload.voiceId !== 'string' || !payload.voiceId.trim()) {
        throw new Error('Voice service returned an invalid response.');
      }

      const clonedVoice: ClonedVoice = {
        id: payload.voiceId,
        name: normalizedName,
        sampleUri: audioUri,
        createdAt: new Date().toISOString(),
      };
      await storageService.saveClonedVoice(clonedVoice);
      onProgress?.(100);
      return { success: true, voiceId: payload.voiceId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Voice cloning failed.',
      };
    }
  }

  async deleteVoiceClone(voiceId: string): Promise<boolean> {
    try {
      await requestJson<void>(`/v1/voice-clones/${encodeURIComponent(voiceId)}`, {
        method: 'DELETE',
      });
      await storageService.deleteClonedVoice(voiceId);
      return true;
    } catch {
      return false;
    }
  }

  getClonedVoices(): Promise<ClonedVoice[]> {
    return storageService.getClonedVoices();
  }

  async playPreview(uri: string): Promise<void> {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) {
        void sound.unloadAsync();
      }
    });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  isRecordingValid(duration: number): boolean {
    return duration >= MIN_RECORDING_DURATION;
  }

  getMinDuration(): number {
    return MIN_RECORDING_DURATION;
  }

  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }

  private clearDurationInterval(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  private async resetRecordingState(): Promise<void> {
    this.clearDurationInterval();
    this.recording = null;
    this.recordingState = { isRecording: false, duration: 0, uri: null };
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch {
    }
  }
}

export const voiceCloningService = new VoiceCloningService();
