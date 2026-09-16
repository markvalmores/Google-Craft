// Dynamic Timezone-Based Weather & Season Simulation Engine

export type WeatherType = 'sunny' | 'rain' | 'thunder' | 'snow' | 'autumn' | 'starry';
export type SeasonType = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface WeatherSeasonState {
  timezone: string;
  season: SeasonType;
  weather: WeatherType;
  isNight: boolean;
  temperatureCelsius: number;
  description: string;
  seasonIcon: string;
  weatherIcon: string;
}

export class WeatherSeasonService {
  private customWeather: WeatherType | null = null;

  // Detect season from user's calendar month and hemisphere (assuming North default)
  public getSeasonFromMonth(month: number): SeasonType {
    // 0 = Jan, 1 = Feb, ... 11 = Dec
    if (month >= 2 && month <= 4) return 'Spring'; // Mar, Apr, May
    if (month >= 5 && month <= 7) return 'Summer'; // Jun, Jul, Aug
    if (month >= 8 && month <= 10) return 'Autumn'; // Sep, Oct, Nov
    return 'Winter'; // Dec, Jan, Feb
  }

  public getSeasonIcon(season: SeasonType): string {
    switch (season) {
      case 'Spring': return '🌸';
      case 'Summer': return '☀️';
      case 'Autumn': return '🍂';
      case 'Winter': return '❄️';
    }
  }

  public getWeatherIcon(weather: WeatherType): string {
    switch (weather) {
      case 'sunny': return '☀️';
      case 'rain': return '🌧️';
      case 'thunder': return '⛈️';
      case 'snow': return '🌨️';
      case 'autumn': return '🍁';
      case 'starry': return '✨';
    }
  }

  // Calculate current weather state based on local time, timezone, and calendar
  public getCurrentState(): WeatherSeasonState {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const month = now.getMonth();
    const hour = now.getHours();
    const isNight = hour < 6 || hour >= 19;
    const season = this.getSeasonFromMonth(month);

    let defaultWeather: WeatherType = 'sunny';
    let temp = 22;

    if (season === 'Winter') {
      temp = Math.round(-2 + (hour > 10 && hour < 16 ? 4 : 0));
      defaultWeather = 'snow';
    } else if (season === 'Autumn') {
      temp = Math.round(14 + (hour > 11 && hour < 17 ? 5 : 0));
      defaultWeather = 'autumn';
    } else if (season === 'Summer') {
      temp = Math.round(27 + (hour > 12 && hour < 17 ? 6 : 0));
      defaultWeather = isNight ? 'starry' : 'sunny';
    } else {
      // Spring
      temp = Math.round(18 + (hour > 10 && hour < 16 ? 4 : 0));
      defaultWeather = (now.getDate() % 3 === 0) ? 'rain' : 'sunny';
    }

    if (isNight && defaultWeather === 'sunny') {
      defaultWeather = 'starry';
    }

    const activeWeather = this.customWeather || defaultWeather;

    let desc = 'Clear sunny skies with gentle voxel breeze.';
    if (activeWeather === 'rain') desc = 'Continuous gentle rainfall with wet voxel puddles.';
    if (activeWeather === 'thunder') desc = 'Thunderstorm with rolling thunder and lightning flashes!';
    if (activeWeather === 'snow') desc = 'Gentle snowfall dusting the earth in powdery white.';
    if (activeWeather === 'autumn') desc = 'Crisp golden autumn breeze with fluttering leaves.';
    if (activeWeather === 'starry') desc = 'Twinkling starry night sky and lunar glow.';

    return {
      timezone,
      season,
      weather: activeWeather,
      isNight,
      temperatureCelsius: temp,
      description: desc,
      seasonIcon: this.getSeasonIcon(season),
      weatherIcon: this.getWeatherIcon(activeWeather)
    };
  }

  public setOverrideWeather(weather: WeatherType | null) {
    this.customWeather = weather;
  }
}

export const weatherSeasonService = new WeatherSeasonService();
