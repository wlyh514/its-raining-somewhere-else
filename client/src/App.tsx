/// <reference types="@types/google.maps" />
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { useEffect, useRef, useState } from 'react';

import { GuessResp, QuestionResp } from 'api';
import './App.css';
import Map from './components/Map';
import Warnings, { WarningsMethods } from './components/Warinings';
import { GOOGLE_MAP_API_KEY } from './consts';
import Game from './game';

//https://www.timeanddate.com/worldclock/sunearth.html

const render = (status: Status) => {
  return <h1>{status}</h1>;
};
function App() {

  const [started, setStarted] = useState<boolean>(false);

  const [question, setQuestion] = useState<QuestionResp | null>(null);

  const [guesses, setGuesses] = useState<GuessResp[]>([]);
  const [processingGuess, setProcessingGuess] = useState<boolean>(false);

  const warningsRef = useRef<WarningsMethods>();

  Game.setWarningsRef(warningsRef);

  const onGameStartChange = async (started: boolean) => {
    if (started) {
      setStarted(true);
      const question = await Game.newQuestion();
      if (question) {
        setQuestion(question);
      }
    }
  }

  const makeAGuess = async (pos: google.maps.LatLng) => {
    if (!question) {
      return;
    }
    setProcessingGuess(true); 

    const guess = await Game.makeAGuess(question.id, pos);
    if (!guess) {
      // Give an error popup or something idk
    } else {
      if (guess.end && !guess.correct && guess.answer) {
        setGuesses([...guesses, guess, {
          end: true, 
          correct: true, 
          location: guess.answer.location,
          current: guess.answer.current
        }])
      } else {
        setGuesses([...guesses, guess]);
      }
    }
    
    setProcessingGuess(false);
  }

  const restart = () => {
    if (!guesses.at(-1)?.end) {
      Game.deleteQuestion();
    }
    setStarted(false);
    setQuestion(null);
    setProcessingGuess(false);
    setGuesses([]);
  }

  useEffect(() => {
    setTimeout(() => {
      document.title = "It's Raining Somewhere Else🌧";
    }, 2000);
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>It's Raining🌧 Somewhere Else</h1>

        <Wrapper apiKey={GOOGLE_MAP_API_KEY} render={render}>
          <Map 
            started={started} 
            setStarted={onGameStartChange}
            question={question} 
            center={{lat: 39.142, lng: 10.196}}
            zoom={3}
            minZoom={3}
            gestureHandling="greedy"
            restriction={{latLngBounds: {north: 84, south: -84, west: -180, east: 180}, strictBounds: true}}
            fullscreenControl={false}
            mapTypeControl={false}
            processingGuess={processingGuess}
            makeAGuess={makeAGuess}
            guesses={guesses}
            restart={restart}
          >
          
          </Map>
        </Wrapper>

        <Warnings ref={warningsRef}/>

      </header>
    </div>
  );
}

export default App;