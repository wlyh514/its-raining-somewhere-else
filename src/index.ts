import cors from 'cors';
import express, { json, Router } from "express";
import { rateLimit } from "express-rate-limit";
import { body } from "express-validator";
import https from 'https';
import fs from 'fs';

import { GuessReq } from "api";
import { PORT, QUESTION_CLEAN_INTERVAL_MS, ORIGIN } from "./consts";
import { PositionNotFoundError } from "./errors";
import { Question } from "./question";
import { validationErrorHandler } from "./utils";

const app = express();
app.set('trust proxy', true);

const api = Router(); 

api.use(json());
api.use(cors());

setInterval(Question.cleanStaleQuestions, QUESTION_CLEAN_INTERVAL_MS);

api.post('/new-question', 
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
      error: {
        code: 429, 
        message: 'You can only request for a new question 5 times per minute.'
      }
    }
  }),
async (req, res) => {
  const question = await Question.newQuestion(Question.Question, req.ip);
  if (question) {
    console.log(`${req.ip} requested for a new question. Question ${question.id} generated.`);
    res.status(201).json(question.publicResp).end();
  } else {
    res.status(500).end();
  }
});

api.post('/guess/:questionId', 
  body('lat').isDecimal(),
  body('lon').isDecimal(),
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
      error: {
        code: 429, 
        message: 'You can only make 10 guesses per minute.'
      }
    }
  }),
validationErrorHandler,
async (req, res) => {
  try {
    const question = Question.getQuestionById(req.params!.questionId);
    const {lat, lon} = req.body as GuessReq;
    if (!question) {
      res.status(404).end();
      return;
    }
    console.log(`${req.ip} made a guess on (${lat}, ${lon}) for question ${question.id}`);
    res.json(await question.makeGuess(lat, lon)).end();
  } catch (error) {
    if (error instanceof PositionNotFoundError) {
      res.status(400).json({error: {code: 1006, message: 'Position not found. '}});
    } else {
      console.error(error);
    }
  }
});

api.delete('/', 
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: null
  }),
(req, res) => {
  const question = Question.getQuestionByIp(req.ip);
  if (!question) {
    res.status(404).end();
    return;
  }
  Question.archiveQuestion(question);
  res.status(200).end();
})

app.use('/api', api);

if (process.env.SSL) {
  https
    .createServer({
      key: fs.readFileSync(process.env.KEY_FILE!),
      cert: fs.readFileSync(process.env.CERT_FILE!),
    }, app)
    .listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    })
} else {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}