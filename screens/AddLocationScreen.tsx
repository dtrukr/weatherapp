import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { City } from "../types"; // Adjust the import path as necessary

interface AddLocationScreenProps {
  navigation: any;
  route: {
    params: {
      onSelectCity: (city: City) => void;
    };
  };
}

const AddLocationScreen: React.FC<AddLocationScreenProps> = ({
  navigation,
  route,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    const newTimeout = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `https://www.yr.no/api/v0/locations/search?language=en&q=${query}`
        );
        const filteredLocations = response.data._embedded.location.filter(
          (location: any) => location.category.id !== "CE12"
        );
        const suggestionsList: City[] = filteredLocations.map(
          (location: any) => ({
            cityId: location.id,
            cityName: location.name,
            countryName: location.country.name,
          })
        );
        setSuggestions(suggestionsList);
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    setDebounceTimeout(newTimeout);
  };

  const handleCitySelect = (city: City) => {
    if (route.params && route.params.onSelectCity) {
      route.params.onSelectCity(city);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Add City</Text>
          </View>

          <View style={styles.searchHeader}>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search for a city"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.cityId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text style={styles.suggestionText}>
                    {item.cityName}, {item.countryName}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginLeft: 10,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: "#fff",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
  },
  suggestionText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default AddLocationScreen;
