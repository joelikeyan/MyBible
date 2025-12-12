import { API_KEYS } from '../config/ApiConfig';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface Voice {
  voice_id: string;
  name: string;
  preview_url?: string;
}

export const ElevenLabsService = {
  // 1. Get List of Voices
  getVoices: async (): Promise<Voice[]> => {
    try {
      const response = await fetch(API_KEYS.elevenLabs.voicesUrl, {
        headers: {
          'xi-api-key': API_KEYS.elevenLabs.apiKey,
        },
      });
      const data = await response.json();
      return data.voices.map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name,
        preview_url: v.preview_url,
      }));
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  },

  // 2. Add Voice (Cloning)
  // Note: For web verification, we'll need to handle file uploads carefully.
  // In a real device, we use FormData with the file uri.
  addVoice: async (name: string, audioUri: string): Promise<Voice | null> => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', 'User cloned voice from MyBible App');

      // Handle file append differently for Web vs Native
      if (Platform.OS === 'web') {
        // On web, audioUri is likely a blob URL or base64.
        // For this prototype, we might need to fetch the blob first if it's a blob url
        const res = await fetch(audioUri);
        const blob = await res.blob();
        formData.append('files', blob, 'recording.mp3');
      } else {
        // Native
        formData.append('files', {
          uri: audioUri,
          name: 'recording.mp3',
          type: 'audio/mpeg',
        } as any);
      }

      const response = await fetch(API_KEYS.elevenLabs.voiceCloneUrl, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEYS.elevenLabs.apiKey,
          // Content-Type is set automatically by FormData
        },
        body: formData,
      });

      const data = await response.json();
      if (data.voice_id) {
        return { voice_id: data.voice_id, name: name };
      }
      console.error('Clone failed:', data);
      return null;
    } catch (error) {
      console.error('Error cloning voice:', error);
      return null;
    }
  },

  // 3. Text to Speech
  // Returns a playable URL or file path
  textToSpeech: async (text: string, voiceId: string): Promise<string | null> => {
    try {
      const url = `${API_KEYS.elevenLabs.ttsUrl}/${voiceId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEYS.elevenLabs.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        console.error('TTS Error:', await response.text());
        return null;
      }

      // For Expo AV, we can often play the blob URL on web, or save to file on Native
      if (Platform.OS === 'web') {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } else {
        // Native: Save to cache directory
        const fileUri = FileSystem.cacheDirectory + `tts_${Date.now()}.mp3`;
        // Fetch gives us a blob/buffer. On native we might need 'expo-file-system' download if we want to stream to file?
        // Actually, simpler to just return the response as base64 or write bytes.
        // Or simpler: Use FileSystem.downloadAsync if we had a direct GET url.
        // Since it's POST, we must read the blob and write it.
        // Simplest workaround for prototype: Convert blob to base64.
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve) => {
           reader.onloadend = async () => {
              const base64data = (reader.result as string).split(',')[1];
              await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
              resolve(fileUri);
           };
           reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      console.error('Error TTS:', error);
      return null;
    }
  },
};
