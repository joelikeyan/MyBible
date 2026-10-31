import { createApp } from './app';
import { ElevenLabsGateway } from './elevenLabsGateway';

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  throw new Error('ELEVENLABS_API_KEY is required. Run the ElevenLabs onboarding command first.');
}

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const host = process.env.HOST?.trim() || '127.0.0.1';
const app = createApp(new ElevenLabsGateway(apiKey), {
  allowedOrigins: process.env.MYBIBLE_ALLOWED_ORIGINS,
});

app.listen(port, host, () => {
  process.stdout.write(`MyBible API listening on http://${host}:${port}\n`);
});
