import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { storageService, ClonedVoice } from './storageService';
import { config } from '../config';

// Voice cloning configuration
const MIN_RECORDING_DURATION = 30; // seconds
const MAX_RECORDING_DURATION = 300; // 5 minutes
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

class VoiceCloningService {
  private recording: Audio.Recording | null = null;
  private recordingState: RecordingState = {
    isRecording: false,
    duration: 0,
    uri: null,
  };
  private durationInterval: NodeJS.Timeout | null = null;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  /**
   * Start recording audio for voice cloning
   */
  async startRecording(onDurationUpdate?: (duration: number) => void): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.recordingState = {
        isRecording: true,
        duration: 0,
        uri: null,
      };

      // Start duration timer
      this.durationInterval = setInterval(() => {
        this.recordingState.duration += 1;
        onDurationUpdate?.(this.recordingState.duration);

        // Auto-stop at max duration
        if (this.recordingState.duration >= MAX_RECORDING_DURATION) {
          this.stopRecording();
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  /**
   * Stop recording and get the audio file
   */
  async stopRecording(): Promise<{ uri: string; duration: number } | null> {
    try {
      if (!this.recording) {
        return null;
      }

      if (this.durationInterval) {
        clearInterval(this.durationInterval);
        this.durationInterval = null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const duration = this.recordingState.duration;

      this.recording = null;
      this.recordingState = {
        isRecording: false,
        duration: 0,
        uri: uri,
      };

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      if (uri && duration >= MIN_RECORDING_DURATION) {
        return { uri, duration };
      } else if (duration < MIN_RECORDING_DURATION) {
        console.warn(`Recording too short: ${duration}s (min: ${MIN_RECORDING_DURATION}s)`);
        return null;
      }

      return null;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  /**
   * Cancel current recording
   */
  async cancelRecording(): Promise<void> {
    try {
      if (this.durationInterval) {
        clearInterval(this.durationInterval);
        this.durationInterval = null;
      }

      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }

      this.recordingState = {
        isRecording: false,
        duration: 0,
        uri: null,
      };
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  }

  /**
   * Pick an audio file from device storage
   */
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
        throw new Error(`Unsupported format: ${extension}. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
      }

      return {
        uri: asset.uri,
        name: asset.name,
      };
    } catch (error) {
      console.error('Error picking audio file:', error);
      return null;
    }
  }

  /**
   * Create a voice clone from audio file
   */
  async createVoiceClone(
    audioUri: string,
    voiceName: string,
    onProgress?: (progress: number) => void
  ): Promise<VoiceCloneResult> {
    if (config.elevenLabs.apiKey) {
      return this.createRealVoiceClone(audioUri, voiceName, onProgress);
    }
    return this.createMockVoiceClone(audioUri, voiceName, onProgress);
  }

  private async createRealVoiceClone(
    audioUri: string,
    voiceName: string,
    onProgress?: (progress: number) => void
  ): Promise<VoiceCloneResult> {
    try {
      onProgress?.(10);

      const formData = new FormData();
      formData.append('name', voiceName);
      formData.append('description', 'Cloned via MyBible App');

      // Fetch file content to blob/file for upload
      // Note: In React Native, FormData works with uri/type/name object
      formData.append('files', {
        uri: audioUri,
        name: 'recording.m4a', // You might need to detect actual type
        type: 'audio/m4a'
      } as any);

      onProgress?.(30);

      const response = await fetch(config.elevenLabs.voiceCloneUrl, {
        method: 'POST',
        headers: {
          'xi-api-key': config.elevenLabs.apiKey,
          // 'Content-Type': 'multipart/form-data', // Often handled automatically by fetch with FormData
        },
        body: formData,
      });

      onProgress?.(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'ElevenLabs API Error');
      }

      const data = await response.json();
      const voiceId = data.voice_id;

      // Save locally
      const clonedVoice: ClonedVoice = {
        id: voiceId,
        name: voiceName,
        sampleUri: audioUri,
        createdAt: new Date().toISOString(),
      };
      await storageService.saveClonedVoice(clonedVoice);

      onProgress?.(100);

      return {
        success: true,
        voiceId,
      };

    } catch (error) {
      console.error('Real Voice Clone Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async createMockVoiceClone(
    audioUri: string,
    voiceName: string,
    onProgress?: (progress: number) => void
  ): Promise<VoiceCloneResult> {
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        onProgress?.(i);
      }

      const voiceId = `clone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const clonedVoice: ClonedVoice = {
        id: voiceId,
        name: voiceName,
        sampleUri: audioUri,
        createdAt: new Date().toISOString(),
      };

      await storageService.saveClonedVoice(clonedVoice);

      return {
        success: true,
        voiceId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a cloned voice
   */
  async deleteVoiceClone(voiceId: string): Promise<boolean> {
    try {
      await storageService.deleteClonedVoice(voiceId);
      // If using real API, we should also delete from ElevenLabs here
      return true;
    } catch (error) {
      console.error('Error deleting voice clone:', error);
      return false;
    }
  }

  /**
   * Get all cloned voices
   */
  async getClonedVoices(): Promise<ClonedVoice[]> {
    return storageService.getClonedVoices();
  }

  /**
   * Play audio preview
   */
  async playPreview(uri: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();

      // Unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing preview:', error);
    }
  }

  /**
   * Format duration as MM:SS
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Check if recording duration is sufficient
   */
  isRecordingValid(duration: number): boolean {
    return duration >= MIN_RECORDING_DURATION;
  }

  /**
   * Get minimum required recording duration
   */
  getMinDuration(): number {
    return MIN_RECORDING_DURATION;
  }

  /**
   * Get current recording state
   */
  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }
}

export const voiceCloningService = new VoiceCloningService();
