import crypto from 'crypto';

import { GuessResp, QuestionResp } from "api";
import { Cities } from "./cities";
import { QUESTION_LIFESPAN_MS } from './consts';
import { Weather } from "./weather";

export namespace Question {

  type QuestionId = string;

  const questionIdtoQuestion = new Map<QuestionId, Question>();
  const ipToQuestion = new Map<string, Question>();

  export const getQuestionById = (id: QuestionId): Question | null => {
    return questionIdtoQuestion.get(id) || null;
  }

  export const getQuestionByIp = (ip: string): Question | null => {
    return ipToQuestion.get(ip) || null;
  }

  export const archiveQuestion = (question: Question) => {
    if (question.ip) {
      ipToQuestion.delete(question.ip);
    }
    questionIdtoQuestion.delete(question.id);
    console.log(`Question ${question.id} archived.`);
  }

  export const newQuestion = async (
    cls: new (weather: Weather.RealtimeWeatherResp, ip: string | null) => Question,
    ip?: string
  ): Promise<Question | null> => {
    const city = Cities.randomCity();
    const currentWeather = await Weather.getCurrentWeatherAt(`${city.lat},${city.lng}`);
    
    if (!currentWeather) {
      return null;
    }

    const question = new cls(currentWeather, ip || null);
    return question;
  }

  export const cleanStaleQuestions = () => {
    console.log('Cleaning stale questions...')
    const now = Date.now();
    for (const [id, question] of questionIdtoQuestion) {
      if (now - question.lastRefreshed.getTime() > QUESTION_LIFESPAN_MS) {
        archiveQuestion(question);
      }
    }
    console.log('Cleaning done!')
  }
  
  class Guess {

    public weather: Weather.RealtimeWeatherResp | null = null;
    readonly id: QuestionId = crypto.randomUUID();

    constructor(
      public lat: number,
      public lon: number,
    ) {}

    async fetchWeather(): Promise<Weather.RealtimeWeatherResp | null> {
      return this.weather = await Weather.getCurrentWeatherAt(`${this.lat},${this.lon}`);
    }
  }

  export class Question {

    readonly guesses: Guess[] = [];
    readonly id: QuestionId = crypto.randomUUID();
    protected MAX_GUESS = 15;

    lastRefreshed: Date = new Date();
    
    constructor(
      public answer: Weather.RealtimeWeatherResp,
      public ip: string | null
    ) {
      if (ip) {
        ipToQuestion.set(ip, this);
      }
      questionIdtoQuestion.set(this.id, this);
    }

    get publicResp(): QuestionResp {
      const { last_updated_epoch, temp_c, temp_f, condition, is_day } = this.answer.current;
      return { id: this.id, last_updated_epoch, temp_c, temp_f, condition, is_day };
    }

    protected guessIsCorrect(guess: Guess): boolean {
      // Compare guess.weather and this.answer
      const ans = this.answer;
      const gus = guess.weather;
      if (!gus) throw new Error(`Guess ${guess.id} weather not fetched.`);

      return (Math.abs(ans.current.temp_c - gus.current.temp_c) < 2) &&
        (ans.current.condition.code === gus.current.condition.code) && 
        (ans.current.is_day === gus.current.is_day);
    }
    
    async makeGuess(lat: number, lon: number): Promise<GuessResp> {
      const guess = new Guess(lat, lon);
      await guess.fetchWeather();
      this.guesses.push(guess); 

      const correct = this.guessIsCorrect(guess);
      const end = correct || this.guesses.length === this.MAX_GUESS;
      if (end) {
        archiveQuestion(this);
      }
      const current = Weather.reduceRealtimeWeatherData(guess.weather!.current);

      let resp: GuessResp = {
        correct, 
        end, 
        location: guess.weather!.location,
        current
      }

      if (end && !correct) {
        resp.answer = {
          location: this.answer.location,
          current: Weather.reduceRealtimeWeatherData(this.answer.current)
        };
      }

      return resp;
    }

    refresh() {
      this.lastRefreshed = new Date();
    }
  }
}