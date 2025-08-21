# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Background fetch / silent-push (install notes)

If you plan to use background fetch (opportunistic background updates) or silent push to keep prayer times and caches up-to-date while the app is not open, follow these steps.

Important: these features require a custom build (EAS) and native modules — they will not work in Expo Go.

1. Install native packages

```bash
# from the frontend folder
yarn add expo-background-fetch expo-task-manager
npx pod-install ios
```

2. Add required Info.plist / AndroidManifest entries

- iOS: add `UIBackgroundModes` entries to allow background fetch and remote notifications. In `app.json` (or `app.config.js`) add under `expo.ios.infoPlist`:

```json
"ios": {
   "infoPlist": {
      "UIBackgroundModes": ["fetch", "remote-notification"]
   }
}
```

- Android: ensure your manifest allows background processing and boot start if needed. Add `RECEIVE_BOOT_COMPLETED` and optionally `WAKE_LOCK` in `android.manifest` via config plugin or after ejecting.

3. Build with EAS

These native modules require a custom native build. Use EAS to create a dev or production build and install it on a device:

```bash
# Create a development build (recommended for testing background behavior)
npx eas build -p ios --profile development
npx eas build -p android --profile development

# Or production build for App Store / Play Store
npx eas build -p ios --profile production
npx eas build -p android --profile production
```

4. Notes on behavior and reliability

- `expo-background-fetch` is opportunistic: the OS determines when to run background fetches (iOS is especially conservative). It's good for periodic cache refreshes but not guaranteed at exact times.
- For guaranteed server-driven updates (e.g., exact pre-prayer updates), use silent push notifications (APNs/Firebase) from your server to wake the app. That requires server infra and correct push credentials.
- Always test background fetch on a real device (simulators and Expo Go won't show real behavior).

5. Additional resources

- expo-background-fetch: https://docs.expo.dev/versions/latest/sdk/background-fetch/
- expo-task-manager: https://docs.expo.dev/versions/latest/sdk/task-manager/
- EAS Build docs: https://docs.expo.dev/build/introduction/

