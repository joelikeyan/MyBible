import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { VoiceProviderGateway } from './elevenLabsGateway';

function createGateway(): VoiceProviderGateway {
  return {
    createVoiceClone: vi.fn().mockResolvedValue({
      voiceId: 'voice_12345678',
      requiresVerification: false,
    }),
    deleteVoiceClone: vi.fn().mockResolvedValue(undefined),
    synthesizeSpeech: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
  };
}

describe('ElevenLabs API gateway', () => {
  it('creates a clone from an audio upload', async () => {
    const gateway = createGateway();
    const response = await request(createApp(gateway))
      .post('/v1/voice-clones')
      .field('name', 'Reading Voice')
      .field('consent', 'true')
      .attach('files', Buffer.from('audio'), {
        filename: 'sample.mp3',
        contentType: 'audio/mpeg',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      voiceId: 'voice_12345678',
      requiresVerification: false,
    });
    expect(gateway.createVoiceClone).toHaveBeenCalledOnce();
  });

  it('returns generated audio for a cloned voice', async () => {
    const gateway = createGateway();
    const response = await request(createApp(gateway))
      .post('/v1/read-aloud')
      .send({ text: 'In the beginning', voiceId: 'voice_12345678' });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('audio/mpeg');
    expect(response.body).toEqual(Buffer.from([1, 2, 3, 4]));
    expect(gateway.synthesizeSpeech).toHaveBeenCalledWith({
      text: 'In the beginning',
      voiceId: 'voice_12345678',
    });
  });

  it('rejects voice cloning without explicit consent', async () => {
    const gateway = createGateway();
    const response = await request(createApp(gateway))
      .post('/v1/voice-clones')
      .field('name', 'Reading Voice')
      .attach('files', Buffer.from('audio'), {
        filename: 'sample.mp3',
        contentType: 'audio/mpeg',
      });

    expect(response.status).toBe(400);
    expect(gateway.createVoiceClone).not.toHaveBeenCalled();
  });

  it('rejects invalid read-aloud requests before provider usage', async () => {
    const gateway = createGateway();
    const response = await request(createApp(gateway))
      .post('/v1/read-aloud')
      .send({ text: '', voiceId: 'invalid' });

    expect(response.status).toBe(400);
    expect(gateway.synthesizeSpeech).not.toHaveBeenCalled();
  });

  it('deletes a cloned voice', async () => {
    const gateway = createGateway();
    const response = await request(createApp(gateway))
      .delete('/v1/voice-clones/voice_12345678');

    expect(response.status).toBe(204);
    expect(gateway.deleteVoiceClone).toHaveBeenCalledWith('voice_12345678');
  });
});
