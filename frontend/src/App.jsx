import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupScreen from './components/SetupScreen';
import InterviewRoom from './components/InterviewRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SetupScreen />} />
        <Route path="/interview" element={<InterviewRoom />} />
      </Routes>
    </Router>
  );
}

export default App;