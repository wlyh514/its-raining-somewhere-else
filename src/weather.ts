import { LocationData, RealtimeWeatherData, ReducedRealtimeWeatherData } from "api";
import axios, { AxiosError } from "axios";
import { WEATHERAPI_KEY } from "./consts";
import { PositionNotFoundError } from "./errors";

export namespace Weather {
  export interface RealtimeWeatherResp {
    location: LocationData;
    current: RealtimeWeatherData;
  }
  interface WeatherAPIErrorBody {
    error: {
      code: number; 
      message: string;
    }
  }

  const BASE_URL = 'https://api.weatherapi.com/v1';

  const isWeatherAPIError = (err: any): err is WeatherAPIErrorBody =>
   err.error && typeof err.error.code === 'number' && typeof err.error.message == 'string';

  export const getCurrentWeatherAt = async (
    q: string
  ): Promise<RealtimeWeatherResp | null> => {
    try {
      const resp = await axios.get(`${BASE_URL}/current.json`, {
        params: {
          key: WEATHERAPI_KEY,
          q,
        }
      });
      return resp.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response) {
          let body = await err.response.data;
          // Position not found
          if (err.response.status === 400 && isWeatherAPIError(body) && body.error.code === 1006) {
            throw new PositionNotFoundError();
          }
        }
        console.error(err.toJSON());
      } else {
        console.error(err);
      }
      return null;
    }
  }

  export const reduceRealtimeWeatherData = (data: RealtimeWeatherData): ReducedRealtimeWeatherData => {
    const partialData = {...data} as Partial<RealtimeWeatherData>
    delete partialData.feelslike_c;
    delete partialData.feelslike_f;
    delete partialData.uv;
    delete partialData.gust_kph;
    delete partialData.gust_mph;
    return partialData as ReducedRealtimeWeatherData;
  }
}