import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from "@react-navigation/drawer";
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

interface City {
  id: string;
  name: string;
  country: string;
}

interface CustomDrawerContentProps {
  navigation: DrawerNavigationProp<any>;
  favorites: City[];
  onSelectCity: (city: City) => void;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
  navigation,
  favorites,
  onSelectCity,
}) => {
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
  const [favorites, setFavorites] = useState<City[]>([]);
  const [city, setCity] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cityImage, setCityImage] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    handleSelectCity({
      id: "2-2950159",
      name: "Berlin",
      country: "Germany",
    });
  }, []);

  const fetchWeather = async (cityId: string) => {
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
      console.log("-->Got weather data");
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const fetchCityImage = async (cityName: string) => {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${cityName}+tourist&client_id=xIvFLUpWyk1m-I8Q7zWAu6q5iD0WE6MEBvUKuVyh_CA&orientation=landscape&per_page=1`
      );
      const imageUrl = response.data.results[0].urls.regular;
      setCityImage(imageUrl);
      console.log("-->Got city image:", imageUrl);
    } catch (error) {
      console.error("Error fetching city image:", error);
    }
  };

  const handleSelectCity = async (city: City) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.some((fav) => fav.id === city.id)) {
        return prevFavorites;
      }
      return [...prevFavorites, city];
    });

    setCity(city.name);

    await Promise.all([fetchWeather(city.id), fetchCityImage(city.name)]);
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
            city={city}
            weatherData={weatherData}
            cityImage={cityImage}
            onSelectCity={handleSelectCity}
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
            favorites={[]}
            {...props}
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
