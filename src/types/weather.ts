
export interface WeatherData {
  weather: Array<{
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
    humidity: number;
  };
  name: string;
  wind: {
    speed: number;
  };
}

export interface ForecastDay {
  date: string;
  temp: number;
  condition: string;
}
