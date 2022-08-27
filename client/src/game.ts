import { GuessReq, GuessResp, QuestionResp } from "api";
import React from "react";
import { WarningsMethods } from "./components/Warinings";
import { API_URL } from "./consts";
import { isErrorResp } from "./utils";

namespace Game {

  let warningsRef: React.MutableRefObject<WarningsMethods | undefined>;
  export function setWarningsRef(ref: React.MutableRefObject<WarningsMethods | undefined>) {
    warningsRef = ref;
  }

  export async function newQuestion(): Promise<QuestionResp | null> {
    try {
      const resp = await fetch(`${API_URL}/api/new-question`, {method: 'POST'});
      const body = await resp.json();
      if (!resp.ok) {
        if (isErrorResp(body)) {
          warningsRef?.current?.pushWarning({
            type: 'error', 
            message: `[${body.error.code}] ${body.error.message}`
          });
        }
        return null;
      }
      return body as QuestionResp;
    } catch (error) {
      console.error(error);
      warningsRef?.current?.pushWarning({
        type: 'error', 
        message: 'Error connecting to the server.'
      });
      return null;
    }
  }

  export async function makeAGuess(questionId: string, pos: google.maps.LatLng): Promise<GuessResp | null> {
    try {
      const resp = await fetch(`${API_URL}/api/guess/${questionId}`,{
        method: 'POST',
        body: JSON.stringify({
          lat: pos.lat(),
          lon: pos.lng()
        } as GuessReq),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (resp.status === 404) {
        warningsRef?.current?.pushWarning({
          type: 'warning', 
          message: 'Cannot find this game on the serever. Please refresh.'
        });
        return null;
      }
      if (!resp.ok) {
        const body = await resp.json();

        if (isErrorResp(body)) {
          warningsRef?.current?.pushWarning({
            type: 'error', 
            message: `[${body.error.code}] ${body.error.message}`
          });
        }
        return null;
      }
      const body = await resp.json();
      return body as GuessResp;
    } catch (error) {
      console.error(error);
      warningsRef?.current?.pushWarning({
        type: 'error', 
        message: 'Error connecting to the server.'
      });
      return null;
    }
  }

  export function deleteQuestion() {
    fetch(`${API_URL}/api/`, {
      method: 'DELETE'
    });
  }
}

export default Game;