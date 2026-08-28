import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Health Tracker</h1>
      <p>アプリが正常に起動しました！</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)