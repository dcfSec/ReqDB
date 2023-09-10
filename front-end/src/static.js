import { createContext } from 'react';

export const API = "/api";

// Global states
export const UserContext = createContext(null);

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
        <li>{line}</li>
      ))}
          </ul></li>
      ))}
      </ul>
    } else {
      errorLines = <p>{message}</p>
    }
    return errorLines
}