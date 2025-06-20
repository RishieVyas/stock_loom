import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MarketDashboard.css';

const MarketDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [biggestMarketCap, setBiggestMarketCap] = useState([]);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/top-performers');
        setTopPerformers(response.data);
      } catch (error) {
        console.error('Error fetching top performers:', error);
      }
    };

  const fetchBiggestMarketCap = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/biggest-market-cap');
        setBiggestMarketCap(response.data);
      } catch (error) {
        console.error('Error fetching biggest market cap:', error);
      }
    };

    fetchTopPerformers();
    fetchBiggestMarketCap();
  }, []);

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      try {
        const response = await axios.get(`http://localhost:5001/api/search-tickers?q=${e.target.value}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching tickers:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStock = (symbol) => {
    setSearchQuery(symbol);
    setSearchResults([]);
    navigate(`/stock/${symbol}`);
  };

  // Helper function to determine trend class based on price change
  const getTrendClass = (priceChange) => {
    return priceChange >= 0 ? 'positive' : 'negative';
  };

  // Helper function to get first letter for logo
  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'S';
  };

  return (
    <div className="marketdashboard">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for stocks..."
            className="search-bar"
          />
          {searchQuery && (
            <ul className="search-results">
              {searchResults.length ? (
                searchResults.map((stock, index) => (
                  <li key={index} onClick={() => handleSelectStock(stock.symbol)}>
                    <div className="stock-logo">{getFirstLetter(stock.name)}</div>
                    <div className="stock-info">
                      <span className="search-symbol">{stock.symbol}</span>
                      <span className="search-name">{stock.name}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="search-no-results">Stock not found</li>
              )}
            </ul>
          )}
        </div>

        {/* Hot Picks Section */}
        <section className="stock-section">
          <h2 className="section-title">🔥 Hot Picks - Last 24 hours</h2>
          <div className="stock-grid">
            {topPerformers.map((stock, index) => (
              <div 
                key={index} 
                className="stock-card" 
                onClick={() => handleSelectStock(stock.symbol || stock.name)}
              >
                {/* Ticker and Company Name */}
                <div className="card-header">
                  <div className="stock-logo">{getFirstLetter(stock.name)}</div>
                  <div>
                    <h3 className="ticker">{stock.symbol || stock.name}</h3>
                    <p className="company-name">{stock.name}</p>
                  </div>
                </div>

                {/* Price and Change */}
                <div className="price-container">
                  <p className="price">${stock.price || '0.00'}</p>
                  <p className={`price-change ${getTrendClass(stock.priceChange)}`}>
                    {stock.priceChange >= 0 ? '+' : ''}{stock.priceChange}%
                  </p>
                </div>

                {/* Sparkline Mock */}
                <div className={`sparkline sparkline-${getTrendClass(stock.priceChange)}`}>
                  <div className="sparkline-gradient"></div>
                </div>

                {/* Market Cap */}
                <div className="market-cap">
                  Market Cap: <span>${stock.marketCap || '0.00'}B</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Market Cap Leaders Section */}
        <section className="stock-section">
          <h2 className="section-title">👑 Market Cap Leaders</h2>
          <div className="stock-grid">
            {biggestMarketCap.map((stock, index) => (
              <div 
                key={index} 
                className="stock-card" 
                onClick={() => handleSelectStock(stock.symbol || stock.name)}
              >
                {/* Ticker and Company Name */}
                <div className="card-header">
                  <div className="stock-logo">{getFirstLetter(stock.name)}</div>
                  <div>
                    <h3 className="ticker">{stock.symbol || stock.name}</h3>
                    <p className="company-name">{stock.name}</p>
                  </div>
                </div>

                {/* Price and Change (if available) */}
                <div className="price-container">
                  <p className="price">${stock.price || '0.00'}</p>
                  <p className="market-cap-value">${stock.marketCap}B</p>
                </div>

                {/* Sparkline Mock */}
                <div className="sparkline sparkline-positive">
                  <div className="sparkline-gradient"></div>
                </div>

                {/* Market Cap */}
                <div className="market-cap">
                  Market Cap: <span>${stock.marketCap}B</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MarketDashboard;
