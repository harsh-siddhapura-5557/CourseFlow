# CourseFlow - Mini LMS Mobile App

A production-grade React Native Expo mobile application for learning management, built with TypeScript, NativeWind, and Zustand.

## 🚀 Features

- **Authentication**: Secure login/register with API integration and token storage via Expo SecureStore.
- **Course Catalog**: Dynamic course listing with search, filtering, and pull-to-refresh.
- **Bookmarks**: Save your favorite courses with persistent storage.
- **Course Details**: Comprehensive course information and enrollment system.
- **WebView Integration**: Seamlessly view course content with local HTML templates and React Native communication.
- **Notifications**: Smart notifications for bookmark milestones and inactivity reminders.
- **Performance**: Optimized list rendering, memoization, and smooth UI transitions.
- **Offline Mode**: Real-time connectivity monitoring with user feedback.
- **Error Handling**: Built-in retry mechanism for API failures and graceful error states.

## 🛠️ Tech Stack

- **Framework**: Expo (SDK 51)
- **Navigation**: Expo Router (File-based)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage & SecureStore
- **Networking**: Axios with retry interceptors

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go app on your mobile device (for development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   API_URL=https://api.freeapi.app/api/v1
   ```

### Running the App

- Start the development server:
  ```bash
  npm start
  ```
- Open on Android:
  ```bash
  npm run android
  ```
- Open on iOS:
  ```bash
  npm run ios
  ```

## 🏗️ Architecture

The project follows a **feature-based modular structure**:

- `app/`: Expo Router screens and layouts.
- `features/`: Module-specific logic (Auth, Courses, etc.).
- `components/`: Reusable UI components.
- `store/`: Zustand state management.
- `services/`: API and third-party service integrations.
- `hooks/`: Custom React hooks.
- `types/`: TypeScript interfaces and types.
- `utils/`: Helper functions.

## 📱 Build Instructions (APK)

To build a standalone APK for Android:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Configure the build:
   ```bash
   eas build:configure
   ```
4. Run the build (choose `android` and `apk` as the build type):
   ```bash
   eas build --platform android --profile preview
   ```
   *Note: Ensure you have `buildType: "apk"` in your `eas.json` under the `preview` profile.*

## 📄 License

MIT
