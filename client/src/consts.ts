export const GOOGLE_MAP_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY || "";
if (!GOOGLE_MAP_API_KEY) {
  throw new Error('No Google Map API key found. ');
}

export const API_URL = process.env.REACT_APP_API_URL || ""
if (!API_URL) {
  throw new Error('No API URL found. ');
}

export const MAX_GUESSES = 15;
export const TEMP_DELTA = 2;