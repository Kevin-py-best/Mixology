import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import PhoneFrame from './components/PhoneFrame'
import './index.css'
import './phone.css'

const isPhoneScreen = new URLSearchParams(window.location.search).get('phone-screen') === '1'
document.documentElement.classList.add(isPhoneScreen ? 'phone-app-document' : 'phone-preview-document')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isPhoneScreen ? <App /> : <PhoneFrame />}
  </React.StrictMode>,
)
