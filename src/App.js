import React from 'react';
import Map from './components/Map';
import './App.css';

function App() {
  return (
    <div className="App">
      <p>Hey! Nella mappa qui sotto trovi la posizione dell'Iss quasi in tempo reale!</p>
      <p>Se clicchi su un punto qualsiasi della mappa troverai le date dei fly-over per quel determinato punto </p>
      <Map/>
    </div>
  );
}

export default App;
