import { createContext } from 'react';

export const API = "/api";

// Global states
export const UserContext = createContext(null);

/**
 * Parses the error message from the API and returns it as readable HTML
 * 
 * @param {string|array|object} message Message from the API
 * @returns Error message HTML formated
 */
export function handleErrorMessage(message) {
  let errorLines = null
  if (Array.isArray(message)) {
    errorLines = <>{message.map((line, index) => (
      <p key={index}>{line}</p>
    ))}</>
  } else if (typeof message === "object") {
    errorLines = <ul>
      {Object.keys(message).map((m, index) => (
        <li key={index}>Key <code>{m}</code>:<ul>
          {message[m].map((line) => (
            <li key={index}>{line}</li>
          ))}
        </ul></li>
      ))}
    </ul>
  } else if (typeof message === "string") {
    errorLines = <p>{message}</p>
  } else {
    errorLines = <p>{JSON.stringify(message)}</p>
  }
  return errorLines
}