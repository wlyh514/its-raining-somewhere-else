declare module 'api' {
  export interface QuestionResp {
    id: string;
    last_updated_epoch: number; 
    temp_c: number; 
    temp_f: number;
    condition: {
      text: string;
      icon: string; 
      code: number;
    };
    is_day: 1 | 0;
  }

  interface LocationData {
    lat: number; 
    lon: number;
    name: string; 
    region: string; 
    country: string; 
    tz_id: string; 
    localtime_epoch: number;
    localtime: string; 
  }

  export interface RealtimeWeatherData {
    last_updated: string; 
    last_updated_epoch: number; 
    temp_c: number; 
    temp_f: number;
    feelslike_c: number;
    feelslike_f: number; 
    condition: {
      text: string;
      icon: string; 
      code: number;
    };
    wind_mph: number; 
    wind_kph: number; 
    wind_degree: number; 
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number; 
    precip_mm: number; 
    precip_in: number;
    humidity: number; 
    cloud: number;
    is_day: 1 | 0; 
    uv: number; 
    gust_mph: number; 
    gust_kph: number;
  }

  type ReducedRealtimeWeatherData = Omit<
    RealtimeWeatherData, 
    'feelslike_c' | 'feelslike_f' | 'uv' | 'gust_mph' | 'gust_kph'
  >;

  export interface GuessResp {
    correct: boolean;
    end: boolean;
    location: LocationData;
    current: ReducedRealtimeWeatherData;
    answer?: {
      location: LocationData;
      current: ReducedRealtimeWeatherData;
    }
  }

  export interface GuessReq {
    lat: number; 
    lon: number;
  }

  export interface ErrorResp {
    error: {
      code: number;
      message: string;
    }
  }
}