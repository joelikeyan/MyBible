import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import multer from 'multer';
import { VoiceProviderGateway } from './elevenLabsGateway';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const MAX_SPEECH_CHARACTERS = 10_000;
const VOICE_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const AUDIO_TYPES = new Set([
  'audio/aac',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/x-m4a',
  'audio/x-wav',
]);

function parseAllowedOrigins(value: string | undefined): Set<string> {
  return new Set(
    (value ?? 'http://localhost:19006,http://localhost:8081,http://localhost:5173')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  );
}

function getMessage(error: unknown): string {
  if (error instanceof multer.MulterError) {
    return error.code === 'LIMIT_FILE_SIZE'
      ? 'Each voice sample must be 25 MB or smaller.'
      : error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'The voice provider request failed.';
}

export function createApp(
  gateway: VoiceProviderGateway,
  options: { allowedOrigins?: string } = {}
) {
  const app = express();
  const allowedOrigins = parseAllowedOrigins(options.allowedOrigins);
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_AUDIO_BYTES, files: 5 },
    fileFilter: (_request, file, callback) => {
      callback(null, AUDIO_TYPES.has(file.mimetype));
    },
  });
  const providerLimiter = rateLimit({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  }));
  app.use(express.json({ limit: '64kb' }));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.post('/v1/voice-clones', providerLimiter, upload.array('files', 5), async (request, response, next) => {
    try {
      const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
      const hasConsent = request.body.consent === 'true';
      const files = Array.isArray(request.files) ? request.files : [];
      if (!name || name.length > 100) {
        response.status(400).json({ message: 'Voice name must contain 1 to 100 characters.' });
        return;
      }
      if (files.length === 0) {
        response.status(400).json({ message: 'At least one supported audio sample is required.' });
        return;
      }
      if (!hasConsent) {
        response.status(400).json({
          message: 'Voice ownership or explicit authorization must be confirmed.',
        });
        return;
      }

      const result = await gateway.createVoiceClone({
        name,
        samples: files.map(file => ({
          bytes: file.buffer,
          filename: file.originalname,
          contentType: file.mimetype,
        })),
      });
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/v1/voice-clones/:voiceId', providerLimiter, async (request, response, next) => {
    try {
      const voiceId = Array.isArray(request.params.voiceId)
        ? request.params.voiceId[0]
        : request.params.voiceId;
      if (!voiceId || !VOICE_ID_PATTERN.test(voiceId)) {
        response.status(400).json({ message: 'Voice ID is invalid.' });
        return;
      }
      await gateway.deleteVoiceClone(voiceId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post('/v1/read-aloud', providerLimiter, async (request, response, next) => {
    try {
      const text = typeof request.body.text === 'string' ? request.body.text.trim() : '';
      const voiceId = typeof request.body.voiceId === 'string' ? request.body.voiceId.trim() : '';
      if (!text || text.length > MAX_SPEECH_CHARACTERS) {
        response.status(400).json({
          message: `Text must contain 1 to ${MAX_SPEECH_CHARACTERS} characters.`,
        });
        return;
      }
      if (!VOICE_ID_PATTERN.test(voiceId)) {
        response.status(400).json({ message: 'Voice ID is invalid.' });
        return;
      }

      const audio = await gateway.synthesizeSpeech({ text, voiceId });
      response
        .status(200)
        .set({
          'Cache-Control': 'private, no-store',
          'Content-Length': String(audio.byteLength),
          'Content-Type': 'audio/mpeg',
        })
        .send(Buffer.from(audio));
    } catch (error) {
      next(error);
    }
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    response.status(error instanceof multer.MulterError ? 400 : 502).json({
      message: getMessage(error),
    });
  };
  app.use(errorHandler);

  return app;
}
