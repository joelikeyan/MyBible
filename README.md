# MyBible Mobile

MyBible is an Expo and React Native Bible reader with English and original-language chapter rendering, local notes and highlights, offline device speech, optional AI study tools, and secure ElevenLabs voice cloning and read-aloud playback.

## Architecture

- `src/screens`: mobile workflows and navigation targets.
- `src/components`: reusable Scripture, study, and accessibility UI.
- `src/services/bibleApi.ts`: typed adapters for public Scripture sources.
- `src/services/httpClient.ts`: timeout, error, JSON, and MyBible API handling.
- `src/services/aiService.ts`: validated AI study contracts through the MyBible API.
- `src/services/voiceCloningService.ts`: recording and secure voice-clone uploads through the MyBible API.
- `src/services/voiceService.ts`: offline device narration plus ElevenLabs playback for selected cloned voices.
- `src/services/storageService.ts`: local notes, highlights, preferences, bookmarks, and voice metadata.
- `server`: credential-safe ElevenLabs gateway, request validation, upload limits, CORS policy, and rate limits.

Provider credentials never belong in the Expo bundle. The ElevenLabs key remains in `.env.local` and is read only by the Node gateway.

## Requirements

- Node.js 20 or newer.
- npm 10 or newer.
- Expo Go or an Android/iOS development build.

## Install

```powershell
npm ci
Copy-Item .env.example .env.local
npx -y @elevenlabs/cli@latest onboard init
npx -y @elevenlabs/cli@latest onboard connect --env-path .env.local
npm run check
```

Run the API and Expo app in separate terminals:

```powershell
npm run api
npm start
```

`EXPO_PUBLIC_MYBIBLE_API_URL` is required for AI study, API.Bible, voice cloning, and cloned-voice read-aloud. Built-in narrator profiles continue to use offline device speech. Public KJV, Hebrew, and Greek chapter retrieval does not require provider credentials.

For Android Emulator access to a Windows-hosted API, use `http://10.0.2.2:3000`. For a physical device, use the development computer's LAN address and allow the API port through Windows Firewall.

## MyBible API Contract

The mobile client uses these endpoints:

- `POST /v1/ai/questions` with `{ "question": string, "context"?: string }`.
- `POST /v1/ai/study-guides` with `{ "book": string, "chapter": number }`.
- `POST /v1/voice-clones` as multipart form data with `name`, `consent=true`, and `files`.
- `DELETE /v1/voice-clones/:voiceId`.
- `POST /v1/read-aloud` with `{ "text": string, "voiceId": string }`, returning `audio/mpeg`.
- `GET /v1/bibles/:bibleId/passages/:passageId?content-type=text`.

The included ElevenLabs routes keep credentials server-side, validate request bodies, limit audio samples to 25 MB each, enforce per-process rate limits, and return JSON errors with a `message` field. Add your application authentication middleware before exposing the API beyond a trusted local network.

Voice cloning is available only after the user confirms ownership or explicit authorization. Uploaded samples are forwarded from memory and are not persisted by the gateway. Generated read-aloud audio is cached only for active playback and removed afterward.

## Validation

```powershell
npm run typecheck
npm test
npm run check
npx expo-doctor
```

## Scripture Sources

- English KJV chapters: `https://api.getbible.net/v2/`.
- Greek Tischendorf and Hebrew WLC chapters: `https://bolls.life/get-text/`.

Source licensing and attribution must be reviewed and preserved before redistributing downloaded corpora or offline exports.
