import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { MainScreenProps, WeatherData, City } from "../types";

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

const MainScreen: React.FC<MainScreenProps> = ({ city, onSelectCity }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cityImage, setCityImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const backgroundPositionAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();

  useEffect(() => {
    if (city) {
      handleSelectCity(city);
    }
  }, [city]);

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
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching weather:", error);
      setError("Failed to fetch weather data. Please try again.");
    }
  };

  const fetchCityImage = async (cityName: string) => {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${cityName}+tourist&client_id=xIvFLUpWyk1m-I8Q7zWAu6q5iD0WE6MEBvUKuVyh_CA&orientation=landscape&per_page=1`
      );
      const imageUrl = response.data.results[0].urls.regular;
      setCityImage(imageUrl);
    } catch (error) {
      console.error("Error fetching city image:", error);
    }
  };

  const handleSelectCity = async (city: City) => {
    setLoading(true);

    await Promise.all([
      fetchWeather(city.cityId),
      fetchCityImage(city.cityName),
    ]);

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => setLoading(false));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (city) {
      await handleSelectCity(city);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (cityImage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [cityImage]);

  useEffect(() => {
    if (weatherData) {
      const backgroundPosition = calculateBackgroundPosition(
        weatherData.temperature
      );
      Animated.timing(backgroundPositionAnim, {
        toValue: -backgroundPosition,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [weatherData]);

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "heavyrain":
        return <Icon name="rainy-outline" size={35} color="white" />;
      case "lightrain":
        return <Icon name="cloudy-outline" size={35} color="white" />;
      case "fair_day":
      case "clearsky_day":
        return <Icon name="sunny-outline" size={35} color="white" />;
      case "partlycloudy_day":
        return <Icon name="partly-sunny-outline" size={35} color="white" />;
      case "rainshowers_day":
      case "lightrainshowers_day":
        return <Icon name="rainy-outline" size={35} color="white" />;
      default:
        return <Icon name="cloud-outline" size={35} color="white" />;
    }
  };

  const calculateBackgroundPosition = (temperature: number) => {
    const minTemp = -10;
    const maxTemp = 40;
    const imageHeight = 1800;
    const position =
      ((maxTemp - temperature) / (maxTemp - minTemp)) * imageHeight;
    return Math.max(0, Math.min(position, imageHeight - windowHeight));
  };

  const renderHourlyForecast = () => {
    return (
      <View>
        <View style={styles.divider} />
        <ScrollView horizontal style={styles.hourlyScroll}>
          {weatherData?.hourly.map((hour, index) => (
            <View key={index} style={styles.hourlyItem}>
              <Text style={styles.hourlyTime}>
                {new Date(hour.time).getHours()}:00
              </Text>
              {getWeatherIcon(hour.icon)}
              <Text style={styles.hourlyTemp}>{Math.round(hour.temp)}°</Text>
              <Text style={styles.hourlyPrecipitation}>
                {hour.precipitation} mm
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.divider} />
      </View>
    );
  };

  const renderDailyForecast = () => {
    return (
      <View style={styles.dailyContainer}>
        {weatherData?.daily.map((day, index) => (
          <View key={index} style={styles.dailyItem}>
            <View style={styles.dailyColumnLeft}>
              <Text style={styles.dailyDay}>
                {new Date(day.date).toLocaleDateString("en", {
                  weekday: "long",
                })}
              </Text>
            </View>
            <View style={styles.dailyIconContainer}>
              {getWeatherIcon(day.icon)}
            </View>
            <View style={styles.dailyColumnRight}>
              <Text style={styles.dailyTemp}>
                ↑ {Math.round(day.temp_max)}° ↓ {Math.round(day.temp_min)}°
              </Text>
              <Text style={styles.dailyPrecipitation}>
                {day.precipitation} mm
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <View style={styles.container}>
      <View style={styles.foregroundContainer}>
        <View style={styles.backgroundContainer}>
          <Animated.Image
            source={require("../assets/background_thermo_blurred.png")}
            style={[
              styles.backgroundImage,
              { transform: [{ translateY: backgroundPositionAnim }] },
            ]}
          />
        </View>
        <View style={styles.foregroundContainer}>
          {cityImage && (
            <View style={styles.cityImageContainer}>
              <Animated.View style={{ opacity: fadeAnim }}>
                <Image source={{ uri: cityImage }} style={styles.cityImage} />
                <LinearGradient
                  colors={["rgba(0,0,0,0.5)", "transparent"]}
                  style={styles.gradientOverlay}
                />
              </Animated.View>
            </View>
          )}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.drawerButton}
                onPress={openDrawer}
              >
                <Icon name="menu-outline" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.cityTitle}>
                  {city?.cityName || "Add a city"}
                </Text>
                {loading && (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={styles.spinner}
                  />
                )}
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    navigation.navigate("AddLocation", {
                      onSelectCity: (selectedCity: City) => {
                        onSelectCity(selectedCity);
                      },
                    })
                  }
                >
                  <Icon name="add-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <>
                {weatherData && (
                  <View style={styles.weatherMain}>
                    <Text style={styles.mainTemperature}>
                      {Math.round(weatherData.temperature)}°
                    </Text>
                    {getWeatherIcon(weatherData.icon)}
                    <Text style={styles.weatherDescription}>
                      {weatherData.description}
                    </Text>
                    <Text style={styles.tempRange}>
                      ↑ {Math.round(weatherData.maxTemp)}° ↓{" "}
                      {Math.round(weatherData.minTemp)}°
                    </Text>
                  </View>
                )}

                {weatherData && renderHourlyForecast()}

                {weatherData && renderDailyForecast()}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  backgroundContainer: {
    position: "absolute",
    width: windowWidth,
    height: windowHeight,
    overflow: "hidden",
  },
  backgroundImage: {
    width: windowWidth,
    height: 1800,
    position: "absolute",
    opacity: 0.7,
  },
  foregroundContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityTitle: {
    fontSize: 24,
    color: "white",
    textAlign: "left",
  },
  headerIcons: {
    flex: 1,
    alignItems: "flex-end",
  },
  iconButton: {
    padding: 10,
  },
  weatherMain: {
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 20,
  },
  mainTemperature: {
    fontSize: 72,
    color: "white",
  },
  weatherDescription: {
    fontSize: 24,
    color: "white",
  },
  tempRange: {
    fontSize: 18,
    color: "white",
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "white",
    opacity: 0.3,
    marginTop: 10,
  },
  hourlyScroll: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  hourlyItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  hourlyTime: {
    color: "white",
    fontSize: 18,
  },
  hourlyTemp: {
    color: "white",
    fontSize: 18,
  },
  dailyContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  dailyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dailyColumnLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  dailyColumnRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  dailyIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 35,
    height: 35,
  },
  dailyDay: {
    fontSize: 18,
    color: "white",
  },
  dailyTemp: {
    fontSize: 18,
    color: "white",
    textAlign: "right",
  },
  cityImageContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  cityImage: {
    width: windowWidth,
    height: windowHeight,
    opacity: 0.25,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 500,
  },
  drawerButton: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  spinner: {
    marginLeft: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  hourlyPrecipitation: {
    color: "white",
    fontSize: 12,
  },
  dailyPrecipitation: {
    color: "white",
    fontSize: 14,
    textAlign: "right",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  errorText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});

export default MainScreen;
