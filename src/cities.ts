import cities, {City} from 'cities.json';
import crypto from 'crypto';

export namespace Cities {
  export const randomCity = (): City => {
    return cities[crypto.randomInt(0, cities.length)];
  }
}