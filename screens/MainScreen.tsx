import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

const MainScreen = ({
  city,
  weatherData,
  cityImage,
  onSelectCity,
  loading,
}) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();

  useEffect(() => {
    if (cityImage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [cityImage]);

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
            </View>
          </View>
        ))}
      </View>
    );
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const backgroundPosition = weatherData
    ? calculateBackgroundPosition(weatherData.temperature)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.foregroundContainer}>
        <View style={styles.backgroundContainer}>
          <ImageBackground
            source={require("../assets/background_thermo_blurred.png")}
            style={[styles.backgroundImage, { top: -backgroundPosition }]}
          />
        </View>
        <View style={styles.foregroundContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          {!loading && cityImage && (
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.drawerButton}
                onPress={openDrawer}
              >
                <Icon name="menu-outline" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.cityTitle}>{city || "Select a City"}</Text>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    navigation.navigate("AddLocation", {
                      onSelectCity: (selectedCity) => {
                        onSelectCity(selectedCity);
                      },
                    })
                  }
                >
                  <Icon name="add-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

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
    marginVertical: 10,
  },
  hourlyScroll: {
    marginTop: 20,
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
    flex: 3,
    alignItems: "center",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default MainScreen;
