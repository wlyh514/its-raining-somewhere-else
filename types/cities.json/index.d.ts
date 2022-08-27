declare module 'cities.json' {
  export type City = {
    country: string; 
    name: string; 
    lat: number; 
    lng: number;
  };
  const cities:City[]; 
  export default cities;
}

