import { ErrorResp } from "api";

export const classNames = (clsObj: Record<string, boolean>): string => {
  let activeClasses: string[] = [];
  for (const key in clsObj) {
    if (clsObj[key]) {
      activeClasses.push(key);
    }
  }
  return activeClasses.join(' ');
}

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export const isErrorResp = (resp: any): resp is ErrorResp => 
  resp.error && typeof resp.error.code === 'number' && typeof resp.error.message === 'string' 