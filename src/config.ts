// Configuration for external services

export const config = {
  // OpenAI API (for AI Study Assistant)
  // Key provided by user
  openai: {
    apiKey: 'proj_XAyHRpRjtv5Fs5yT3Xy7XUM4',
    model: 'gpt-4o-mini',
  },

  // Google AI (Gemini)
  // Key provided by user
  googleAI: {
    apiKey: 'AIzaSyC0yJi6Cck2IIkTfLRFY7SfnIMDDaC0f88',
    model: 'gemini-1.5-flash', // Using a fast, capable model
  },

  // ElevenLabs API (for Voice Cloning)
  // Key provided by user
  elevenLabs: {
    apiKey: 'sk_e123db856381a534c5a3afc1d135d85263ef8675339c87ca',
    voiceCloneUrl: 'https://api.elevenlabs.io/v1/voices/add',
    ttsUrl: 'https://api.elevenlabs.io/v1/text-to-speech',
  },

  // API.Bible (for additional translations)
  // Key provided by user
  apiBible: {
    apiKey: 'pbnN3b_VRiDqCFuc5vfiF',
    baseUrl: 'https://api.scripture.bible/v1',
  },
};
