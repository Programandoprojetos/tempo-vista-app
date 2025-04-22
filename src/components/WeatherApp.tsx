
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloudSun, CloudRain, Snowflake, Sun, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const weatherIcons = {
  Clear: <Sun className="text-yellow-400" size={64} />,
  Clouds: <Cloud className="text-gray-400" size={64} />,
  Rain: <CloudRain className="text-blue-500" size={64} />,
  Snow: <Snowflake className="text-blue-300" size={64} />,
  Default: <CloudSun className="text-gray-300" size={64} />,
};

const API_KEY = "d9f725755d9f49c6eed0ce9f897e97d9"; // This is a public API key

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      const data = await res.json();
      
      if (data.cod === "404") {
        throw new Error("Cidade não encontrada");
      }
      
      setWeather(data);
    } catch (err) {
      console.error('Erro ao buscar clima:', err);
      toast({
        title: "Erro",
        description: err.message === "Cidade não encontrada" 
          ? "Cidade não encontrada. Verifique o nome e tente novamente."
          : "Erro ao buscar dados do clima. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setWeather(null);
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
    return weatherIcons[condition] || weatherIcons['Default'];
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      <h1 className="text-white text-4xl font-bold mb-6">Previsão do Tempo</h1>
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

      {weather && weather.main && (
        <motion.div 
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-6">
            <CardContent className="flex flex-col items-center gap-4">
              {renderWeatherIcon(weather.weather[0].main)}
              <h2 className="text-2xl font-bold text-gray-800">{weather.name}</h2>
              <p className="text-gray-600 text-lg capitalize">{weather.weather[0].description}</p>
              <p className="text-4xl font-semibold text-blue-700">{Math.round(weather.main.temp)}°C</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <p>Umidade: {weather.main.humidity}%</p>
                <p>Vento: {Math.round(weather.wind.speed)} km/h</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
