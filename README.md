# 🌌 Dream Atlas

**Dream Atlas** is a dream journaling and sleep-tracking application built with React Native and Expo.

It lets users record and explore their dreams, track sleep data, view weekly dream insights, and connect dream experiences with sleep patterns.

---

## ✨ Features

* 📖 **Dream Journal** — Create, edit, and browse daily dream entries
* 🧠 **Dream Insights** — Explore recurring themes and patterns across dreams
* 😴 **Sleep Tracker** — View sleep sessions, sleep stages, and heart-rate data
* 🎙️ **Audio Journaling** — Record spoken dream entries
* 🤖 **AI Processing** — Process and analyze dream entries through the backend
* 🔐 **Google Authentication** — Sign in securely with Google and Firebase Authentication
* ☁️ **Backend Integration** — Communicate with the Dream Atlas backend API
* 📱 **Cross-platform** — Run on iOS, Android, and Web
* 🌌 **Pastel Galaxy UI** — A visual theme designed around dreams, stars, and nighttime

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo_Router-6-000020?logo=expo&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/SQLite-expo--sqlite-003B57?logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Cloud-gcloud-4285F4?logo=googlecloud&logoColor=white" />
  <img src="https://img.shields.io/badge/Lottie-Animations-00DDB3?logo=lottie&logoColor=white" />
</p>

| Technology                  | Purpose                                     |
| --------------------------- | ------------------------------------------- |
| **React Native**            | Cross-platform mobile application           |
| **Expo SDK 54**             | Development and native app tooling          |
| **Expo Router**             | File-based navigation                       |
| **TypeScript**              | Type-safe application development           |
| **Firebase Authentication** | User authentication                         |
| **expo-sqlite**             | Local data storage                          |
| **expo-audio**              | Audio recording                             |
| **Lottie**                  | Animated UI elements                        |
| **Google Cloud CLI**        | Local Google Cloud authentication           |
| **Dream Atlas Backend**     | API, AI processing, and cloud data services |

---

# 🚀 Getting Started

## Prerequisites

Before running the application locally, install the following:

### Required

* **Node.js** — LTS version recommended
* **npm**
* **Git**
* **Xcode** — required for iOS development on macOS
* **CocoaPods** — required for iOS native dependencies
* **Google Cloud CLI (`gcloud`)** — required for Google Cloud authentication

You will also need access to a running **Dream Atlas backend**.

> The frontend does not operate completely independently. Features such as authentication, dream processing, and cloud-backed data require the backend API.

---

## 1. Clone the Repository

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd <repository-directory>
```

If you need to work on a specific branch:

```bash
git checkout <branch-name>
```

---

## 2. Install Dependencies

Install the project's npm dependencies:

```bash
npm install
```

---

## 3. Configure Google Cloud Authentication

Some application functionality communicates with Google Cloud services.

Authenticate your local Google Cloud environment using Application Default Credentials:

```bash
gcloud auth application-default login
```

Follow the browser prompts to authenticate with your Google account.

---

# 🔐 4. Configure Environment Variables

Create a `.env` file in the root of the project:

```bash
touch .env
```

Add the following variables:

```env
# Backend API
# For local development, use the IP address of your computer
# so that devices/emulators can reach the backend.
EXPO_PUBLIC_API_URL=http://<your-wifi-ip-address>:8080

# Google Authentication
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id

# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Finding your local IP address

When running the backend on your computer, the mobile application needs to access it over your local network.

On macOS, you can find your Wi-Fi IP address with:

```bash
ipconfig getifaddr en0
```

For example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080
```

**Do not use `localhost` when connecting from a physical device.**

The device needs to use your computer's local network IP address instead.

---

# 🔥 5. Firebase Configuration

The application uses Firebase Authentication.

Create or use a Firebase project and configure the required Firebase application credentials.

The Firebase values should correspond to the Firebase project used by the Dream Atlas backend.

Make sure the following variables are configured:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

> **Security note:** `.env` files containing local configuration should not be committed to the repository. Never commit private credentials, service-account keys, or other secrets.

---

# 🖥️ 6. Start the Backend

The frontend communicates with the Dream Atlas backend through:

```env
EXPO_PUBLIC_API_URL
```

Make sure the backend is running before testing functionality that requires API access.

For example, if the backend is running locally on port `8080`:

```env
EXPO_PUBLIC_API_URL=http://<your-ip-address>:8080
```

See the **Dream Atlas Backend** repository for backend installation and configuration instructions.

---

# 📱 Running the Application

## iOS Simulator

iOS development requires macOS and Xcode.

Run:

```bash
npx expo run:ios
```

Or:

```bash
npm run ios
```

This builds the native iOS application and launches it in the iOS Simulator.

---

## Android Emulator

Run:

```bash
npx expo run:android
```

Or:

```bash
npm run android
```

---

## Web

Start the web development server:

```bash
npx expo start --web
```

Or:

```bash
npm run web
```

The application will open in your browser.

---

## Expo / Metro Development Server

To start the Expo development server:

```bash
npm start
```

or:

```bash
npx expo start
```

This provides the Metro bundler and development tooling.

---

# 📜 Available Scripts

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm start`       | Start the Expo development server     |
| `npm run ios`     | Build and run the iOS application     |
| `npm run android` | Build and run the Android application |
| `npm run web`     | Start the web application             |
| `npm run lint`    | Run ESLint                            |

---

# 📂 Project Structure

The project follows **Expo Router's file-based routing architecture**.

```text
.
├── app/                         # Application screens and routes
│   ├── (tabs)/                  # Main tab navigation
│   │   ├── _layout.tsx          # Tab navigator configuration
│   │   ├── index.tsx            # Calendar / home screen
│   │   ├── insights.tsx         # Weekly dream insights
│   │   └── sleep-tracker.tsx    # Sleep tracking
│   │
│   ├── _layout.tsx              # Root navigation/layout
│   ├── conversational-analytics.tsx
│   ├── dream/
│   │   ├── [date].tsx           # Dreams for a specific date
│   │   └── entry/
│   │       └── [id].tsx         # Individual dream entry
│   ├── list.tsx                  # Dream list
│   ├── login.tsx                 # Login screen
│   └── settings.tsx              # Application settings
│
├── assets/                       # Static assets
│   ├── animations/
│   │   └── flying-kiki.lottie
│   └── images/
│       ├── android-icon-background.png
│       ├── android-icon-foreground.png
│       ├── android-icon-monochrome.png
│       ├── dream-star.png
│       ├── dream-wand.png
│       ├── favicon.png
│       ├── icon.png
│       ├── splash-icon.png
│       ├── wizard1.png
│       └── wizard2.png
│
├── components/                   # Reusable UI components
│   ├── day-log-card.tsx
│   ├── dream-preview-card.tsx
│   ├── dream-processing-animation.tsx
│   ├── insights-loading.tsx
│   ├── starfield.tsx
│   ├── tag-input.tsx
│   ├── themed-text.tsx
│   └── themed-view.tsx
│
├── constants/                    # Application constants
│   ├── dream-types.ts
│   ├── moods.ts
│   ├── sleep-quality.ts
│   └── theme.ts
│
├── context/                      # React contexts
│   └── AuthContext.tsx           # Authentication state
│
├── hooks/                        # Reusable React hooks
│   ├── use-day-log.ts
│   ├── use-dreams.ts
│   └── use-theme-color.ts
│
├── lib/                          # Third-party/library configuration
│   └── firebase.ts               # Firebase initialization
│
├── services/                     # Application services
│   ├── api.ts                    # Backend API client
│   ├── db.ts                     # Local database access
│   ├── export.ts                 # Data export functionality
│   └── notifications.ts          # Notifications
│
├── types/                        # TypeScript types
│   ├── day-log.ts
│   └── dream.ts
│
├── utils/                        # Utility functions
│   └── confirm.ts
│
├── app.json                      # Expo application configuration
├── eslint.config.js              # ESLint configuration
├── metro.config.js               # Metro bundler configuration
├── package.json                  # Dependencies and npm scripts
├── tsconfig.json                 # TypeScript configuration
└── expo-env.d.ts                 # Expo environment types
```

---

# 🧭 Application Architecture

At a high level, the application is organized into four layers:

```text
┌─────────────────────────────┐
│          Expo App            │
│     React Native + Router    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        React Hooks           │
│   Context + UI Components    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          Services            │
│ API · SQLite · Export · etc. │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Dream Atlas Backend     │
│   Auth · AI · Cloud Data     │
└─────────────────────────────┘
```

### Routes

The `app/` directory contains the application's routes.

Because Dream Atlas uses **Expo Router**, files inside `app/` automatically become navigable routes.

For example:

```text
app/
└── dream/
    └── [date].tsx
```

represents a dynamic route for a specific date.

---

# 🔑 Authentication

Authentication is handled using:

* Google Authentication
* Firebase Authentication
* Firebase ID tokens

After authentication, the application uses the Firebase user's ID token when communicating with the backend API.

The authentication state is managed through:

```text
context/AuthContext.tsx
```

Firebase initialization is handled in:

```text
lib/firebase.ts
```

---


# 🌙 Sleep Tracker

The Sleep Tracker provides a dedicated interface for exploring sleep data alongside dreams.

The main screen is:

```text
app/(tabs)/sleep-tracker.tsx
```

Sleep-related data is retrieved through the backend API and presented alongside sleep sessions and associated dream entries.

---

# 🧠 Dream Insights

Weekly dream analysis is available through:

```text
app/(tabs)/insights.tsx
```

The Insights experience is designed to help users understand:

* Recurring dream themes
* Emotional patterns
* Weekly dream activity
* Connections between different dream entries

AI processing is performed through the backend rather than directly exposing AI credentials in the mobile application.

---

# 🎨 UI Components

Reusable UI components are kept in:

```text
components/
```

Examples include:

* `day-log-card.tsx` — Daily journal summary
* `dream-preview-card.tsx` — Dream preview
* `dream-processing-animation.tsx` — Dream processing animation
* `insights-loading.tsx` — Insights loading state
* `starfield.tsx` — Background starfield
* `tag-input.tsx` — Dream tag input
* `themed-text.tsx` — Theme-aware text
* `themed-view.tsx` — Theme-aware container

Keeping these components separate from route files makes screens easier to maintain and reuse.

---

# 🧪 Code Quality

Run ESLint with:

```bash
npm run lint
```

Before opening a pull request, make sure:

* The application builds successfully
* ESLint passes
* New components follow the existing project structure
* Environment variables are not committed
* API changes remain compatible with the backend

---

# 🤝 Contributing

Contributions are welcome.

A typical workflow is:

```bash
git checkout -b feature/my-feature

npm install

# Make your changes

npm run lint

git add .
git commit -m "Add my feature"

git push origin feature/my-feature
```

Then open a pull request.

For larger changes, document architectural decisions in `DECISIONS.md`.

---

# 📄 Project Documentation

Additional project documentation is available in:

| File           | Purpose                                |
| -------------- | -------------------------------------- |
| `README.md`    | Project setup and overview             |
| `AGENTS.md`    | Development guidance for coding agents |
| `CLAUDE.md`    | AI-assisted development instructions   |
| `DECISIONS.md` | Architectural and technical decisions  |

---

# 🔒 Environment & Secrets

Do **not** commit:

* `.env` files
* Firebase service-account credentials
* Google Cloud service-account keys
* Private API keys
* OAuth client secrets
* Other authentication credentials

Only public client configuration intended for Expo's `EXPO_PUBLIC_*` environment variables should be included in the frontend environment.

---

## 🌌 Dream Atlas

Dreams are more than memories.

**Dream Atlas helps you explore the relationship between what you dream and how you sleep.**
