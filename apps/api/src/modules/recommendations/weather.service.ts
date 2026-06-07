import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface WeatherData {
  temperature: number
  weatherCode: number
  description: string
}

@Injectable()
export class WeatherService {
  constructor(private config: ConfigService) {}

  async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    const apiKey = this.config.get<string>('OPENWEATHER_API_KEY')
    if (!apiKey) return null

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = (await res.json()) as {
        main: { temp: number }
        weather: Array<{ id: number; description: string }>
      }
      return {
        temperature: data.main.temp,
        weatherCode: data.weather[0].id,
        description: data.weather[0].description,
      }
    } catch {
      return null
    }
  }

  async getWeatherForBranch(): Promise<WeatherData | null> {
    const lat = parseFloat(this.config.get<string>('DEFAULT_LAT') ?? '19.4326')
    const lon = parseFloat(this.config.get<string>('DEFAULT_LON') ?? '-99.1332')
    return this.getWeather(lat, lon)
  }
}
