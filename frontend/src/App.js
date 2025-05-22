import React from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" className="app-logo">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            <h1>GeoSnapMap</h1>
          </div>
          <p className="tagline">Capture memories. Map moments.</p>
        </div>
      </header>
      <main>
        <div className="card fade-in">
          <ImageUpload />
        </div>
        <footer>
          <p>&copy; {new Date().getFullYear()} GeoSnapMap | All rights reserved to Dustin Polk</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
