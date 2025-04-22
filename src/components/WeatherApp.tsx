
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CloudSun,
  CloudRain,
  Snowflake,
  Sun,
  Cloud
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Howl } from 'howler';
import Lottie from 'lottie-react';
import { WeatherData, ForecastDay } from '@/types/weather';
import { useToast } from '@/components/ui/use-toast';
import rainAnimation from './animations/rain.json';
import sunAnimation from './animations/sun.json';
import snowAnimation from './animations/snow.json';

// Definindo os sons
const sounds: Record<string, Howl> = {
  Rain: new Howl({ src: ['/sounds/rain.mp3'], volume: 0.5 }),
  Thunderstorm: new Howl({ src: ['/sounds/thunder.mp3'], volume: 0.5 }),
  Snow: new Howl({ src: ['/sounds/snow.mp3'], volume: 0.5 }),
  Clear: new Howl({ src: ['/sounds/birds.mp3'], volume: 0.3 }),
  Clouds: new Howl({ src: ['/sounds/clouds.mp3'], volume: 0.3 }),
};

// Definindo animações
const weatherAnimations: Record<string, any> = {
  Clear: sunAnimation,
  Rain: rainAnimation,
  Snow: snowAnimation,
  Clouds: sunAnimation, // Substitua com animação para nuvens, se desejar
};

// Ícones para o clima
const weatherIcons = {
  Clear: <Sun className="text-yellow-400" size={64} />,
  Clouds: <Cloud className="text-gray-400" size={64} />,
  Rain: <CloudRain className="text-blue-500" size={64} />,
  Drizzle: <CloudRain className="text-cyan-400" size={64} />,
  Thunderstorm: <CloudRain className="text-purple-600 animate-pulse" size={64} />,
  Snow: <Snowflake className="text-blue-200" size={64} />,
  Mist: <Cloud className="text-gray-300" size={64} />,
  Smoke: <Cloud className="text-gray-500" size={64} />,
  Haze: <Cloud className="text-yellow-300" size={64} />,
  Dust: <Cloud className="text-yellow-500" size={64} />,
  Fog: <Cloud className="text-gray-400" size={64} />,
  Sand: <Cloud className="text-yellow-600" size={64} />,
  Ash: <Cloud className="text-gray-700" size={64} />,
  Squall: <CloudRain className="text-blue-800" size={64} />,
  Tornado: <Cloud className="text-red-700 animate-spin" size={64} />,
  Default: <CloudSun className="text-gray-300" size={64} />,
};

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(dark);
  }, []);

  const playSoundForCondition = (condition: string) => {
    const sound = sounds[condition as keyof typeof sounds];
    if (sound) {
      sound.play();
    }
  };

  const fetchWeather = async () => {
    if (!city) {
      toast({
        title: "Digite uma cidade",
        description: "Por favor, insira o nome de uma cidade para buscar o clima.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=6db8d86e39995531dd7a032d92a31f2c&units=metric&lang=pt_br`
      );
      const data = await res.json();
      
      if (data.cod === "404") {
        throw new Error("Cidade não encontrada");
      }
      
      setWeather(data);
      playSoundForCondition(data.weather[0].main);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=6db8d86e39995531dd7a032d92a31f2c&units=metric&lang=pt_br`
      );
      const forecastData = await forecastRes.json();

      const daily: Record<string, any[]> = {};
      forecastData.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!daily[date]) daily[date] = [];
        daily[date].push(item);
      });

      const summary = Object.entries(daily).slice(0, 5).map(([date, items]) => {
        const temps = items.map(i => i.main.temp);
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        const condition = items[0].weather[0].main;
        return { date, temp: avgTemp, condition };
      });

      setForecast(summary);
    } catch (err) {
      console.error('Erro ao buscar clima:', err);
      toast({
        title: "Erro",
        description: err instanceof Error && err.message === "Cidade não encontrada" 
          ? "Cidade não encontrada. Verifique o nome e tente novamente."
          : "Erro ao buscar dados do clima. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  const renderWeatherIcon = (condition: string) => {
    return weatherIcons[condition as keyof typeof weatherIcons] || weatherIcons['Default'];
  };

  const renderWeatherAnimation = (condition: string) => {
    return (
      <Lottie 
        animationData={weatherAnimations[condition] || sunAnimation} 
        loop={true} 
        style={{ width: 100, height: 100 }} 
      />
    );
  };

  const backgroundStyle = weather ? weather.weather[0].main : 'Default';
  const bgClasses = {
    Clear: 'from-yellow-300 to-orange-500',
    Clouds: 'from-gray-300 to-gray-500',
    Rain: 'from-blue-400 to-blue-700',
    Snow: 'from-white to-blue-100',
    Thunderstorm: 'from-purple-400 to-indigo-900',
    Default: 'from-slate-400 to-slate-700'
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${bgClasses[backgroundStyle as keyof typeof bgClasses] || bgClasses.Default} p-4 transition-all duration-700 text-white`}>
      <h1 className="text-4xl font-bold mb-6">Previsão do Tempo</h1>
      <div className="flex gap-2 mb-4 w-full max-w-sm">
        <Input 
          placeholder="Digite a cidade..." 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-white/90"
        />
        <Button 
          onClick={fetchWeather}
          disabled={loading}
          className="bg-white text-blue-600 hover:bg-white/90"
        >
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {loading && <p>Carregando...</p>}

      {weather && weather.main && (
        <motion.div 
          className="w-full max-w-sm" 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-6 text-gray-800">
            <CardContent className="flex flex-col items-center gap-4">
              {renderWeatherAnimation(weather.weather[0].main)}  {/* Usando animação */}
              <h2 className="text-2xl font-bold">{weather.name}</h2>
              <p className="text-lg capitalize">{weather.weather[0].description}</p>
              <p className="text-4xl font-semibold text-blue-700">{Math.round(weather.main.temp)}°C</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <p>Umidade: {weather.main.humidity}%</p>
                <p>Vento: {Math.round(weather.wind.speed)} km/h</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {forecast.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full max-w-4xl">
          {forecast.map((day, idx) => (
            <Card key={idx} className="bg-white/80 backdrop-blur-md p-4 rounded-xl text-center shadow text-gray-800">
              <CardContent className="p-2 flex flex-col items-center">
                <p className="font-semibold mb-2">{new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                {renderWeatherIcon(day.condition)}
                <p className="text-lg font-bold mt-2">{Math.round(day.temp)}°C</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <footer className="mt-10 text-white/70 text-sm">© 2025 - App do Tempo</footer>
    </div>
  );
}
