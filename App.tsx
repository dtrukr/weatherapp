import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import MainScreen from "./screens/MainScreen";
import AddLocationScreen from "./screens/AddLocationScreen";
import { Animated } from "react-native";
import axios from "axios";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const CustomDrawerContent = ({ navigation, favorites, onSelectCity }) => {
  return (
    <DrawerContentScrollView style={styles.drawerContent}>
      <Text style={styles.drawerTitle}>Favorite Cities</Text>
      {favorites.length > 0 ? (
        favorites.map((city) => (
          <DrawerItem
            key={city.id}
            label={`${city.name}, ${city.country}`}
            onPress={() => {
              onSelectCity(city);
              navigation.closeDrawer();
            }}
            labelStyle={styles.drawerItemLabel}
          />
        ))
      ) : (
        <Text style={styles.noFavorites}>No favorite cities yet</Text>
      )}
      <TouchableOpacity
        style={styles.addCityButton}
        onPress={() => navigation.navigate("AddLocation", { onSelectCity })}
      >
        <Text style={styles.addCityText}>+ Add City</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  maxTemp: number;
  minTemp: number;
  hourly: Array<any>;
  daily: Array<any>;
}

const App = () => {
  const [favorites, setFavorites] = useState([]);
  const [city, setCity] = useState(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cityImage, setCityImage] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (cityId: String) => {
    try {
      const weatherResponse = await axios.get(
        `https://www.yr.no/api/v0/locations/${cityId}/forecast`
      );
      const dayIntervals = weatherResponse.data.dayIntervals;
      const shortIntervals = weatherResponse.data.shortIntervals;

      const daily = dayIntervals.map(
        (day: {
          start: any;
          temperature: { min: any; max: any };
          twentyFourHourSymbol: any;
          precipitation: { value: any };
        }) => ({
          date: day.start,
          temp_min: day.temperature.min,
          temp_max: day.temperature.max,
          icon: day.twentyFourHourSymbol,
          precipitation: day.precipitation.value,
        })
      );

      const hourly = shortIntervals
        .map(
          (hour: {
            start: any;
            temperature: { value: any };
            symbolCode: { next1Hour: any };
            precipitation: { value: any };
          }) => ({
            time: hour.start,
            temp: hour.temperature.value,
            icon: hour.symbolCode.next1Hour,
            precipitation: hour.precipitation.value,
          })
        )
        .slice(0, 24);

      const currentWeather = dayIntervals[0];
      setWeatherData({
        temperature: currentWeather.temperature.value,
        description: currentWeather.twentyFourHourSymbol.replaceAll("_", " "),
        icon: currentWeather.twentyFourHourSymbol,
        maxTemp: currentWeather.temperature.max,
        minTemp: currentWeather.temperature.min,
        daily: daily,
        hourly: hourly,
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const fetchCityImage = async (cityName: String) => {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${cityName}+tourist&client_id=xIvFLUpWyk1m-I8Q7zWAu6q5iD0WE6MEBvUKuVyh_CA&orientation=landscape&per_page=1`
      );
      const imageUrl = response.data.results[0].urls.full;
      setCityImage(imageUrl);
    } catch (error) {
      console.error("Error fetching city image:", error);
    }
  };

  const handleSelectCity = async (city: { id: String; name: String }) => {
    setLoading(true);

    setFavorites((prevFavorites) => {
      if (prevFavorites.some((fav) => fav.id === city.id)) {
        return prevFavorites;
      }
      return [...prevFavorites, city];
    });

    await Promise.all([fetchWeather(city.id), fetchCityImage(city.name)]);

    setCity(city.name);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setLoading(false));
  };

  const MainStack = () => (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: "transparentModal",
        ...TransitionPresets.ModalSlideFromBottomIOS,
      }}
    >
      <Stack.Screen name="Main">
        {(props) => (
          <MainScreen
            {...props}
            favorites={favorites}
            setFavorites={setFavorites}
            city={city}
            weatherData={weatherData}
            cityImage={cityImage}
            onSelectCity={handleSelectCity}
            loading={loading}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AddLocation"
        options={{
          cardStyle: { backgroundColor: "transparent" },
        }}
      >
        {(props) => (
          <AddLocationScreen
            {...props}
            onSelectCity={(city) => {
              handleSelectCity(city);
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Main"
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            favorites={favorites}
            onSelectCity={handleSelectCity}
          />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="Weather" component={MainStack} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    backgroundColor: "#1E1E1E",
    flex: 1,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 16,
    color: "white",
  },
  noFavorites: {
    padding: 16,
    fontStyle: "italic",
    color: "white",
  },
  drawerItemLabel: {
    color: "white",
    fontSize: 16,
  },
  addCityButton: {
    padding: 16,
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  addCityText: {
    color: "white",
    fontSize: 16,
  },
});

export default App;
