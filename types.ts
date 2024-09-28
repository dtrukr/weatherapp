// types.ts

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  maxTemp: number;
  minTemp: number;
  hourly: Array<{
    time: string;
    temp: number;
    icon: string;
    precipitation: number;
  }>;
  daily: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    icon: string;
    precipitation: number;
  }>;
}

export interface City {
  cityId: string;
  cityName: string;
  countryName: string;
}

export interface MainScreenProps {
  city: City | null;
  onSelectCity: (city: City) => void;
}
