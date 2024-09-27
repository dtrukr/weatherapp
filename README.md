# Weather Forecast App

A modern weather forecast app built using React Native and Expo. The app allows users to add their favorite cities, view current weather conditions, hourly and daily forecasts, and a city-specific background image.

## Features

- **Add Favorite Cities**: Users can add cities to their favorites list and quickly switch between them.
- **Current Weather**: Displays the current temperature, weather conditions, and temperature range for the selected city.
- **Hourly Forecast**: Provides the hourly weather forecast for the next 24 hours.
- **Daily Forecast**: Displays the weather forecast for the upcoming days.
- **City Background**: A dynamically fetched background image for the selected city.
- **Smooth Transitions**: Uses animations to prevent flickering during city changes and data fetching.

## Tech Stack

- **React Native**: The app's framework.
- **Expo**: For managing the app's development, build, and deployment.
- **Axios**: For handling API requests.
- **Unsplash API**: For fetching city background images.
- **YR.no API**: For retrieving weather data.
- **React Navigation**: For handling navigation and drawer functionality.

## Prerequisites

- [Node.js](https://nodejs.org/en/) installed (v14.x or newer).
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally.

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/dtrukr/weatherapp.git
   cd weatherapp
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the project in Expo:**

   ```bash
   npx expo start
   ```

4. Use the Expo Go app on your mobile device or an emulator to view the app.

## Project Structure

```bash
├── assets             # Static assets (e.g., background image, icons)
├── screens            # React Native components for different app screens
│   ├── MainScreen.tsx   # Main screen showing weather data
│   └── AddLocationScreen.tsx # Screen for adding new cities
├── App.tsx            # Main entry point of the app
├── .env               # Environment variables (API keys)
├── package.json       # Project dependencies and scripts
└── README.md          # Project documentation
```

## APIs Used

- **[Unsplash API](https://unsplash.com/developers)**: For fetching background images based on the city name.
- **[YR.no API](https://developer.yr.no/)**: Provides weather data, including current temperature, hourly forecasts, and daily forecasts.

## How to Use

1. **Add a City**: Open the drawer menu and click on "Add City". Search for a city, and it will be added to your favorites list.
2. **View Weather**: After selecting a city, the app will display the current weather, hourly forecast, and daily forecast.
3. **Switch Between Cities**: Open the drawer and select a city from your favorites to update the weather information.
4. **City Background**: The background image updates based on the city you select, thanks to the Unsplash API.

## Running on a Device

To run the app on your physical device:

1. Install the **Expo Go** app from the App Store or Google Play.
2. Run `npx expo start` in your terminal to start the Expo bundler.
3. Scan the QR code in the terminal or the Expo Developer Tools in your browser using the Expo Go app.

## Troubleshooting

- **Slow API responses**: Ensure that your API keys are correct and that you haven't exceeded your request limit for the Unsplash or YR.no APIs.
- **Navigation issues**: Make sure that React Navigation is installed correctly and you have configured the `NavigationContainer` and `DrawerNavigator` as per the documentation.

## Future Improvements

- **Offline Support**: Implement caching for weather data and city images.
- **Push Notifications**: Send notifications when significant weather changes occur in the user's favorite cities.
- **Dark Mode**: Provide a dark mode theme that can be toggled within the app.
