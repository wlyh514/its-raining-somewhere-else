import { GuessResp, QuestionResp } from "api";
import { useRef } from "react";
import { MAX_GUESSES } from "../consts";
import ButtonGroup from "./ButtonGroup";
import DetailedWeatherDataDisplay from "./DetailedWeatherDataDisplay";

interface Props {
  question: QuestionResp | null,
  selectedPos: google.maps.LatLng | null,
  processingGuess: boolean;
  makeAGuess: (pos: google.maps.LatLng) => void;
  guesses: GuessResp[];
  focusedGuess: number;
  setFocusedGuess: (foc: number)=> void;
  restart: () => void;
  setMapType: (type: string) => any;
}

const GamePanel = ({question, 
  selectedPos, 
  processingGuess, 
  makeAGuess, 
  guesses, 
  focusedGuess,
  restart,
  setMapType
}: Props) => {
  
  const guess = guesses[focusedGuess];
  const end = guesses.at(-1)?.end === true;
  const win = end && (guesses.length === 1 || guesses.at(-2)?.end === false);
  const titleDivRef = useRef<HTMLDivElement>(null);

  const bottomBtnOnClick = () => {
    if (end) {
      restart(); 
    } else if (selectedPos) {
      makeAGuess(selectedPos);
    }
  }

  const infoDivPos = () => {
    const space = 20;
    if (!titleDivRef.current) {
      return {
        top: '3em',
        left: space,
      }
    }
    return {
      top: titleDivRef.current.getBoundingClientRect().bottom + space,
      left: space,
    }
  }

  return (<>
    <div className="game-title-container" ref={titleDivRef}>
      <h2 title="Return to menu" onClick={restart} style={{display: 'inline-block', marginRight: 40}}>It's Raining Somewhere Else</h2>
      <ButtonGroup btns={[
        {key: 'roadmap', value: 'Roadmap'}, 
        {key: 'satellite', value: 'Satellite'}, 
        {key: 'hybrid', value: 'Hybrid'},
        {key: 'terrain', value: 'Terrain'}
      ]}
        onFocusChange={setMapType}
      />
    </div>
    <div className="game-info-container" style={infoDivPos()}>
      <h3>Find somewhere that is...</h3>
      {
        question ? <>
          <h3>{question.temp_c}(±2)℃ / {question.temp_f}℉ </h3>
          <img src={`https://${question.condition.icon}`} />
          <h3 style={{marginTop: 0}}>{question.condition.text} ({question.is_day ? 'Day': 'Night'})</h3>
        </> : <h3>Loading...</h3>
      }
      {
        guesses.length > 0 ? <div className='select-menu'>
          <h3>
            {
              guess.correct && guesses[guesses.length - 2]?.correct === false ? 'Correct Answer': `Guess ${focusedGuess + 1} of ${MAX_GUESSES}`
            }
          </h3>
          <h4 style={{margin: 5}}>
            {guess.location.name + ', '}
            {guess.location.region ? guess.location.region + ', ' : null}
            {guess.location.country}
          </h4>
          <DetailedWeatherDataDisplay data={guess.current}/>
        </div> : null
      }
    </div>

    <div className='select-container'>
      <h3 style={{marginBottom: 2}}>
        {
          processingGuess ? 'Processing your guess...' :
            end ? 
              win ? 'You got it!' : 'Guesses depleted' : 
            selectedPos ? 'Is it here?' : 'Where is it?'
        }
      </h3>
      <h5 style={{marginTop: 2, marginBottom: 0}} className='secondary-text'>
        {
          processingGuess || end ? '' : 
          selectedPos ? 
            `(${selectedPos.lat().toFixed(4)}, ${selectedPos.lng().toFixed(4)})` : 'Click a point on the map to select'
        }
      </h5>

      <button 
        className='btn' 
        disabled={processingGuess || (!selectedPos && !end)}
        onClick={bottomBtnOnClick}
      >
      <h3>
        {
          processingGuess ? 'Loading...' : 
            end ? 'New Game' :  
            'Take a Guess!'
        }
      </h3>
    </button>

    </div> 

  </>)
}

export default GamePanel;