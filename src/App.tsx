import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Join from './pages/Join';
import Room from './pages/Room';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App; 