/// <reference types="@types/google.maps" />
import { isLatLngLiteral } from "@googlemaps/typescript-guards";
import { GuessResp, QuestionResp } from "api";
import { createCustomEqual } from "fast-equals";
import React, { useEffect, useRef, useState } from "react";
import { TEMP_DELTA } from "../consts";
import { classNames } from "../utils";
import GamePanel from "./GamePanel";
import Marker from "./Marker";

// Copied from 
// https://github.com/googlemaps/js-samples/blob/ba83e1f1f8ecfb6f4e89a1dc1a552a4cb3034b1e/samples/react-map/index.tsx

interface MapProps extends google.maps.MapOptions {
  style?: { [key: string]: string };
  children?: React.ReactNode;
  started: boolean;
  question: QuestionResp | null;
  processingGuess: boolean;
  guesses: GuessResp[];
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  setStarted: (started: boolean) => any;
  makeAGuess: (pos: google.maps.LatLng) => void;
  restart: () => void;
}

const Map: React.FC<MapProps> = ({
  onClick,
  children,
  onIdle,
  style,

  started,
  question,
  setStarted, 
  makeAGuess,
  processingGuess,
  guesses,
  restart: _restart,
  ...options
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [selectedPos, setSelectedPos] = useState<google.maps.LatLng | null>(null);
  const [focusedGuess, setFocusedGuess] = useState<number>(0);
  const [prevGuessSize, setPrevguessSize] = useState<number>(0);

  if (prevGuessSize !== guesses.length) {
    setPrevguessSize(guesses.length);
    setFocusedGuess(guesses.length - 1);
  }

  useEffect(() => {
    let guess = guesses[focusedGuess] ;
    if (guess) {
      map?.panTo({
        lat: guess.location.lat,
        lng: guess.location.lon
      })
    }
  }, [focusedGuess, guesses])

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);

  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  useEffect(() => {
    if (map) {
      ["click", "idle"].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      );

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (onClick) {
          onClick(e);
        }
        if (e.latLng && !processingGuess && guesses.at(-1)?.end !== true) {
          setSelectedPos(e.latLng);
          // map.panTo(e.latLng);
        }
      });

      if (onIdle) {
        map.addListener("idle", () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);
  // TODO: Refactor this this is bad
  const getColorForGuessMarker = (indx: number): {stroke: string, bg: string} | undefined => {
    const guess = guesses[indx];
    const correct = guesses[indx].correct;
    const close = (guess.current.condition.code === question?.condition.code && guess.current.is_day === question?.is_day) || 
      (Math.abs(guess.current.temp_c - (question?.temp_c || 99999)) < TEMP_DELTA && guess.current.is_day === question?.is_day);
    if (!guess) {
      return;
    }
    if (focusedGuess === indx) {
      if (correct) {
        return {
          stroke: '#67bf33',
          bg: '#547d3c'
        }
      } else if (close) {
        return {
          stroke: '#ca9823',
          bg: '#ebae37'
        }
      } 
      else {
        return {
          stroke: '#133264',
          bg: '#1c468b'
        }
      }
    } else {
      if (correct) {
        return {
          stroke: 'white',
          bg: '#539929'
        }
      } else if (close){
        return {
          stroke: 'white',
          bg: '#f6b12a'
        }
      } else {
        return {
          stroke: 'white',
          bg: '#2e74e4'
        }
      }
    }
  }

  const restart = () => {
    _restart();
    map?.panTo({lat: 39.142, lng: 10.196});
    map?.setZoom(3);
  }

  const setMapType = (type: string) => {
    map?.setMapTypeId(type);
  }

  return (<>
    <div className={classNames({
      'map-container': true, 
      'full': started
    })}>
      <div ref={ref} style={{position: 'absolute', left: 0, width: '100%', top: 0, height: '100%'}}/>
      {
        started ? 
        <GamePanel 
          processingGuess={processingGuess} 
          question={question} 
          selectedPos={selectedPos}
          makeAGuess={() => {
            if (selectedPos) {
              makeAGuess(selectedPos);
            }
            setSelectedPos(null);
          }}
          guesses={guesses}
          focusedGuess={focusedGuess}
          setFocusedGuess={setFocusedGuess}
          restart={restart}
          setMapType={setMapType}
        /> : 
        <div className="map-start-cover" onClick={() => setStarted(true)}>
          <h1>Click to Start</h1>
        </div>
      }
    </div>

    {
      selectedPos ? 
      <Marker 
        position={{lat: selectedPos.lat(), lng: selectedPos.lng()}}
        label={{
          text: '?',
          color: 'white',
          fontWeight: 'bolder',
          fontSize: 'larger'
        }}
        map={map}
      /> : null
    }
    {
      guesses.map((guess, indx) => { 
        const color = getColorForGuessMarker(indx);
        return <Marker 
          color={color?.bg || ''} 
          position={{lat: guess.location.lat, lng: guess.location.lon}} 
          map={map}
          label={{text: (indx + 1).toString(), fontSize: 'larger', color: 'white'}}
          onClick={() => {setFocusedGuess(indx)}} 
          strokeColor={color?.stroke || ''}
        />
      })
    }

    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // set the map prop on the child component
        return React.cloneElement(child, { map } as any);
      }
    })}
  </> 
  )
}

export default Map;

const deepCompareEqualsForMaps = createCustomEqual(
  ((deepEqual: any) => (a: any, b: any) => {
    if (
      isLatLngLiteral(a) ||
      a instanceof google.maps.LatLng ||
      isLatLngLiteral(b) ||
      b instanceof google.maps.LatLng
    ) {
      return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
    }

    // TODO extend to other types

    // use fast-equals for other objects
    return deepEqual(a, b);
  }) as any
);

function useDeepCompareMemoize(value: any) {
  const ref = React.useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

function useDeepCompareEffectForMaps(
  callback: React.EffectCallback,
  dependencies: any[]
) {
  React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
}