# GoConverter (Expo + Conversion Server)

This archive contains two parts:
1. **Mobile app (Expo)** — `App.tsx`, `screens/`, `ui/`, `utils/` etc.
2. **Conversion server (Node + LibreOffice + FFmpeg)** — in `/server` (Dockerfile included).

## Quick start (Android testing)

1. Extract the archive and open a terminal in the project root.
2. Install dependencies:
   ```bash
   npm install
   npx expo install
   ```
3. Start the app:
   ```bash
   npm run start
   ```
   Scan the QR code with Expo Go on your Android device.

## Notes
- Replace `config.ts` SERVER_URL with your deployed server URL (after you deploy `/server` to Fly.io / Render / Railway).
- AdMob app ID is set in `app.json`. Banner & Interstitial IDs are embedded; ensure your AdMob account has the units created.
- For DOCX → PDF and audio/video conversions, deploy the server (see `/server/Dockerfile`) to Fly.io or Render. The server includes LibreOffice & FFmpeg.
- For Play Store builds, use EAS: `eas build --platform android`.

## Server deploy (Fly.io example)
1. Install flyctl and login.
2. From `/server` run `fly launch` and `fly deploy`.
3. Update `config.ts` in the mobile app with the deployed domain.

