// Configuration for external services
// In a real app, these should be loaded from environment variables (e.g., .env)

export const config = {
  // OpenAI API (for AI Study Assistant)
  // Get key: https://platform.openai.com/api-keys
  openai: {
    apiKey: '', // Enter your OpenAI API Key here
    model: 'gpt-4o-mini',
  },

  // ElevenLabs API (for Voice Cloning)
  // Get key: https://elevenlabs.io/app/settings/api-keys
  elevenLabs: {
    apiKey: '', // Enter your ElevenLabs API Key here
    voiceCloneUrl: 'https://api.elevenlabs.io/v1/voices/add',
    ttsUrl: 'https://api.elevenlabs.io/v1/text-to-speech',
  },

  // API.Bible (for additional translations)
  // Get key: https://scripture.api.bible/
  apiBible: {
    apiKey: '', // Enter your API.Bible Key here
  },
};
