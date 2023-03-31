import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => (
  <div>
    <h1>Sample Plugin</h1>
    <p>This is a Hawtio plugin example.</p>
  </div>
)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
