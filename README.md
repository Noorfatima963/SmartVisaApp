# SmartVisaApp

SmartVisaApp is a cross-platform mobile application built with [Expo](https://expo.dev) and React Native.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

-   **Node.js**: Download and install the latest LTS version from [nodejs.org](https://nodejs.org/).
-   **Expo Go**:
    -   **Android**: Download from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
    -   **iOS**: Download from the [App Store](https://apps.apple.com/app/expo-go/id982107779).
-   **Git**: To clone the repository.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Noorfatima963/SmartVisaApp.git
    cd SmartVisaApp
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the development server**:
    ```bash
    npx expo start
    ```

2.  **Open the app**:
    -   **On your phone**: Open the **Expo Go** app and scan the QR code displayed in your terminal.
    -   **Android Emulator**: Press `a` in the terminal window (requires Android Studio).
    -   **iOS Simulator**: Press `i` in the terminal window (requires Xcode, macOS only).
    -   **Web**: Press `w` in the terminal window.

## Project Structure

-   `App.js`: Main entry point of the application.
-   `app.json`: Configuration for Expo.
-   `assets/`: Images and other static assets.
-   `components/`: Reusable UI components.
-   `screens/`: Individual screens of the application.
-   `navigation/`: Navigation configuration (stack, tabs, etc.).
-   `package.json`: Project dependencies and scripts.

## Troubleshooting

-   **Metro Bundler issues**: If you encounter issues with the bundler, try running `npx expo start -c` to clear the cache.
-   **Network issues**: Ensure your phone and computer are on the same Wi-Fi network.

## Scripts

-   `npm start`: Runs `expo start`.
-   `npm run android`: Runs `expo start --android`.
-   `npm run ios`: Runs `expo start --ios`.
-   `npm run web`: Runs `expo start --web`.
