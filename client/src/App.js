import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import MarketDashboard from './MarketDashboard';
import CompanyStockInfo from './CompanyStockInfo';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<MarketDashboard />} />
        <Route path="/stock/:symbol" element={<CompanyStockInfo />} />
      </Routes>
    </Router>
  );
};

export default App;
