# MyBible Mobile

MyBible Mobile is an Expo and React Native Bible reader with English and original-language chapter rendering, local notes and highlights, speech playback, optional AI study tools, and optional voice cloning.

## Architecture

- `src/screens`: mobile workflows and navigation targets.
- `src/components`: reusable Scripture, study, and accessibility UI.
- `src/services/bibleApi.ts`: typed adapters for public Scripture sources.
- `src/services/httpClient.ts`: timeout, error, JSON, and MyBible API handling.
- `src/services/aiService.ts`: validated AI study contracts through the MyBible API.
- `src/services/voiceCloningService.ts`: recording and secure voice-clone uploads through the MyBible API.
- `src/services/storageService.ts`: local notes, highlights, preferences, bookmarks, and voice metadata.

Provider credentials never belong in the Expo bundle. AI, API.Bible, and voice-provider credentials must remain in the server-side MyBible API environment.

## Requirements

- Node.js 20 or newer.
- npm 10 or newer.
- Expo Go or an Android/iOS development build.

## Install

```powershell
npm ci
Copy-Item .env.example .env
npm run check
npm start
```

`EXPO_PUBLIC_MYBIBLE_API_URL` is required only for AI study, API.Bible, and voice cloning. Public KJV, Hebrew, and Greek chapter retrieval does not require provider credentials.

For Android Emulator access to a Windows-hosted API, use `http://10.0.2.2:3000`. For a physical device, use the development computer's LAN address and allow the API port through Windows Firewall.

## MyBible API Contract

The mobile client uses these endpoints:

- `POST /v1/ai/questions` with `{ "question": string, "context"?: string }`.
- `POST /v1/ai/study-guides` with `{ "book": string, "chapter": number }`.
- `POST /v1/voice-clones` as multipart form data with `name` and `files`.
- `DELETE /v1/voice-clones/:voiceId`.
- `GET /v1/bibles/:bibleId/passages/:passageId?content-type=text`.

The API must authenticate users, keep provider credentials server-side, validate request bodies, enforce rate limits, and return JSON errors with a `message` field.

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
