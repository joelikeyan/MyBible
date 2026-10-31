import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export interface VoiceSample {
  bytes: Uint8Array;
  filename: string;
  contentType: string;
}

export interface CreateVoiceCloneInput {
  name: string;
  samples: VoiceSample[];
}

export interface SynthesizeSpeechInput {
  text: string;
  voiceId: string;
}

export interface VoiceProviderGateway {
  createVoiceClone(input: CreateVoiceCloneInput): Promise<{
    voiceId: string;
    requiresVerification: boolean;
  }>;
  deleteVoiceClone(voiceId: string): Promise<void>;
  synthesizeSpeech(input: SynthesizeSpeechInput): Promise<Uint8Array>;
}

async function collectAudio(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  const reader = stream.getReader();

  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(chunk);
    totalLength += chunk.byteLength;
  }

  const audio = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    audio.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return audio;
}

export class ElevenLabsGateway implements VoiceProviderGateway {
  private readonly client: ElevenLabsClient;

  constructor(apiKey: string) {
    this.client = new ElevenLabsClient({ apiKey });
  }

  async createVoiceClone(input: CreateVoiceCloneInput) {
    const files = input.samples.map(sample => {
      const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(sample.bytes.byteLength);
      bytes.set(sample.bytes);
      return new File([bytes], sample.filename, { type: sample.contentType });
    });
    const voice = await this.client.voices.ivc.create({
      name: input.name,
      files,
      description: 'MyBible read-aloud voice',
      removeBackgroundNoise: false,
    });
    return {
      voiceId: voice.voiceId,
      requiresVerification: voice.requiresVerification,
    };
  }

  async deleteVoiceClone(voiceId: string): Promise<void> {
    await this.client.voices.delete(voiceId);
  }

  async synthesizeSpeech(input: SynthesizeSpeechInput): Promise<Uint8Array> {
    const stream = await this.client.textToSpeech.convert(input.voiceId, {
      text: input.text,
      modelId: 'eleven_v4',
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        stability: 0.7,
        similarityBoost: 0.5,
      },
    });
    return collectAudio(stream);
  }
}
