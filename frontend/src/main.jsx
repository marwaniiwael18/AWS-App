import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import './index.css'
import App from './App.jsx'
import awsconfig from './aws-exports.js'

// Configure AWS Amplify with your real Cognito credentials
Amplify.configure(awsconfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
