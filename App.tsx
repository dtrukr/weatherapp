import React, { useState } from "react";
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

const App = () => {
  const [favorites, setFavorites] = useState<City[]>([]);
  const [city, setCity] = useState<string | null>(null);

  const handleSelectCity = (city: City) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.some((fav) => fav.id === city.id)) {
        return prevFavorites;
      }
      return [...prevFavorites, city];
    });

    setCity(city.name);
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
          <MainScreen {...props} city={city} onSelectCity={handleSelectCity} />
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
            favorites={favorites}
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
