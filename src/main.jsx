import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { clarity } from 'react-microsoft-clarity';

const clarityId = import.meta.env.VITE_CLARITY_ID
if (clarityId) {
  clarity.init(clarityId)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
